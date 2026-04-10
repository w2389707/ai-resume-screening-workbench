import { describe, expect, it } from "vitest";
import { getCandidateSecondaryLabels } from "./filters";
import type { BatchCandidate } from "./ranking";

function buildCandidate(secondaryLabelsJson: string): BatchCandidate {
  return {
    id: "candidate_1",
    originalName: "candidate.docx",
    processingState: "Completed",
    aiLabel: "Clearly AI Related",
    suggestedStatus: "Suggested Priority Review",
    mainType: "AI Application / Engineering / Delivery",
    evidenceJson: "[]",
    strongestEvidence: "Built a RAG assistant for support.",
    aiStrength: "High",
    evidenceCompleteness: "High",
    parsedText: "Built a RAG assistant for support.",
    parseError: null,
    secondaryLabelsJson,
    overrides: []
  };
}

describe("getCandidateSecondaryLabels", () => {
  it("returns unique labels in original order", () => {
    const labels = getCandidateSecondaryLabels(
      buildCandidate('["Explicit AI Work","Explicit AI Work","AI Tool Usage"]')
    );

    expect(labels).toEqual(["Explicit AI Work", "AI Tool Usage"]);
  });
});
