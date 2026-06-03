const mongoose = require("mongoose");

const moderationAuditSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    reason: {
      type: String,
      default: "",
      trim: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
    },
    targetQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnswerReport",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ModerationAudit", moderationAuditSchema);
