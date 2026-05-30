const express = require("express");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  upvoteQuestion,
  acceptAnswer,
  unacceptAnswer,
  getSimilarQuestions,
} = require("../controllers/questionController");

const router = express.Router();

router.get("/similar", getSimilarQuestions);
router.get("/", optionalAuth, getQuestions);
router.get("/:id", optionalAuth, getQuestionById);
router.post("/", auth, createQuestion);
router.patch("/:id", auth, updateQuestion);
router.delete("/:id", auth, deleteQuestion);
router.patch("/:id/upvote", auth, upvoteQuestion);
router.patch("/:questionId/accept/:answerId", auth, acceptAnswer);
router.patch("/:questionId/unaccept", auth, unacceptAnswer);

module.exports = router;
