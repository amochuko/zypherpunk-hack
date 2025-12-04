import dotenv from "dotenv";
dotenv.config();

export const config = {
  API_KEY: String(process.env.API_KEY),
  LOG_LEVEL: "info",
  USE_MOCK_ADAPTER: Boolean(process.env.USE_MOCK_ADAPTER),
  port: process.env.PORT,
  webhookSecret: process.env.WEBHOOK_SECRET,
  CRYPTO_SECRET: String(process.env.CRYPTO_SECRET),
  GITHUB_TOKEN: String(process.env.GITHUB_TOKEN),
  ZINGO_CLI_PATH:
    String(process.env.ZINGO_CLI_PATH) ?? String(process.env.ZINGO_SERVICE_URL),
  ZINGO_DATA_DIR: String(process.env.DATA_DIR) ?? "zingo-cli",
  ZINGO_SERVICE_URL: String(process.env.ZINGO_SERVICE_URL),
  MASTER_KEY: process.env.MASTER_KEY ?? "dev-master-key",
};
