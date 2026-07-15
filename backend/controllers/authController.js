const User = require("../models/User");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ====================== Register ======================

exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check existing email
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Allow only valid roles
    const allowedRoles = [
      "Patient",
      "Doctor",
      "Admin",
      "Receptionist",
    ];

    const userRole = allowedRoles.includes(role)
      ? role
      : "Patient";

    // Check existing phone up front (Patient.phone is unique) so we
    // never create a User we'd have to roll back.
    if (userRole === "Patient") {
      const phoneTaken = await Patient.findOne({ phone });
      if (phoneTaken) {
        return res.status(400).json({
          success: false,
          message: "This phone number is already registered to another patient",
        });
      }
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
      phone,
      role: userRole,
    });

    // Create Patient Profile
    try {
      if (userRole === "Patient") {
        await Patient.create({
          user: user._id,
          firstName,
          lastName,
          email,
          phone,
          age: 18, // Default age (update later)
          status: "Active",
        });
      }
    } catch (err) {
      // Rollback User if Patient creation fails
      console.error("Patient creation failed:", err.message);
      await User.findByIdAndDelete(user._id);

      // Give a clearer message for the common duplicate-key case
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        return res.status(400).json({
          success: false,
          message: `This ${field} is already in use`,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to create patient profile",
      });
    }

    // JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);

    // Handle duplicate key errors from the User collection too
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({
        success: false,
        message: `This ${field} is already in use`,
      });
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ====================== Login ======================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ====================== Current User ======================

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};