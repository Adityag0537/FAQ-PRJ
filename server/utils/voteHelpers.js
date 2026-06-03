const attachVoteStatus = (doc, userId, type = "question") => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };

  if (userId && obj.upvotedBy) {
    obj.userHasUpvoted = obj.upvotedBy.some(
      (id) => id.toString() === userId.toString()
    );
  } else if (userId) {
    obj.userHasUpvoted = false;
  } else {
    obj.userHasUpvoted = false;
  }

  delete obj.upvotedBy;
  return obj;
};

const attachVoteStatusList = (docs, userId) =>
  docs.map((doc) => attachVoteStatus(doc, userId));

module.exports = {
  attachVoteStatus,
  attachVoteStatusList,
};
