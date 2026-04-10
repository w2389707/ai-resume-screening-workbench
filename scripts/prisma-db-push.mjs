import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function resolveFileUrlToPath(databaseUrl) {
  if (!databaseUrl.startsWith("file:")) {
    return null;
  }

  const rawPath = databaseUrl.slice("file:".length);

  if (rawPath.startsWith("./") || rawPath.startsWith(".\\")) {
    return path.resolve(process.cwd(), rawPath.slice(2));
  }

  if (rawPath.startsWith("/")) {
    return rawPath.slice(1);
  }

  return path.resolve(process.cwd(), rawPath);
}

function ensureDatabaseFile(databaseUrl) {
  const resolvedPath = resolveFileUrlToPath(databaseUrl);

  if (!resolvedPath) {
    return;
  }

  mkdirSync(path.dirname(resolvedPath), { recursive: true });
  writeFileSync(resolvedPath, "", { flag: "a" });
}

const [databaseUrl, ...flags] = process.argv.slice(2);

if (!databaseUrl) {
  console.error("Usage: node scripts/prisma-db-push.mjs <database-url> [--force-reset] [--touch]");
  process.exit(1);
}

const shouldForceReset = flags.includes("--force-reset");
const shouldTouch = flags.includes("--touch");

if (shouldTouch) {
  ensureDatabaseFile(databaseUrl);
}

const prismaArgs = ["prisma", "db", "push", "--url", databaseUrl];

if (shouldForceReset) {
  prismaArgs.push("--force-reset");
}

const result =
  process.platform === "win32"
    ? spawnSync(
        "powershell",
        [
          "-NoProfile",
          "-Command",
          `npx ${prismaArgs
            .map((value) => value.replace(/'/g, "''"))
            .map((value) => `'${value}'`)
            .join(" ")}`
        ],
        {
          cwd: process.cwd(),
          encoding: "utf8",
          stdio: "inherit"
        }
      )
    : spawnSync("npx", prismaArgs, {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "inherit"
      });

process.exit(result.status ?? 1);
