import { describe, expect, it } from "vitest";
import {
  AI_LABELS,
  EVIDENCE_LEVELS,
  MAIN_TYPES,
  PROCESSING_STATES,
  SUGGESTED_STATUSES
} from "./domain";

describe("domain constants", () => {
  it("exposes the approved system labels and statuses", () => {
    expect(AI_LABELS).toEqual([
      "Clearly AI Related",
      "Possibly AI Related",
      "No Clear AI Signal",
      "Parse Exception"
    ]);
    expect(EVIDENCE_LEVELS).toEqual([
      "Strong Related",
      "Weak Related",
      "Inferred Related"
    ]);
    expect(MAIN_TYPES).toContain("AI Tool Power User");
    expect(PROCESSING_STATES).toContain("Queued");
    expect(SUGGESTED_STATUSES).toContain("Suggested Priority Review");
  });
});
