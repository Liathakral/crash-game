import express from "express";
import { getCryptoPrices } from "./../services/CryptoService.js";

const cryptoRoutes = express.Router();

cryptoRoutes .get("/prices", async (req, res) => {
  try {
    const prices = await getCryptoPrices();
    res.json({ success: true, prices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default cryptoRoutes;
