const Question = require("../models/Question");
const Answer = require("../models/Answer");
const { CATEGORIES } = require("../config/constants");
const { getFaqSettings } = require("../utils/settingsHelpers");
const { isQuestionFaqEligible } = require("../utils/faqEligibility");
const {
  canEditQuestion,
  canDeleteQuestion,
} = require("../utils/permissions");
const { processUploadedFiles } = require("../utils/attachmentHelpers");
const {
  handleAcceptedAnswerChange,
  revokeAcceptedAnswerSp,
} = require("../utils/spRewards");
const {
  parsePagination,
  parseCategories,
  buildCategoryFilter,
  buildTextSearchFilter,
  paginatedResponse,
} = require("../utils/queryHelpers");
const {
  attachVoteStatus,
  attachVoteStatusList,
} = require("../utils/voteHelpers");
const {
  enrichQuestions,
  enrichQuestion,
} = require("../utils/questionEnrichment");
const { parseSort, fetchQuestionsSorted } = require("../utils/questionSort");

const validateCategories = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return "At least one category is required";
  }

  const invalid = categories.filter(
    (category) => !CATEGORIES.includes(category)
  );

  if (invalid.length) {
    return `Invalid categories: ${invalid.join(", ")}`;
  }

  return null;
};

const getQuestions = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const categories = parseCategories(req.query);
    const search = req.query.search || "";
    const sort = parseSort(req.query.sort);
    const hasSearch = Boolean(search.trim());

    const filter = {
      ...buildCategoryFilter(categories),
      ...buildTextSearchFilter(search),
    };

    if (sort === "solved") {
      filter.acceptedAnswer = { $ne: null };
    }

    const { questions, total } = await fetchQuestionsSorted({
      filter,
      sort,
      skip,
      limit,
      hasSearch,
    });

    const userId = req.user?._id;
    const data = await enrichQuestions(questions, userId);

    res.status(200).json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("author", "name email")
      .populate({
        path: "acceptedAnswer",
        populate: { path: "author", select: "name email" },
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    question.views = (question.views || 0) + 1;
    await question.save();

    const faqSettings = await getFaqSettings();
    const data = await enrichQuestion(question, req.user?._id);
    data.isFaqEligible = isQuestionFaqEligible(question, {
      minViews: faqSettings.faqMinViews,
      minAgeDays: faqSettings.faqMinAgeDays,
    });
    data.faqSettings = faqSettings;

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createQuestion = async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const categories =
      typeof req.body.categories === "string"
        ? JSON.parse(req.body.categories)
        : req.body.categories;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const categoryError = validateCategories(categories);

    if (categoryError) {
      return res.status(400).json({
        success: false,
        message: categoryError,
      });
    }

    let attachments = [];

    try {
      attachments = await processUploadedFiles(req.files);
    } catch (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message,
      });
    }

    const question = await Question.create({
      title,
      description,
      categories,
      author: req.user._id,
      attachments,
    });

    const populated = await Question.findById(question._id).populate(
      "author",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (!canEditQuestion(req.user, question)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own questions",
      });
    }

    const title = req.body.title;
    const description = req.body.description;
    const categories =
      typeof req.body.categories === "string"
        ? JSON.parse(req.body.categories)
        : req.body.categories;

    if (title) {
      question.title = title;
    }

    if (description) {
      question.description = description;
    }

    if (categories) {
      const categoryError = validateCategories(categories);

      if (categoryError) {
        return res.status(400).json({
          success: false,
          message: categoryError,
        });
      }

      question.categories = categories;
    }

    if (req.files?.length) {
      try {
        const newAttachments = await processUploadedFiles(req.files);
        question.attachments = [...(question.attachments || []), ...newAttachments];
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: uploadError.message,
        });
      }
    }

    await question.save();

    const populated = await Question.findById(question._id)
      .populate("author", "name email")
      .populate("acceptedAnswer");

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (!canDeleteQuestion(req.user, question)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own questions",
      });
    }

    if (question.acceptedAnswerSpAwardedTo) {
      await revokeAcceptedAnswerSp(question);
    }

    await Answer.deleteMany({ questionId: question._id });
    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const upvoteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const userId = req.user._id.toString();
    const alreadyUpvoted = (question.upvotedBy || []).some(
      (id) => id.toString() === userId
    );

    let message;

    if (alreadyUpvoted) {
      question.upvotedBy = question.upvotedBy.filter(
        (id) => id.toString() !== userId
      );
      question.upvotes = Math.max(0, question.upvotes - 1);
      message = "Upvote removed";
    } else {
      question.upvotedBy.push(req.user._id);
      question.upvotes += 1;
      message = "Question upvoted";
    }

    await question.save();

    const populated = await Question.findById(question._id)
      .populate("author", "name email")
      .populate({
        path: "acceptedAnswer",
        populate: { path: "author", select: "name email" },
      });

    const data = await enrichQuestion(populated, req.user._id);

    res.status(200).json({
      success: true,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptAnswer = async (req, res) => {
  try {
    const { questionId, answerId } = req.params;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (
      !question.author ||
      question.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the question owner can accept an answer",
      });
    }

    const answer = await Answer.findById(answerId);

    if (!answer || answer.questionId.toString() !== questionId) {
      return res.status(404).json({
        success: false,
        message: "Answer not found for this question",
      });
    }

    const previousAnswerId = question.acceptedAnswer?.toString() || null;

    question.acceptedAnswer = answerId;
    question.acceptedAnswerContent = answer.content;

    if (previousAnswerId !== answerId.toString()) {
      await handleAcceptedAnswerChange(question, previousAnswerId, answer);
    }

    await question.save();

    const populated = await Question.findById(questionId)
      .populate("author", "name email")
      .populate({
        path: "acceptedAnswer",
        populate: { path: "author", select: "name email" },
      });

    const data = await enrichQuestion(populated, req.user._id);

    res.status(200).json({
      success: true,
      message: "Answer accepted successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const unacceptAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (
      !question.author ||
      question.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the question owner can unaccept an answer",
      });
    }

    if (!question.acceptedAnswer) {
      return res.status(400).json({
        success: false,
        message: "No accepted answer to remove",
      });
    }

    const previousAnswerId = question.acceptedAnswer?.toString() || null;
    await handleAcceptedAnswerChange(question, previousAnswerId, null);
    question.acceptedAnswer = null;
    question.acceptedAnswerContent = "";
    await question.save();

    const populated = await Question.findById(questionId)
      .populate("author", "name email")
      .populate({
        path: "acceptedAnswer",
        populate: { path: "author", select: "name email" },
      });

    const data = await enrichQuestion(populated, req.user._id);

    res.status(200).json({
      success: true,
      message: "Answer unaccepted successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSimilarQuestions = async (req, res) => {
  try {
    const search = req.query.q || req.query.search || "";

    if (!search.trim()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const questions = await Question.find({
      $text: { $search: search.trim() },
    })
      .select({ score: { $meta: "textScore" }, title: 1, description: 1, categories: 1 })
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  upvoteQuestion,
  acceptAnswer,
  unacceptAnswer,
  getSimilarQuestions,
};
