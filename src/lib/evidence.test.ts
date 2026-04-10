import { describe, expect, it } from "vitest";
import { parseEvidenceJson } from "./evidence";

describe("parseEvidenceJson", () => {
  it("returns stored evidence entries in stable order", () => {
    const evidence = parseEvidenceJson(
      JSON.stringify([
        {
          level: "Strong Related",
          sentence: "Built a RAG assistant for support.",
          labels: ["Explicit AI Work"]
        },
        {
          level: "Weak Related",
          sentence: "Used Cursor for prototyping.",
          labels: ["AI Tool Usage"]
        }
      ])
    );

    expect(evidence).toEqual([
      {
        level: "Strong Related",
        sentence: "Built a RAG assistant for support.",
        labels: ["Explicit AI Work"]
      },
      {
        level: "Weak Related",
        sentence: "Used Cursor for prototyping.",
        labels: ["AI Tool Usage"]
      }
    ]);
  });

  it("falls back to an empty list when evidence json is invalid", () => {
    expect(parseEvidenceJson("not json")).toEqual([]);
  });
});
