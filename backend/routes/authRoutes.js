const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AuthOtp = require("../models/AuthOtp");
const authenticate = require("../middleware/authenticate");
const { sendAuthOtp } = require("../utils/email");

const router = express.Router();
const toPublicUser = (user) => ({ id: user._id.toString(), name: user.name, email: user.email, username: user.username, initials: user.initials });
const createToken = (user) => jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
const hashOtp = (code) => crypto.createHmac("sha256", process.env.JWT_SECRET).update(code).digest("hex");
const makeOtp = () => crypto.randomInt(100000, 1000000).toString();

async function createAndSendOtp({ purpose, email, user, pendingUser }) {
  const code = makeOtp();
  await AuthOtp.deleteMany({ email, purpose });
  const otp = await AuthOtp.create({ purpose, email, codeHash: hashOtp(code), user: user?._id, pendingUser, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
  try { await sendAuthOtp({ to: email, code, purpose }); }
  catch (error) { await AuthOtp.findByIdAndDelete(otp._id); throw error; }
  return otp;
}

// Direct auth remains available while email verification is being configured.
// The OTP routes below can be enabled in the client later without changing accounts.
router.post("/signup", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const username = `@${email?.split("@")[0] || ""}`;
    if (!name || !email?.includes("@") || !password || password.length < 6) return res.status(400).json({ message: "Provide a name, valid email, and password of at least 6 characters" });
    if (await User.exists({ $or: [{ email }, { username }] })) return res.status(409).json({ message: "An account already exists with this email" });
    const user = await User.create({ name, email, username, passwordHash: await bcrypt.hash(password, 12) });
    return res.status(201).json({ user: toPublicUser(user), token: createToken(user), isNewUser: true });
  } catch (error) { return next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const identifier = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select("+passwordHash");
    if (!user || !password || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Email or password is incorrect" });
    return res.json({ user: toPublicUser(user), token: createToken(user), isNewUser: false });
  } catch (error) { return next(error); }
});

router.post("/signup/request", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const username = `@${email?.split("@")[0] || ""}`;
    if (!name || !email?.includes("@") || !password || password.length < 6) return res.status(400).json({ message: "Provide a name, valid email, and password of at least 6 characters" });
    if (await User.exists({ $or: [{ email }, { username }] })) return res.status(409).json({ message: "An account already exists with this email" });
    const otp = await createAndSendOtp({ purpose: "signup", email, pendingUser: { name, username, passwordHash: await bcrypt.hash(password, 12) } });
    return res.status(202).json({ verificationId: otp._id.toString(), email });
  } catch (error) { return next(error); }
});

router.post("/login/request", async (req, res, next) => {
  try {
    const identifier = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select("+passwordHash");
    if (!user || !password || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Email or password is incorrect" });
    const otp = await createAndSendOtp({ purpose: "login", email: user.email, user });
    return res.status(202).json({ verificationId: otp._id.toString(), email: user.email });
  } catch (error) { return next(error); }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const verificationId = req.body.verificationId;
    const code = String(req.body.code || "").replace(/\s/g, "");
    if (!verificationId || !/^\d{6}$/.test(code)) return res.status(400).json({ message: "Enter the six-digit verification code" });
    const otp = await AuthOtp.findById(verificationId).select("+pendingUser.passwordHash");
    if (!otp || otp.expiresAt < new Date()) return res.status(400).json({ message: "This code has expired. Request a new one." });
    if (otp.attempts >= 5) { await AuthOtp.findByIdAndDelete(otp._id); return res.status(429).json({ message: "Too many incorrect attempts. Request a new code." }); }
    if (otp.codeHash !== hashOtp(code)) { otp.attempts += 1; await otp.save(); return res.status(401).json({ message: "That verification code is incorrect" }); }
    let user;
    if (otp.purpose === "signup") {
      if (await User.exists({ email: otp.email })) return res.status(409).json({ message: "An account already exists with this email" });
      user = await User.create({ name: otp.pendingUser.name, email: otp.email, username: otp.pendingUser.username, passwordHash: otp.pendingUser.passwordHash });
    } else {
      user = await User.findById(otp.user);
      if (!user) return res.status(401).json({ message: "Account no longer exists" });
    }
    await AuthOtp.findByIdAndDelete(otp._id);
    return res.json({ user: toPublicUser(user), token: createToken(user), isNewUser: otp.purpose === "signup" });
  } catch (error) { return next(error); }
});

router.get("/me", authenticate, (req, res) => res.json({ user: toPublicUser(req.user) }));
module.exports = router;
