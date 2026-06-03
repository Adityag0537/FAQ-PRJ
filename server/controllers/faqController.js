const Question = require("../models/Question");
const { getFaqEligibilityFilter } = require("../utils/faqEligibility");
const { getFaqSettings } = require("../utils/settingsHelpers");
const { stripAttachmentsForList } = require("../utils/attachmentHelpers");
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
    const { faqMinViews, faqMinAgeDays } = await getFaqSettings();

    const filter = {
      ...getFaqEligibilityFilter({ minViews: faqMinViews, minAgeDays: faqMinAgeDays }),
      ...buildCategoryFilter(categories),
      ...buildTextSearchFilter(search),
    };

    let query = Question.find(filter)
      .populate("author", "name email")
      .populate({
        path: "acceptedAnswer",
        select: "content author createdAt upvotes",
        populate: { path: "author", select: "name email" },
      })
      .sort(search ? { score: { $meta: "textScore" } } : { views: -1, upvotes: -1, createdAt: -1 });

    if (search) {
      query = query.select({ score: { $meta: "textScore" } });
    }

    const [faqs, total] = await Promise.all([
      query.skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    const data = faqs.map((faq) => stripAttachmentsForList(faq));

    res.status(200).json(paginatedResponse(data, total, page, limit));
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
