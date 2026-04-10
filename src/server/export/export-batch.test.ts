import { describe, expect, it } from "vitest";
import { buildExportRows } from "./export-batch";

describe("buildExportRows", () => {
  it("returns one row per candidate with recruiter-confirmed fields", () => {
    const rows = buildExportRows([
      {
        originalName: "alice.pdf",
        parsedText: "Alice Lee\nAI product manager\nShipped prompt tooling.",
        aiLabel: "Clearly AI Related",
        suggestedStatus: "Suggested Priority Review",
        mainType: "AI Application / Engineering / Delivery",
        secondaryLabelsJson: '["RAG","Prompting"]',
        aiStrength: "High",
        evidenceCompleteness: "High",
        strongestEvidence: "Built a RAG assistant for support."
      }
    ]);

    expect(rows).toEqual([
      {
        "Candidate Name": "Alice Lee",
        "Original File Name": "alice.pdf",
        "System Label": "Clearly AI Related",
        "Suggested Status": "Suggested Priority Review",
        "Main Type": "AI Application / Engineering / Delivery",
        "Secondary Labels": "RAG, Prompting",
        "AI Strength": "High",
        "Evidence Completeness": "High",
        "Strongest Evidence": "Built a RAG assistant for support."
      }
    ]);
  });
});
