const crypto = require("crypto");
const VenueMatch = require("../models/VenueMatch");

async function razorpayWebhook(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.get("x-razorpay-signature") || "";
  if (!secret || !Buffer.isBuffer(req.body) || !/^[a-f0-9]{64}$/i.test(signature)) return res.sendStatus(400);

  const expected = crypto.createHmac("sha256", secret).update(req.body).digest();
  const supplied = Buffer.from(signature, "hex");
  if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) return res.sendStatus(400);

  let event;
  try { event = JSON.parse(req.body.toString("utf8")); }
  catch { return res.sendStatus(400); }
  if (event.event !== "payment.captured") return res.sendStatus(200);

  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id || payment.status !== "captured") return res.sendStatus(400);
  try {
    const match = await VenueMatch.findOne({ "bookings.paymentOrderId": payment.order_id });
    if (!match) return res.sendStatus(200);
    const booking = match.bookings.find((item) => item.paymentOrderId === payment.order_id);
    if (!booking) return res.sendStatus(200);
    if (payment.amount !== Math.round(booking.amount * 100) || payment.currency !== (process.env.RAZORPAY_CURRENCY || "INR")) return res.sendStatus(400);
    if (booking.status !== "confirmed") {
      booking.status = "confirmed";
      booking.paymentId = payment.id;
      await match.save();
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("Could not process Razorpay payment webhook:", error.message);
    return res.sendStatus(500);
  }
}

module.exports = razorpayWebhook;
