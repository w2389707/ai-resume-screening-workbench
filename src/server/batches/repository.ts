import { db } from "@/server/db";

export type BatchItemInput = {
  fileName: string;
  originalName: string;
  processingState?: string;
  aiLabel?: string | null;
  suggestedStatus?: string | null;
  mainType?: string | null;
  secondaryLabelsJson?: string;
  evidenceJson?: string;
  strongestEvidence?: string | null;
  aiStrength?: string | null;
  evidenceCompleteness?: string | null;
  parsedText?: string | null;
  parseError?: string | null;
};

export async function createBatch(input: { name: string }) {
  return db.batch.create({
    data: {
      name: input.name
    }
  });
}

export async function createBatchItems(
  batchId: string,
  items: BatchItemInput[]
) {
  return Promise.all(
    items.map((item) =>
      db.batchItem.create({
        data: {
          batchId,
          fileName: item.fileName,
          originalName: item.originalName,
          processingState: item.processingState ?? "Queued",
          aiLabel: item.aiLabel ?? null,
          suggestedStatus: item.suggestedStatus ?? null,
          mainType: item.mainType ?? null,
          secondaryLabelsJson: item.secondaryLabelsJson ?? "[]",
          evidenceJson: item.evidenceJson ?? "[]",
          strongestEvidence: item.strongestEvidence ?? null,
          aiStrength: item.aiStrength ?? null,
          evidenceCompleteness: item.evidenceCompleteness ?? null,
          parsedText: item.parsedText ?? null,
          parseError: item.parseError ?? null
        }
      })
    )
  );
}

export async function getBatchDetail(batchId: string) {
  return db.batch.findUnique({
    where: {
      id: batchId
    },
    include: {
      items: {
        include: {
          overrides: true
        },
        orderBy: [
          {
            createdAt: "asc"
          },
          {
            id: "asc"
          }
        ]
      }
    }
  });
}

export async function applyOverride(input: {
  batchId: string;
  batchItemId: string;
  finalLabel: string;
  finalStatus: string;
  reasonTag?: string;
  freeTextReason?: string;
}) {
  const item = await db.batchItem.findUnique({
    where: {
      id: input.batchItemId
    }
  });

  if (!item || item.batchId !== input.batchId) {
    throw new Error("Batch item not found.");
  }

  await db.override.create({
    data: {
      batchItemId: input.batchItemId,
      originalLabel: item.aiLabel,
      finalLabel: input.finalLabel,
      originalStatus: item.suggestedStatus,
      finalStatus: input.finalStatus,
      reasonTag: input.reasonTag,
      freeTextReason: input.freeTextReason
    }
  });

  return db.batchItem.update({
    where: {
      id: input.batchItemId
    },
    data: {
      aiLabel: input.finalLabel,
      suggestedStatus: input.finalStatus
    },
    include: {
      overrides: {
        orderBy: [
          {
            createdAt: "desc"
          },
          {
            id: "desc"
          }
        ]
      }
    }
  });
}
