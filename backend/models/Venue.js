const mongoose = require("mongoose");

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  address: { type: String, required: true, trim: true, maxlength: 240 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
venueSchema.index({ name: 1, address: 1, city: 1 }, { unique: true });

module.exports = mongoose.model("Venue", venueSchema);
