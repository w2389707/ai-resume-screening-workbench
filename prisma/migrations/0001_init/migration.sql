-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BatchItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "processingState" TEXT NOT NULL DEFAULT 'Queued',
    "aiLabel" TEXT,
    "suggestedStatus" TEXT,
    "mainType" TEXT,
    "secondaryLabelsJson" TEXT NOT NULL DEFAULT '[]',
    "strongestEvidence" TEXT,
    "aiStrength" TEXT,
    "evidenceCompleteness" TEXT,
    "parsedText" TEXT,
    "parseError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BatchItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Override" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batchItemId" TEXT NOT NULL,
    "originalLabel" TEXT,
    "finalLabel" TEXT,
    "originalStatus" TEXT,
    "finalStatus" TEXT,
    "reasonTag" TEXT,
    "freeTextReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Override_batchItemId_fkey" FOREIGN KEY ("batchItemId") REFERENCES "BatchItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BatchItem_batchId_createdAt_idx" ON "BatchItem"("batchId", "createdAt");

-- CreateIndex
CREATE INDEX "Override_batchItemId_createdAt_idx" ON "Override"("batchItemId", "createdAt");
