const Answer = require("../models/Answer");
const AnswerReport = require("../models/AnswerReport");
const { REPORT_REASONS } = require("../models/AnswerReport");

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

    const answer = await Answer.findById(answerId);

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

module.exports = {
  reportAnswer,
};
