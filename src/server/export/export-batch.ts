import * as XLSX from "xlsx";
import { getCandidateDisplayName } from "@/lib/candidate-display";

type ExportableBatchItem = {
  originalName: string;
  parsedText?: string | null;
  aiLabel: string | null;
  suggestedStatus: string | null;
  mainType: string | null;
  secondaryLabelsJson: string;
  aiStrength: string | null;
  evidenceCompleteness: string | null;
  strongestEvidence: string | null;
};

function parseSecondaryLabels(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export function buildExportRows(items: ExportableBatchItem[]) {
  return items.map((item) => ({
    "Candidate Name": getCandidateDisplayName(item),
    "Original File Name": item.originalName,
    "System Label": item.aiLabel ?? "",
    "Suggested Status": item.suggestedStatus ?? "",
    "Main Type": item.mainType ?? "",
    "Secondary Labels": parseSecondaryLabels(item.secondaryLabelsJson).join(", "),
    "AI Strength": item.aiStrength ?? "",
    "Evidence Completeness": item.evidenceCompleteness ?? "",
    "Strongest Evidence": item.strongestEvidence ?? ""
  }));
}

export function exportRowsToWorkbook(rows: Array<Record<string, string>>) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Batch Export");

  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx"
  });
}
