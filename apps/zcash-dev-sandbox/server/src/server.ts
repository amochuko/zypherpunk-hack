import { mountRouters } from "@numquid/route-mounter";
import cors from "cors";
import express from "express";
import path from "node:path";
import { config } from "./config";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Simple API key middleware (optional)
// app.use((req, res, next) => {
//   if (!config.API_KEY) return next();
//   const key = req.headers["x-api-key"] || req.query.api_key;
//   if (key === config.API_KEY) return next();

//   return res.status(401).json({ error: "invalid api key" });
// });

mountRouters(app, path.resolve("src", "modules"));

app.listen(config.PORT, () => {
  console.log(
    `Zcash sandbox prototype API listening on http://localhost:${config.PORT}/api`
  );
});
