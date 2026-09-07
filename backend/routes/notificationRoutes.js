const express = require("express");
const Notification = require("../models/Notification");
const authenticate = require("../middleware/authenticate");
const { serializeNotification } = require("../utils/notifications");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(40);
    return res.json({ notifications: notifications.map(serializeNotification) });
  } catch (error) { return next(error); }
});

router.patch("/:notificationId/read", async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user._id },
      { readAt: new Date() },
      { new: true },
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json({ notification: serializeNotification(notification) });
  } catch (error) { return next(error); }
});

router.patch("/read-all", async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, readAt: null }, { readAt: new Date() });
    return res.json({ ok: true });
  } catch (error) { return next(error); }
});

module.exports = router;
