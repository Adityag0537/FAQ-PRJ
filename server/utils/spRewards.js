const { ACCEPTED_ANSWER_SP_REWARD, ANSWER_UPVOTE_SP_REWARD } = require("../config/constants");
const { adjustSpPoints } = require("./spPoints");

const awardAcceptedAnswerSp = async (question, answer) => {
  if (!answer?.author) {
    return;
  }

  await adjustSpPoints(answer.author, ACCEPTED_ANSWER_SP_REWARD);
  question.acceptedAnswerSpAwardedTo = answer.author;
};

const revokeAcceptedAnswerSp = async (question) => {
  if (!question.acceptedAnswerSpAwardedTo) {
    return;
  }

  await adjustSpPoints(
    question.acceptedAnswerSpAwardedTo,
    -ACCEPTED_ANSWER_SP_REWARD
  );
  question.acceptedAnswerSpAwardedTo = null;
};

const handleAcceptedAnswerChange = async (question, previousAnswerId, newAnswer) => {
  const previousAwardedTo = question.acceptedAnswerSpAwardedTo?.toString();

  if (previousAnswerId && previousAwardedTo) {
    await revokeAcceptedAnswerSp(question);
  }

  if (newAnswer) {
    await awardAcceptedAnswerSp(question, newAnswer);
  }
};

const handleAnswerUpvoteSp = async (answer, userId, isAddingUpvote) => {
  const authorId = answer.author?.toString();

  if (!authorId || authorId === userId.toString()) {
    return;
  }

  const delta = isAddingUpvote ? ANSWER_UPVOTE_SP_REWARD : -ANSWER_UPVOTE_SP_REWARD;
  await adjustSpPoints(answer.author, delta);
};

module.exports = {
  awardAcceptedAnswerSp,
  revokeAcceptedAnswerSp,
  handleAcceptedAnswerChange,
  handleAnswerUpvoteSp,
};
