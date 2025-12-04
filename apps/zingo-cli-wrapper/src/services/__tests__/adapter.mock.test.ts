import { describe, expect, it } from "vitest";
import { MockAdapter } from "../adapters/mockAdapter";

describe("MockAdapter", () => {
  it("creates wallet and returns UA and balance", async () => {
    const a = new MockAdapter();
    const w = await a.createWallet({ id: "demo1", name: "demo2" });

    expect(w.unifiedAddress).toContain("ua_dummy");

    const bal = await a.getBalance("ua_dummy");
    expect(bal).toBe(0);
  });

  it('send creates tx', async()=>{
    const a = new MockAdapter();
    const w = await a.createWallet({id: 'demo'});
    const r = await a.sendToAddress(w.id, 'toAddress3', 1.23);

    expect(r.txid.startsWith('tx_')).toBe(true);

    const txs = await a.listTransactions(w.id);
    expect(txs.length).toBe(1);
    expect(txs[0].amount).toBe(1.23);
    
  })
});
