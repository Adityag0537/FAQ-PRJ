const express = require("express");
const auth = require("../middleware/auth");
const {
  reportAnswer,
  reportQuestion,
} = require("../controllers/reportController");

const router = express.Router();

router.post("/answers/:id/report", auth, reportAnswer);
router.post("/questions/:id/report", auth, reportQuestion);

module.exports = router;
