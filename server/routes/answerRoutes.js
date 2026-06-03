const express = require("express");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const {
  addAnswer,
  getAnswersByQuestion,
  updateAnswer,
  deleteAnswer,
  upvoteAnswer,
} = require("../controllers/answerController");

const router = express.Router();

router.get("/questions/:questionId/answers", optionalAuth, getAnswersByQuestion);
router.post("/questions/:questionId/answers", auth, addAnswer);
router.patch("/answers/:id", auth, updateAnswer);
router.delete("/answers/:id", auth, deleteAnswer);
router.patch("/answers/:id/upvote", auth, upvoteAnswer);

module.exports = router;
