import mongoose from "mongoose";
import dotenv from "dotenv";
import GameRound from "./src/models/GameRound.js";
import User from "./src/models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "crypto_crash" });
    console.log("✅ MongoDB Connected");

    await GameRound.deleteMany({});
    console.log("🗑 Cleared old game rounds");

    const users = await User.find({});
    if (!users.length) throw new Error("No users found. Run populateSampleData.js first!");

    // Fake crash points
    const crashPoints = [2.5, 5.2, 1.8, 10.0, 3.4];
    const seed = "sample_seed";

    const rounds = crashPoints.map((crash, i) => ({
      roundNumber: i + 1,
      startTime: new Date(Date.now() - (i + 1) * 60000), // 1 min apart
      endTime: new Date(Date.now() - (i + 1) * 60000 + 8000),
      crashPoint: crash,
      hashSeed: seed,
      bets: [
        {
          userId: users[0]._id,
          usdAmount: 10,
          cryptoAmount: 0.00015,
          currency: "BTC",
          cashedOut: crash > 2,
          cashoutMultiplier: crash > 2 ? 2.0 : null
        },
        {
          userId: users[1]._id,
          usdAmount: 20,
          cryptoAmount: 0.00030,
          currency: "BTC",
          cashedOut: crash > 3,
          cashoutMultiplier: crash > 3 ? 3.0 : null
        }
      ]
    }));

    await GameRound.insertMany(rounds);
    console.log("🎮 Inserted sample game rounds:", rounds.length);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error populating rounds:", error);
    process.exit(1);
  }
};

run();
