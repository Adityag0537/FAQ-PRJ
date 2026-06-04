const Answer = require("../models/Answer");
const { attachVoteStatus, attachVoteStatusList } = require("./voteHelpers");
const { buildVisibleAnswerFilter } = require("./moderationVisibility");

const getAnswerCountMap = async (questionIds) => {
  if (!questionIds.length) {
    return {};
  }

  const answerFilter = await buildVisibleAnswerFilter({
    questionId: { $in: questionIds },
  });

  const counts = await Answer.aggregate([
    { $match: answerFilter },
    { $group: { _id: "$questionId", count: { $sum: 1 } } },
  ]);

  return counts.reduce((map, item) => {
    map[item._id.toString()] = item.count;
    return map;
  }, {});
};

const enrichQuestions = async (questions, userId) => {
  const questionIds = questions.map((q) => q._id);
  const countMap = await getAnswerCountMap(questionIds);
  const withVotes = attachVoteStatusList(questions, userId);

  return withVotes.map((question) => {
    const acceptedAnswerContent = question.acceptedAnswer
      ? question.acceptedAnswerContent
      : "";

    return {
      ...question,
      acceptedAnswerContent,
      answerCount: countMap[question._id.toString()] || 0,
      attachmentCount: question.attachments?.length || 0,
    };
  });
};

const enrichQuestion = async (question, userId) => {
  const countMap = await getAnswerCountMap([question._id]);
  const enriched = attachVoteStatus(question, userId);

  return {
    ...enriched,
    acceptedAnswerContent: enriched.acceptedAnswer
      ? enriched.acceptedAnswerContent
      : "",
    answerCount: countMap[question._id.toString()] || 0,
    attachmentCount: question.attachments?.length || 0,
  };
};

module.exports = {
  enrichQuestions,
  enrichQuestion,
};
