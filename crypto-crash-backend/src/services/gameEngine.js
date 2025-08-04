import GameRound from "../models/GameRound.js";
import { generateCrashPoint } from "../utils/CrashPoint.js";
import { deductFromWallet } from "./WalletService.js";
import { getCryptoPrices, cryptoToUsd } from "./CryptoService.js";
import { addToWallet } from "./WalletService.js";
export const cashoutPlayer = async (userId) => {
  if (!currentRound) throw new Error("No active round");
  const bet = currentRound.bets.find(
    (b) => b.userId.toString() === userId.toString()
  );
  if (!bet) throw new Error("No bet found for this round");
  if (bet.cashedOut) throw new Error("Already cashed out");
  const elapsed = (Date.now() - currentRound.startTime.getTime()) / 1000;
  const currentMultiplier = 1 + elapsed * 0.15;
  if (currentMultiplier >= currentRound.crashPoint) {
    throw new Error("Too late, round already crashed");
  }
  const payoutCrypto = bet.cryptoAmount * currentMultiplier;
  const prices = await getCryptoPrices();
  const payoutUsd = cryptoToUsd(payoutCrypto, bet.currency, prices);
  bet.cashedOut = true;
  bet.cashoutMultiplier = parseFloat(currentMultiplier.toFixed(2));
  await currentRound.save();
  await addToWallet(userId, payoutUsd, bet.currency, "cashout");
  ioInstance.emit("cashout_event", {
    userId,
    payoutUsd: parseFloat(payoutUsd.toFixed(2)),
    payoutCrypto,
    currency: bet.currency,
    multiplier: bet.cashoutMultiplier
  });
  console.log(
    `💰 User ${userId} cashed out at ${bet.cashoutMultiplier}x for $${payoutUsd}`
  );
  return {
    multiplier: bet.cashoutMultiplier,
    payoutUsd,
    payoutCrypto
  };
};
export const placeBet = async (userId, usdAmount, currency) => {
  if (!currentRound) throw new Error("No active round");
  const timeSinceStart = (Date.now() - currentRound.startTime.getTime());
  if (timeSinceStart > 5000) {
    throw new Error("Betting closed for this round");
  }
  const { cryptoAmount, prices } = await deductFromWallet(userId, usdAmount, currency);
  currentRound.bets.push({
    userId,
    usdAmount,
    cryptoAmount,
    currency
  });
  await currentRound.save();
  console.log(`🎯 Bet placed: User ${userId} - $${usdAmount} in ${currency} (${cryptoAmount})`);
  ioInstance.emit("new_bet", {
    userId,
    usdAmount,
    cryptoAmount,
    currency
  });
  return { cryptoAmount, prices };
};
let currentRound = null;
let roundNumber = 1;
let ioInstance = null;
const SEED = "super_secret_server_seed";
const ROUND_INTERVAL = 10 * 1000;
const MULTIPLIER_INTERVAL = 100;
export const startGameEngine = (io) => {
  ioInstance = io;
  startNewRound();
};
const startNewRound = async () => {
  const crashPoint = generateCrashPoint(SEED, roundNumber);
  currentRound = await GameRound.create({
    roundNumber,
    startTime: new Date(),
    crashPoint,
    hashSeed: SEED,
    bets: []
  });
  ioInstance.emit("round_start", {
    roundNumber,
    crashPointHash: currentRound.hashSeed,
    startTime: currentRound.startTime
  });
  console.log(`🎮 Round ${roundNumber} started - Crash at ${crashPoint}x`);
  let multiplier = 1.0;
  const startTime = Date.now();
  const multiplierTimer = setInterval(async () => {
    const elapsed = (Date.now() - startTime) / 1000;
    multiplier = 1 + elapsed * 0.15;
    if (multiplier >= crashPoint) {
      clearInterval(multiplierTimer);
      endRound(multiplier);
    } else {
      ioInstance.emit("multiplier_update", { multiplier: parseFloat(multiplier.toFixed(2)) });
    }
  }, MULTIPLIER_INTERVAL);
};
const endRound = async (finalMultiplier) => {
  console.log(`💥 Round ${roundNumber} crashed at ${finalMultiplier}x`);
  currentRound.endTime = new Date();
  await currentRound.save();
  ioInstance.emit("round_end", {
    roundNumber,
    crashPoint: finalMultiplier
  });
  roundNumber++;
  setTimeout(startNewRound, ROUND_INTERVAL);
};
export const getCurrentRound = () => currentRound;
