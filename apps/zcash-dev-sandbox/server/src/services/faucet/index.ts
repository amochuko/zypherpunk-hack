import express from "express";
import { CONFIG } from "./config";
import { sendTestnetFunds } from "./wallet";

const faucetApp = express();

faucetApp.post("/", async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: "address required" });
    }

    const txid = await sendTestnetFunds(address, Number(CONFIG.AMOUNT));
    res.json({ txid });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "faucet error", details: e.toString() });
  }
});

export { faucetApp };
