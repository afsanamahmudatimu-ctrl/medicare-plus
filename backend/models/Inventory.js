const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);