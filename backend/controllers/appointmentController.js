const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const mongoose = require("mongoose");
// =========================
// Get All Appointments
// =========================
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient")
      .populate("doctor")
      .sort({ date: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =========================
// Create Appointment
// =========================
// ===============================
// Create Appointment
// ===============================
exports.createAppointment = async (req, res) => {
  try {

    const {
      doctor,
      doctorId,
      patient,
      date,
      time,
      type,
      mode,
      reason,
      status,
      notes,
    } = req.body;

    const selectedDoctor = doctor || doctorId;

    // Required Fields
    if (!selectedDoctor || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Doctor, Date and Time are required.",
      });
    }

    // Validate Doctor Id
    if (!mongoose.Types.ObjectId.isValid(selectedDoctor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Doctor ID",
      });
    }

    // Check Doctor
    const doctorDoc = await Doctor.findById(selectedDoctor);

    if (!doctorDoc) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    let patientId;

    // ===========================
    // Patient Booking
    // ===========================

    if (req.user.role === "Patient") {

      const patientDoc = await Patient.findOne({
        user: req.user._id,
        isDeleted: false,
      });

      if (!patientDoc) {
        return res.status(404).json({
          success: false,
          message: "Patient profile not found",
        });
      }

      patientId = patientDoc._id;

    }

    // ===========================
    // Admin Booking
    // ===========================

    else {

      if (!patient) {
        return res.status(400).json({
          success: false,
          message: "Patient is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(patient)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Patient ID",
        });
      }

      const patientDoc = await Patient.findById(patient);

      if (!patientDoc || patientDoc.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      patientId = patientDoc._id;
    }

    // ===========================
    // Date Validation
    // ===========================

    const appointmentDate = new Date(date);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    // ===========================
    // Duplicate Slot Check
    // ===========================

    const slotExists = await Appointment.findOne({
      doctor: doctorDoc._id,
      date: appointmentDate,
      time,
      status: {
        $nin: ["Cancelled"],
      },
    });

    if (slotExists) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is already booked.",
      });
    }

    // ===========================
    // Create Appointment
    // ===========================

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorDoc._id,
      date: appointmentDate,
      time,
      type: type || "Consultation",
      mode: mode || "In-person",
      reason,
      notes,
      status:
        req.user.role === "Patient"
          ? "Confirmed"
          : status || "Confirmed",
    });

    const result = await Appointment.findById(appointment._id)
      .populate("patient")
      .populate("doctor");

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully.",
      appointment: result,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

// =========================
// Get Single Appointment
// =========================
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient")
      .populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// =========================
// Update Appointment
// =========================
exports.updateAppointment = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.doctorId && !updateData.doctor) {
      updateData.doctor = updateData.doctorId;
      delete updateData.doctorId;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient")
      .populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// =========================
// Cancel Appointment
// =========================
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    const isStaff =
      req.user.role === "admin" ||
      req.user.role === "receptionist";

    if (!isStaff) {
      const patient = await Patient.findOne({
        user: req.user._id,
      });

      if (!patient) {
        return res.status(404).json({
          message: "Patient profile not found",
        });
      }

      if (
        appointment.patient.toString() !== patient._id.toString()
      ) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }
    }

    appointment.status = "Cancelled";

    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled",
      appointment,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// =========================
// Booking Data
// =========================
exports.getBookingData = async (req, res) => {
  try {
    const doctors = await Doctor.find().select(
      "_id name department experience qualification email phone"
    );

    const timeSlots = [
      "09:00 AM",
      "10:00 AM",
      "11:00 AM",
      "12:00 PM",
      "02:00 PM",
      "03:00 PM",
      "04:00 PM",
    ];

    const availableDates = [];

    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);

      date.setDate(today.getDate() + i);

      if (date.getDay() !== 0) {
        availableDates.push(
          date.toISOString().split("T")[0]
        );
      }
    }

    const formattedDoctors = doctors.map((doc) => ({
      id: doc._id,
      name: doc.name,
      department: doc.department,
      specialty: doc.department,
      email: doc.email,
      phone: doc.phone,
      experience: doc.experience,
      qualification: doc.qualification,
      initials: doc.name
        .split(" ")
        .map((x) => x[0])
        .join("")
        .toUpperCase(),
      rating: 4.5,
      patients: 120,
      availableSlots: availableDates.flatMap((date) =>
        timeSlots.map((time) => ({
          date,
          time,
        }))
      ),
    }));

    res.json({
      doctors: formattedDoctors,
      timeSlots,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// =========================
// My Appointments
// =========================
exports.getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      user: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    const appointments = await Appointment.find({
      patient: patient._id,
    })
      .populate("doctor", "name department email phone")
      .sort({ date: -1 });

    res.json({
      appointments,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// =========================
// Update Status
// =========================
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.status = req.body.status;

    await appointment.save();

    res.json({
      success: true,
      message: "Status updated",
      appointment,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};