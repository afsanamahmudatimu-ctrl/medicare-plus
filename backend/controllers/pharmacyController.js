const Pharmacy = require("../models/Pharmacy");

// Get All Medicines

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Pharmacy.find().sort({ createdAt: -1 });

    res.json(medicines);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Create Medicine

exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Pharmacy.create(req.body);

    res.status(201).json(medicine);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Update Medicine

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.json(medicine);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Delete Medicine

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Pharmacy.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.json({
      message: "Medicine Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};