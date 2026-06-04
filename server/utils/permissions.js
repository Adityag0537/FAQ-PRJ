const isAdmin = (user) => user?.role === "ADMIN";

const isOwner = (user, authorId) =>
  user &&
  authorId &&
  user._id.toString() === authorId.toString();

const canEditQuestion = (user, question) =>
  isAdmin(user) || isOwner(user, question?.author);

const canDeleteQuestion = (user, question) =>
  isAdmin(user) || isOwner(user, question?.author);

const canEditAnswer = (user, answer) =>
  isAdmin(user) || isOwner(user, answer?.author);

const canDeleteAnswer = (user, answer) =>
  isAdmin(user) || isOwner(user, answer?.author);

module.exports = {
  isAdmin,
  isOwner,
  canEditQuestion,
  canDeleteQuestion,
  canEditAnswer,
  canDeleteAnswer,
};
