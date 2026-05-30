export function getQuestionStatus(question, faqThreshold = 5) {
  const hasAccepted = Boolean(
    question.acceptedAnswer &&
      (typeof question.acceptedAnswer === "object"
        ? question.acceptedAnswer._id
        : question.acceptedAnswer)
  );

  if (hasAccepted && question.upvotes >= faqThreshold) {
    return "faq";
  }

  if (hasAccepted) {
    return "solved";
  }

  return "open";
}

export function getAcceptedAnswerPreview(question, maxLength = 140) {
  const answer = question.acceptedAnswer;

  if (!answer) {
    return null;
  }

  const content =
    typeof answer === "object" ? answer.content : question.acceptedAnswerContent;

  if (!content) {
    return null;
  }

  if (content.length <= maxLength) {
    return content;
  }

  return `${content.slice(0, maxLength).trim()}…`;
}

export function getAcceptedAnswerId(question) {
  if (!question.acceptedAnswer) {
    return null;
  }

  const id =
    typeof question.acceptedAnswer === "object"
      ? question.acceptedAnswer._id
      : question.acceptedAnswer;

  return id?.toString() ?? null;
}

export function mergeQuestionUpdate(previous, updated) {
  return {
    ...previous,
    ...updated,
    author: updated.author ?? previous.author,
    categories: updated.categories ?? previous.categories,
    acceptedAnswer: updated.acceptedAnswer ?? previous.acceptedAnswer,
    answerCount:
      updated.answerCount !== undefined
        ? updated.answerCount
        : previous.answerCount,
  };
}
