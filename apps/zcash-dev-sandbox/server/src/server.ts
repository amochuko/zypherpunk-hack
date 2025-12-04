import { mountRouters } from "@numquid/route-mounter";
import cors from "cors";
import express from "express";
import path from "node:path";
import { config } from "./config";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mountRouters(app, path.resolve("src", "modules"));

app.listen(config.PORT, () => {
  console.log(
    `Zcash sandbox prototype API listening on http://localhost:${config.PORT}`
  );
});
