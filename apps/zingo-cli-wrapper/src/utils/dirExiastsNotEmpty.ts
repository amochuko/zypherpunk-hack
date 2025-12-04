import fs from "node:fs/promises";

export async function dirExistsNotEmpty(dir: string): Promise<boolean> {
  try {
    const files = await fs.readdir(dir);
    return files.length > 0;
  } catch (err) {
    return false;
  }
}
