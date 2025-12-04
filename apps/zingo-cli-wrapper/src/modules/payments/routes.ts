import express from "express";
import * as paymentCtrl from "./controller/payments.controller";

const router = express.Router();

// POST /payments/verify
router.post("/verify", paymentCtrl.verifyPayment);

export default router;
