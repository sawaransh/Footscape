const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required" });

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: "Account no longer exists" });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Your session is invalid or has expired" });
  }
}

module.exports = authenticate;
