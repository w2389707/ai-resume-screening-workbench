import { NextResponse } from "next/server";
import { getBatchDetail } from "@/server/batches/repository";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    batchId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { batchId } = await params;
  const detail = await getBatchDetail(batchId);

  if (!detail) {
    return NextResponse.json({ error: "Batch not found." }, { status: 404 });
  }

  return NextResponse.json(detail);
}
