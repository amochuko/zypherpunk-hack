import axios from "axios";
import { config } from "../config";

const { ZCASH_RPC_URL, ZCASH_RPC_USER, ZCASH_RPC_PASS } = config;

if (!ZCASH_RPC_URL || !ZCASH_RPC_USER || !ZCASH_RPC_PASS) {
  console.warn("Warning: ZCASH_RPC_* not configured. Edit .env");
}

let id = 0;

export async function rpc(method = "POST", params: string[] = []) {

  const payload = {
    jsonrpc: "1.0",
    id: ++id,
    method,
    params,
  };

  const axiosCfg = {
    headers: { "Content-Type": "application/json" },
    auth: {
      username: ZCASH_RPC_USER,
      password: ZCASH_RPC_PASS,
    },
    timeout: 30000,
  };

  console.log({ ZCASH_RPC_URL });
  const res = await axios.post(ZCASH_RPC_URL, payload, axiosCfg);

  if (res.data.error) {
    console.error("error here 101")
    throw new Error(JSON.stringify(res.data.error));
  }

  return res.data.result;
}
