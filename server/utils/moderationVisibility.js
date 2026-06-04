const User = require("../models/User");

const visibleAnswerFilter = { isRemoved: { $ne: true } };

const getSuspendedUserIds = () =>
  User.find({ isSuspended: true }).distinct("_id");

const buildActiveAuthorFilter = (suspendedUserIds) =>
  suspendedUserIds.length ? { author: { $nin: suspendedUserIds } } : {};

const buildVisibleQuestionFilter = async (filter = {}) => ({
  ...filter,
  ...buildActiveAuthorFilter(await getSuspendedUserIds()),
});

const buildVisibleAnswerFilter = async (filter = {}) => ({
  ...filter,
  ...visibleAnswerFilter,
  ...buildActiveAuthorFilter(await getSuspendedUserIds()),
});

module.exports = {
  visibleAnswerFilter,
  getSuspendedUserIds,
  buildActiveAuthorFilter,
  buildVisibleQuestionFilter,
  buildVisibleAnswerFilter,
};
