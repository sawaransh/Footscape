const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate");

const router = express.Router();
const toPublicUser = (user) => ({ id: user._id.toString(), name: user.name, email: user.email, username: user.username, initials: user.initials });
const createToken = (user) => jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/signup", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const username = `@${email?.split("@")[0] || ""}`;
    if (!name || !email?.includes("@") || !password || password.length < 6) return res.status(400).json({ message: "Provide a name, valid email, and password of at least 6 characters" });
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(409).json({ message: "An account already exists with this email" });
    const user = await User.create({ name, email, username, passwordHash: await bcrypt.hash(password, 12) });
    return res.status(201).json({ user: toPublicUser(user), token: createToken(user) });
  } catch (error) { return next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const identifier = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select("+passwordHash");
    if (!user || !password || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Email or password is incorrect" });
    return res.json({ user: toPublicUser(user), token: createToken(user) });
  } catch (error) { return next(error); }
});

router.get("/me", authenticate, (req, res) => res.json({ user: toPublicUser(req.user) }));
module.exports = router;
