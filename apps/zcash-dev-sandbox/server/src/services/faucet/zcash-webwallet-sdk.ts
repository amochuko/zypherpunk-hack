type ZcashClientOpts = {
  serverUrl: string;
  chain: "testnet" | "mainnet";
};

type SendArgs = {
  address: string;
  amount: number;
  memo?: string;
};

// TODO: This is a stub, need full implmentation
export class ZcashClient {
  private baseUrl = "";
  private chain = "";

  constructor(args: ZcashClientOpts) {
    this.baseUrl = args.serverUrl;
    this.chain = args.chain;
  }

  async loadOrCreate(seed: string) {
    return {
      send(args: SendArgs) {
        return { txid: "demo" };
      },
    };
  }
}
