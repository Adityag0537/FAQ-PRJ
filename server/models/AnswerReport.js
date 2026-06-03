const mongoose = require("mongoose");

const REPORT_REASONS = [
  "Spam",
  "Incorrect Information",
  "Offensive Content",
  "Misleading Answer",
  "Duplicate Answer",
  "Other",
];

const REPORT_STATUSES = ["PENDING", "REVIEWED", "DISMISSED", "ACTION_TAKEN"];

const answerReportSchema = new mongoose.Schema(
  {
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: REPORT_REASONS,
      required: true,
    },
    additionalComments: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

answerReportSchema.index({ answerId: 1, reportedBy: 1 }, { unique: true });

module.exports = mongoose.model("AnswerReport", answerReportSchema);
module.exports.REPORT_REASONS = REPORT_REASONS;
module.exports.REPORT_STATUSES = REPORT_STATUSES;
