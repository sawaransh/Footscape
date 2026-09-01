const express = require("express");
const Community = require("../models/Community");
const Membership = require("../models/Membership");
const authenticate = require("../middleware/authenticate");

const router = express.Router();
const makeInviteCode = (name) => `${name.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase() || "FC"}-${Math.floor(1000 + Math.random() * 9000)}`;
const serializeUser = (user, role) => ({ id: user._id.toString(), name: user.name, username: user.username, initials: user.initials, role, isAdmin: role === "admin" });
const serializeCommunity = (community, role) => ({ id: community._id.toString(), name: community.name, inviteCode: community.inviteCode, adminId: community.admin._id ? community.admin._id.toString() : community.admin.toString(), role, isAdmin: role === "admin" });

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const memberships = await Membership.find({ user: req.user._id }).populate({ path: "community", populate: { path: "admin", select: "name username" } });
    return res.json({ communities: memberships.map(({ community, role }) => serializeCommunity(community, role)) });
  } catch (error) { return next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ message: "Community name is required" });
    let community;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try { community = await Community.create({ name, inviteCode: makeInviteCode(name), admin: req.user._id }); break; }
      catch (error) { if (error.code !== 11000) throw error; }
    }
    if (!community) return res.status(503).json({ message: "Could not create a unique invite code. Please try again." });
    await Membership.create({ community: community._id, user: req.user._id, role: "admin" });
    return res.status(201).json({ community: serializeCommunity(community, "admin") });
  } catch (error) { return next(error); }
});

router.post("/join", async (req, res, next) => {
  try {
    const inviteCode = req.body.inviteCode?.trim().toUpperCase();
    const community = await Community.findOne({ inviteCode }).populate("admin", "name username");
    if (!community) return res.status(404).json({ message: "No community found for that invite code" });
    const membership = await Membership.findOneAndUpdate({ community: community._id, user: req.user._id }, { $setOnInsert: { role: "member" } }, { upsert: true, new: true });
    return res.json({ community: serializeCommunity(community, membership.role) });
  } catch (error) { return next(error); }
});

router.get("/:communityId", async (req, res, next) => {
  try {
    const membership = await Membership.findOne({ community: req.params.communityId, user: req.user._id });
    if (!membership) return res.status(403).json({ message: "You are not a member of this community" });
    const community = await Community.findById(req.params.communityId).populate("admin", "name username");
    if (!community) return res.status(404).json({ message: "Community not found" });
    const members = await Membership.find({ community: community._id }).populate("user", "name username");
    return res.json({ community: serializeCommunity(community, membership.role), members: members.map(({ user, role }) => serializeUser(user, role)) });
  } catch (error) { return next(error); }
});

module.exports = router;
