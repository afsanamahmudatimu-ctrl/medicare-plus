// routes/staffRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/staffController");
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get("/", auth, allowRoles("Admin"), controller.getStaff);
router.post("/", auth, allowRoles("Admin"), controller.createStaff);
router.put("/:id", auth, allowRoles("Admin"), controller.updateStaff);
router.delete("/:id", auth, allowRoles("Admin"), controller.deleteStaff);

module.exports = router;