import { Router } from "express";
import { rpc } from "../../utils/zcash-rpc";

const router = Router();

/**
 * POST /send
 * { to, amount }
 * Convenience endpoint: uses node wallet RPC sendtoaddress for transparent sends
 */
router.post("/send", async (req, res) => {
  try {
    const { to, amount } = req.body || {};
    if (!to || !amount) {
      return res.status(400).json({ error: "missing to or amount" });
    }

    const txid = await rpc("sendtoaddress", [to, Number(amount)]);

    return res.json({ txid });
  } catch (err: any) {
    console.error("send error:", err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

/**
 * POST /raw/send
 * { hex }
 * Submit a raw transaction hex (sendrawtransaction)
 */
router.post("/raw/send", async (req, res) => {
  try {
    const { hex } = req.body || {};
    if (!hex) {
      return res.status(400).json({ error: "missing hex" });
    }

    const result = await rpc("sendrawtransaction", [hex]);

    return res.json({ result });
  } catch (err: any) {
    console.error("raw send error:", err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
});
export default router;
