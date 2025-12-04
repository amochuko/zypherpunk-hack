import { extractJsonFromCliOutput } from "./extractJsonFromCliOutput";


export async function parseCliJson<T = any>(raw: string): Promise<T> {
  const jsonStr = extractJsonFromCliOutput(raw);
  try {
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    // If JSON.parse fails (e.g. trailing logs appended), attempt to cut off
    // at the last '}' or ']' and parse again.
    const lastBrace = Math.max(
      jsonStr.lastIndexOf("}"),
      jsonStr.lastIndexOf("]")
    );
    if (lastBrace > 0) {
      const trimmed = jsonStr.slice(0, lastBrace + 1);
      return JSON.parse(trimmed) as T;
    }
    throw err;
  }
}
