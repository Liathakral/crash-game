import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  BTC: { type: Number, default: 0 }, // in BTC
  ETH: { type: Number, default: 0 }  // in ETH
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  wallet: { type: walletSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
