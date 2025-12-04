import dotenv from "dotenv";
dotenv.config();

export const config = {
  PORT: process.env.PORT,
  FAUCET_AMOUNT: process.env.FAUCET_AMOUNT,
  BASE_URL: process.env.BASE_URL,
  ZCASH_RPC_URL: String(process.env.ZCASH_RPC_URL),
  ZCASH_RPC_USER: String(process.env.ZCASH_RPC_USER),
  ZCASH_RPC_PASS: String(process.env.ZCASH_RPC_PASS),
};
