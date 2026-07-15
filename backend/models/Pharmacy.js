const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    medicine: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Low Stock", "Out of Stock"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pharmacy", pharmacySchema);