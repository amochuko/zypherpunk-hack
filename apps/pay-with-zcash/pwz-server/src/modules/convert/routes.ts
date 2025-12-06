import { Router } from "express";
import { getZecPrice } from "../../utils/get-zec-price";
import { convertBodySchema } from "./schema/convert-body.schema";
import { config } from "../../config";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { amount, from, to } = convertBodySchema.parse(req.body);
    const {price, source} = await getZecPrice(config.BASE_URL_ZCASH_PRICE);

    let result: number;
    if (from === "usd" && to === "zec") {
      result = amount / price;
    } else if (from === "zec" && to === "usd") {
      result = amount * price;
    } else {
      result = amount;
    }

    res.json({ amount: result, rate: price, source });
  } catch (err) {
    console.error(err);

    res.status(400).json({ error: "Invalid request" });
  }
});


export default router;
