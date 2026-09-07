const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
  fixture: { type: mongoose.Schema.Types.ObjectId, ref: "Fixture" },
  type: { type: String, enum: ["fixture-created", "fixture-reminder"], required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 280 },
  readAt: { type: Date, default: null },
  dedupeKey: { type: String, unique: true, sparse: true },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
