const express = require("express");
const User = require("../models/User");
const Membership = require("../models/Membership");
const Fixture = require("../models/Fixture");
const authenticate = require("../middleware/authenticate");
const { populateFixture, serializeFixture } = require("../utils/fixture");

const router = express.Router();
router.use(authenticate);

router.get("/:userId/profile", async (req, res, next) => {
  try {
    const [player, viewerMemberships] = await Promise.all([
      User.findById(req.params.userId),
      Membership.find({ user: req.user._id }).select("community"),
    ]);
    if (!player) return res.status(404).json({ message: "Player not found" });

    const communityIds = viewerMemberships.map((membership) => membership.community);
    const sharedMembership = await Membership.exists({ user: player._id, community: { $in: communityIds } });
    if (!sharedMembership && player._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view players who share one of your communities" });
    }

    const fixtures = await populateFixture(Fixture.find({
      community: { $in: communityIds },
      rsvp: player._id,
      $or: [{ status: "completed" }, { dateTime: { $lt: new Date() } }],
    }).sort({ dateTime: -1 }));
    const serializedFixtures = fixtures.map(serializeFixture);
    const stats = serializedFixtures.reduce((totals, fixture) => ({
      matches: totals.matches + 1,
      goals: totals.goals + (fixture.stats[player._id.toString()]?.goals || 0),
      assists: totals.assists + (fixture.stats[player._id.toString()]?.assists || 0),
    }), { matches: 0, goals: 0, assists: 0 });
    return res.json({
      player: { id: player._id.toString(), name: player.name, username: player.username, initials: player.initials },
      stats,
      fixtures: serializedFixtures.slice(0, 5),
    });
  } catch (error) { return next(error); }
});

module.exports = router;
