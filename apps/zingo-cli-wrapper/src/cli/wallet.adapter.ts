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
  WatchWallet,
} from "../modules/wallets/interface/wallet.interface";
import { dirExistsNotEmpty } from "../utils/dirExiastsNotEmpty";
import { parseCliJson } from "../utils/parseCliJson";
import { runCliForWallet } from "./spawn-cli";

export type TxEntry = {
  txid: string;
  block_height?: number | null;
  timestamp?: number | null; // unix seconds
  amount: number; // in zatoshi/atomic units (keep raw)
  direction: "in" | "out" | "internal";
  memo?: string | null;
  raw?: any; // original parsed entry
};
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

  async deleteWatchWallet(walletId: string): Promise<void> {
    const walletDir = this.walletDir(walletId);

    if (!walletDir.startsWith(this.dataDir))
      throw new Error("refusing to remove path outside base dir");

    try {
      await fs.rm(walletDir, { recursive: true, force: true });
      console.log(`Wallet id ${walletId} removed.`);
    } catch (err) {
      console.error(`Failed to delete Wallet id ${walletId}.`);
    }
  }

  async transactions(walletId: string): Promise<any[]> {
    const walletDir = this.walletDir(walletId!);

    const raw = await runCliForWallet(walletDir, ["transactions"], {
      nosync: true,
    });

    try {
      const parsed = await parseCliJson<any>(raw);
      if (!Array.isArray(parsed)) return [];

      const out: TxEntry[] = parsed.map((t: any) => {
        const amount =
          typeof t.amount === "number" ? t.amount : Number(t.amount ?? 0);
        const direction: TxEntry["direction"] =
          t.direction ?? (amount >= 0 ? "in" : "out");
        return {
          txid: t.txid ?? t.hash ?? t.transaction_id ?? "",
          block_height: t.block_height ?? t.height ?? null,
          timestamp: t.timestamp ? Number(t.timestamp) : null,
          amount,
          direction,
          memo: t.memo ?? null,
          raw: t,
        } as TxEntry;
      });

      return out;
    } catch (err) {
      console.error("transactions", err);
      throw err;
    }
  }

  private walletDir(id: string) {
    return path.join(this.dataDir, id);
  }

  async walletKind(walletId?: string): Promise<WalletKind> {
    const walletDir = this.walletDir(walletId!);

    const out = await runCliForWallet(walletDir, ["wallet_kind"], {
      nosync: true,
    });

    try {
      return JSON.parse(out);
    } catch (err) {
      console.error("walletKind", err);
      throw err;
    }
  }

  // To determine/validate an address
  async parseAaddress(walletId: string): Promise<{
    status: boolean;
    chain_name: string;
    address_kind: "transparent" | "sapling" | "unified";
    [index: string]: any;
  }> {
    const walletDir = this.walletDir(walletId!);
    const out = await runCliForWallet(walletDir, ["parse_address", walletId], {
      nosync: true,
    });

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

  birthday(walletId?: string): Promise<number> {
    throw new Error("Method not implemented.");
  }

  exportUfvk(walletId?: string): Promise<{ ufvk: string; birthday: number }> {
    throw new Error("Method not implemented.");
  }

  listMemos(walletId?: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async listAddresses(walletId?: string): Promise<any> {
    const walletDir = this.walletDir(walletId!);

    return await this.getAddresses(walletDir);
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

    await runCliForWallet(walletDir, ["addresses"], {
      nosync: true,
    });

    const ua = await this.getAddresses(walletDir);
    return { id, path: walletDir, unifiedAddress: ua };
  }

  async createWalletFromViewkey(opts: {
    id?: string;
    ufvk: string;
    birthday?: number;
  }): Promise<WatchWallet> {
    //
    const id = opts.id ?? uuidv4();
    const walletDir = this.walletDir(id);
    await fs.mkdir(walletDir, { recursive: true });

    if (!opts?.ufvk) throw new Error("ufvk is required");

    // avoid clobber
    if (await dirExistsNotEmpty(walletDir)) {
      throw new Error(`wallet id "${id}" already exists and is non-empty`);
    }

    await fs.mkdir(walletDir, { recursive: true, mode: 0o700 });

    const birthday = Number(opts.birthday ?? 0);

    await runCliForWallet(
      walletDir,
      ["--viewkey", opts.ufvk, "--birthday", String(Math.max(0, birthday))],
      { nosync: true }
    );

    const ua = await this.getAddresses(walletDir);

    const watch: WatchWallet = {
      id,
      walletDir,
      birthday,
      ufvk: opts.ufvk,
      unifiedAddress: ua,
    };

    // path: string;
    // unifiedAddress?: string;

    return watch;
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

    await runCliForWallet(walletDir, ["--seed", opts.seed], {
      nosync: true,
    });

    const ua = await this.getAddresses(walletDir);

    return { id, path: walletDir, unifiedAddress: ua };
  }

  async createUnifiedAddress(walletId: string): Promise<CreateAddressReturn> {
    // spawn zingo-cli new_address
    const walletDir = this.walletDir(walletId);

    const out = await runCliForWallet(walletDir, ["new_address"], {
      nosync: true,
    });

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
    const out = await runCliForWallet(walletDir, ["new_taddress"], {
      nosync: true,
    });

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

    const out = await runCliForWallet(walletDir, ["balance"], {
      nosync: true,
    });

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

    const args = ["send", "--to", to, "--amount", amount.toString()];

    if (memo) {
      args.push("--memo", memo);
    }

    const out = await runCliForWallet(walletDir, args, {
      nosync: true,
    });

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
    const raw = await runCliForWallet(walletDir, ["addresses"], {
      nosync: true,
    });

    const parsed = await parseCliJson<any>(raw);

    // parsed is expected to be an array of address objects .
    // Choose the best encoded_address to treat as "unifiedAddress".
    let ua: string | undefined;

    if (Array.isArray(parsed) && parsed.length > 0) {
      // Prefer an address that has orchard/sapling flags (your app's policy)
      const preferred = parsed.find((a: any) => a.has_orchard || a.has_sapling);
      ua = preferred?.encoded_address ?? parsed[0].encoded_address;
    } else if (parsed?.unified_address) {
      ua = parsed.unified_address;
    } else if (typeof parsed === "string") {
      ua = parsed;
    } else {
      ua = parsed.encoded_address;
    }

    if (!ua) {
      throw new Error(
        "Could not determine unified address from zingo-cli output."
      );
    }

    return ua;
  }
}
