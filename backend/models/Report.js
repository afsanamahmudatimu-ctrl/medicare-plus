const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: String,
    patient: String,
    date: String,
    status: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);