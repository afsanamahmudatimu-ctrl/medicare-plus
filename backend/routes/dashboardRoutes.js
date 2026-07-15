const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get(
  "/stats",
  auth,
  allowRoles(
    "Admin", "Doctor", "Receptionist"),
  dashboardController.getStats
);

module.exports = router;