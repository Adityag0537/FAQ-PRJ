const express = require("express");
const optionalAuth = require("../middleware/optionalAuth");
const { getLeaderboard } = require("../controllers/leaderboardController");

const router = express.Router();

router.get("/", optionalAuth, getLeaderboard);

module.exports = router;
