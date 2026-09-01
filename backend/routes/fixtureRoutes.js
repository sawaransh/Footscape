const express = require("express");
const Fixture = require("../models/Fixture");
const Membership = require("../models/Membership");
const authenticate = require("../middleware/authenticate");
const { populateFixture, serializeFixture } = require("../utils/fixture");

const router = express.Router();
router.use(authenticate);

async function membershipFor(userId, communityId) {
  return Membership.findOne({ user: userId, community: communityId });
}

function emitFixture(req, fixture) {
  req.app.get("io").to(`community:${fixture.communityId}`).emit("fixture:updated", fixture);
}

router.get("/community/:communityId", async (req, res, next) => {
  try {
    if (!await membershipFor(req.user._id, req.params.communityId)) return res.status(403).json({ message: "You are not a member of this community" });
    const fixtures = await populateFixture(Fixture.find({ community: req.params.communityId }).sort({ dateTime: -1 }));
    return res.json({ fixtures: fixtures.map(serializeFixture) });
  } catch (error) { return next(error); }
});

router.post("/community/:communityId", async (req, res, next) => {
  try {
    const membership = await membershipFor(req.user._id, req.params.communityId);
    if (!membership || membership.role !== "admin") return res.status(403).json({ message: "Only community admins can create fixtures" });
    const { title, dateTime, duration, venue, description } = req.body;
    if (!title?.trim() || !dateTime) return res.status(400).json({ message: "Match name and date/time are required" });
    const fixture = await Fixture.create({ community: req.params.communityId, createdBy: req.user._id, title, dateTime, duration, venue, description });
    const result = serializeFixture(await populateFixture(Fixture.findById(fixture._id)));
    emitFixture(req, result);
    return res.status(201).json({ fixture: result });
  } catch (error) { return next(error); }
});

router.get("/:fixtureId", async (req, res, next) => {
  try {
    const fixture = await populateFixture(Fixture.findById(req.params.fixtureId));
    if (!fixture) return res.status(404).json({ message: "Fixture not found" });
    if (!await membershipFor(req.user._id, fixture.community)) return res.status(403).json({ message: "You are not a member of this community" });
    return res.json({ fixture: serializeFixture(fixture) });
  } catch (error) { return next(error); }
});

router.patch("/:fixtureId/rsvp", async (req, res, next) => {
  try {
    const fixture = await Fixture.findById(req.params.fixtureId);
    if (!fixture) return res.status(404).json({ message: "Fixture not found" });
    if (!await membershipFor(req.user._id, fixture.community)) return res.status(403).json({ message: "You are not a member of this community" });
    const userId = req.user._id.toString();
    fixture.rsvp = fixture.rsvp.filter((id) => id.toString() !== userId);
    if (!req.body.remove) fixture.rsvp.push(req.user._id);
    await fixture.save();
    const result = serializeFixture(await populateFixture(Fixture.findById(fixture._id)));
    emitFixture(req, result);
    return res.json({ fixture: result });
  } catch (error) { return next(error); }
});

router.patch("/:fixtureId/teams", async (req, res, next) => {
  try {
    const fixture = await Fixture.findById(req.params.fixtureId);
    if (!fixture) return res.status(404).json({ message: "Fixture not found" });
    const membership = await membershipFor(req.user._id, fixture.community);
    if (!membership || membership.role !== "admin") return res.status(403).json({ message: "Only community admins can edit teams" });
    const { playerId, team } = req.body;
    if (!playerId || ![null, "A", "B"].includes(team)) return res.status(400).json({ message: "Choose a player and team A, B, or no team" });
    if (!fixture.rsvp.some((id) => id.toString() === playerId)) return res.status(400).json({ message: "Only players who joined the match can be assigned" });
    fixture.teams.A = fixture.teams.A.filter((id) => id.toString() !== playerId);
    fixture.teams.B = fixture.teams.B.filter((id) => id.toString() !== playerId);
    if (team) fixture.teams[team].push(playerId);
    await fixture.save();
    const result = serializeFixture(await populateFixture(Fixture.findById(fixture._id)));
    emitFixture(req, result);
    return res.json({ fixture: result });
  } catch (error) { return next(error); }
});

router.patch("/:fixtureId/stats", async (req, res, next) => {
  try {
    const fixture = await Fixture.findById(req.params.fixtureId);
    if (!fixture) return res.status(404).json({ message: "Fixture not found" });
    const membership = await membershipFor(req.user._id, fixture.community);
    if (!membership || membership.role !== "admin") return res.status(403).json({ message: "Only community admins can update match statistics" });
    const { playerId, field, delta } = req.body;
    if (!playerId || !["goals", "assists"].includes(field) || ![-1, 1].includes(delta)) return res.status(400).json({ message: "Invalid statistic update" });
    if (![...fixture.teams.A, ...fixture.teams.B].some((id) => id.toString() === playerId)) return res.status(400).json({ message: "Player must be assigned to a team first" });
    let stat = fixture.stats.find((item) => item.player.toString() === playerId);
    if (!stat) { stat = { player: playerId, goals: 0, assists: 0 }; fixture.stats.push(stat); stat = fixture.stats.at(-1); }
    stat[field] = Math.max(0, stat[field] + delta);
    await fixture.save();
    const result = serializeFixture(await populateFixture(Fixture.findById(fixture._id)));
    emitFixture(req, result);
    return res.json({ fixture: result });
  } catch (error) { return next(error); }
});

router.patch("/:fixtureId/end", async (req, res, next) => {
  try {
    const fixture = await Fixture.findById(req.params.fixtureId);
    if (!fixture) return res.status(404).json({ message: "Fixture not found" });
    const membership = await membershipFor(req.user._id, fixture.community);
    if (!membership || membership.role !== "admin") return res.status(403).json({ message: "Only community admins can end a match" });
    fixture.status = "completed";
    fixture.endedAt = new Date();
    await fixture.save();
    const result = serializeFixture(await populateFixture(Fixture.findById(fixture._id)));
    emitFixture(req, result);
    return res.json({ fixture: result });
  } catch (error) { return next(error); }
});

module.exports = router;
