// routes/bedRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/bedController");
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get("/", auth, allowRoles("Admin", "Receptionist"), controller.getBeds);
router.post("/", auth, allowRoles("Admin", "Receptionist"), controller.createBed);
router.put("/:id", auth, allowRoles("Admin", "Receptionist"), controller.updateBed);
router.delete("/:id", auth, allowRoles("Admin", "Receptionist"), controller.deleteBed);

module.exports = router;