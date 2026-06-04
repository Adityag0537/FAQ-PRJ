const Question = require("../models/Question");
const {
  buildVisibleAnswerFilter,
} = require("./moderationVisibility");

const VALID_SORTS = [
  "newest",
  "oldest",
  "most-answers",
  "most-upvoted",
  "unanswered",
  "solved",
];

const parseSort = (sort) =>
  VALID_SORTS.includes(sort) ? sort : "newest";

const buildSortOption = (sort, hasSearch) => {
  if (hasSearch) {
    return { score: { $meta: "textScore" } };
  }

  switch (sort) {
    case "oldest":
      return { createdAt: 1 };
    case "most-upvoted":
      return { upvotes: -1, createdAt: -1 };
    case "solved":
      return { createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
};

const populateQuestionQuery = (query, answerFilter) =>
  query
    .populate("author", "name email")
    .populate({
      path: "acceptedAnswer",
      match: answerFilter,
      populate: { path: "author", select: "name email" },
    });

const reorderByIds = (documents, ids) => {
  const orderMap = new Map(ids.map((id, index) => [id.toString(), index]));

  return [...documents].sort(
    (a, b) =>
      orderMap.get(a._id.toString()) - orderMap.get(b._id.toString())
  );
};

const fetchByAnswerCountSort = async (filter, sort, skip, limit) => {
  const answerFilter = await buildVisibleAnswerFilter();
  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "answers",
        let: { questionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$questionId", "$$questionId"] },
              ...answerFilter,
            },
          },
        ],
        as: "_answers",
      },
    },
    {
      $addFields: {
        answerCount: { $size: "$_answers" },
      },
    },
  ];

  if (sort === "unanswered") {
    pipeline.push({ $match: { answerCount: 0 } });
    pipeline.push({ $sort: { createdAt: -1 } });
  } else {
    pipeline.push({ $sort: { answerCount: -1, createdAt: -1 } });
  }

  pipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      total: [{ $count: "count" }],
    },
  });

  const [result] = await Question.aggregate(pipeline);
  const ids = result.data.map((item) => item._id);
  const total = result.total[0]?.count || 0;

  if (!ids.length) {
    return { questions: [], total };
  }

  const populated = await populateQuestionQuery(
    Question.find({ _id: { $in: ids } }),
    answerFilter
  );

  const questions = await populated;
  return { questions: reorderByIds(questions, ids), total };
};

const fetchQuestionsSorted = async ({
  filter,
  sort,
  skip,
  limit,
  hasSearch,
}) => {
  if (sort === "most-answers" || sort === "unanswered") {
    return fetchByAnswerCountSort(filter, sort, skip, limit);
  }

  const answerFilter = await buildVisibleAnswerFilter();
  let query = populateQuestionQuery(
    Question.find(filter).sort(buildSortOption(sort, hasSearch)),
    answerFilter
  );

  if (hasSearch) {
    query = query.select({ score: { $meta: "textScore" } });
  }

  const [questions, total] = await Promise.all([
    query.skip(skip).limit(limit),
    Question.countDocuments(filter),
  ]);

  return { questions, total };
};

module.exports = {
  VALID_SORTS,
  parseSort,
  fetchQuestionsSorted,
};
