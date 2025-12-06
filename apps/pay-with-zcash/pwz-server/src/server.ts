import { mountRouters } from "@numquid/route-mounter";
import cors from "cors";
import express from "express";
import path from "node:path";
import { config } from "./config";
import shortCodRedirectRouter from "./static-routes/s/short-code-redirect";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use(shortCodRedirectRouter);

const modulesDir = path.join(__dirname, "modules");
mountRouters(app, modulesDir);

app.listen(config.port, "0.0.0.0", () => {
  console.log(
    `Pay with Zcash gateway running on http://0.0.0.0:${config.port}/api`
  );
});
