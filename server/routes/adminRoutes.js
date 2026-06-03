const express = require("express");
const auth = require("../middleware/auth");
const { requireAdmin } = require("../middleware/authorize");
const {
  getReportedAnswers,
  updateReportStatus,
  adminRemoveAnswer,
  adminEditAnswer,
  adminEditQuestion,
  adminDeleteQuestion,
  issueWarning,
  suspendUser,
  reactivateUser,
  getUsers,
  getFaqConfig,
  updateFaqConfig,
  getAnalytics,
  getAuditTrail,
} = require("../controllers/adminController");

const router = express.Router();

router.use(auth, requireAdmin);

router.get("/analytics", getAnalytics);
router.get("/audit", getAuditTrail);
router.get("/reports", getReportedAnswers);
router.patch("/reports/:id", updateReportStatus);
router.delete("/answers/:id", adminRemoveAnswer);
router.patch("/answers/:id", adminEditAnswer);
router.patch("/questions/:id", adminEditQuestion);
router.delete("/questions/:id", adminDeleteQuestion);
router.post("/users/:userId/warn", issueWarning);
router.patch("/users/:userId/suspend", suspendUser);
router.patch("/users/:userId/reactivate", reactivateUser);
router.get("/users", getUsers);
router.get("/faq-config", getFaqConfig);
router.patch("/faq-config", updateFaqConfig);

module.exports = router;
