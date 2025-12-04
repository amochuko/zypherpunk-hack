import { Router } from "express";
import { getZecPrice } from "../../utils/coingecko";
import { convertBodySchema } from "./schema/convert-body.schema";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { amount, from, to } = convertBodySchema.parse(req.body);
    const zecPrice = await getZecPrice();

    let result: number;
    if (from === "usd" && to === "zec") {
      result = amount / zecPrice;
    } else if (from === "zec" && to === "usd") {
      result = amount * zecPrice;
    } else {
      result = amount;
    }

    res.json({ amount: result, rate: zecPrice });
  } catch (err) {
    console.error(err);

    res.status(400).json({ error: "Invalid request" });
  }
});


export default router;
