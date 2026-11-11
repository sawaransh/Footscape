const crypto = require("crypto");
const express = require("express");
const VenueMatch = require("../models/VenueMatch");
const Venue = require("../models/Venue");
const authenticate = require("../middleware/authenticate");

const router = express.Router();
router.use(authenticate);
const organizerEmails = new Set([
  "mittal.sawaransh@gmail.com",
  ...(process.env.VENUE_MATCH_ORGANIZER_EMAILS || process.env.VENUE_MATCH_ORGANIZER_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
]);
const canSchedule = (user) => organizerEmails.has(user.email?.trim().toLowerCase());
const paymentConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const id = (value) => value?._id?.toString() || value?.toString();

function serialize(match) {
  return {
    id: match._id.toString(), title: match.title, venueName: match.venueName,
    address: match.address, city: match.city, dateTime: match.dateTime,
    duration: match.duration, format: match.format, sideCapacity: match.sideCapacity,
    price: match.price, description: match.description, status: match.status,
    createdBy: id(match.createdBy),
    bookings: match.bookings.filter((booking) => booking.status === "confirmed").map((booking) => ({
      id: booking._id.toString(), userId: id(booking.user), side: booking.side,
      name: booking.user?.name || "Player", username: booking.user?.username || "",
    })),
    myBooking: match.bookings.find((booking) => id(booking.user) === match._viewerId)?.status || null,
    mySide: match.bookings.find((booking) => id(booking.user) === match._viewerId)?.side || null,
  };
}

router.get("/matches", async (req, res, next) => {
  try {
    const { q = "", city = "" } = req.query;
    const filter = { status: "open", dateTime: { $gte: new Date(Date.now() - 4 * 60 * 60 * 1000) } };
    if (city) filter.city = new RegExp(String(city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (q) {
      const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["title", "venueName", "address", "city"].map((field) => ({ [field]: new RegExp(safe, "i") }));
    }
    const matches = await VenueMatch.find(filter).populate("bookings.user", "name username").sort({ dateTime: 1 }).limit(100);
    return res.json({ matches: matches.map((match) => { match._viewerId = req.user._id.toString(); return serialize(match); }), canSchedule: canSchedule(req.user), paymentConfigured: paymentConfigured() });
  } catch (error) { return next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const { q = "", city = "" } = req.query;
    const filter = {};
    if (city) filter.city = new RegExp(String(city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (q) {
      const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["name", "address", "city"].map((field) => ({ [field]: new RegExp(safe, "i") }));
    }
    const venues = await Venue.find(filter).sort({ city: 1, name: 1 }).limit(100).lean();
    const venueMatches = await VenueMatch.find({ status: "open", dateTime: { $gte: new Date() } }).sort({ dateTime: 1 }).lean();
    return res.json({ venues: venues.map((venue) => {
      const upcoming = venueMatches.filter((match) => match.venueName.toLowerCase() === venue.name.toLowerCase() && match.address.toLowerCase() === venue.address.toLowerCase());
      return { id: venue._id.toString(), name: venue.name, address: venue.address, city: venue.city, upcomingCount: upcoming.length, nextMatch: upcoming[0] ? { id: upcoming[0]._id.toString(), dateTime: upcoming[0].dateTime, title: upcoming[0].title } : null };
    }), canSchedule: canSchedule(req.user) });
  } catch (error) { return next(error); }
});

router.post("/matches", async (req, res, next) => {
  try {
    if (!canSchedule(req.user)) return res.status(403).json({ message: "You are not approved to schedule public matches" });
    const { title, venueName, address, city, dateTime, duration, format, sideCapacity, price, description } = req.body;
    if (!title?.trim() || !venueName?.trim() || !address?.trim() || !city?.trim() || !dateTime) return res.status(400).json({ message: "Match and venue details are required" });
    const parsedDate = new Date(dateTime);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) return res.status(400).json({ message: "Choose a future match time" });
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || parsedPrice > 100000 || Math.round(parsedPrice * 100) !== parsedPrice * 100 || (parsedPrice > 0 && parsedPrice < 1)) return res.status(400).json({ message: "Price must be free or at least ₹1, with up to two decimal places" });
    const normalized = { name: venueName.trim(), address: address.trim(), city: city.trim() };
    let venue = await Venue.findOne({ name: new RegExp(`^${normalized.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"), address: normalized.address, city: normalized.city });
    if (!venue) venue = await Venue.create({ ...normalized, createdBy: req.user._id });
    const match = await VenueMatch.create({ title, venueName: venue.name, address: venue.address, city: venue.city, dateTime: parsedDate, duration, format, sideCapacity, price, description, createdBy: req.user._id });
    await match.populate("bookings.user", "name username");
    match._viewerId = req.user._id.toString();
    return res.status(201).json({ match: serialize(match) });
  } catch (error) { return next(error); }
});

router.get("/matches/:matchId", async (req, res, next) => {
  try {
    const match = await VenueMatch.findById(req.params.matchId).populate("bookings.user", "name username");
    if (!match) return res.status(404).json({ message: "Match not found" });
    match._viewerId = req.user._id.toString();
    return res.json({ match: serialize(match), paymentConfigured: paymentConfigured() });
  } catch (error) { return next(error); }
});

router.post("/matches/:matchId/bookings", async (req, res, next) => {
  try {
    const match = await VenueMatch.findById(req.params.matchId);
    if (!match || match.status !== "open") return res.status(404).json({ message: "This match is no longer open" });
    if (match.dateTime <= new Date()) return res.status(409).json({ message: "This match has already started" });
    const side = req.body.side;
    if (!["A", "B"].includes(side)) return res.status(400).json({ message: "Choose a side to book" });
    const existing = match.bookings.find((booking) => id(booking.user) === req.user._id.toString() && booking.status !== "cancelled");
    if (existing?.status === "confirmed") return res.status(409).json({ message: "You already have a confirmed place in this match" });
    const occupied = match.bookings.filter((booking) => booking.side === side && (booking.status === "confirmed" || (booking.status === "pending" && booking.expiresAt > new Date())) && booking._id.toString() !== existing?._id.toString()).length;
    if (occupied >= match.sideCapacity) return res.status(409).json({ message: `Side ${side} is full. Choose the other side.` });

    let order = null;
    if (match.price > 0) {
      if (!paymentConfigured()) return res.status(503).json({ message: "Online payment is not configured yet. Ask the app owner to add the Razorpay keys." });
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(match.price * 100), currency: process.env.RAZORPAY_CURRENCY || "INR", receipt: `venue_${match._id.toString().slice(-12)}_${Date.now().toString(36)}`, notes: { matchId: match._id.toString(), userId: req.user._id.toString(), side } }),
      });
      order = await response.json();
      if (!response.ok) return res.status(502).json({ message: "Payment provider could not start checkout. Please try again." });
    }

    if (existing) match.bookings.pull(existing._id);
    match.bookings.push({ user: req.user._id, side, amount: match.price, status: match.price === 0 ? "confirmed" : "pending", paymentOrderId: order?.id || "", expiresAt: order ? new Date(Date.now() + 15 * 60 * 1000) : null });
    await match.save();
    const booking = match.bookings.at(-1);
    const updatedMatch = await VenueMatch.findById(match._id).populate("bookings.user", "name username");
    updatedMatch._viewerId = req.user._id.toString();
    return res.status(201).json({ bookingId: booking._id.toString(), order: order ? { id: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID } : null, match: serialize(updatedMatch) });
  } catch (error) { return next(error); }
});

router.post("/matches/:matchId/bookings/verify", async (req, res, next) => {
  try {
    const { bookingId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (!paymentConfigured()) return res.status(503).json({ message: "Payment verification is unavailable" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${orderId}|${paymentId}`).digest("hex");
    const expectedBuffer = Buffer.from(expected);
    const suppliedBuffer = Buffer.from(String(signature || ""));
    if (expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) return res.status(400).json({ message: "Payment verification failed" });
    const match = await VenueMatch.findById(req.params.matchId);
    const booking = match?.bookings.id(bookingId);
    if (!booking || id(booking.user) !== req.user._id.toString() || booking.paymentOrderId !== orderId) return res.status(404).json({ message: "Booking not found" });
    booking.status = "confirmed";
    booking.paymentId = paymentId;
    await match.save();
    await match.populate("bookings.user", "name username");
    match._viewerId = req.user._id.toString();
    return res.json({ match: serialize(match) });
  } catch (error) { return next(error); }
});

module.exports = router;
