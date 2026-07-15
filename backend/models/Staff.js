const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    shift: {
      type: String,
      required: true,
      enum: ["Morning", "Evening", "Night"],
      default: "Morning",
    },

    status: {
      type: String,
      enum: ["Active", "On Leave"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Staff", staffSchema);