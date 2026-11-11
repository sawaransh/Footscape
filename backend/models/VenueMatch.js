const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  side: { type: String, enum: ["A", "B"], required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  amount: { type: Number, required: true, min: 0 },
  paymentOrderId: { type: String, default: "" },
  paymentId: { type: String, default: "" },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

const venueMatchSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  venueName: { type: String, required: true, trim: true, maxlength: 120 },
  address: { type: String, required: true, trim: true, maxlength: 240 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  dateTime: { type: Date, required: true, index: true },
  duration: { type: Number, default: 60, min: 30, max: 240 },
  format: { type: String, default: "5v5", trim: true, maxlength: 12 },
  sideCapacity: { type: Number, required: true, min: 1, max: 22 },
  price: { type: Number, required: true, min: 0, max: 100000 },
  description: { type: String, default: "", trim: true, maxlength: 500 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookings: [bookingSchema],
  status: { type: String, enum: ["open", "cancelled", "completed"], default: "open" },
}, { timestamps: true });

module.exports = mongoose.model("VenueMatch", venueMatchSchema);
