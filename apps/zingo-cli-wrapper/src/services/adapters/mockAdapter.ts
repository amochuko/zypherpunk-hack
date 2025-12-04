import {
  Balance,
  IWalletService,
  WalletInfo,
  WalletKind,
  WatchWallet,
} from "../../modules/wallets/interface/wallet.interface";

import { v4 as uuidv4 } from "uuid";

export class MockAdapter implements IWalletService {
  createWalletFromViewkey(opts: {
    id?: string;
    ufvk: string;
    birthday?: number;
  }): Promise<WatchWallet> {
    throw new Error("Method not implemented.");
  }
  createWalletFromSeed(opts: {
    id?: string;
    seed?: string;
  }): Promise<WalletInfo> {
    throw new Error("Method not implemented.");
  }
  deleteWatchWallet(walletId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  parseAaddress(walletId: string): Promise<{
    status: boolean;
    chain_name: string;
    address_kind: "transparent" | "sapling" | "unified";
    [index: string]: any;
  }> {
    throw new Error("Method not implemented.");
  }
  recovery_info(
    walletId?: string
  ): Promise<{ seedPhrase: string; birthday: number; [index: string]: any }> {
    throw new Error("Method not implemented.");
  }
  transactions(walletId?: string): Promise<{ [index: string]: any }> {
    throw new Error("Method not implemented.");
  }
  birthday(walletId?: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
  exportUfvk(walletId?: string): Promise<{ ufvk: string; birthday: number }> {
    throw new Error("Method not implemented.");
  }
  listMemos(walletId?: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  walletKind(walletId?: string): Promise<WalletKind> {
    throw new Error("Method not implemented.");
  }
  private db = new Map<string, any>();

  async createUnifiedAddress(walletId: string) {
    return this.db.get(walletId);
  }

  createTransparentAddress(walletId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async createWallet(opts: {
    id: string;
    seed?: string;
    name?: string;
  }): Promise<WalletInfo> {
    const id = opts.id ?? uuidv4();
    const ua = `ua_dummy_${id}`;
    this.db.set(id, { id, ua, balance: 0, txs: [] });
    return { id, path: `/tmp/${id}`, unifiedAddress: ua };
  }

  async getUnifiedAddress(walletId: string): Promise<string> {
    return this.db.get(walletId)?.ua ?? "";
  }

  async getBalance(walletId: string): Promise<Balance> {
    return this.db.get(walletId)?.balance ?? 0;
  }

  async listTransactions(walletId: string): Promise<any[]> {
    return this.db.get(walletId)?.txs ?? [];
  }

  async sendToAddress(
    walletId: string,
    to: string,
    amount: number
  ): Promise<{ txid: string }> {
    const txid = `tx_${Date.now().toString(36)}`;
    const record = { txid, to, amount, timestamp: Date.now() };
    this.db.get(walletId).txs.push(record);
    return { txid };
  }
}
