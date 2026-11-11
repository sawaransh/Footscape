const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    globalRole: {
      type: String,
      enum: ["member", "partner", "admin", "master_admin"],
      default: "member",
      index: true,
    },
  },
  { timestamps: true }
);

userSchema.virtual("initials").get(function getInitials() {
  return this.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
});

userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
