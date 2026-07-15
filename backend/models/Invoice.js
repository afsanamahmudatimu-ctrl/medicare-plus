const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoice: {
      type: String,
      required: true,
      trim: true,
    },

    patient: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      
    },

    status: {
      type: String,
      enum: ["Paid", "Pending", "Processing"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);