import axios from "axios";
let cachedPrices = {};
let lastFetchTime = 0;
const CACHE_DURATION = 10 * 1000;
export const getCryptoPrices = async () => {
  const now = Date.now();

  if (now - lastFetchTime < CACHE_DURATION && Object.keys(cachedPrices).length) {
    return cachedPrices;
  }

  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      { params: { ids: "bitcoin,ethereum", vs_currencies: "usd" } }
    );

    cachedPrices = {
      BTC: response.data.bitcoin.usd,
      ETH: response.data.ethereum.usd
    };
    lastFetchTime = now;
    return cachedPrices;
  } catch (error) {
    console.error("❌ CoinGecko API failed. Using last cached prices.");
    if (Object.keys(cachedPrices).length) return cachedPrices;
    throw new Error("Unable to fetch crypto prices (no cache available)");
  }
};
export const usdToCrypto = (usdAmount, currency, priceData) => {
  if (!priceData[currency]) throw new Error("Invalid currency");
  return usdAmount / priceData[currency];
};
export const cryptoToUsd = (cryptoAmount, currency, priceData) => {
  if (!priceData[currency]) throw new Error("Invalid currency");
  return cryptoAmount * priceData[currency];
};
