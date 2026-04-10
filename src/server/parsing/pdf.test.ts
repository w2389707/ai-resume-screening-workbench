// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const execFileMock = vi.fn();

vi.mock("node:child_process", () => ({
  execFile: execFileMock
}));

describe("parsePdf", () => {
  beforeEach(() => {
    execFileMock.mockReset();
  });

  it("extracts text by invoking the pdf-parse cli", async () => {
    execFileMock.mockImplementation(
      (
        _file: string,
        _args: string[],
        _options: Record<string, unknown>,
        callback: (error: Error | null, stdout: string, stderr: string) => void
      ) => {
        callback(null, "Alice Lee\nBuilt a RAG assistant.\n", "");
      }
    );

    const { parsePdf } = await import("./pdf");

    await expect(parsePdf("resume.pdf")).resolves.toBe("Alice Lee\nBuilt a RAG assistant.");
    expect(execFileMock).toHaveBeenCalledTimes(1);
    expect(execFileMock.mock.calls[0][0]).toBe(process.execPath);
    expect(execFileMock.mock.calls[0][1]).toEqual(
      expect.arrayContaining(["text", "resume.pdf", "--format", "text"])
    );
  });

  it("surfaces stderr from the cli when parsing fails", async () => {
    execFileMock.mockImplementation(
      (
        _file: string,
        _args: string[],
        _options: Record<string, unknown>,
        callback: (error: Error | null, stdout: string, stderr: string) => void
      ) => {
        const error = new Error("spawn failed") as Error & { stderr?: string };
        error.stderr = "encrypted pdf not supported";
        callback(error, "", "encrypted pdf not supported");
      }
    );

    const { parsePdf } = await import("./pdf");

    await expect(parsePdf("resume.pdf")).rejects.toThrow("encrypted pdf not supported");
  });
});
