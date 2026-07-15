const Staff = require("../models/Staff");

// Get All Staff

exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    res.json(staff);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Create Staff

exports.createStaff = async (req, res) => {
  try {
    const staff = await Staff.create(req.body);

    res.status(201).json(staff);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Update Staff

exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.json(staff);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Delete Staff

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    res.json({
      message: "Staff deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};