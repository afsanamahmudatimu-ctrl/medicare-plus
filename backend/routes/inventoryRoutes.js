// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/inventoryController");
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get("/", auth, allowRoles("Admin", "Receptionist"), controller.getInventory);
router.post("/", auth, allowRoles("Admin", "Receptionist"), controller.createInventory);
router.put("/:id", auth, allowRoles("Admin", "Receptionist"), controller.updateInventory);
router.delete("/:id", auth, allowRoles("Admin", "Receptionist"), controller.deleteInventory);

module.exports = router;