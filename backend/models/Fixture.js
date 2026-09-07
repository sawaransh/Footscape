const mongoose = require("mongoose");

const statSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  goals: { type: Number, default: 0, min: 0 },
  assists: { type: Number, default: 0, min: 0 },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  type: { type: String, enum: ["goal", "custom"], required: true },
  player: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true, trim: true, maxlength: 240 },
  elapsedSeconds: { type: Number, required: true, min: 0 },
}, { timestamps: true });

const fixtureSchema = new mongoose.Schema({
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  dateTime: { type: Date, required: true },
  duration: { type: Number, default: 90, min: 1, max: 360 },
  venue: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["scheduled", "completed"], default: "scheduled" },
  endedAt: { type: Date },
  timer: {
    paused: { type: Boolean, default: false },
    pausedAt: { type: Date, default: null },
    pausedDurationSeconds: { type: Number, default: 0, min: 0 },
  },
  rsvp: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  teams: {
    A: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    B: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  stats: [statSchema],
  events: [eventSchema],
}, { timestamps: true });

module.exports = mongoose.model("Fixture", fixtureSchema);
