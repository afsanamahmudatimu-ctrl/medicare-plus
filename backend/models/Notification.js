const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    message: String,
    type: String, // appointment / lab / prescription / alert / system / billing
    unread: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);