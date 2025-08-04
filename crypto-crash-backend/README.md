# Crypto Crash Game Backend

Backend for a multiplayer "Crash" game with cryptocurrency conversion, provably fair crash point algorithm, and WebSocket-based real-time updates.

---

## Features
- **Game Engine**: New round every 10 seconds, multiplier starts at 1x and increases until random crash point.
- **Provably Fair Algorithm**: SHA-256 hash-based crash point generation for transparency.
- **Crypto Conversion**: USD ⇄ BTC/ETH using CoinGecko API (with fallback cache).
- **Wallet System**: Atomic balance updates for bets/cashouts.
- **Real-Time Multiplayer**: WebSocket broadcasting of game events and handling cashouts.
- **Simulated Crypto Transactions**: No blockchain interaction.

---

## Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO (WebSockets)
- CoinGecko API
- dotenv for config

---
## WebSocket Events
Server → Client

round_start – New round begins

multiplier_update – Updated every 100ms

new_bet – New bet placed

cashout_event – Player cashout

round_end – Round crash point reached

Client → Server

cashout_request – Request to cash out current bet

Provably Fair Algorithm
Crash point = 1 + (first_8_hex_chars_of_SHA256(seed + round_number) % 12000) / 100
Players can verify by checking:

Round seed (hashSeed)

Round number
## Setup Instructions

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd crypto-crash-backend
npm install


MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net
PORT=2000

place a bet from either curl request or frontend as soon as the server starts as you have 5 secs before the round starts

if you failt to place bet then restart backend and send curl request again 