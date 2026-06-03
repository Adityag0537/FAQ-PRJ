const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const { formatUserResponse } = require("../utils/userResponse");
const {
  getMyQuestions,
  getMyAnswers,
} = require("../controllers/activityController");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");

    res.status(200).json({
      success: true,
      data: formatUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/me/questions", auth, getMyQuestions);
router.get("/me/answers", auth, getMyAnswers);

module.exports = router;
