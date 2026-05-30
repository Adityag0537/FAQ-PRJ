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
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 50;

module.exports = {
  CATEGORIES,
  FAQ_UPVOTE_THRESHOLD,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
};
