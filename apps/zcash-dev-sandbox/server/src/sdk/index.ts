// Minimal browser/node SDK that wraps the local prototype API.

// Usage:
// const SDK = require('./sdk');
// const client = new SDK({ baseUrl: 'http://localhost:3000' });
// await client.generateAddress();

class SandboxSDK {
  private base: string;
  private defaultHeaders: Record<string, string>;

  constructor({ baseUrl = "http://localhost:3000", apiKey = null } = {}) {
    this.base = baseUrl.replace(/\/+$/, "");
    this.defaultHeaders = {};

    if (apiKey) {
      this.defaultHeaders["x-api-key"] = apiKey;
    }
  }

  async _fetch(path: string, opts: Record<string, any> = {}) {
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      this.defaultHeaders,
      opts.headers || {}
    );
    const res = await fetch(this.base + path, {
      method: opts.method || "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }

  generateAddress(type = "transparent") {
    return this._fetch("/generate_address", { method: "POST", body: { type } });
  }

  faucet(address: string, amount = undefined) {
    return this._fetch("/faucet", {
      method: "POST",
      body: { address, amount },
    });
  }

  send(to: string, amount: number) {
    return this._fetch("/send", { method: "POST", body: { to, amount } });
  }

  sendRaw(hex: string) {
    return this._fetch("/raw/send", { method: "POST", body: { hex } });
  }
}

if (typeof module !== "undefined") module.exports = SandboxSDK;
