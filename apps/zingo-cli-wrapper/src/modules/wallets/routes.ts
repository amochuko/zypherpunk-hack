import express from "express";
import walletContrl from "./controllers/wallet.controller";

const router = express.Router();

router.post("/", walletContrl.createWallet);
router.get("/:id/balance", walletContrl.getBalance);
router.get("/:id/send", walletContrl.send);
router.get("/kind", walletContrl.walletKind);

export default router;
