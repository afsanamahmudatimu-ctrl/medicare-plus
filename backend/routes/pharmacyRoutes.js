// routes/pharmacyRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/pharmacyController");
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get("/", auth, allowRoles("Admin", "Receptionist"), controller.getMedicines);
router.post("/", auth, allowRoles("Admin", "Receptionist"), controller.createMedicine);
router.put("/:id", auth, allowRoles("Admin", "Receptionist"), controller.updateMedicine);
router.delete("/:id", auth, allowRoles("Admin", "Receptionist"), controller.deleteMedicine);

module.exports = router;