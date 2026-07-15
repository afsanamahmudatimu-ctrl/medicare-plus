const Role = require("../models/Role");

// Get All Roles

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });

    res.json(roles);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Create Role

exports.createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body);

    res.status(201).json(role);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Update Role

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    res.json(role);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Delete Role

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);

    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    res.json({
      message: "Role deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};