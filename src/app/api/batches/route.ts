import { extname } from "node:path";
import { NextResponse } from "next/server";
import { createBatch, createBatchItems } from "@/server/batches/repository";
import { queueBatch } from "@/server/batches/processor-registry";
import { normalizeResumeText } from "@/server/parsing/normalize";
import { persistUpload } from "@/server/storage/upload-store";

export const runtime = "nodejs";

function isValidUploadFile(value: FormDataEntryValue): value is File {
  return value instanceof File && value.name.trim().length > 0;
}

async function parseUploadedResume(fullPath: string, originalName: string) {
  const extension =
    extname(originalName).toLowerCase() || extname(fullPath).toLowerCase();

  if (extension === ".pdf") {
    const { parsePdf } = await import("@/server/parsing/pdf");
    return parsePdf(fullPath);
  }

  if (extension === ".docx") {
    const { parseDocx } = await import("@/server/parsing/docx");
    return parseDocx(fullPath);
  }

  throw new Error(`Unsupported file type: ${extension || "unknown"}`);
}

function getBatchName(formData: FormData) {
  const requestedName = formData.get("name");
  if (typeof requestedName === "string" && requestedName.trim()) {
    return requestedName.trim();
  }

  return `Batch ${new Date().toISOString().slice(0, 10)}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter(isValidUploadFile);

  if (!files.length) {
    return NextResponse.json(
      { error: "At least one valid resume file is required." },
      { status: 400 }
    );
  }

  const batch = await createBatch({ name: getBatchName(formData) });
  const uploadedFiles = await Promise.all(files.map((file) => persistUpload(file)));

  const items = await Promise.all(
    uploadedFiles.map(async (uploadedFile, index) => {
      try {
        const parsedText = normalizeResumeText(
          await parseUploadedResume(uploadedFile.fullPath, files[index].name)
        );

        return {
          fileName: uploadedFile.fullPath,
          originalName: files[index].name,
          processingState: "Queued",
          parsedText
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Resume parsing failed.";

        return {
          fileName: uploadedFile.fullPath,
          originalName: files[index].name,
          processingState: "Failed",
          aiLabel: "Parse Exception",
          suggestedStatus: "Parse Exception",
          parseError: message
        };
      }
    })
  );

  await createBatchItems(batch.id, items);
  queueBatch(batch.id);

  return NextResponse.json({ batchId: batch.id }, { status: 201 });
}
