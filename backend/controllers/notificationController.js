const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.userId }, { unread: false });
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.userId });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};