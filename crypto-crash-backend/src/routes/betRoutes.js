import express from "express";
import { placeBet } from "../services/gameEngine.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, usdAmount, currency } = req.body;

    if (!userId || !usdAmount || !currency) {
      return res.status(400).json({ success: false, error: "Missing parameters" });
    }

    const result = await placeBet(userId, usdAmount, currency.toUpperCase());
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
