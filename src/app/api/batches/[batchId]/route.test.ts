// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

const getBatchDetail = vi.fn();

vi.mock("@/server/batches/repository", () => ({
  getBatchDetail
}));

describe("GET /api/batches/[batchId]", () => {
  it("returns batch detail for polling", async () => {
    getBatchDetail.mockResolvedValue({
      id: "batch_01",
      name: "April 9 batch",
      items: [{ id: "item_1", processingState: "Queued" }]
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/batches/batch_01"),
      { params: Promise.resolve({ batchId: "batch_01" }) }
    );

    expect(response.status).toBe(200);
    expect(getBatchDetail).toHaveBeenCalledWith("batch_01");
    await expect(response.json()).resolves.toEqual({
      id: "batch_01",
      name: "April 9 batch",
      items: [{ id: "item_1", processingState: "Queued" }]
    });
  });
});
