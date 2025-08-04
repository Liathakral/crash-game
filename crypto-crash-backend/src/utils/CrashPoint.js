import crypto from "crypto";

/**
 * Generates a provably fair crash point.
 * - seed: secret string known before the round
 * - roundNumber: incrementing round number
 */
export const generateCrashPoint = (seed, roundNumber) => {
  const hash = crypto
    .createHash("sha256")
    .update(seed + roundNumber)
    .digest("hex");

  // Convert hash to integer
  const hashInt = parseInt(hash.substring(0, 8), 16);

  // Ensure min crash of 1.0 and max ~120x
  const crashMultiplier = 1 + (hashInt % 12000) / 100; // up to 120x

  return parseFloat(crashMultiplier.toFixed(2));
};
