// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

const applyOverride = vi.fn();

vi.mock("@/server/batches/repository", () => ({
  applyOverride
}));

describe("POST /api/batches/[batchId]/items/[itemId]/override", () => {
  it("stores the override and returns the updated item", async () => {
    applyOverride.mockResolvedValue({
      id: "item_1",
      aiLabel: "Possibly AI Related",
      suggestedStatus: "Suggested Manual Review",
      overrides: [
        {
          id: "override_1",
          originalLabel: "Clearly AI Related",
          finalLabel: "Possibly AI Related"
        }
      ]
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/batches/batch_1/items/item_1/override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          finalLabel: "Possibly AI Related",
          finalStatus: "Suggested Manual Review",
          reasonTag: "insufficient evidence"
        })
      }),
      {
        params: Promise.resolve({
          batchId: "batch_1",
          itemId: "item_1"
        })
      }
    );

    expect(applyOverride).toHaveBeenCalledWith({
      batchId: "batch_1",
      batchItemId: "item_1",
      finalLabel: "Possibly AI Related",
      finalStatus: "Suggested Manual Review",
      reasonTag: "insufficient evidence",
      freeTextReason: undefined
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "item_1",
      aiLabel: "Possibly AI Related",
      suggestedStatus: "Suggested Manual Review",
      overrides: [
        {
          id: "override_1",
          originalLabel: "Clearly AI Related",
          finalLabel: "Possibly AI Related"
        }
      ]
    });
  });
});
