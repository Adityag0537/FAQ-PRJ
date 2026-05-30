const { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } = require("../config/constants");

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_PAGE_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || DEFAULT_PAGE_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const parseCategories = (query) => {
  if (!query.categories) {
    return [];
  }

  if (Array.isArray(query.categories)) {
    return query.categories.filter(Boolean);
  }

  return query.categories
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);
};

const buildCategoryFilter = (categories) => {
  if (!categories.length) {
    return {};
  }

  return { categories: { $in: categories } };
};

const buildTextSearchFilter = (search) => {
  if (!search || !search.trim()) {
    return {};
  }

  return { $text: { $search: search.trim() } };
};

const paginatedResponse = (data, total, page, limit) => ({
  success: true,
  count: data.length,
  total,
  page,
  pages: Math.ceil(total / limit) || 1,
  limit,
  data,
});

module.exports = {
  parsePagination,
  parseCategories,
  buildCategoryFilter,
  buildTextSearchFilter,
  paginatedResponse,
};
