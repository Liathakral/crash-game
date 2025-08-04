import express from "express";
import User from "../models/User.js";
import { getWallet } from "../services/WalletService.js";
import { depositToWallet } from "../services/WalletService.js";
const WalletRoutes = express.Router();

// Create a user
WalletRoutes.post("/create", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, error: "Username required" });

    const user = await User.create({ username });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get wallet balance
WalletRoutes.get("/:userId", async (req, res) => {
  try {
    const wallet = await getWallet(req.params.userId);
    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deposit USD into wallet
WalletRoutes.post("/deposit", async (req, res) => {
  try {
    const { userId, usdAmount, currency } = req.body;
    if (!userId || !usdAmount || !currency) {
      return res.status(400).json({ success: false, error: "Missing parameters" });
    }

    const result = await depositToWallet(userId, usdAmount, currency.toUpperCase());
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default WalletRoutes;
