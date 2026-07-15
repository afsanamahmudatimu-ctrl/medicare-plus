// backend/routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();
const { updateAppointmentStatus } = require("../controllers/appointmentController");
const controller = require("../controllers/appointmentController");
const appointmentController = require("../controllers/appointmentController");

const auth = require("../middleware/authMiddleware");

// Get booking data (doctors + available slots)
router.get("/booking-data", auth, appointmentController.getBookingData);

// Get user's appointments
router.get("/my", auth, appointmentController.getMyAppointments);

// Get all appointments
router.get("/", auth, controller.getAppointments);

// Get single appointment
router.get("/:id", auth, controller.getAppointment);

// Create appointment
router.post("/", auth, controller.createAppointment);

// Update appointment
router.put("/:id", auth, controller.updateAppointment);

// Update appointment status
router.put("/status/:id", auth, updateAppointmentStatus);

// Delete/Cancel appointment
router.delete("/:id", auth, controller.deleteAppointment);

module.exports = router;