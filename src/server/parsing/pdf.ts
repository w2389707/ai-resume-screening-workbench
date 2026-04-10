import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function getPdfParseCliPath() {
  return path.join(process.cwd(), "node_modules", "pdf-parse", "bin", "cli.mjs");
}

export async function parsePdf(fullPath: string) {
  try {
    const result = await execFileAsync(
      process.execPath,
      [getPdfParseCliPath(), "text", fullPath, "--format", "text"],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
        windowsHide: true
      }
    );

    const stdout =
      typeof result === "string"
        ? result
        : "stdout" in result && typeof result.stdout === "string"
          ? result.stdout
          : "";

    return stdout.trim();
  } catch (error) {
    const stderr =
      error &&
      typeof error === "object" &&
      "stderr" in error &&
      typeof error.stderr === "string"
        ? error.stderr.trim()
        : "";
    const message = stderr || (error instanceof Error ? error.message : "PDF parsing failed.");
    throw new Error(message);
  }
}
