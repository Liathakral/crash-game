import express from "express";
import { cashoutPlayer } from "../services/gameEngine.js";

const cashoutRoutes = express.Router();

cashoutRoutes.post("/", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: "User ID required" });

    const result = await cashoutPlayer(userId);
    res.json({ success: true, ...result });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default cashoutRoutes;
