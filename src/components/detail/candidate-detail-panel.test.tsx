import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CandidateDetailPanel } from "./candidate-detail-panel";

describe("CandidateDetailPanel", () => {
  it("renders evidence groups and candidate metadata", () => {
    render(
      React.createElement(CandidateDetailPanel, {
        item: {
          id: "item_1",
          originalName: "alice.pdf",
          aiLabel: "Clearly AI Related",
          suggestedStatus: "Suggested Priority Review",
          mainType: "AI Application / Engineering / Delivery",
          aiStrength: "High",
          evidenceCompleteness: "Medium",
          secondaryLabels: ["Explicit AI Work"],
          evidence: [
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
          ]
        }
      })
    );

    expect(screen.getByText("Built a RAG assistant for support.")).toBeInTheDocument();
    expect(screen.getByText("Strong Related")).toBeInTheDocument();
    expect(screen.getByText("AI Application / Engineering / Delivery")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Explicit AI Work")).toBeInTheDocument();
  });
});
