import 'dotenv/config'

export const CONFIG = {
  TESTNET: true,
  LIGHTWALLETD_URL: String(process.env.LIGHTWALLETD_URL), // public testnet
  FAUCET_SEED: String(process.env.FAUCET_SEED),
  AMOUNT: process.env.AMOUNT,
};
