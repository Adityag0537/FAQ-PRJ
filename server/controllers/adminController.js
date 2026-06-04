const Answer = require("../models/Answer");
const Question = require("../models/Question");
const User = require("../models/User");
const AnswerReport = require("../models/AnswerReport");
const QuestionReport = require("../models/QuestionReport");
const ModerationAudit = require("../models/ModerationAudit");
const { parsePagination, paginatedResponse } = require("../utils/queryHelpers");
const { updateFaqSettings, getFaqSettings } = require("../utils/settingsHelpers");
const { revokeAcceptedAnswerSp } = require("../utils/spRewards");

const logAudit = async ({
  admin,
  action,
  reason = "",
  targetUser = null,
  targetAnswer = null,
  targetQuestion = null,
  reportId = null,
}) => {
  await ModerationAudit.create({
    admin: admin._id,
    action,
    reason,
    targetUser,
    targetAnswer,
    targetQuestion,
    reportId,
  });
};

const getReportedAnswers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const status = req.query.status || "PENDING";

    const filter = status === "ALL" ? {} : { status };

    const [reports, total] = await Promise.all([
      AnswerReport.find(filter)
        .populate({
          path: "answerId",
          populate: [
            { path: "author", select: "name email role isSuspended" },
            { path: "removedBy", select: "name email" },
          ],
        })
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AnswerReport.countDocuments(filter),
    ]);

    const data = await Promise.all(
      reports.map(async (report) => {
        const answer = report.answerId;

        if (!answer) {
          return {
            report,
            answer: null,
            question: null,
          };
        }

        const question = await Question.findById(answer.questionId)
          .select("title _id")
          .populate("author", "name email");

        return {
          _id: report._id,
          status: report.status,
          reason: report.reason,
          additionalComments: report.additionalComments,
          createdAt: report.createdAt,
          reporter: report.reportedBy,
          answer: {
            _id: answer._id,
            content: answer.content,
            author: answer.author,
            isRemoved: answer.isRemoved,
            removedAt: answer.removedAt,
            removedReason: answer.removedReason,
            removedBy: answer.removedBy,
          },
          question,
        };
      })
    );

    res.status(200).json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReportedQuestions = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const status = req.query.status || "PENDING";

    const filter = status === "ALL" ? {} : { status };

    const [reports, total] = await Promise.all([
      QuestionReport.find(filter)
        .populate({
          path: "questionId",
          populate: { path: "author", select: "name email role isSuspended" },
        })
        .populate("reportedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      QuestionReport.countDocuments(filter),
    ]);

    const data = reports.map((report) => {
      const question = report.questionId;

      return {
        _id: report._id,
        status: report.status,
        reason: report.reason,
        additionalComments: report.additionalComments,
        createdAt: report.createdAt,
        reporter: report.reportedBy,
        question: question
          ? {
              _id: question._id,
              title: question.title,
              description: question.description,
              author: question.author,
            }
          : null,
      };
    });

    res.status(200).json(paginatedResponse(data, total, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const report = await AnswerReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const { status, reason } = req.body;
    const allowed = ["REVIEWED", "DISMISSED", "ACTION_TAKEN", "PENDING"];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    report.status = status;
    await report.save();

    const actionMap = {
      DISMISSED: "Dismiss Report",
      REVIEWED: "Mark Report Reviewed",
      ACTION_TAKEN: "Report Action Taken",
    };

    await logAudit({
      admin: req.user,
      action: actionMap[status] || "Update Report Status",
      reason: reason || "",
      reportId: report._id,
      targetAnswer: report.answerId,
    });

    res.status(200).json({
      success: true,
      message: "Report updated",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateQuestionReportStatus = async (req, res) => {
  try {
    const report = await QuestionReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const { status, reason } = req.body;
    const allowed = ["REVIEWED", "DISMISSED", "ACTION_TAKEN", "PENDING"];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
    }

    report.status = status;
    await report.save();

    const actionMap = {
      DISMISSED: "Dismiss Question Report",
      REVIEWED: "Mark Question Report Reviewed",
      ACTION_TAKEN: "Question Report Action Taken",
    };

    await logAudit({
      admin: req.user,
      action: actionMap[status] || "Update Question Report Status",
      reason: reason || "",
      reportId: report._id,
      targetQuestion: report.questionId,
    });

    res.status(200).json({
      success: true,
      message: "Report updated",
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const adminRemoveAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    const question = await Question.findById(answer.questionId);

    if (
      question &&
      question.acceptedAnswer?.toString() === answer._id.toString()
    ) {
      await revokeAcceptedAnswerSp(question);
      question.acceptedAnswer = null;
      question.acceptedAnswerContent = "";
      question.acceptedAnswerSpAwardedTo = null;
      await question.save();
    }

    answer.isRemoved = true;
    answer.removedAt = new Date();
    answer.removedReason = req.body?.reason || "";
    answer.removedBy = req.user._id;

    await answer.save();
    await AnswerReport.updateMany(
      { answerId: answer._id },
      {
        status: "ACTION_TAKEN",
      }
    );
    await logAudit({
      admin: req.user,
      action: "Remove Answer",
      reason: req.body?.reason || "",
      targetAnswer: answer._id,
      targetQuestion: answer.questionId,
      targetUser: answer.author,
    });

    res.status(200).json({
      success: true,
      message: "Answer removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const adminEditAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: "Answer not found",
      });
    }

    const { content, reason } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    answer.content = content;
    await answer.save();

    const question = await Question.findById(answer.questionId);

    if (
      question &&
      question.acceptedAnswer?.toString() === answer._id.toString()
    ) {
      question.acceptedAnswerContent = content;
      await question.save();
    }

    await logAudit({
      admin: req.user,
      action: "Edit Answer",
      reason: reason || "",
      targetAnswer: answer._id,
      targetUser: answer.author,
    });

    const populated = await Answer.findById(answer._id).populate(
      "author",
      "name email"
    );

    res.status(200).json({
      success: true,
      message: "Answer updated",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const adminEditQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const { title, description, reason } = req.body;

    if (title) {
      question.title = title;
    }

    if (description) {
      question.description = description;
    }

    await question.save();

    await logAudit({
      admin: req.user,
      action: "Edit Question",
      reason: reason || "",
      targetQuestion: question._id,
    });

    res.status(200).json({
      success: true,
      message: "Question updated",
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const adminDeleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (question.acceptedAnswerSpAwardedTo) {
      await revokeAcceptedAnswerSp(question);
    }

    await Answer.deleteMany({ questionId: question._id });
    await QuestionReport.updateMany(
      { questionId: question._id },
      { status: "ACTION_TAKEN" }
    );
    await question.deleteOne();

    await logAudit({
      admin: req.user,
      action: "Delete Question",
      reason: req.body?.reason || "",
      targetQuestion: question._id,
    });

    res.status(200).json({
      success: true,
      message: "Question deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const issueWarning = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await logAudit({
      admin: req.user,
      action: "Issue Warning",
      reason: req.body?.reason || "",
      targetUser: user._id,
    });

    res.status(200).json({
      success: true,
      message: `Warning issued to ${user.name}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const reason = req.body?.reason || "User suspended";

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Cannot suspend an admin account",
      });
    }

    user.isSuspended = true;
    await user.save();

    const answers = await Answer.find({
      author: user._id,
      isRemoved: { $ne: true },
    });
    const answerIds = answers.map((answer) => answer._id);

    if (answerIds.length) {
      const acceptedQuestions = await Question.find({
        acceptedAnswer: { $in: answerIds },
      });

      for (const question of acceptedQuestions) {
        await revokeAcceptedAnswerSp(question);
        question.acceptedAnswer = null;
        question.acceptedAnswerContent = "";
        question.acceptedAnswerSpAwardedTo = null;
        await question.save();
      }

      await Answer.updateMany(
        { _id: { $in: answerIds } },
        {
          isRemoved: true,
          removedAt: new Date(),
          removedReason: reason,
          removedBy: req.user._id,
        }
      );
    }

    await AnswerReport.updateMany(
      {
        answerId: { $in: answerIds },
        status: "PENDING",
      },
      {
        status: "ACTION_TAKEN",
      }
    );

    const questionIds = await Question.find({ author: user._id }).distinct("_id");

    await QuestionReport.updateMany(
      {
        questionId: { $in: questionIds },
        status: "PENDING",
      },
      {
        status: "ACTION_TAKEN",
      }
    );

    await logAudit({
      admin: req.user,
      action: "Suspend User",
      reason,
      targetUser: user._id,
    });

    res.status(200).json({
      success: true,
      message: "User suspended",
      data: { _id: user._id, isSuspended: user.isSuspended },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isSuspended = false;
    await user.save();

    await logAudit({
      admin: req.user,
      action: "Reactivate User",
      reason: req.body?.reason || "",
      targetUser: user._id,
    });

    res.status(200).json({
      success: true,
      message: "User reactivated",
      data: { _id: user._id, isSuspended: user.isSuspended },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const search = (req.query.search || "").trim();

    const filter = {};

    if (req.query.isSuspended === "true") {
      filter.isSuspended = true;
    } else if (req.query.isSuspended === "false") {
      filter.isSuspended = { $ne: true };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json(paginatedResponse(users, total, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFaqConfig = async (req, res) => {
  try {
    const settings = await getFaqSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateFaqConfig = async (req, res) => {
  try {
    const { faqMinViews, faqMinAgeDays, reason } = req.body;
    const settings = await updateFaqSettings({ faqMinViews, faqMinAgeDays });

    await logAudit({
      admin: req.user,
      action: "Configure FAQ Thresholds",
      reason: reason || `Views: ${settings.faqMinViews}, Age: ${settings.faqMinAgeDays}d`,
    });

    res.status(200).json({
      success: true,
      message: "FAQ thresholds updated",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalAnswers,
      pendingAnswerReports,
      pendingQuestionReports,
      totalSp,
      topContributors,
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments({ isRemoved: { $ne: true } }),
      AnswerReport.countDocuments({ status: "PENDING" }),
      QuestionReport.countDocuments({ status: "PENDING" }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: "$spPoints" } } },
      ]),
      User.find()
        .select("name spPoints role")
        .sort({ spPoints: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        pendingReports: pendingAnswerReports + pendingQuestionReports,
        totalSpAwarded: totalSp[0]?.total || 0,
        topContributors,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAuditTrail = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [entries, total] = await Promise.all([
      ModerationAudit.find()
        .populate("admin", "name email")
        .populate("targetUser", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ModerationAudit.countDocuments(),
    ]);

    res.status(200).json(paginatedResponse(entries, total, page, limit));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReportedAnswers,
  getReportedQuestions,
  updateReportStatus,
  updateQuestionReportStatus,
  adminRemoveAnswer,
  adminEditAnswer,
  adminEditQuestion,
  adminDeleteQuestion,
  issueWarning,
  suspendUser,
  reactivateUser,
  getUsers,
  getFaqConfig,
  updateFaqConfig,
  getAnalytics,
  getAuditTrail,
};
