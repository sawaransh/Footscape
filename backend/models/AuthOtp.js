const mongoose = require("mongoose");

const authOtpSchema = new mongoose.Schema({
  purpose: { type: String, enum: ["signup", "login"], required: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  codeHash: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  pendingUser: {
    name: { type: String, trim: true },
    username: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, select: false },
  },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true });

authOtpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model("AuthOtp", authOtpSchema);
