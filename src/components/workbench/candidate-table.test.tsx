import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BatchSummary } from "./batch-summary";

describe("BatchSummary", () => {
  it("renders top-line counts for a batch", () => {
    render(
      React.createElement(BatchSummary, {
        summary: {
          total: 10,
          completed: 7,
          processing: 2,
          parseExceptions: 1,
          clearlyAiRelated: 4,
          possiblyAiRelated: 2,
          noClearAiSignal: 1
        }
      })
    );

    expect(screen.getByText("10 files")).toBeInTheDocument();
    expect(screen.getByText("4 clearly AI related")).toBeInTheDocument();
  });
});
