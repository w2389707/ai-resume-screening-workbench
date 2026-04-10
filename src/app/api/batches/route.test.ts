// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const createBatch = vi.fn();
const createBatchItems = vi.fn();
const persistUpload = vi.fn();
const queueBatch = vi.fn();
const parsePdf = vi.fn();
const parseDocx = vi.fn();
const normalizeResumeText = vi.fn();

vi.mock("@/server/batches/repository", () => ({
  createBatch,
  createBatchItems
}));

vi.mock("@/server/storage/upload-store", () => ({
  persistUpload
}));

vi.mock("@/server/parsing/pdf", () => ({
  parsePdf
}));

vi.mock("@/server/parsing/docx", () => ({
  parseDocx
}));

vi.mock("@/server/parsing/normalize", () => ({
  normalizeResumeText
}));

vi.mock("@/server/batches/processor-registry", () => ({
  queueBatch
}));

async function buildRequest(files: File[], name = "April 9 batch") {
  const formData = new FormData();
  formData.set("name", name);

  for (const file of files) {
    formData.append("files", file);
  }

  return new Request("http://localhost/api/batches", { method: "POST", body: formData });
}

describe("POST /api/batches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("creates a batch from uploaded files and returns batch detail", async () => {
    createBatch.mockResolvedValue({ id: "batch_01", name: "April 9 batch" });
    persistUpload.mockImplementation(async (file: File) => ({
      storedName: `stored-${file.name}`,
      fullPath: `/tmp/${file.name}`
    }));
    parsePdf.mockResolvedValue("Built a RAG assistant.");
    parseDocx.mockResolvedValue("Used ChatGPT to improve drafts.");
    normalizeResumeText.mockImplementation((value: string) => value);
    createBatchItems.mockResolvedValue([]);

    const { POST } = await import("./route");
    const response = await POST(
      await buildRequest([
        new File(["resume one"], "alice.pdf", { type: "application/pdf" }),
        new File(["resume two"], "bob.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        })
      ])
    );

    expect(response.status).toBe(201);
    expect(queueBatch).toHaveBeenCalledWith("batch_01");
    expect(createBatch).toHaveBeenCalledWith({ name: "April 9 batch" });
    expect(createBatchItems).toHaveBeenCalledWith("batch_01", [
      {
        fileName: "/tmp/alice.pdf",
        originalName: "alice.pdf",
        processingState: "Queued",
        parsedText: "Built a RAG assistant."
      },
      {
        fileName: "/tmp/bob.docx",
        originalName: "bob.docx",
        processingState: "Queued",
        parsedText: "Used ChatGPT to improve drafts."
      }
    ]);
    await expect(response.json()).resolves.toEqual({
      batchId: "batch_01"
    });
  });

  it("accepts docx-only uploads even when the PDF parser module is unavailable", async () => {
    vi.resetModules();

    const createBatchSingle = vi.fn().mockResolvedValue({ id: "batch_docx", name: "Docx batch" });
    const createBatchItemsSingle = vi.fn().mockResolvedValue([]);
    const persistUploadSingle = vi.fn().mockImplementation(async (file: File) => ({
      storedName: `stored-${file.name}`,
      fullPath: `/tmp/${file.name}`
    }));
    const parseDocxSingle = vi.fn().mockResolvedValue("Used ChatGPT to improve drafts.");
    const normalizeSingle = vi.fn().mockImplementation((value: string) => value);
    const queueBatchSingle = vi.fn();

    vi.doMock("@/server/batches/repository", () => ({
      createBatch: createBatchSingle,
      createBatchItems: createBatchItemsSingle
    }));
    vi.doMock("@/server/storage/upload-store", () => ({
      persistUpload: persistUploadSingle
    }));
    vi.doMock("@/server/parsing/docx", () => ({
      parseDocx: parseDocxSingle
    }));
    vi.doMock("@/server/parsing/pdf", () => ({
      parsePdf: vi.fn(() => {
        throw new Error("pdf parser should not be loaded for docx-only uploads");
      })
    }));
    vi.doMock("@/server/parsing/normalize", () => ({
      normalizeResumeText: normalizeSingle
    }));
    vi.doMock("@/server/batches/processor-registry", () => ({
      queueBatch: queueBatchSingle
    }));

    const { POST } = await import("./route");
    const response = await POST(
      await buildRequest([
        new File(["resume two"], "bob.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        })
      ], "Docx batch")
    );

    expect(response.status).toBe(201);
    expect(createBatchSingle).toHaveBeenCalledWith({ name: "Docx batch" });
    expect(createBatchItemsSingle).toHaveBeenCalledWith("batch_docx", [
      {
        fileName: "/tmp/bob.docx",
        originalName: "bob.docx",
        processingState: "Queued",
        parsedText: "Used ChatGPT to improve drafts."
      }
    ]);
    expect(queueBatchSingle).toHaveBeenCalledWith("batch_docx");
  });

  it("rejects empty placeholder file entries instead of creating a failed batch", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      await buildRequest([
        new File([""], "", {
          type: "application/octet-stream"
        })
      ], "Empty batch")
    );

    expect(response.status).toBe(400);
    expect(createBatch).not.toHaveBeenCalled();
    expect(createBatchItems).not.toHaveBeenCalled();
    expect(queueBatch).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "At least one valid resume file is required."
    });
  });

  it("uses the original upload name when the stored path loses its extension", async () => {
    const createBatchPdf = vi.fn().mockResolvedValue({ id: "batch_pdf", name: "April 9 batch" });
    const createBatchItemsPdf = vi.fn().mockResolvedValue([]);
    const persistUploadPdf = vi.fn().mockResolvedValue({
      storedName: "stored-resume",
      fullPath: "/tmp/stored-resume"
    });
    const parsePdfForStoredName = vi.fn().mockResolvedValue("Built a RAG assistant.");
    const normalizePdf = vi.fn().mockImplementation((value: string) => value);
    const queueBatchPdf = vi.fn();

    vi.doMock("@/server/batches/repository", () => ({
      createBatch: createBatchPdf,
      createBatchItems: createBatchItemsPdf
    }));
    vi.doMock("@/server/storage/upload-store", () => ({
      persistUpload: persistUploadPdf
    }));
    vi.doMock("@/server/parsing/pdf", () => ({
      parsePdf: parsePdfForStoredName
    }));
    vi.doMock("@/server/parsing/normalize", () => ({
      normalizeResumeText: normalizePdf
    }));
    vi.doMock("@/server/batches/processor-registry", () => ({
      queueBatch: queueBatchPdf
    }));

    const { POST } = await import("./route");
    const response = await POST(
      await buildRequest([new File(["resume one"], "alice.pdf", { type: "application/pdf" })])
    );

    expect(response.status).toBe(201);
    expect(parsePdfForStoredName).toHaveBeenCalledWith("/tmp/stored-resume");
    expect(createBatchItemsPdf).toHaveBeenCalledWith("batch_pdf", [
      {
        fileName: "/tmp/stored-resume",
        originalName: "alice.pdf",
        processingState: "Queued",
        parsedText: "Built a RAG assistant."
      }
    ]);
    expect(queueBatchPdf).toHaveBeenCalledWith("batch_pdf");
  });
});
