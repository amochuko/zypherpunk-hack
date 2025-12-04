import express from "express";
import { CommontAdaptor } from "../../cli/common.adapter";

const router = express.Router();
const common = new CommontAdaptor();

router.get("/", async (_req, res) => {
  const v = await common.getVersion();

  res.json({ data: v });
});

export default router;
