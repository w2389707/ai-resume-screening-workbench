import React from "react";

type BatchPageHeaderProps = {
  title: string;
  error?: string | null;
};

export function BatchPageHeader({ title, error }: BatchPageHeaderProps) {
  return React.createElement(
    "header",
    {
      style: {
        display: "grid",
        gap: 14
      }
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      React.createElement(
        "div",
        { style: { display: "grid", gap: 10 } },
        React.createElement(
          "p",
          {
            style: {
              margin: 0,
              letterSpacing: "0.2em",
              textTransform: "uppercase"
            }
          },
          "Batch workbench"
        ),
        React.createElement(
          "h1",
          { style: { margin: 0, fontSize: "clamp(2rem, 4vw, 3.5rem)", lineHeight: 1.05 } },
          title
        )
      ),
      React.createElement(
        "a",
        {
          href: "/",
          style: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 44,
            padding: "0 18px",
            borderRadius: 999,
            background: "#111827",
            color: "#ffffff",
            fontWeight: 600,
            textDecoration: "none"
          }
        },
        "Upload another batch"
      )
    ),
    error
      ? React.createElement("p", { role: "alert", style: { margin: 0, color: "#991b1b" } }, error)
      : null
  );
}
