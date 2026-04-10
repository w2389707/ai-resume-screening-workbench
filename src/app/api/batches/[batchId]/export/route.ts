import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { buildExportRows, exportRowsToWorkbook } from "@/server/export/export-batch";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    batchId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { batchId } = await params;
  const url = new URL(request.url);
  const requestedItemIds = url.searchParams.getAll("itemId").filter(Boolean);

  const items = await db.batchItem.findMany({
    where: {
      batchId,
      ...(requestedItemIds.length
        ? {
            id: {
              in: requestedItemIds
            }
          }
        : {})
    }
  });

  const orderedItems = requestedItemIds.length
    ? requestedItemIds
        .map((itemId) => items.find((item) => item.id === itemId))
        .filter((item): item is (typeof items)[number] => Boolean(item))
    : items;

  const workbook = exportRowsToWorkbook(buildExportRows(orderedItems));

  return new NextResponse(workbook, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="batch-${batchId}.xlsx"`
    }
  });
}
