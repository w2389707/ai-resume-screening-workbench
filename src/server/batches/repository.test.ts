// @vitest-environment node

import { spawnSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let testDatabasePath = "";
let testDatabaseUrl = "";
let previousDatabaseUrl: string | undefined;

function removeTestDatabase() {
  if (!testDatabasePath) {
    return;
  }

  for (const suffix of ["", "-wal", "-shm"]) {
    const filePath = `${testDatabasePath}${suffix}`;
    if (existsSync(filePath)) {
      try {
        rmSync(filePath, { force: true });
      } catch {
        // SQLite can hold transient file locks on Windows; best-effort cleanup is enough for tests.
      }
    }
  }
}

function runPrismaDbPush(databaseUrl: string, databasePath: string) {
  if (!existsSync(databasePath)) {
    writeFileSync(databasePath, "");
  }

  const result = spawnSync(
    process.execPath,
    ["./scripts/prisma-db-push.mjs", databaseUrl, "--force-reset", "--touch"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl
      },
      encoding: "utf8"
    }
  );

  if (result.status !== 0) {
    throw new Error(
      `Prisma db push failed.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
    );
  }
}

describe("batch repository", () => {
  beforeEach(async () => {
    const databaseName = `test-repository-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.db`;
    testDatabasePath = path.join(process.cwd(), databaseName);
    testDatabaseUrl = `file:./${databaseName}`;
    previousDatabaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = testDatabaseUrl;
    runPrismaDbPush(testDatabaseUrl, testDatabasePath);
    vi.resetModules();
  }, 30000);

  afterEach(async () => {
    const globalPrisma = globalThis as typeof globalThis & {
      prisma?: { $disconnect(): Promise<void> };
      prismaUrl?: string;
    };

    if (globalPrisma.prisma) {
      await globalPrisma.prisma.$disconnect();
    }

    delete globalPrisma.prisma;
    delete globalPrisma.prismaUrl;
    removeTestDatabase();
    if (previousDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = previousDatabaseUrl;
    }
    previousDatabaseUrl = undefined;
    testDatabasePath = "";
    testDatabaseUrl = "";
  }, 30000);

  it("creates a batch and returns items ordered by strongest-first ranking fields", async () => {
    const { createBatch, createBatchItems, getBatchDetail } = await import("./repository");
    const batch = await createBatch({ name: "2026-04-09 Batch 01" });
    await createBatchItems(batch.id, [
      { fileName: "alice.pdf", originalName: "alice.pdf" },
      { fileName: "bob.docx", originalName: "bob.docx" }
    ]);

    const detail = await getBatchDetail(batch.id);
    expect(detail?.items).toHaveLength(2);
    expect(detail?.name).toBe("2026-04-09 Batch 01");
    expect(detail?.items[0].processingState).toBe("Queued");
  }, 30000);

  it("stores recruiter overrides without deleting the original system label", async () => {
    const { applyOverride, createBatch, createBatchItems, getBatchDetail } = await import("./repository");
    const batch = await createBatch({ name: "Override Batch" });
    await createBatchItems(batch.id, [
      {
        fileName: "alice.pdf",
        originalName: "alice.pdf",
        aiLabel: "Clearly AI Related",
        suggestedStatus: "Suggested Priority Review"
      }
    ]);

    const detail = await getBatchDetail(batch.id);
    const item = detail!.items[0];

    await applyOverride({
      batchId: batch.id,
      batchItemId: item.id,
      finalLabel: "Possibly AI Related",
      finalStatus: "Suggested Manual Review",
      reasonTag: "insufficient evidence"
    });

    const nextDetail = await getBatchDetail(batch.id);
    expect(nextDetail!.items[0].aiLabel).toBe("Possibly AI Related");
    expect(nextDetail!.items[0].suggestedStatus).toBe("Suggested Manual Review");
    expect(nextDetail!.items[0].overrides).toHaveLength(1);
    expect(nextDetail!.items[0].overrides[0].originalLabel).toBe("Clearly AI Related");
    expect(nextDetail!.items[0].overrides[0].finalLabel).toBe("Possibly AI Related");
  }, 30000);
});
