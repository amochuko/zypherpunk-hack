import axios from "axios";

export async function getZecPrice(
  url: string,
  source = ""
): Promise<{ price: number; source: string }> {
  const res = await axios.get(url);

  const { Price, Source } = res.data;

  return { price: Number(Price) ?? 0, source: Source ?? source };
}
