// utils for spawnCli assumed: spawnCli(args: string[]): Promise<string>


export function extractJsonFromCliOutput(output: string): string {
  // find first JSON start (either object or array)
  const startObj = output.indexOf("{");
  const startArr = output.indexOf("[");

  let start = -1;
  if (startObj === -1) start = startArr;
  else if (startArr === -1) start = startObj;
  else start = Math.min(startObj, startArr);

  if (start === -1) {
    throw new Error("No JSON object/array found in CLI output.");
  }

  // naive: take substring from first JSON-start to end and attempt parse
  const candidate = output.slice(start).trim();

  // For safety, try progressively shorter chunks if there is trailing garbage
  // but usually candidate parses as-is (the CLI ends with a clean JSON).
  return candidate;
}
