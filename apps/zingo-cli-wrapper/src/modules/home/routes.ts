import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({ data: "Welcome to Zcash CLI Wrapper!" });
});

export default router;
