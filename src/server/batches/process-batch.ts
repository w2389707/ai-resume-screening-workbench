import { db } from "@/server/db";
import { analyzeResume } from "@/server/analyze";

export async function processBatch(batchId: string) {
  while (true) {
    const items = await db.batchItem.findMany({
      where: {
        batchId,
        processingState: "Queued",
        parsedText: {
          not: null
        }
      },
      orderBy: [
        {
          createdAt: "asc"
        },
        {
          id: "asc"
        }
      ]
    });

    if (!items.length) {
      return;
    }

    for (const item of items) {
      await db.batchItem.update({
        where: {
          id: item.id
        },
        data: {
          processingState: "Analyzing"
        }
      });

      try {
        const analysis = await analyzeResume(item.parsedText ?? "");

        await db.batchItem.update({
          where: {
            id: item.id
          },
          data: {
            processingState: "Completed",
            aiLabel: analysis.label,
            suggestedStatus: analysis.suggestedStatus,
            mainType: analysis.mainType,
            secondaryLabelsJson: JSON.stringify(analysis.secondaryLabels),
            evidenceJson: JSON.stringify(analysis.evidence),
            strongestEvidence: analysis.strongestEvidence,
            aiStrength: analysis.aiStrength,
            evidenceCompleteness: analysis.evidenceCompleteness
          }
        });
      } catch (error) {
        await db.batchItem.update({
          where: {
            id: item.id
          },
          data: {
            processingState: "Failed",
            parseError: error instanceof Error ? error.message : "Unknown error"
          }
        });
      }
    }
  }
}
