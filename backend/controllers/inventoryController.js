const Inventory = require("../models/Inventory");

// Get All Items

exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Create Item

exports.createInventory = async (req, res) => {
  try {
    const item = await Inventory.create(req.body);

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Update Item

exports.updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    res.json(item);
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// Delete Item

exports.deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    res.json({
      message: "Inventory item deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};