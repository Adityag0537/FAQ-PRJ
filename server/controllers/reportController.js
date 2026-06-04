const Answer = require("../models/Answer");
const Question = require("../models/Question");
const AnswerReport = require("../models/AnswerReport");
const QuestionReport = require("../models/QuestionReport");
const { REPORT_REASONS } = require("../models/AnswerReport");
const { QUESTION_REPORT_REASONS } = require("../models/QuestionReport");
const {
  buildVisibleAnswerFilter,
  buildVisibleQuestionFilter,
} = require("../utils/moderationVisibility");

const reportAnswer = async (req, res) => {
  try {
    const { reason, additionalComments } = req.body;
    const { id: answerId } = req.params;

    if (!reason || !REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Valid reason required: ${REPORT_REASONS.join(", ")}`,
      });
    }

    const answer = await Answer.findOne(await buildVisibleAnswerFilter({
      _id: answerId,
    }));

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    if (answer.author.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report your own answer",
      });
    }

    const existing = await AnswerReport.findOne({
      answerId,
      reportedBy: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this answer",
      });
    }

    const report = await AnswerReport.create({
      answerId,
      reportedBy: req.user._id,
      reason,
      additionalComments: additionalComments || "",
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Answer reported successfully",
      data: report,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this answer",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const reportQuestion = async (req, res) => {
  try {
    const { reason, additionalComments } = req.body;
    const { id: questionId } = req.params;

    if (!reason || !QUESTION_REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Valid reason required: ${QUESTION_REPORT_REASONS.join(", ")}`,
      });
    }

    const question = await Question.findOne(
      await buildVisibleQuestionFilter({ _id: questionId })
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (question.author?.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report your own question",
      });
    }

    const existing = await QuestionReport.findOne({
      questionId,
      reportedBy: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this question",
      });
    }

    const report = await QuestionReport.create({
      questionId,
      reportedBy: req.user._id,
      reason,
      additionalComments: additionalComments || "",
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Question reported successfully",
      data: report,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this question",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  reportAnswer,
  reportQuestion,
};
