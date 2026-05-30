const Question = require("../models/Question");
const Answer = require("../models/Answer");
const { attachVoteStatus, attachVoteStatusList } = require("../utils/voteHelpers");
const { enrichQuestions } = require("../utils/questionEnrichment");

const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ author: req.user._id })
      .populate("author", "name email")
      .populate({
        path: "acceptedAnswer",
        populate: { path: "author", select: "name email" },
      })
      .sort({ createdAt: -1 });

    const data = await enrichQuestions(questions, req.user._id);

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

const getMyAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ author: req.user._id })
      .populate("author", "name email")
      .populate({
        path: "questionId",
        populate: {
          path: "acceptedAnswer",
          select: "_id content",
        },
      })
      .sort({ createdAt: -1 });

    const data = attachVoteStatusList(answers, req.user._id).map((answer) => {
      const question = answer.questionId;
      const acceptedId =
        question?.acceptedAnswer?._id?.toString() ||
        question?.acceptedAnswer?.toString() ||
        null;

      return {
        ...answer,
        questionId: question?._id || answer.questionId,
        questionTitle: question?.title || "Deleted question",
        questionAcceptedAnswer: question?.acceptedAnswer || null,
        isAccepted: acceptedId === answer._id.toString(),
      };
    });

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

module.exports = {
  getMyQuestions,
  getMyAnswers,
};
