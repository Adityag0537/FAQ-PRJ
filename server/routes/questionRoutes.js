const express = require("express");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const upload = require("../middleware/upload");
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
router.post("/", auth, upload.array("attachments", 5), createQuestion);
router.patch("/:id", auth, upload.array("attachments", 5), updateQuestion);
router.delete("/:id", auth, deleteQuestion);
router.patch("/:id/upvote", auth, upvoteQuestion);
router.patch("/:questionId/accept/:answerId", auth, acceptAnswer);
router.patch("/:questionId/unaccept", auth, unacceptAnswer);

module.exports = router;
