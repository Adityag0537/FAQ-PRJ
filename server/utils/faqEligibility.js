const getFaqEligibilityFilter = ({ minViews, minAgeDays }) => {
  const minCreatedAt = new Date();
  minCreatedAt.setDate(minCreatedAt.getDate() - minAgeDays);

  return {
    acceptedAnswer: { $ne: null },
    views: { $gte: minViews },
    createdAt: { $lte: minCreatedAt },
  };
};

const isQuestionFaqEligible = (question, { minViews, minAgeDays }) => {
  if (!question.acceptedAnswer) {
    return false;
  }

  if ((question.views || 0) < minViews) {
    return false;
  }

  const minCreatedAt = new Date();
  minCreatedAt.setDate(minCreatedAt.getDate() - minAgeDays);

  return new Date(question.createdAt) <= minCreatedAt;
};

module.exports = {
  getFaqEligibilityFilter,
  isQuestionFaqEligible,
};
