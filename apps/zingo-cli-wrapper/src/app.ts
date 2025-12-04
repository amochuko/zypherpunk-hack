import { mountRouters } from "@numquid/route-mounter";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { config } from "./config";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 10 * 100,
    max: 100,
  })
);

// Simple API key middleware (optional)
app.use((req, res, next) => {
  if (!config.API_KEY) return next();

  const key = req.headers["x-api-key"] || req.query.api_key;
  if (key === config.API_KEY) {
    return next();
  }

  return res.status(401).json({ error: "Invalid api key" });
});

const isDev = process.env.NODE_ENV !== "production";
const baseDir = isDev ? "src" : "dist";
const modulesDir = path.resolve(baseDir, "modules");

mountRouters(app, modulesDir);

export default app;
