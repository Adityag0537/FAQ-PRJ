const mongoose = require("mongoose");

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
