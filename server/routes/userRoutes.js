const express = require("express");
const auth = require("../middleware/auth");
const {
  getMyQuestions,
  getMyAnswers,
} = require("../controllers/activityController");

const router = express.Router();

router.get("/me/questions", auth, getMyQuestions);
router.get("/me/answers", auth, getMyAnswers);

module.exports = router;
