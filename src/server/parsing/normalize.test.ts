import { describe, expect, it } from "vitest";
import { normalizeResumeText } from "./normalize";

describe("normalizeResumeText", () => {
  it("collapses excess whitespace and preserves sentence boundaries", () => {
    const input = "Experience\n\nBuilt RAG chatbot.   Improved accuracy by 18%.";

    expect(normalizeResumeText(input)).toBe(
      "Experience\nBuilt RAG chatbot. Improved accuracy by 18%."
    );
  });
});
