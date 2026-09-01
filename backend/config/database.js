const mongoose = require("mongoose");

async function connectDatabase() {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error("MONGODB_URI is missing. Add it to backend/.env before starting the server.");
  }

  await mongoose.connect(connectionString);
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
}

module.exports = connectDatabase;
