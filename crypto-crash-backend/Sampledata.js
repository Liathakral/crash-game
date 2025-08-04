import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import { depositToWallet } from "./src/services/WalletService.js"

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

const users = [
  { username: "player1" },
  { username: "player2" },
  { username: "player3" },
  { username: "player4" },
  { username: "player5" }
];

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "crypto_crash" });
    console.log("✅ MongoDB Connected");

    await User.deleteMany({});
    console.log("🗑 Cleared old users");

    // Create users
    const createdUsers = await User.insertMany(users);
    console.log("👥 Users created:", createdUsers.map(u => u.username));

    // Give each player some BTC balance
    for (const user of createdUsers) {
      await depositToWallet(user._id, 1000, "BTC");
      await depositToWallet(user._id, 500, "ETH");
    }

    console.log("💰 Deposited funds to all players");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error populating data:", error);
    process.exit(1);
  }
};

run();
