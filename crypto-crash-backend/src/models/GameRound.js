import mongoose from "mongoose";

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  usdAmount: Number,
  cryptoAmount: Number,
  currency: { type: String, enum: ["BTC", "ETH"], required: true },
  cashedOut: { type: Boolean, default: false },
  cashoutMultiplier: { type: Number, default: null }
});

const gameRoundSchema = new mongoose.Schema({
  roundNumber: Number,
  startTime: Date,
  endTime: Date,
  crashPoint: Number,
  hashSeed: String,
  bets: [betSchema]
});

export default mongoose.model("GameRound", gameRoundSchema);
