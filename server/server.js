const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const seedDatabase = require("./seed/seed");
const { CATEGORIES, FAQ_UPVOTE_THRESHOLD } = require("./config/constants");

dotenv.config();

const startServer = async () => {
  await connectDB();

  try {
    await seedDatabase();
  } catch (error) {
    console.error("Seed error:", error.message);
  }

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/users", require("./routes/userRoutes"));
  app.use("/api/questions", require("./routes/questionRoutes"));
  app.use("/api/faqs", require("./routes/faqRoutes"));
  app.use("/api", require("./routes/answerRoutes"));

  app.get("/api/categories", (req, res) => {
    res.status(200).json({
      success: true,
      data: CATEGORIES,
    });
  });

  app.get("/api/config", (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        faqUpvoteThreshold: FAQ_UPVOTE_THRESHOLD,
      },
    });
  });

  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Samagama FAQ API Running",
    });
  });

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
