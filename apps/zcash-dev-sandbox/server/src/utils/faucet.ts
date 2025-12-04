// This script uses RPC sendtoaddress (transparent addresses). It can be invoked via npm run faucet-send -- <toAddress> [amount] or used by API.

const { rpc } = require("./zcash-rpc");

const DEFAULT_AMOUNT = Number(process.env.FAUCET_AMOUNT || "0.1");
const FROM_ADDR = process.env.FAUCET_FROM_ADDRESS;

if (!FROM_ADDR) {
  console.warn(
    "FAUCET_FROM_ADDRESS is not set; faucet will still attempt send if RPC wallet is unlocked/usable."
  );
}

export async function faucetSend(to: string, amount = DEFAULT_AMOUNT) {
  if (!to) throw new Error("Missing to address");
  // For a minimal prototype we call sendtoaddress (uses transparent address from node wallet).
  // NOTE: This requires the RPC wallet to be funded/unlocked. For production you'd
  // implement a funded hot-wallet or manual funding.
  console.log(`Requesting zcashd RPC sendtoaddress ${to} ${amount}`);
  const txid = await rpc("sendtoaddress", [to, Number(amount)]);
  return txid;
}

if (require.main === module) {
  (async () => {
    const argv = process.argv.slice(2);
    const to = argv[0];
    const amount = argv[1] ? Number(argv[1]) : DEFAULT_AMOUNT;
    if (!to) {
      console.error("Usage: node src/faucet.js <toAddress> [amount]");
      process.exit(1);
    }
    try {
      const txid = await faucetSend(to, amount);
      console.log("TXID:", txid);
      process.exit(0);
    } catch (err:any) {
      console.error("Faucet send failed:", err.message || err);
      process.exit(2);
    }
  })();
}
