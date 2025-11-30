import path from "path";
import fs from "fs";

let native: any = null;

const tryPaths = [
  path.join(__dirname, "..", "native", "target", "release", "pczt_native.node"),
  path.join(
    __dirname,
    "..",
    "native",
    "target",
    "release",
    "libpczt_native.so"
  ),
  path.join(__dirname, "..", "native", "target", "release", "pczt_native.dll"),
  path.join(
    __dirname,
    "..",
    "native",
    "target",
    "release",
    "libpczt_native.dylib"
  ),
];

for (const p of tryPaths) {
  if (fs.existsSync(p)) {
    native = require(p);
    break;
  }
}

if (!native) {
  throw new Error(
    `Native addon not found. Build it first (cd native && cargo build --release). ` +
      `Tried: ${tryPaths.join(", ")}`
  );
}

export async function propose_transaction(
  inputs: Array<[any, any]>,
  txReq: any
): Promise<any> {
  return JSON.parse(
    native.propose_transaction_sync(
      JSON.stringify(inputs),
      JSON.stringify(txReq)
    )
  );
}

export async function prove_transaction(pczt: any): Promise<any> {
  const s = await native.prove_transaction(JSON.stringify(pczt));
  return JSON.parse(s);
}

export async function get_sighash(
  pczt: any,
  input_index: number
): Promise<string> {
  return native.get_sighash(JSON.stringify(pczt), input_index);
}

export async function append_signature(
  pczt: any,
  input_index: number,
  signature_hex: string
): Promise<any> {
  const s = native.append_signature(
    JSON.stringify(pczt),
    input_index,
    signature_hex
  );
  return JSON.parse(s);
}

export async function combine(pczt: any): Promise<any> {
  const s = native.combine(JSON.stringify(pczt));
  return JSON.parse(s);
}

export async function finalize_and_extract(pczt: any): Promise<string> {
  return native.finalize_and_extract(JSON.stringify(pczt));
}

export async function serialize_pczt(pczt: any): Promise<string> {
  return native.serialize_pczt(JSON.stringify(pczt));
}

export async function parse_pczt(bytes_hex: string): Promise<any> {
  const s = native.parse_pczt(bytes_hex);
  return JSON.parse(s);
}
