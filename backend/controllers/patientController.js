const Patient = require("../models/Patient");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
// ===============================
// Get All Patients (Search + Pagination)
// ===============================
// ===============================
// Create Patient (Create User + Patient)
// ===============================
exports.createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      age,
      dateOfBirth,
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
      status,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !phone || !gender || !age || !email) {
      return res.status(400).json({
        success: false,
        message:
          "First Name, Last Name, Email, Phone, Gender and Age are required.",
      });
    }

    // Check User Email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Check Patient Phone
    const existingPatient = await Patient.findOne({
      $or: [
        { phone },
        { email },
      ],
    });

    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient already exists.",
      });
    }

    // Default Password
    const defaultPassword = "Patient@123";

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create User
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: "Patient",
    });

    try {
      // Create Patient
      const patient = await Patient.create({
        user: user._id,
        firstName,
        lastName,
        gender,
        age,
        dateOfBirth,
        bloodGroup,
        phone,
        email,
        address,
        emergencyContact,
        medicalHistory,
        allergies,
        status: status || "Active",
      });

      return res.status(201).json({
        success: true,
        message: "Patient created successfully.",
        loginCredentials: {
          email,
          password: defaultPassword,
        },
        patient,
      });

    } catch (err) {

      // Rollback User
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: "Failed to create patient profile.",
      });
    }

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
// ===============================
// Get All Patients (Search + Pagination)
// ===============================
exports.getPatients = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const query = {
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Patient.countDocuments(query);

    const patients = await Patient.find(query)
      .populate("user", "email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      patients,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// ===============================
// Get Single Patient
// ===============================
exports.getPatient = async (req, res) => {
  try {

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Patient ID",
      });
    }

    const patient = await Patient.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("user", "email role");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      patient,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
// ===============================
// Update Patient
// ===============================
exports.updatePatient = async (req, res) => {
  try {

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Patient ID",
      });
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient || patient.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const {
      firstName,
      lastName,
      gender,
      age,
      dateOfBirth,
      bloodGroup,
      phone,
      email,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
      status,
    } = req.body;

    // Duplicate Email
    if (email) {
      const emailExists = await Patient.findOne({
        email,
        _id: { $ne: patient._id },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Duplicate Phone
    if (phone) {
      const phoneExists = await Patient.findOne({
        phone,
        _id: { $ne: patient._id },
      });

      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }
    }

    // Update Patient
    patient.firstName = firstName ?? patient.firstName;
    patient.lastName = lastName ?? patient.lastName;
    patient.gender = gender ?? patient.gender;
    patient.age = age ?? patient.age;
    patient.dateOfBirth = dateOfBirth ?? patient.dateOfBirth;
    patient.bloodGroup = bloodGroup ?? patient.bloodGroup;
    patient.phone = phone ?? patient.phone;
    patient.email = email ?? patient.email;
    patient.address = address ?? patient.address;
    patient.emergencyContact =
      emergencyContact ?? patient.emergencyContact;
    patient.medicalHistory =
      medicalHistory ?? patient.medicalHistory;
    patient.allergies = allergies ?? patient.allergies;
    patient.status = status ?? patient.status;

    await patient.save();

    // Update User
    await User.findByIdAndUpdate(patient.user, {
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      email: patient.email,
    });

    const updatedPatient = await Patient.findById(patient._id)
      .populate("user", "email role");

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient: updatedPatient,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
// ===============================
// Soft Delete Patient
// ===============================
exports.deletePatient = async (req, res) => {
  try {

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Patient ID",
      });
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient || patient.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    patient.isDeleted = true;
    patient.status = "Inactive";

    await patient.save();

    // Delete User Login Account
    await User.findByIdAndDelete(patient.user);

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};
// ===============================
// Restore Patient
// ===============================
exports.restorePatient = async (req, res) => {

  try {

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Patient ID",
      });
    }

    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (!patient.user) {
      return res.status(400).json({
        success: false,
        message: "Cannot restore because login account no longer exists.",
      });
    }

    patient.isDeleted = false;
    patient.status = "Active";

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Patient restored successfully",
      patient,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};
// ===============================
// Patient Statistics
// ===============================
exports.getPatientCount = async (req, res) => {

  try {

    const total = await Patient.countDocuments({
      isDeleted: false,
    });

    const active = await Patient.countDocuments({
      status: "Active",
      isDeleted: false,
    });

    const inactive = await Patient.countDocuments({
      status: "Inactive",
      isDeleted: false,
    });

    const deleted = await Patient.countDocuments({
      isDeleted: true,
    });

    res.status(200).json({
      success: true,
      statistics: {
        total,
        active,
        inactive,
        deleted,
      },
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

};