import type { EvidenceItem } from "@/server/analyze/types";
import { EVIDENCE_LEVELS } from "./domain";

function isEvidenceItem(value: unknown): value is EvidenceItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.sentence === "string" &&
    Array.isArray(candidate.labels) &&
    candidate.labels.every((label) => typeof label === "string") &&
    typeof candidate.level === "string" &&
    EVIDENCE_LEVELS.includes(candidate.level as (typeof EVIDENCE_LEVELS)[number])
  );
}

export function parseEvidenceJson(value: string | null | undefined): EvidenceItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isEvidenceItem);
  } catch {
    return [];
  }
}
