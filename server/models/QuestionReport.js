const mongoose = require("mongoose");

const QUESTION_REPORT_REASONS = [
  "Spam",
  "Incorrect Information",
  "Offensive Content",
  "Misleading Question",
  "Duplicate Question",
  "Other",
];

const REPORT_STATUSES = ["PENDING", "REVIEWED", "DISMISSED", "ACTION_TAKEN"];

const questionReportSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: QUESTION_REPORT_REASONS,
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

questionReportSchema.index(
  { questionId: 1, reportedBy: 1 },
  { unique: true }
);

module.exports = mongoose.model("QuestionReport", questionReportSchema);
module.exports.QUESTION_REPORT_REASONS = QUESTION_REPORT_REASONS;
module.exports.REPORT_STATUSES = REPORT_STATUSES;
