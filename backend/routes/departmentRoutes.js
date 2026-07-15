// routes/departmentRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/departmentController");
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get("/", auth, allowRoles("Admin", "Receptionist"), controller.getDepartments);
router.post("/", auth, allowRoles("Admin", "Receptionist"), controller.createDepartment);
router.put("/:id", auth, allowRoles("Admin", "Receptionist"), controller.updateDepartment);
router.delete("/:id", auth, allowRoles("Admin", "Receptionist"), controller.deleteDepartment);

module.exports = router;