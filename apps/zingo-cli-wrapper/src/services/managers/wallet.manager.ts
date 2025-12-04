import os from "node:os";
import path from "node:path";
import { WalletAdaptor } from "../../cli/wallet.adapter";
import { config } from "../../config";
import {
  IWalletService,
  WalletInfo,
  WalletKind,
} from "../../modules/wallets/interface/wallet.interface";
import { MockAdapter } from "../../services/adapters/mockAdapter";

const DATA_DIR =
  config.ZINGO_DATA_DIR ?? path.join(os.homedir(), ".zcash-wrapper-data");

export class WalletManager implements IWalletService {
  private adapter: IWalletService;
  private wallet = new Map<string, WalletInfo>();

  constructor(USE_MOCK = true) {
    this.adapter = USE_MOCK ? new MockAdapter() : new WalletAdaptor(DATA_DIR);
  }

  async deleteWatchWallet(walletId: string): Promise<void> {
    await this.adapter.deleteWatchWallet(walletId);
  }

  walletKind(walletId?: string): Promise<WalletKind> {
    return this.adapter.walletKind();
  }

  async parseAaddress(walletId: string): Promise<{
    status: boolean;
    chain_name: string;
    address_kind: "transparent" | "sapling" | "unified";
    [index: string]: any;
  }> {
    return this.parseAaddress(walletId);
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

  createTransparentAddress(walletId: string): Promise<any> {
    return this.adapter.createTransparentAddress(walletId);
  }

  async createWallet(opts: { name?: string }) {
    const id = opts.name
      ? `w_${opts.name}_${Date.now().toString(36)}`
      : `w_${Date.now().toString(36)}`;

    const info = await this.adapter.createWallet({ id });

    // TODO: persist wallet metadata to disk/db (postgres, sqlite etc)
    this.wallet.set(info.id, info);

    return info;
  }

  async getBalance(walletId: string) {
    return this.adapter.getBalance(walletId);
  }

  createUnifiedAddress(walletId: string) {
    return this.adapter.createUnifiedAddress(walletId, "oz");
  }

  async listTransactions(walletId: string): Promise<{ [index: string]: any }> {
    return await this.adapter.transactions(walletId);
  }

  sendToAddress(
    walletId: string,
    to: string,
    amount: number,
    memo?: string
  ): Promise<{ txid: string }> {
    return this.adapter.sendToAddress(walletId, to, amount, memo);
  }
}

// export const walletManager = new WalletManager();

export function initWalletManager(USE_MOCK: boolean) {
  // placeholder: load wallets from DB or disk if exists
  // keep simple for POC
  console.log(
    "walletManager initialized with adapter:",
    USE_MOCK ? "mock" : "zingo-cli"
  );
}
