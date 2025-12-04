export function cleanZingoOutput(raw: string): string {
  if (!raw) return "";

  // normalize newlines
  const normalized = raw.replace(/\r/g, "");

  // 1) Prefer extracting the first JSON-like block { ... } (non-greedy)
  const jsonMatch = normalized.match(/\{[\s\S]*?\}/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }

  // 2) Fallback: line-based cleaning
  const lines = normalized.split("\n").map((l) => l.replace(/\s+$/u, ""));

  // trim leading/trailing blank lines
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  // remove any leading "Launching ..." lines (there may be 0..n)
  while (lines.length && /^Launching\b/.test(lines[0])) lines.shift();

  // remove trailing shutdown / quit lines
  const trailingPattern =
    /^(Save task shutdown successfully\.|Zingo CLI quit successfully\.)$/;
  while (lines.length && trailingPattern.test(lines[lines.length - 1].trim())) {
    lines.pop();
  }

  return lines.join("\n").trim();
}
