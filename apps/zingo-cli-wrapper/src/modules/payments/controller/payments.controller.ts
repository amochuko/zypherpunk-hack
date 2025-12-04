import { Request, Response } from "express";
import { walletService } from "../../../config";

/**
 * POST /payments/verify
 * { walletId, txid, memo?, amount? }
 */
export async function verifyPayment(req: Request, res: Response) {
  const { walletId, txid, memo, amount } = req.body;
  try {
    const txs = await walletService.listTransactions(walletId);

    const matches = (txs ?? []).filter((t: any) => {
      if (txid && t.txid !== txid) return false;
      if (memo && t.memo !== memo) return false;
      if (amount && Number(t.amount) !== Number(amount)) return false;

      return true;
    });

    res.json({ matches });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
