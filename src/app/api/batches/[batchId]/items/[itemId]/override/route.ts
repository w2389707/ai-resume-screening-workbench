import { NextResponse } from "next/server";
import { applyOverride } from "@/server/batches/repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    batchId: string;
    itemId: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { batchId, itemId } = await params;
  const body = (await request.json()) as {
    finalLabel: string;
    finalStatus: string;
    reasonTag?: string;
    freeTextReason?: string;
  };

  try {
    const item = await applyOverride({
      batchId,
      batchItemId: itemId,
      finalLabel: body.finalLabel,
      finalStatus: body.finalStatus,
      reasonTag: body.reasonTag,
      freeTextReason: body.freeTextReason
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to apply override."
      },
      {
        status: 404
      }
    );
  }
}
