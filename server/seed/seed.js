const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const QuestionReport = require("../models/QuestionReport");
const AnswerReport = require("../models/AnswerReport");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config/adminCredentials");

dotenv.config();

const SEED_USER_EMAIL = "seed@samagama.local";

const ensureSeedAdmin = async (passwordHash) => {
  let adminUser = await User.findOne({ email: ADMIN_EMAIL });

  if (!adminUser) {
    adminUser = await User.create({
      name: "Samagama Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
    });
    console.log(`Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  return adminUser;
};

const removeSeedQuestions = async () => {
  const seedUser = await User.findOne({ email: SEED_USER_EMAIL }).select("_id");
  const filters = [{ isSeed: true }];

  if (seedUser) {
    filters.push({ author: seedUser._id });
  }

  const seedQuestionIds = await Question.find({ $or: filters }).distinct("_id");

  if (!seedQuestionIds.length) {
    return 0;
  }

  await Answer.deleteMany({ questionId: { $in: seedQuestionIds } });
  await Question.deleteMany({ _id: { $in: seedQuestionIds } });

  return seedQuestionIds.length;
};

const removeNonAdminUsers = async () => {
  const nonAdminUserIds = await User.find({ role: { $ne: "ADMIN" } }).distinct("_id");

  if (!nonAdminUserIds.length) {
    return {
      users: 0,
      questions: 0,
      answers: 0,
    };
  }

  const questionIds = await Question.find({
    author: { $in: nonAdminUserIds },
  }).distinct("_id");

  const answerIds = await Answer.find({
    $or: [
      { author: { $in: nonAdminUserIds } },
      { questionId: { $in: questionIds } },
    ],
  }).distinct("_id");

  if (answerIds.length) {
    await Question.updateMany(
      { acceptedAnswer: { $in: answerIds } },
      {
        acceptedAnswer: null,
        acceptedAnswerContent: "",
        acceptedAnswerSpAwardedTo: null,
      }
    );
    await AnswerReport.deleteMany({ answerId: { $in: answerIds } });
  }

  if (questionIds.length) {
    await QuestionReport.deleteMany({ questionId: { $in: questionIds } });
  }

  await Answer.deleteMany({
    $or: [
      { _id: { $in: answerIds } },
      { questionId: { $in: questionIds } },
    ],
  });
  await Question.deleteMany({ _id: { $in: questionIds } });
  await User.deleteMany({ _id: { $in: nonAdminUserIds } });

  return {
    users: nonAdminUserIds.length,
    questions: questionIds.length,
    answers: answerIds.length,
  };
};

const seedDatabase = async ({ closeConnection = false } = {}) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await ensureSeedAdmin(passwordHash);

  const removedCount = await removeSeedQuestions();
  console.log(`Removed ${removedCount} seed question${removedCount === 1 ? "" : "s"}.`);

  const nonAdminRemoved = await removeNonAdminUsers();
  console.log(
    `Removed ${nonAdminRemoved.users} non-admin user${nonAdminRemoved.users === 1 ? "" : "s"}, ` +
      `${nonAdminRemoved.questions} question${nonAdminRemoved.questions === 1 ? "" : "s"}, ` +
      `and ${nonAdminRemoved.answers} answer${nonAdminRemoved.answers === 1 ? "" : "s"}.`
  );
  console.log("Seed admin is available.");

  if (closeConnection) {
    await mongoose.connection.close();
  }
};

if (require.main === module) {
  seedDatabase({ closeConnection: true })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
