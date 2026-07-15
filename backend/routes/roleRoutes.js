// routes/roleRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/roleController");
const auth = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

router.get("/", auth, allowRoles("Admin"), controller.getRoles);
router.post("/", auth, allowRoles("Admin"), controller.createRole);
router.put("/:id", auth, allowRoles("Admin"), controller.updateRole);
router.delete("/:id", auth, allowRoles("Admin"), controller.deleteRole);

module.exports = router;