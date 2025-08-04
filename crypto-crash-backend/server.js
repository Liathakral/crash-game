import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import cryptoRoutes from "./src/routes/CryptoRoutes.js";
import WalletRoutes from "./src/routes/WalletRoutes.js";
import betRoutes from "./src/routes/betRoutes.js";
import cashoutRoutes from "./src/routes/cashoutRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import { cashoutPlayer } from "./src/services/gameEngine.js";
import { startGameEngine } from "./src/services/gameEngine.js";

import logger from "./src/utils/logger.js";


dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/api/crypto", cryptoRoutes);
app.use("/api/wallet", WalletRoutes);
app.use("/api/bet", betRoutes);
app.use("/api/transactions", transactionRoutes);

app.use("/api/cashout", cashoutRoutes);

app.get("/", (req, res) => {
  res.send("Crypto Crash Backend Running 🚀");
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  socket.on("cashout_request", async ({ userId }) => {
    try {
      const result = await cashoutPlayer(userId);
      socket.emit("cashout_success", result);
    } catch (error) {
      socket.emit("cashout_error", { error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

startGameEngine(io);

// Start server
const PORT = process.env.PORT || 2000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

logger.info(`Server started on port ${PORT}`);
logger.error("Error message here");
