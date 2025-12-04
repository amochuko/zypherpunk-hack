import { mountRouters } from "@numquid/route-mounter";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";

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

const isDev = process.env.NODE_ENV !== "production";
const baseDir = isDev ? "src" : "dist";
const modulesDir = path.resolve(baseDir, "modules");

mountRouters(app, modulesDir);

export default app;
