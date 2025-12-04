import { Router } from "express";
import QRCode from "qrcode";
import { qrCodeBodySchema } from "./schema/qrcode.schema";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { amount, address, label, memo } = qrCodeBodySchema.parse(req.body);

    // Zcash URI format: zcash:<address>?amount=1.23&memo=...
    let uri = `zcash:${address}`;
    const params = new URLSearchParams();

    if (amount) params.append("amount", amount.toString());
    if (label) params.append("label", label);
    if (memo) params.append("memo", memo);

    const paramStr = params.toString();
    if (paramStr) {
      uri += `?${paramStr}`;
    }

    const qrData = await QRCode.toDataURL(uri, { margin: 1, scale: 6 });

    res.json({ uri, qrData });
  } catch (err) {
    console.error(err);

    res.status(400).json({ error: "Invalid request" });
  }
});

router.get("/", async (req, res) => {
  const { data } = req.query;

  if (!data || typeof data !== "string") {
    return res.status(400).send("Missing data");
  }

  try {
    const qrData = await QRCode.toDataURL(data, { margin: 1, scale: 6 });
    const base64 = qrData.split(",")[1];
    const buffer = Buffer.from(base64, "base64");
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (e) {
    res.status(500).send("Error generating QR");
  }
});

export default router;
