import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config";
import {
  Balance,
  CreateAddressReturn,
  IWalletService,
  WalletInfo,
  WalletKind,
} from "../modules/wallets/interface/wallet.interface";
import { spawnCli } from "./spawn-cli";

/**
 * WalletAdaptor
 *
 * - Centralizes all zingo-cli calls through spawnCli helper.
 * - Returns normalized JS objects to callers.
 */
// TODO: verify actual CLI flags on dev machine with `zingo-cli --help` and
// adjust args inside spawnCli calls below if needed.
//
export class WalletAdaptor implements IWalletService {
  constructor(private dataDir = config.ZINGO_DATA_DIR) {}
  listTransactions(walletId: string): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  private walletDir(id: string) {
    return path.join(this.dataDir, id);
  }

  async walletKind(walletId?: string): Promise<WalletKind> {
    const out = await spawnCli(["wallet_kind"]);

    try {
      return JSON.parse(out);
    } catch (err) {
      console.error("walletKind", err);
      throw err;
    }
  }

  async parseAaddress(walletId?: string): Promise<{
    status: boolean;
    chain_name: string;
    address_kind: "transparent" | "sapling" | "unified";
    [index: string]: any;
  }> {
    const wallertDir = this.walletDir(walletId!);

    const out = await spawnCli(["get-address"]);

    try {
      const parsed = JSON.parse(out);
      return parsed;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  recovery_info(
    walletId?: string
  ): Promise<{ seedPhrase: string; birthday: number; [index: string]: any }> {
    throw new Error("Method not implemented.");
  }

  async transactions(walletId?: string): Promise<{ [index: string]: any }> {
    const walletDir = this.walletDir(walletId!);

    const out = await spawnCli(["transactions"]);

    try {
      const parsed = JSON.parse(out);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.transactions) return parsed.transactions;

      return [];
    } catch (err) {
      // If output is raw lines, try to split
      const lines = out
        .trim()
        .split("\n")
        .map((l: any) => l.trim())
        .filter(Boolean);
      return lines;
    }
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

  async createWallet(opts: {
    id: string;
    seed?: string;
    name?: string;
  }): Promise<WalletInfo> {
    //
    const id = opts.id ?? uuidv4();
    const wallertDir = this.walletDir(id);

    await fs.mkdir(wallertDir, { recursive: true });

    // If seed provided, create or restore wallet, else create new seed.
    // NOTE: CLI options below are plausible; verify exact flags with zingo-cli --help.
    const seed = opts.seed ?? "";
    if (seed) {
      await spawnCli([
        "wallet",
        "create",
        "--seed",
        seed,
        "--data-dir",
        wallertDir,
        "--json",
      ]);
    } else {
      await spawnCli(["wallet", "create", "--data-dir", wallertDir, "--json"]);
    }

    // get addreess
    const ua = await spawnCli([
      "wallet",
      "get-address",
      "--data-url",
      wallertDir,
      "--json",
    ]);

    let uaTrim = ua.trim();

    try {
      const parsed = JSON.parse(uaTrim);

      if (parsed.unified_address) {
        uaTrim = parsed.unified_address;
      } else if (typeof parsed === "string") {
        uaTrim = parsed;
      }

      return { id, path: wallertDir, unifiedAddress: uaTrim };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async createUnifiedAddress(walletId: string): Promise<CreateAddressReturn> {
    // spawn zingo-cli get-address
    const wallertDir = this.walletDir(walletId);
    const out = await spawnCli([
      "wallet",
      "get-address",
      "--data-dir",
      wallertDir,
      "--json",
    ]);

    try {
      const parsed = JSON.parse(out);
      return parsed.unified_address ?? String(parsed);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async createTransparentAddress(
    walletId: string
  ): Promise<CreateAddressReturn> {
    // spawn zingo-cli new_taddress
    const wallertDir = this.walletDir(walletId);
    const out = await spawnCli([
      "wallet",
      "new_taddress",
      "--data-dir",
      wallertDir,
      "--json",
    ]);

    try {
      const parsed = JSON.parse(out);
      return parsed;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getBalance(walletId: string): Promise<Balance> {
    const wallertDir = this.walletDir(walletId);

    const out = await spawnCli([
      "wallet",
      "balance",
      "--data-dir",
      wallertDir,
      "--json",
    ]);

    try {
      const parsed = JSON.parse(out);

      return parsed;
    } catch (err) {
      throw new Error(`Failed to parse balance: ${String(err)} -- out: ${out}`);
    }
  }

  async sendToAddress(
    walletId: string,
    to: string,
    amount: number,
    memo?: string
  ): Promise<{ txid: string }> {
    const walletDir = this.walletDir(walletId);

    const args = [
      "wallet",
      "send",
      "--to",
      to,
      "--amount",
      amount.toString(),
      "--data-dir",
      walletDir,
      "--json",
    ];

    if (memo) args.push("--memo", memo);
    const out = await spawnCli(args);

    try {
      const parsed = JSON.parse(out);

      if (parsed.txid) return { txid: parsed.txid };
      if (parsed.transaction_id) return { txid: parsed.transaction_id };

      return { txid: String(parsed) };
    } catch (err) {
      return { txid: out.trim() };
    }
  }
}
