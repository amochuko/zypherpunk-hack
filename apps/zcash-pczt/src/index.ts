import {
  append_signature,
  combine,
  finalize_and_extract,
  get_sighash,
  parse_pczt,
  propose_transaction,
  prove_transaction,
  serialize_pczt,
} from "./native-bridge";

import { PrevTxOut, TransactionRequest, TxIn } from "./types";

interface PCZTInput {
  inputs: [TxIn, PrevTxOut][];
  txRequest: TransactionRequest;
}

async function main({ inputs, txRequest }: PCZTInput) {
  console.log("Proposing transaction...");

  let pczt = await propose_transaction(inputs, txRequest);
  console.log("PCZT proposed:", pczt);

  console.log("Proving transaction (will call Rust pczt prover)...");
  pczt = await prove_transaction(pczt);
  console.log("Proofs:", pczt.proofs);

  console.log("Signing inputs...");
  for (let i = 0; i < inputs.length; i++) {
    const sighash = await get_sighash(pczt, i);
    console.log("Sighash (hex):", sighash);

    // In real life: sign sighash with wallet's privkey -> signature bytes (64)
    // Here we simulate by creating 64-bytes of deterministic data:
    const fakeSig = Buffer.alloc(64, i + 1).toString("hex");
    pczt = await append_signature(pczt, i, fakeSig);
  }
  console.log("Sigs attached:", pczt.signatures);

  console.log("Combining...");
  pczt = await combine(pczt);
  console.log("Combined:", pczt.combined);

  console.log("Finalizing & extracting transaction bytes...");
  const txHex = await finalize_and_extract(pczt);
  console.log("Final transaction bytes (hex):", txHex);

  console.log("Serialize PCZT...");
  const serialized = await serialize_pczt(pczt);
  console.log("Serialized PCZT (hex):", serialized);

  console.log("Parse PCZT back...");
  const parsed = await parse_pczt(serialized);
  console.log("Parsed:", parsed);
}

const inputs: [TxIn, PrevTxOut][] = [
  [
    { txid: "abcd1234", vout: 0 },
    { value: 100_000, scriptPubKey: "76a914...88ac" },
  ],
];

const txRequest: TransactionRequest = {
  recipients: [{ address: "uorchard1...", value: 90_000 }],
  fee: 1_000,
};

main({ inputs, txRequest }).catch((e) => console.error("Demo failed:", e));
