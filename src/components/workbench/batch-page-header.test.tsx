import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BatchPageHeader } from "./batch-page-header";

describe("BatchPageHeader", () => {
  it("shows a clear action to upload another batch", () => {
    render(React.createElement(BatchPageHeader, { title: "Batch 2026-04-10" }));

    expect(screen.getByRole("heading", { name: "Batch 2026-04-10" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Upload another batch"
      })
    ).toHaveAttribute("href", "/");
  });
});
