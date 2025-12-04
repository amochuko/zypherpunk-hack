import { WalletAdaptor } from "../cli/wallet.adapter";

export interface WatchWallet {
  id: string;
  ufvk: string;
  walletDir?: string;
  unifiedAddress: string;
  birthday: number;
}

export class ViewkeyService {
  constructor(private walletAdapter: WalletAdaptor) {}
  async createWatchWallet(opts: {
    id?: string;
    ufvk: string; // required: viewing key provided by user (should be provided client-side!)
    birthday?: number;
    // persist the UFVK encrypted on disk only if user explicitly consents and provides passphrase
    persistKeyWithConsent?: { passphrase: string } | undefined;
    // persist entire wallet dir encrypted at rest (optional)
    persistWalletWithPassphrase?: string | undefined;
  }): Promise<WatchWallet> {
    // generate id & walletDir
    // create wallet from viewkey
    // fetch unifiedAddress
    // return watch wallet info

    const watch = await this.walletAdapter.createWalletFromViewkey({
      id: opts.id,
      ufvk: opts.ufvk,
      birthday: opts.birthday,
    });

    return {
      birthday: watch.birthday,
      id: watch.id,
      ufvk: watch.ufvk,
      unifiedAddress: String(watch.unifiedAddress),
    };
  }

  async getTransactions(wallet: WatchWallet) {
    const tx = await this.walletAdapter.transactions(wallet.id);
    return tx;
  }

  async getBalance(wallet: WatchWallet): Promise<any> {
    return await this.walletAdapter.getBalance(wallet.id);
  }

  async listAddresses(wallet: WatchWallet) {
    return await this.walletAdapter.listAddresses(wallet.id);
  }
}
