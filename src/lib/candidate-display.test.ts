import { describe, expect, it } from "vitest";
import { getCandidateDisplayName } from "./candidate-display";

describe("getCandidateDisplayName", () => {
  it("prefers a name-like first line from parsed resume text", () => {
    expect(
      getCandidateDisplayName({
        originalName: "candidate.docx",
        parsedText: "Lin Chen\nSenior AI Engineer\nBuilt a RAG assistant."
      })
    ).toBe("Lin Chen");
  });

  it("supports short chinese names from parsed resume text", () => {
    expect(
      getCandidateDisplayName({
        originalName: "resume.docx",
        parsedText: "\u6797\u6668\n\u9ad8\u7ea7AI\u5de5\u7a0b\u5e08\n\u8d1f\u8d23RAG\u68c0\u7d22\u94fe\u8def\u8bbe\u8ba1\u3002"
      })
    ).toBe("\u6797\u6668");
  });

  it("falls back to the file stem when the first line looks like a title", () => {
    expect(
      getCandidateDisplayName({
        originalName: "ai-strong-resume.docx",
        parsedText: "Senior AI Engineer\nBuilt a RAG assistant."
      })
    ).toBe("ai-strong-resume");
  });
});
