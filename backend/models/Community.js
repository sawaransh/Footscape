const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  inviteCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Community", communitySchema);
