const User = require("../models/User");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const { getBadgeLevel } = require("../utils/badges");
const { parsePagination, paginatedResponse } = require("../utils/queryHelpers");

const visibleAnswerFilter = { isRemoved: { $ne: true } };

const getLeaderboard = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = { isSuspended: { $ne: true } };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name spPoints createdAt")
        .sort({ spPoints: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((u) => u._id);

    const [acceptedCounts, upvoteStats] = await Promise.all([
      Question.aggregate([
        {
          $match: {
            acceptedAnswer: { $ne: null },
          },
        },
        {
          $lookup: {
            from: "answers",
            localField: "acceptedAnswer",
            foreignField: "_id",
            as: "acceptedDoc",
          },
        },
        { $unwind: "$acceptedDoc" },
        {
          $match: {
            "acceptedDoc.author": { $in: userIds },
            "acceptedDoc.isRemoved": { $ne: true },
          },
        },
        {
          $group: {
            _id: "$acceptedDoc.author",
            count: { $sum: 1 },
          },
        },
      ]),
      Answer.aggregate([
        { $match: { author: { $in: userIds }, ...visibleAnswerFilter } },
        {
          $group: {
            _id: "$author",
            upvotesReceived: { $sum: "$upvotes" },
          },
        },
      ]),
    ]);

    const acceptedMap = acceptedCounts.reduce((map, row) => {
      map[row._id.toString()] = row.count;
      return map;
    }, {});

    const upvoteMap = upvoteStats.reduce((map, row) => {
      map[row._id.toString()] = row.upvotesReceived;
      return map;
    }, {});

    const currentUserId = req.user?._id?.toString();

    const data = users.map((user, index) => ({
      rank: skip + index + 1,
      _id: user._id,
      name: user.name,
      badge: getBadgeLevel(user.spPoints),
      spPoints: user.spPoints || 0,
      acceptedAnswersCount: acceptedMap[user._id.toString()] || 0,
      answerUpvotesReceived: upvoteMap[user._id.toString()] || 0,
      isCurrentUser: currentUserId === user._id.toString(),
    }));

    res.status(200).json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getLeaderboard,
};
