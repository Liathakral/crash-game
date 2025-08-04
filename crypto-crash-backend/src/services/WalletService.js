import crypto from "crypto";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { getCryptoPrices, usdToCrypto,cryptoToUsd } from "./CryptoService.js";
export const depositToWallet = async (userId, usdAmount, currency) => {
  const prices = await getCryptoPrices();
  const cryptoAmount = usdToCrypto(usdAmount, currency, prices);
  const session = await User.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");
    user.wallet[currency] += cryptoAmount;
    await user.save();
    await Transaction.create([{
      userId,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: "deposit",
      transactionHash: crypto.randomBytes(16).toString("hex"),
      priceAtTime: prices[currency]
    }], { session });
    await session.commitTransaction();
    session.endSession();
    return { cryptoAmount, prices };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
export const getWallet = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const prices = await getCryptoPrices();
  return {
    BTC: {
      amount: user.wallet.BTC,
      usdValue: user.wallet.BTC * prices.BTC
    },
    ETH: {
      amount: user.wallet.ETH,
      usdValue: user.wallet.ETH * prices.ETH
    }
  };
};
export const addToWallet = async (userId, usdAmount, currency, type = "cashout") => {
  const prices = await getCryptoPrices();
  const cryptoAmount = usdToCrypto(usdAmount, currency, prices);
  const session = await User.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");
    user.wallet[currency] += cryptoAmount;
    await user.save();
    await Transaction.create([{
      userId,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: type,
      transactionHash: crypto.randomBytes(16).toString("hex"),
      priceAtTime: prices[currency]
    }], { session });
    await session.commitTransaction();
    session.endSession();
    return { cryptoAmount, prices };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
export const deductFromWallet = async (userId, usdAmount, currency) => {
  const prices = await getCryptoPrices();
  const cryptoAmount = usdToCrypto(usdAmount, currency, prices);
  const session = await User.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");
    if (user.wallet[currency] < cryptoAmount) {
      throw new Error("Insufficient balance");
    }
    user.wallet[currency] -= cryptoAmount;
    await user.save();
    await Transaction.create([{
      userId,
      usdAmount,
      cryptoAmount,
      currency,
      transactionType: "bet",
      transactionHash: crypto.randomBytes(16).toString("hex"),
      priceAtTime: prices[currency]
    }], { session });
    await session.commitTransaction();
    session.endSession();
    return { cryptoAmount, prices };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
