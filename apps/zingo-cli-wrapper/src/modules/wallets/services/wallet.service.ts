import { WalletManager } from "../../../services/managers/wallet.manager";
import {
  Balance,
  CreateAddressReturn,
  IWalletService,
  WalletInfo,
  WalletKind,
} from "../interface/wallet.interface";

export class WalletService implements IWalletService {
  private wallet: WalletManager;

  constructor(opts: { wallet: WalletManager; USE_MOCK: boolean }) {
    this.wallet = new WalletManager(opts.USE_MOCK);
  }

  async deleteWatchWallet(walletId: string): Promise<void> {
    await this.wallet.deleteWatchWallet(walletId);
  }

  async createWallet(opts: { id: string; name?: string }): Promise<WalletInfo> {
    const w = await this.wallet.createWallet({ name: opts.name });
    return w;
  }

  async createWalletFromSeed(opts: {
    id: string;
    seed: string;
  }): Promise<WalletInfo> {
    const w = await this.wallet.createWalletFromSeed({
      id: opts.id,
      seed: opts.seed,
    });
    return w;
  }

  async walletKind(walletId?: string): Promise<WalletKind> {
    const w = await this.wallet.walletKind(walletId);
    return w;
  }

  createUnifiedAddress(
    walletId: string,
    opts: "oz"
  ): Promise<CreateAddressReturn> {
    throw new Error("Method not implemented.");
  }

  createTransparentAddress(walletId: string): Promise<CreateAddressReturn> {
    throw new Error("Method not implemented.");
  }
  getBalance(walletId: string): Promise<Balance> {
    throw new Error("Method not implemented.");
  }
  listTransactions(walletId: string): Promise<any[]> {
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
  sendToAddress(
    walletId: string,
    to: string,
    amount: number,
    memo?: string
  ): Promise<{ txid: string }> {
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
}
