import React from "react";
import type { CandidateFilterState, CandidateLabelFilter } from "@/lib/filters";

type FilterBarProps = {
  value: CandidateFilterState;
  onChange: (value: CandidateFilterState) => void;
};

const LABEL_OPTIONS: CandidateLabelFilter[] = [
  "all",
  "Clearly AI Related",
  "Possibly AI Related",
  "No Clear AI Signal",
  "Parse Exception"
];

export function FilterBar({ value, onChange }: FilterBarProps) {
  return React.createElement(
    "div",
    {
      "aria-label": "Candidate filters",
      style: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 280px)",
        gap: 12
      }
    },
    React.createElement(
      "label",
      { style: { display: "grid", gap: 6 } },
      React.createElement("span", { style: { fontSize: "0.85rem", color: "#374151" } }, "Search"),
      React.createElement("input", {
        value: value.query,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onChange({ ...value, query: event.target.value }),
        placeholder: "Search names, labels, evidence",
        style: {
          border: "1px solid rgba(17, 24, 39, 0.14)",
          borderRadius: 16,
          padding: "12px 14px",
          background: "rgba(255, 255, 255, 0.9)"
        }
      })
    ),
    React.createElement(
      "label",
      { style: { display: "grid", gap: 6 } },
      React.createElement("span", { style: { fontSize: "0.85rem", color: "#374151" } }, "Label"),
      React.createElement(
        "select",
        {
          value: value.label,
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
            onChange({
              ...value,
              label: event.target.value as CandidateLabelFilter
            }),
          style: {
            border: "1px solid rgba(17, 24, 39, 0.14)",
            borderRadius: 16,
            padding: "12px 14px",
            background: "rgba(255, 255, 255, 0.9)"
          }
        },
        ...LABEL_OPTIONS.map((label) =>
          React.createElement(
            "option",
            { key: label, value: label },
            label === "all" ? "All labels" : label
          )
        )
      )
    )
  );
}

