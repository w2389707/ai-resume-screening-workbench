import React from "react";

type BatchSummaryProps = {
  summary: {
    total: number;
    completed: number;
    processing: number;
    parseExceptions: number;
    clearlyAiRelated: number;
    possiblyAiRelated: number;
    noClearAiSignal: number;
  };
};

export function BatchSummary({ summary }: BatchSummaryProps) {
  return React.createElement(
    "section",
    {
      "aria-label": "Batch summary",
      style: {
        display: "grid",
        gap: 12,
        border: "1px solid rgba(17, 24, 39, 0.12)",
        borderRadius: 24,
        padding: 20,
        background: "rgba(255, 255, 255, 0.72)"
      }
    },
    React.createElement("strong", null, `${summary.total} files`),
    React.createElement("span", null, `${summary.completed} completed`),
    React.createElement("span", null, `${summary.processing} processing`),
    React.createElement("span", null, `${summary.parseExceptions} parse exceptions`),
    React.createElement(
      "span",
      null,
      `${summary.clearlyAiRelated} clearly AI related`
    ),
    React.createElement(
      "span",
      null,
      `${summary.possiblyAiRelated} possibly AI related`
    ),
    React.createElement(
      "span",
      null,
      `${summary.noClearAiSignal} no clear AI signal`
    )
  );
}
