const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAllRead,
  clearAll,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);
router.patch("/mark-all-read", protect, markAllRead);
router.delete("/", protect, clearAll);

module.exports = router;