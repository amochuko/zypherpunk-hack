import 'dotenv/config'

export const CONFIG = {
  TESTNET: true,
  LIGHTWALLETD_URL: process.env.LIGHTWALLETD_URL, // public testnet
  FAUCET_SEED: process.env.FAUCET_SEED,
  AMOUNT: process.env.AMOUNT,
};
