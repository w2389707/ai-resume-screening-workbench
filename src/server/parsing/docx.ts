import { readFile } from "node:fs/promises";
import mammoth from "mammoth";

export async function parseDocx(fullPath: string) {
  const buffer = await readFile(fullPath);
  const parsed = await mammoth.extractRawText({ buffer });

  return parsed.value ?? "";
}
