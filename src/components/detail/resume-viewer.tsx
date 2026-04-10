import React from "react";

type ResumeViewerProps = {
  text: string | null;
  parseError?: string | null;
};

export function ResumeViewer({ text, parseError }: ResumeViewerProps) {
  return React.createElement(
    "section",
    {
      "aria-label": "Resume viewer",
      style: {
        display: "grid",
        gap: 12,
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(17, 24, 39, 0.12)",
        background: "rgba(255, 255, 255, 0.78)"
      }
    },
    React.createElement("h3", { style: { margin: 0, fontSize: "1rem" } }, "Resume viewer"),
    parseError
      ? React.createElement(
          "p",
          {
            role: "alert",
            style: {
              margin: 0,
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(254, 242, 242, 0.96)",
              color: "#991b1b",
              border: "1px solid rgba(185, 28, 28, 0.2)"
            }
          },
          parseError
        )
      : null,
    React.createElement(
      "pre",
      {
        style: {
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
          fontSize: "0.9rem",
          lineHeight: 1.6
        }
      },
      text ?? "No parsed resume text available."
    )
  );
}
