const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      enum: [
        "Admin",
        "Doctor",
        "Receptionist",
        "Patient",
        "Nurse",
        "Lab Technician",
        "Pharmacist"
      ],
    },

    access: {
      type: String,
      required: true,
      trim: true,
    },

    users: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Role", roleSchema);