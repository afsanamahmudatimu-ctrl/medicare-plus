const mongoose = require("mongoose");

const labSchema = new mongoose.Schema(
  {
    report: { type: String, required: true }, // short title used by admin list view
    title: String, // full title used by patient portal (falls back to `report`)
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    patientName: String,
    doctorName: String,
    department: String,
    labName: String,
    type: { type: String, default: "pathology" }, // cardiology | neurology | radiology | pathology
    date: String,
    status: { type: String, default: "Pending" }, // Reviewed/Completed | Processing | Pending
    result: String,
    remarks: String,
    fileUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lab", labSchema);