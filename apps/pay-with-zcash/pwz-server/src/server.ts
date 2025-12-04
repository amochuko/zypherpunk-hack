import { mountRouters } from "@numquid/route-mounter";
import cors from "cors";
import express from "express";
import path from "node:path";
import { config } from "./config";

const app = express();
app.use(cors());
app.use(express.json());

mountRouters(app, path.resolve("src", "modules"));

app.listen(config.port, () => {
  console.log(
    `Pay with Zcash gateway running on http://localhost:${config.port}`
  );
});
