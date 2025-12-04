import { WalletService } from "../modules/wallets/services/wallet.service";
import { WalletManager } from "./managers/wallet.manager";

export const walletService = new WalletService({
  wallet: new WalletManager(),
  USE_MOCK: false,
});
