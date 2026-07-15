const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    _id: {
    type: String
  },
    name: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
     
    },

    specialty: {
      type: String
    },

    email: {
      type: String,
      unique: true,
      lowercase: true
    },

    phone: {
      type: String
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },

    initials: {
      type: String
    },

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },

    patients: {
      type: Number,
      default: 0
    },

    availableSlots: [
      {
        date: String,
        time: String
      }
    ],

    appointments: {
      type: Number,
      default: 0
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);