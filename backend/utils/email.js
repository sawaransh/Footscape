const nodemailer = require("nodemailer");

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error("Email delivery is not configured. Add EMAIL_USER and EMAIL_APP_PASSWORD to the server environment.");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
  });
}

async function sendAuthOtp({ to, code, purpose }) {
  const action = purpose === "signup" ? "finish creating your Footscape account" : "sign in to Footscape";
  await getTransporter().sendMail({
    from: `Footscape <${process.env.EMAIL_USER}>`,
    to,
    subject: `${code} is your Footscape verification code`,
    text: `Your Footscape verification code is ${code}. Use it to ${action}. It expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
    html: `<div style="margin:0;padding:32px;background:#06170e;font-family:Arial,sans-serif;color:#effff2"><div style="max-width:520px;margin:auto;padding:30px;border:1px solid #285d3a;border-radius:18px;background:#0b2717"><h1 style="margin:0 0 8px;color:#63ed87;font-size:25px">FOOTSCAPE</h1><p style="margin:0 0 26px;color:#c7d9cc">Use this verification code to ${action}.</p><div style="padding:17px;border-radius:12px;background:#04150b;border:1px solid #357d4c;text-align:center;font-size:31px;font-weight:800;letter-spacing:9px;color:#75fa99">${code}</div><p style="margin:26px 0 0;color:#a9c0af;font-size:13px;line-height:1.6">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p></div></div>`,
  });
}

module.exports = { sendAuthOtp };
