import { Router } from "express";
import { rpc } from "../../utils/zcash-rpc";

const router = Router();

/**
 * POST /generate-address
 * { type?: "transparent" | "shielded" }
 */
router.post("/", async (req, res) => {
  try {
    const { type } = req.body || {};

    if (!type || type === "transparent") {
      // zcashd getnewaddress produces transparent address
      const addr = await rpc("getnewaddress", []);

      return res.json({ address: addr, type: "transparent" });
    } else if (type === "shielded") {
      // Note: z_getnewaddress not standard; modern zcashd uses z_getnewaddress for sprout/zcash? If not present, this is a stub.

      try {
        const addr = await rpc("z_getnewaddress", []);

        return res.json({ address: addr, type: "shielded" });
      } catch (err: any) {
        return res.status(501).json({
          error:
            "shielded generation not supported by RPC node in this prototype",
          details: err.message,
        });
      }
    } else {
      return res.status(400).json({ error: "invalid type" });
    }
  } catch (err: any) {
    console.error("generate_address error:", err.message || err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

export default router;
