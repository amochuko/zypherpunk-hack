/**
 * Note: spawnCli is a small wrapper that runs the zingo-cli binary and returns stdout.
 * The exact zingo-cli flags may differ — treat the adapter as the place to normalize CLI arguments → JSON responses.
 */

import * as childProcess from "node:child_process";
import { cleanZingoOutput } from "./cleanZingoOutput";

export function spawnCli(args: string[], timeoutMs = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    const bin = "zingo-cli"; //|| config.ZINGO_CLI_PATH;
    console.log({ bin, args });

    const cp = childProcess.spawn(bin, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    cp.stdout.on("data", (c) => (stdout += c.toString()));
    cp.stderr.on("data", (c) => (stderr += c.toString()));
    cp.on("error", (err) => reject(err));

    cp.on("close", (code) => {
      if (code === 0) {
        const cleaned = cleanZingoOutput(stdout);

        resolve(cleaned);
      } else {
        reject(new Error(`zingo-cli exited ${code}: ${stderr}`));
      }
    });

    if (timeoutMs) {
      setTimeout(() => {
        try {
          cp.kill();
        } catch (err) {}

        reject(new Error("zingo-cli timeout"));
      }, timeoutMs);
    }
  });
}
