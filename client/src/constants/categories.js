export const CATEGORIES = [
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

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "most-answers", label: "Most Answers" },
  { value: "most-upvoted", label: "Most Upvoted" },
  { value: "unanswered", label: "Unanswered" },
  { value: "solved", label: "Solved" },
];

export function buildQueryParams({ search, categories, page, limit, sort }) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (categories?.length) {
    params.set("categories", categories.join(","));
  }

  if (page) {
    params.set("page", String(page));
  }

  if (limit) {
    params.set("limit", String(limit));
  }

  if (sort) {
    params.set("sort", sort);
  }

  return params.toString();
}
