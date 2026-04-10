import type { BatchCandidate } from "@/lib/ranking";

export type CandidateTab = "all" | "completed" | "active" | "failed";

export type CandidateLabelFilter =
  | "all"
  | "Clearly AI Related"
  | "Possibly AI Related"
  | "No Clear AI Signal"
  | "Parse Exception";

export type CandidateFilterState = {
  query: string;
  tab: CandidateTab;
  label: CandidateLabelFilter;
};

const ACTIVE_STATES = new Set(["Queued", "Parsing", "Analyzing"]);

export function getCandidateSecondaryLabels(candidate: BatchCandidate) {
  try {
    const parsed = JSON.parse(candidate.secondaryLabelsJson) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const labels = parsed.filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    );

    return labels.filter((value, index) => labels.indexOf(value) === index);
  } catch {
    return [];
  }
}

export function getCandidateTab(candidate: BatchCandidate): CandidateTab {
  if (candidate.processingState === "Failed" || candidate.aiLabel === "Parse Exception" || candidate.parseError) {
    return "failed";
  }

  if (candidate.processingState === "Completed") {
    return "completed";
  }

  if (ACTIVE_STATES.has(candidate.processingState)) {
    return "active";
  }

  return "all";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterCandidates(
  candidates: BatchCandidate[],
  filters: CandidateFilterState
) {
  const query = normalize(filters.query);

  return candidates.filter((candidate) => {
    if (filters.tab !== "all" && getCandidateTab(candidate) !== filters.tab) {
      return false;
    }

    if (filters.label !== "all" && candidate.aiLabel !== filters.label) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      candidate.originalName,
      candidate.processingState,
      candidate.aiLabel ?? "",
      candidate.suggestedStatus ?? "",
      candidate.mainType ?? "",
      candidate.strongestEvidence ?? "",
      candidate.aiStrength ?? "",
      candidate.evidenceCompleteness ?? "",
      candidate.parsedText ?? "",
      candidate.parseError ?? "",
      ...getCandidateSecondaryLabels(candidate)
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
