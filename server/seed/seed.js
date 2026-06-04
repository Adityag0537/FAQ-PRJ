const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config/adminCredentials");
const faqSeedData = require("./faqSeedData");

dotenv.config();

const seedDatabase = async ({ closeConnection = false } = {}) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const existingSeedCount = await Question.countDocuments({ isSeed: true });

  if (existingSeedCount > 0) {
    console.log("Seed FAQs already exist. Skipping seed.");
    if (closeConnection) {
      await mongoose.connection.close();
    }
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  let seedUser = await User.findOne({ email: "seed@samagama.local" });

  if (!seedUser) {
    seedUser = await User.create({
      name: "Samagama Seed",
      email: "seed@samagama.local",
      passwordHash,
      role: "USER",
    });
  }

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

  const seedCreatedAt = new Date();
  seedCreatedAt.setDate(seedCreatedAt.getDate() - 14);

  for (const item of faqSeedData) {
    const question = await Question.create({
      title: item.title,
      description: item.description,
      categories: item.categories,
      author: seedUser._id,
      upvotes: item.upvotes,
      views: item.views || 150,
      isSeed: true,
      createdAt: seedCreatedAt,
      updatedAt: seedCreatedAt,
    });

    const answer = await Answer.create({
      questionId: question._id,
      author: seedUser._id,
      content: item.answer,
      upvotes: 3,
    });

    question.acceptedAnswer = answer._id;
    question.acceptedAnswerContent = item.answer;
    question.acceptedAnswerSpAwardedTo = seedUser._id;
    await question.save();

    await User.findByIdAndUpdate(seedUser._id, {
      $inc: { spPoints: 10 },
    });
  }

  console.log(`Seeded ${faqSeedData.length} FAQ entries.`);

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
