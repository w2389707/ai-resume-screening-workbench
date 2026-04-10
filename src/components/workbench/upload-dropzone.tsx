"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UploadDropzoneProps = {
  onBatchCreated?: (batchId: string) => void | Promise<void>;
};

function getUploadableFiles(formData: FormData) {
  return formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.name.trim().length > 0);
}

export function UploadDropzone({ onBatchCreated }: UploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = getUploadableFiles(formData);

    if (!files.length) {
      setError("Select at least one resume file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch("/api/batches", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed.");
      }

      const data = (await response.json()) as { batchId?: string };
      if (!data.batchId) {
        throw new Error("Upload succeeded but no batch id was returned.");
      }

      await onBatchCreated?.(data.batchId);
      router.push(`/batches/${data.batchId}`);
      form.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Upload resumes">
      <label>
        Batch name
        <input name="name" type="text" placeholder="April 2026 screening batch" />
      </label>
      <label>
        Resume files
        <input name="files" type="file" multiple accept=".pdf,.docx" required />
      </label>
      <button type="submit" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Create batch"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </form>
  );
}
