import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { walletService } from "../../../services/wallet-init";

type CreateWalletResp = {
  walletId: string;
  unified_address: string;
};

type ErrorResp = {
  error: string;
};

const walletController = {
  transactions: async (
    req: Request,
    res: Response<CreateWalletResp | ErrorResp>,
    next: NextFunction
  ) => {
    const name = req.body.name ?? "default";

    try {
      const w = await walletService.createWallet({ name, id: uuidv4() });

      res.status(201).json({
        walletId: w.id,
        unified_address: String(w.unifiedAddress),
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  },
  createWallet: async (
    req: Request,
    res: Response<CreateWalletResp | ErrorResp>,
    next: NextFunction
  ) => {
    const name = req.body.name ?? "default";

    try {
      const w = await walletService.createWallet({ name, id: uuidv4() });

      res.status(201).json({
        walletId: w.id,
        unified_address: String(w.unifiedAddress),
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  },
  createWalletFromSeed: async (
    req: Request,
    res: Response<CreateWalletResp | ErrorResp>,
    next: NextFunction
  ) => {
    const seed = req.body.seed;

    try {
      const w = await walletService.createWalletFromSeed({
        seed,
        id: uuidv4(),
      });

      res.status(201).json({
        walletId: w.id,
        unified_address: String(w.unifiedAddress),
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  },
  getBalance: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    try {
      const balance = await walletService.getBalance(id);

      res.json({ balance });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  },

  walletKind: async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    try {
      const kind = await walletService.walletKind(id);
      res.json({ kind });
    } catch (err) {
      // console.error(err);

      res.status(500).json({ error: String(err) });
    }
  },

  async send(req: Request, res: Response) {
    const id = req.params.id;
    const { to, amount, memo } = req.body;
    try {
      const result = await walletService.sendToAddress(
        id,
        to,
        Number(amount),
        memo
      );

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  },
};

export default walletController;
