export interface WalletInfo {
  id: string;
  path: string;
  unifiedAddress?: string;
}

export type WatchWallet = {
  id: string;
  walletDir: string;
  ufvk: string;
  ufvkNotPersisted?: true; // marker that UFVK not stored on disk
  birthday: number; // block height
  unifiedAddress?: string;
  persisted?: boolean; // whether wallet contents are encrypted on-disk
};

export type CreateAddressReturn = {
  account: number;
  address_index: number;
  has_orchard: boolean;
  has_sapling: boolean;
  has_transparent: boolean;
  encoded_address: string;
  [index: string]: any;
};

export type OrcharBalance = {
  confirmed_orchard_balance: number;
  unconfirmed_orchard_balance: number;
  total_orchard_balance: number;
};

export type SaplingBalance = {
  confirmed_orchard_balance: number;
  unconfirmed_orchard_balance: number;
  total_orchard_balance: number;
};
export type TransparentBalance = {
  confirmed_orchard_balance: number;
  unconfirmed_orchard_balance: number;
  total_orchard_balance: number;
};

export type Balance = Array<
  OrcharBalance & SaplingBalance & TransparentBalance
>;

export type WalletKind = {
  kind: string;
  transparent: boolean;
  sapling: boolean;
  orchard: boolean;
};

export interface IWalletService {
  createWallet(opts: { id: string; name?: string }): Promise<WalletInfo>;
  createWalletFromSeed(opts: {
    id?: string;
    seed?: string;
  }): Promise<WalletInfo>;
  createWalletFromViewkey(opts: {
    id?: string;
    ufvk: string;
    birthday?: number;
  }): Promise<WatchWallet>;

  //new_address oz - new_address that recieves orchard and sapling
  createUnifiedAddress(
    walletId: string,
    opts: "oz"
  ): Promise<CreateAddressReturn>;
  createTransparentAddress(walletId: string): Promise<CreateAddressReturn>;
  getBalance(walletId: string): Promise<Balance>;
  parseAaddress(walletId: string): Promise<{
    status: boolean;
    chain_name: string;
    address_kind: "transparent" | "sapling" | "unified";
    [index: string]: any;
  }>;

  sendToAddress(
    walletId: string,
    to: string,
    amount: number,
    memo?: string
  ): Promise<{ txid: string }>;

  // recovery_info - Display the wallet's seed phrase, birthday and number of accounts in use.
  recovery_info(
    walletId?: string
  ): Promise<{ seedPhrase: string; birthday: number; [index: string]: any }>;

  // transactions - Provides a list of transaction summaries related to this wallet in order of blockheight.
  transactions(walletId?: string): Promise<{ [index: string]: any }>;

  // birthday - Returns block height wallet was created
  birthday(walletId?: string): Promise<number>;

  // export_ufvk - Export unified full viewing key for the wallet.
  exportUfvk(walletId?: string): Promise<{
    ufvk: string;
    birthday: number;
  }>;

  // messages - List memos for this wallet.
  listMemos(walletId?: string): Promise<any>;

  // wallet_kind
  walletKind(walletId?: string): Promise<WalletKind>;
  // delete watch wallet
  deleteWatchWallet(walletId: string): Promise<void>;
}
