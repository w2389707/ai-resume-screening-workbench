import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseDir = process.env.UPLOAD_DIR ?? ".data/uploads";

export async function persistUpload(file: File) {
  await mkdir(baseDir, { recursive: true });

  const storedName = `${randomUUID()}-${file.name}`;
  const fullPath = join(baseDir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  return { storedName, fullPath };
}
