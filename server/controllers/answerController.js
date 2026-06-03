const Answer = require("../models/Answer");
const Question = require("../models/Question");
const {
  attachVoteStatus,
  attachVoteStatusList,
} = require("../utils/voteHelpers");
const {
  canEditAnswer,
  canDeleteAnswer,
} = require("../utils/permissions");
const { handleAnswerUpvoteSp } = require("../utils/spRewards");

const addAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const { questionId } = req.params;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Answer content is required",
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const answer = await Answer.create({
      questionId,
      author: req.user._id,
      content,
    });

    const populated = await Answer.findById(answer._id).populate(
      "author",
      "name email"
    );

    res.status(201).json({
      success: true,
      message: "Answer added successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const answers = await Answer.find({ questionId })
      .populate("author", "name email")
      .sort({ upvotes: -1, createdAt: -1 });

    const question = await Question.findById(questionId).select("acceptedAnswer");
    const acceptedId = question?.acceptedAnswer?.toString();

    const sorted = [...answers].sort((a, b) => {
      if (acceptedId) {
        if (a._id.toString() === acceptedId) return -1;
        if (b._id.toString() === acceptedId) return 1;
      }
      return 0;
    });

    const data = attachVoteStatusList(sorted, req.user?._id);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    if (!canEditAnswer(req.user, answer)) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own answers",
      });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Answer content is required",
      });
    }

    answer.content = content;
    await answer.save();

    const question = await Question.findById(answer.questionId);

    if (
      question &&
      question.acceptedAnswer &&
      question.acceptedAnswer.toString() === answer._id.toString()
    ) {
      question.acceptedAnswerContent = content;
      await question.save();
    }

    const populated = await Answer.findById(answer._id).populate(
      "author",
      "name email"
    );

    res.status(200).json({
      success: true,
      message: "Answer updated successfully",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    if (!canDeleteAnswer(req.user, answer)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own answers",
      });
    }

    const question = await Question.findById(answer.questionId);

    if (
      question &&
      question.acceptedAnswer &&
      question.acceptedAnswer.toString() === answer._id.toString()
    ) {
      const { revokeAcceptedAnswerSp } = require("../utils/spRewards");
      await revokeAcceptedAnswerSp(question);
      question.acceptedAnswer = null;
      question.acceptedAnswerContent = "";
      question.acceptedAnswerSpAwardedTo = null;
      await question.save();
    }

    await answer.deleteOne();

    res.status(200).json({
      success: true,
      message: "Answer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const upvoteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    const userId = req.user._id.toString();
    const alreadyUpvoted = (answer.upvotedBy || []).some(
      (id) => id.toString() === userId
    );

    let message;

    if (alreadyUpvoted) {
      answer.upvotedBy = answer.upvotedBy.filter(
        (id) => id.toString() !== userId
      );
      answer.upvotes = Math.max(0, answer.upvotes - 1);
      message = "Upvote removed";
      await handleAnswerUpvoteSp(answer, req.user._id, false);
    } else {
      answer.upvotedBy.push(req.user._id);
      answer.upvotes += 1;
      message = "Answer upvoted";
      await handleAnswerUpvoteSp(answer, req.user._id, true);
    }

    await answer.save();

    const populated = await Answer.findById(answer._id).populate(
      "author",
      "name email"
    );

    res.status(200).json({
      success: true,
      message,
      data: attachVoteStatus(populated, req.user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addAnswer,
  getAnswersByQuestion,
  updateAnswer,
  deleteAnswer,
  upvoteAnswer,
};
