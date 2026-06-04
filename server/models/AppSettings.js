const mongoose = require("mongoose");

const appSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    faqMinViews: {
      type: Number,
      default: 100,
    },
    faqMinAgeDays: {
      type: Number,
      default: 7,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AppSettings", appSettingsSchema);
