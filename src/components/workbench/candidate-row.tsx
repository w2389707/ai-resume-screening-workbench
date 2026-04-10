import React from "react";
import { getCandidateDisplayName, getCandidateFileStem } from "@/lib/candidate-display";
import type { BatchCandidate } from "@/lib/ranking";
import { getCandidateSecondaryLabels } from "@/lib/filters";

type CandidateRowProps = {
  candidate: BatchCandidate;
  selected: boolean;
  onSelect: (candidateId: string) => void;
};

export function CandidateRow({ candidate, selected, onSelect }: CandidateRowProps) {
  const secondaryLabels = getCandidateSecondaryLabels(candidate);
  const displayName = getCandidateDisplayName(candidate);
  const fileStem = getCandidateFileStem(candidate.originalName);
  const isParseException = candidate.aiLabel === "Parse Exception" || Boolean(candidate.parseError);

  return React.createElement(
    "tr",
    {
      "aria-selected": selected,
      style: {
        background: isParseException
          ? "rgba(185, 28, 28, 0.06)"
          : selected
            ? "rgba(17, 24, 39, 0.05)"
            : "transparent"
      }
    },
    React.createElement(
      "td",
      { style: { padding: "14px 12px" } },
      React.createElement(
        "button",
        {
          type: "button",
          onClick: () => onSelect(candidate.id),
          style: {
            display: "grid",
            gap: 4,
            border: 0,
            background: "transparent",
            padding: 0,
            textAlign: "left",
            cursor: "pointer",
            color: "#111827"
          }
        },
        React.createElement("strong", null, displayName),
        displayName !== fileStem
          ? React.createElement(
              "span",
              { style: { fontSize: "0.82rem", color: "#6b7280" } },
              candidate.originalName
            )
          : null,
        React.createElement(
          "span",
          { style: { fontSize: "0.85rem", color: "#6b7280" } },
          candidate.suggestedStatus ?? "No suggested status"
        )
      )
    ),
    React.createElement(
      "td",
      { style: { padding: "14px 12px", whiteSpace: "nowrap" } },
      isParseException
        ? React.createElement(
            "span",
            {
              style: {
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(185, 28, 28, 0.12)",
                color: "#991b1b",
                fontWeight: 600
              }
            },
            candidate.processingState
          )
        : candidate.processingState
    ),
    React.createElement(
      "td",
      { style: { padding: "14px 12px" } },
      isParseException
        ? React.createElement(
            "span",
            {
              style: {
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(185, 28, 28, 0.12)",
                color: "#991b1b",
                fontWeight: 600
              }
            },
            candidate.aiLabel ?? "Parse Exception"
          )
        : candidate.aiLabel ?? "Unlabeled"
    ),
    React.createElement("td", { style: { padding: "14px 12px" } }, candidate.mainType ?? "Unspecified"),
    React.createElement(
      "td",
      { style: { padding: "14px 12px" } },
      React.createElement(
        "div",
        { style: { display: "grid", gap: 4 } },
        React.createElement(
          "span",
          null,
          isParseException
            ? candidate.parseError ?? "Resume parsing failed."
            : candidate.strongestEvidence ?? "No evidence captured."
        ),
        secondaryLabels.length && !isParseException
          ? React.createElement(
              "span",
              { style: { color: "#6b7280", fontSize: "0.85rem" } },
              secondaryLabels.join(", ")
            )
          : null
      )
    )
  );
}
