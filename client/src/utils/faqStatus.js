export function isFaqEligible(question, { faqMinViews = 100, faqMinAgeDays = 7 } = {}) {
  const hasAccepted = Boolean(
    question.acceptedAnswer &&
      (typeof question.acceptedAnswer === "object"
        ? question.acceptedAnswer._id
        : question.acceptedAnswer)
  );

  if (!hasAccepted) {
    return false;
  }

  if ((question.views || 0) < faqMinViews) {
    return false;
  }

  const minCreatedAt = new Date();
  minCreatedAt.setDate(minCreatedAt.getDate() - faqMinAgeDays);

  return new Date(question.createdAt) <= minCreatedAt;
}
