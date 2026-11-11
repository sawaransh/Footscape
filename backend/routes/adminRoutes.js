const express = require("express");
const Community = require("../models/Community");
const Membership = require("../models/Membership");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate");

const router = express.Router();
const MASTER_ADMIN_EMAIL = "mittal.sawaransh@gmail.com";
const isAdmin = (user) => ["admin", "master_admin"].includes(user.globalRole);
const isMasterAdmin = (user) => user.globalRole === "master_admin";

router.use(authenticate, (req, res, next) => {
  if (!isAdmin(req.user)) return res.status(403).json({ message: "Admin access is required" });
  return next();
});

router.get("/overview", async (req, res, next) => {
  try {
    const [users, communities, membershipCounts] = await Promise.all([
      User.find().select("name email username globalRole createdAt").sort({ name: 1 }).lean(),
      Community.find().populate("admin", "name email username").sort({ name: 1 }).lean(),
      Membership.aggregate([{ $group: { _id: "$community", count: { $sum: 1 } } }]),
    ]);
    const countByCommunity = new Map(membershipCounts.map(({ _id, count }) => [_id.toString(), count]));
    return res.json({
      users: users.map((user) => ({ id: user._id.toString(), name: user.name, email: user.email, username: user.username, globalRole: user.email?.toLowerCase() === MASTER_ADMIN_EMAIL ? "master_admin" : (user.globalRole || "member"), createdAt: user.createdAt })),
      communities: communities.map((community) => ({ id: community._id.toString(), name: community.name, inviteCode: community.inviteCode, admin: community.admin ? { id: community.admin._id.toString(), name: community.admin.name, email: community.admin.email } : null, memberCount: countByCommunity.get(community._id.toString()) || 0, createdAt: community.createdAt })),
      canManageRoles: isMasterAdmin(req.user),
    });
  } catch (error) { return next(error); }
});

router.patch("/users/:userId/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["member", "partner", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "You cannot assign that access level" });
    }
    if (!isMasterAdmin(req.user) && !["member", "partner"].includes(role)) {
      return res.status(403).json({ message: "Only the master admin can appoint admins" });
    }
    if (req.params.userId === req.user._id.toString()) return res.status(400).json({ message: "You cannot change your own access level" });
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.email?.toLowerCase() === MASTER_ADMIN_EMAIL) return res.status(400).json({ message: "The master admin account is protected" });
    user.globalRole = role;
    await user.save();
    return res.json({ user: { id: user._id.toString(), name: user.name, email: user.email, username: user.username, globalRole: user.globalRole } });
  } catch (error) { return next(error); }
});

router.patch("/communities/:communityId", async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    if (!name || name.length > 100) return res.status(400).json({ message: "Community name must be between 1 and 100 characters" });
    const community = await Community.findByIdAndUpdate(req.params.communityId, { name }, { new: true, runValidators: true }).populate("admin", "name email");
    if (!community) return res.status(404).json({ message: "Community not found" });
    return res.json({ community: { id: community._id.toString(), name: community.name, inviteCode: community.inviteCode, admin: community.admin ? { id: community.admin._id.toString(), name: community.admin.name, email: community.admin.email } : null } });
  } catch (error) { return next(error); }
});

module.exports = router;
