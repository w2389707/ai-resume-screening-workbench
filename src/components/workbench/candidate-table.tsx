import React from "react";
import type { BatchCandidate } from "@/lib/ranking";
import { CandidateRow } from "./candidate-row";

type CandidateTableProps = {
  candidates: BatchCandidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidateId: string) => void;
};

export function CandidateTable({
  candidates,
  selectedCandidateId,
  onSelectCandidate
}: CandidateTableProps) {
  return React.createElement(
    "div",
    {
      style: {
        overflow: "hidden",
        borderRadius: 24,
        border: "1px solid rgba(17, 24, 39, 0.12)",
        background: "rgba(255, 255, 255, 0.82)"
      }
    },
    React.createElement(
      "table",
      { style: { width: "100%", borderCollapse: "collapse" } },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          { style: { textAlign: "left", background: "rgba(17, 24, 39, 0.04)" } },
          React.createElement("th", { style: { padding: "14px 12px" } }, "Candidate"),
          React.createElement("th", { style: { padding: "14px 12px" } }, "State"),
          React.createElement("th", { style: { padding: "14px 12px" } }, "Label"),
          React.createElement("th", { style: { padding: "14px 12px" } }, "Type"),
          React.createElement("th", { style: { padding: "14px 12px" } }, "Evidence")
        )
      ),
      React.createElement(
        "tbody",
        null,
        candidates.length
          ? candidates.map((candidate) =>
              React.createElement(CandidateRow, {
                key: candidate.id,
                candidate,
                selected: candidate.id === selectedCandidateId,
                onSelect: onSelectCandidate
              })
            )
          : React.createElement(
              "tr",
              null,
              React.createElement(
                "td",
                { colSpan: 5, style: { padding: 20, color: "#6b7280" } },
                "No candidates match the current filters."
              )
            )
      )
    )
  );
}

