const AppSettings = require("../models/AppSettings");
const {
  FAQ_MIN_VIEWS_DEFAULT,
  FAQ_MIN_AGE_DAYS_DEFAULT,
} = require("../config/constants");

const SETTINGS_KEY = "faq_thresholds";

const getFaqSettings = async () => {
  let settings = await AppSettings.findOne({ key: SETTINGS_KEY });

  if (!settings) {
    settings = await AppSettings.create({
      key: SETTINGS_KEY,
      faqMinViews: FAQ_MIN_VIEWS_DEFAULT,
      faqMinAgeDays: FAQ_MIN_AGE_DAYS_DEFAULT,
    });
  }

  return {
    faqMinViews: settings.faqMinViews,
    faqMinAgeDays: settings.faqMinAgeDays,
  };
};

const updateFaqSettings = async ({ faqMinViews, faqMinAgeDays }) => {
  const update = {};

  if (faqMinViews !== undefined) {
    update.faqMinViews = Number(faqMinViews);
  }

  if (faqMinAgeDays !== undefined) {
    update.faqMinAgeDays = Number(faqMinAgeDays);
  }

  const settings = await AppSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return {
    faqMinViews: settings.faqMinViews,
    faqMinAgeDays: settings.faqMinAgeDays,
  };
};

module.exports = {
  getFaqSettings,
  updateFaqSettings,
};
