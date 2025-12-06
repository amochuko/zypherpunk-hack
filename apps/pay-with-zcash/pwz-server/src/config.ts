import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT),
  webhookSecret: process.env.WEBHOOK_SECRET,
  baseUrl: process.env.BASE_URL,
  BASE_URL_ZCASH_PRICE: String(process.env.BASE_URL_ZCASH_PRICE),
};
