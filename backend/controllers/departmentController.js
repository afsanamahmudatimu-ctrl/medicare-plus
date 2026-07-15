const Department = require("../models/Department");

// Get All Departments

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });

    res.json(departments);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Create Department

exports.createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Update Department

exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json(department);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Delete Department

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found",
      });
    }

    res.json({
      message: "Department Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};