const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectDatabase = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const communityRoutes = require("./routes/communityRoutes");
const fixtureRoutes = require("./routes/fixtureRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const Membership = require("./models/Membership");
const { sendFixtureReminders } = require("./utils/notifications");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const httpServer = createServer(app);
const allowedOrigins = (process.env.CLIENT_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean);
const isAllowedOrigin = (origin) => !origin || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || allowedOrigins.includes(origin);
const corsOptions = {
  origin(origin, callback) {
    callback(isAllowedOrigin(origin) ? null : new Error("This website is not allowed to access the Footscape API"), isAllowedOrigin(origin));
  },
};
const io = new Server(httpServer, { cors: corsOptions });
app.set("io", io);

io.use((socket, next) => {
  try {
    socket.userId = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET).userId;
    next();
  } catch { next(new Error("Authentication required")); }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.userId}`);
  socket.on("community:join", async (communityId) => {
    if (await Membership.exists({ user: socket.userId, community: communityId })) socket.join(`community:${communityId}`);
  });
});

app.use(express.json());
app.use(cors(corsOptions));

app.get("/", (req,res) => {
 
    res.send("Footscape Backend Running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "connected" });
});

app.use("/api/auth", authRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error(error);
  res.status(500).json({ message: "Something went wrong on the server" });
});

connectDatabase().then(() => httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    sendFixtureReminders(io).catch((error) => console.error("Could not send fixture reminders:", error.message));
    setInterval(() => sendFixtureReminders(io).catch((error) => console.error("Could not send fixture reminders:", error.message)), 60 * 1000);
})).catch((error) => {
  console.error("Unable to start server:", error.message);
  process.exit(1);
});
