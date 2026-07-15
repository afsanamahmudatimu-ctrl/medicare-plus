const express = require("express");

const router = express.Router();
const { doctorPatients } = require("../controllers/doctorController");
const doctorController = require("../controllers/doctorController");

const auth = require("../middleware/authMiddleware");

router.get("/",auth,doctorController.getDoctors);

router.get("/:id",auth,doctorController.getDoctor);

router.post("/",auth,doctorController.createDoctor);

router.put("/:id",auth,doctorController.updateDoctor);

router.delete("/:id",auth,doctorController.deleteDoctor);

module.exports = router;