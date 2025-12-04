import fs from 'node:fs/promises';

export async function folderExists(path: string): Promise<boolean> {
  try {
    await fs.access(path); // resolves if path exists
    return true;
  } catch {
    return false;
  }
}
