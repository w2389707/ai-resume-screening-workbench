import React from "react";
import type { CandidateTab } from "@/lib/filters";

type BatchTabsProps = {
  value: CandidateTab;
  counts: Record<CandidateTab, number>;
  onChange: (value: CandidateTab) => void;
};

const TAB_LABELS: Array<{ value: CandidateTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "active", label: "Processing" },
  { value: "failed", label: "Failed" }
];

export function BatchTabs({ value, counts, onChange }: BatchTabsProps) {
  return React.createElement(
    "div",
    {
      role: "tablist",
      "aria-label": "Batch filters",
      style: { display: "flex", flexWrap: "wrap", gap: 8 }
    },
    ...TAB_LABELS.map((tab) =>
      React.createElement(
        "button",
        {
          key: tab.value,
          type: "button",
          role: "tab",
          "aria-selected": tab.value === value,
          onClick: () => onChange(tab.value),
          style: {
            border: "1px solid rgba(17, 24, 39, 0.12)",
            borderRadius: 999,
            padding: "10px 14px",
            background: tab.value === value ? "#111827" : "rgba(255, 255, 255, 0.82)",
            color: tab.value === value ? "#fff" : "#111827",
            fontWeight: 600
          }
        },
        `${tab.label} (${counts[tab.value]})`
      )
    )
  );
}

