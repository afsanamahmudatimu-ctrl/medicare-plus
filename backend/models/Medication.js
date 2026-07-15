const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  dosage: String,
  progress: Number,
  time: String,
});

module.exports = mongoose.model("Medication", medicationSchema);