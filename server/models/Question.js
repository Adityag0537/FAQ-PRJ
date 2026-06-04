const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    categories: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
    },
    acceptedAnswerContent: {
      type: String,
      default: "",
    },
    isSeed: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    acceptedAnswerSpAwardedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

questionSchema.index({
  title: "text",
  description: "text",
  acceptedAnswerContent: "text",
});

module.exports = mongoose.model("Question", questionSchema);
