const Answer = require("../models/Answer");
const Question = require("../models/Question");
const { FAQ_UPVOTE_THRESHOLD } = require("../config/constants");
const {
  parsePagination,
  parseCategories,
  buildCategoryFilter,
  buildTextSearchFilter,
  paginatedResponse,
} = require("../utils/queryHelpers");

const getFaqs = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const categories = parseCategories(req.query);
    const search = req.query.search || "";

    const filter = {
      acceptedAnswer: { $ne: null },
      upvotes: { $gte: FAQ_UPVOTE_THRESHOLD },
      ...buildCategoryFilter(categories),
      ...buildTextSearchFilter(search),
    };

    let query = Question.find(filter)
      .populate("author", "name email")
      .populate("acceptedAnswer")
      .sort(search ? { score: { $meta: "textScore" } } : { upvotes: -1, createdAt: -1 });

    if (search) {
      query = query.select({ score: { $meta: "textScore" } });
    }

    const [faqs, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    res.status(200).json(paginatedResponse(faqs, total, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getFaqs,
};
