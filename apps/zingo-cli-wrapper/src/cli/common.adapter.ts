import { spawnCli } from "./spawn-cli";

/**
 * CommontAdaptor
 *
 * - Centralizes all zingo-cli calls through spawnCli helper.
 * - Returns normalized JS objects to callers.
 */
// TODO: verify actual CLI flags on dev machine with `zingo-cli --help` and
// adjust args inside spawnCli calls below if needed.
//
export class CommontAdaptor {
  async getVersion(): Promise<{ version: string }> {
    // If seed provided, create or restore wallet, else create new seed.
    // NOTE: CLI options below are plausible; verify exact flags with zingo-cli --help.

    const res = await spawnCli(["--version"]);

    try {
      return { version: res.trim() };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  
}
