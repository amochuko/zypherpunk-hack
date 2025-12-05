import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  res.json({ data: "Welcome to Pay with Zcash Widget." });
});

export default router;
