import { Router } from "express";
import { faucetSend } from "../../utils/faucet";

const router = Router();

/**
 * POST /faucet
 * { address: string, amount?: number }
 */
router.post("/", async (req, res) => {
  try {
    const { to, amount } = req.body || {};

    if (!to || !amount)
      return res.status(400).json({ error: "missing address or amount" });

    const txid = await faucetSend(to, amount);

    return res.json({ txid });
  } catch (err: any) {
    console.error("send error:", err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
