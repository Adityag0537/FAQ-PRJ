const express = require("express");
const auth = require("../middleware/auth");
const { reportAnswer } = require("../controllers/reportController");

const router = express.Router();

router.post("/answers/:id/report", auth, reportAnswer);

module.exports = router;
