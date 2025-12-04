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
import { parseCliJson } from "../utils/parseCliJson";
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
  constructor(private dataDir = config.WALLET_DATA_DIR) {}

  listTransactions(walletId: string): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  private walletDir(id: string) {
    return path.join(this.dataDir, id);
  }

  async walletKind(walletId?: string): Promise<WalletKind> {
    const walletDir = this.walletDir(walletId!);
    const out = await spawnCli(["--data-dir", walletDir, "wallet_kind"]);

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
    const walletDir = this.walletDir(walletId!);

    const out = await spawnCli([
      "--data-dir",
      walletDir,
      "--nosync",
      "get-address",
    ]);

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

    const out = await spawnCli(["--data-dir", walletDir, "transactions"]);

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

  async createWallet(opts: { id?: string }): Promise<WalletInfo> {
    const id = opts.id ?? uuidv4();
    const walletDir = this.walletDir(id);

    // TODO: Review this later
    // if (await folderExists(walletDir)) {
    //   // Decide:
    //   // 1. throw an error (wallet with this ID already exists)
    //   // 2. return the existing wallet info
    //   // 3. allow optional overwrite with explicit flag
    //   throw new Error(`Wallet with id "${id}" already exists.`);
    // }

    await fs.mkdir(walletDir, { recursive: true });

    // Trigger zingo-cli to initialize a wallet in that data-dir.
    // Use global flags before the command: ["--data-dir", walletDir, "--nosync", "addresses"]
    // --nosync prevents automatic background sync startup messages.
    // The CLI will auto-generate a seed and wallet files when it needs to.
    await spawnCli(["--data-dir", walletDir, "--nosyc", "addresses"]);

    const ua = await this.getAddresses(walletDir);
    return { id, path: walletDir, unifiedAddress: ua };
  }

  async createWalletFromViewkey(opts: { id?: string }): Promise<WalletInfo> {
    //
    const id = opts.id ?? uuidv4();
    const walletDir = this.walletDir(id);
    await fs.mkdir(walletDir, { recursive: true });

    await spawnCli([
      "wallet",
      "create",
      "--seed",
      "--data-dir",
      walletDir,
      "--json",
    ]);

    await spawnCli(["wallet", "create", "--data-dir", walletDir, "--json"]);

    // get addreess
    const ua = await spawnCli([
      "wallet",
      "get-address",
      "--data-url",
      walletDir,
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

      return { id, path: walletDir, unifiedAddress: uaTrim };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async createWalletFromSeed(opts: {
    id?: string;
    seed: string;
  }): Promise<WalletInfo> {
    //
    const id = opts.id ?? uuidv4();

    const seedArr = opts.seed.split(" ");
    if (seedArr.length != 24) {
      throw new Error("Seed phrase is not complete!");
    }

    const walletDir = this.walletDir(id);

    await fs.mkdir(walletDir, { recursive: true });

    await spawnCli(["--data-dir", walletDir, "--nosync", "--seed", opts.seed]);

    const ua = await this.getAddresses(walletDir);

    return { id, path: walletDir, unifiedAddress: ua };
  }

  async createUnifiedAddress(walletId: string): Promise<CreateAddressReturn> {
    // spawn zingo-cli get-address
    const walletDir = this.walletDir(walletId);
    const out = await spawnCli([
      "get-address",
      "--data-dir",
      walletDir,
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
    const walletDir = this.walletDir(walletId);
    const out = await spawnCli([
      "wallet",
      "new_taddress",
      "--data-dir",
      walletDir,
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
    const walletDir = this.walletDir(walletId);

    const out = await spawnCli([
      "wallet",
      "balance",
      "--data-dir",
      walletDir,
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

  private async getAddresses(walletDir: string) {
    // Now read addresses (again with --nosync to avoid sync logs)
    const raw = await spawnCli([
      "--data-dir",
      walletDir,
      "--nosync",
      "addresses",
    ]);

    const parsed = await parseCliJson<any>(raw);

    // parsed is expected to be an array of address objects (see your sample).
    // Choose the best encoded_address to treat as "unifiedAddress".
    // In many zingo outputs encoded_address is the unified address; pick first item by default.
    let ua: string | undefined;

    if (Array.isArray(parsed) && parsed.length > 0) {
      // Prefer an address that has orchard/sapling flags (your app's policy)
      const preferred = parsed.find((a: any) => a.has_orchard || a.has_sapling);
      ua = preferred?.encoded_address ?? parsed[0].encoded_address;
    } else if (parsed?.unified_address) {
      ua = parsed.unified_address;
    } else if (typeof parsed === "string") {
      ua = parsed;
    }

    if (!ua) {
      throw new Error(
        "Could not determine unified address from zingo-cli output."
      );
    }

    return ua;
  }
}
