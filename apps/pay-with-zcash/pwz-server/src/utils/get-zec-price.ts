import axios from "axios";

let lastKnownPrice = 0;
let lastUpdated = 0;
let src = "";

export async function getZecPrice(
  url: string,
  source = ""
): Promise<{ price: number; source: string }> {
  const now = Date.now();

  // Simple 60s cache to avaoid multiply API hit
  if (now - lastUpdated < 60000 && lastKnownPrice > 0) {
    return { price: lastKnownPrice, source: src };
  }

  try {
    const res = await axios.get(url);
    const { Price, Source } = res.data;

    if (Price > 0) {
      lastKnownPrice = Number(Price);
      lastUpdated = now;
      src = Source;
    }

    return { price: lastKnownPrice, source: src ?? source };
  } catch (err) {
    console.error("ZEC price fetch failed:", err);
    return { price: lastKnownPrice || 0, source: src || source };
  }
}
