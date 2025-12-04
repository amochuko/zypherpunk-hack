

import { CONFIG } from "./config";
import { ZcashClient } from "./zcash-webwallet-sdk";

export async function initFaucetWallet() {
  const client = new ZcashClient({
    serverUrl: CONFIG.LIGHTWALLETD_URL,
    chain: CONFIG.TESTNET ? "testnet" : "mainnet",
  });

  const wallet = await client.loadOrCreate(CONFIG.FAUCET_SEED);

  return { wallet, client };
}

export async function sendTestnetFunds(toAddress: string, amountZec: number) {
  const { wallet } = await initFaucetWallet();

  const tx = await wallet.send({
    address: toAddress,
    amount: amountZec,
    memo: "Zcash Sandbox Faucet",
  });

  return tx.txid;
}
