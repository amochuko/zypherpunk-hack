import { describe, expect, it, vi } from "vitest";
import * as chileProc from "../../cli/spawn-cli";
import { WalletAdaptor } from "../../cli/wallet.adapter";

vi.mock("../../utils/spawn-cli");

describe("ZingoCliAdapter (parsing)", () => {
  it("parsr balance JSON", async () => {
    const fakeOut = JSON.stringify({ total_balance: "12.34" });
    (chileProc.spawnCli as any).mockResolvedValue(fakeOut);

    const a = new WalletAdaptor("./data");
    const balance = await a.getBalance("wallet1");
    expect(Math.abs(balance - 12.34)).toBeLessThan(1e-6);
  });

  it("parses txs array", async () => {
    const arr = [{ txid: "tx1" }, { txid: "tx2" }];
    (chileProc.spawnCli as any).mockResolvedValue(JSON.stringify(arr));

    const a = new WalletAdaptor("./data");
    const txs = await a.listTransactions("walletA");

    expect(Array.isArray(txs)).toBeTruthy();
    expect(txs.length).toBe(2);
  });
});
