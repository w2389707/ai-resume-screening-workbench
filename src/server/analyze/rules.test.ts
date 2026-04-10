import { describe, expect, it } from "vitest";
import { analyzeResumeWithRules } from "./rules";

describe("analyzeResumeWithRules", () => {
  it("marks explicit RAG project work as clearly AI related", async () => {
    const result = await analyzeResumeWithRules(`
      Built a RAG knowledge assistant for customer support.
      Owned retrieval chain design and prompt evaluation.
      Improved answer accuracy by 18%.
    `);

    expect(result.label).toBe("Clearly AI Related");
    expect(result.suggestedStatus).toBe("Suggested Priority Review");
    expect(result.aiStrength).toBe("High");
    expect(result.evidence[0].level).toBe("Strong Related");
  });
});
