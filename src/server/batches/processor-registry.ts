import { processBatch } from "./process-batch";

const runningBatchIds = new Set<string>();
const rerunBatchIds = new Set<string>();

export function queueBatch(batchId: string) {
  if (runningBatchIds.has(batchId)) {
    rerunBatchIds.add(batchId);
    return;
  }

  runningBatchIds.add(batchId);
  void processBatch(batchId).finally(() => {
    runningBatchIds.delete(batchId);

    if (rerunBatchIds.has(batchId)) {
      rerunBatchIds.delete(batchId);
      queueBatch(batchId);
    }
  });
}
