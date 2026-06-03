const CATEGORIES = [
  "Onboarding & VINS",
  "Timelines & Clashes",
  "NOC Compliance",
  "Dashboard & Offers",
  "Certification & Credits",
  "ViBe LMS Tech",
  "Yaksha AI Engine",
  "Communication Tech",
  "Rosetta Journaling",
  "Team & Code Engineering",
];

const FAQ_UPVOTE_THRESHOLD = Number(process.env.FAQ_UPVOTE_THRESHOLD) || 5;
const FAQ_MIN_VIEWS_DEFAULT =
  Number(process.env.FAQ_MIN_VIEWS) || 100;
const FAQ_MIN_AGE_DAYS_DEFAULT =
  Number(process.env.FAQ_MIN_AGE_DAYS) || 7;
const ACCEPTED_ANSWER_SP_REWARD = 10;
const ANSWER_UPVOTE_SP_REWARD = 1;
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 50;

module.exports = {
  CATEGORIES,
  FAQ_UPVOTE_THRESHOLD,
  FAQ_MIN_VIEWS_DEFAULT,
  FAQ_MIN_AGE_DAYS_DEFAULT,
  ACCEPTED_ANSWER_SP_REWARD,
  ANSWER_UPVOTE_SP_REWARD,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
};
