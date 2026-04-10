export type BatchCandidate = {
  id: string;
  originalName: string;
  processingState: string;
  aiLabel: string | null;
  suggestedStatus: string | null;
  mainType: string | null;
  evidenceJson: string;
  strongestEvidence: string | null;
  aiStrength: string | null;
  evidenceCompleteness: string | null;
  parsedText: string | null;
  parseError: string | null;
  secondaryLabelsJson: string;
  overrides: Array<{
    id: string;
    finalLabel: string | null;
    finalStatus: string | null;
    reasonTag: string | null;
    freeTextReason: string | null;
  }>;
};

const PROCESSING_STATE_SCORE: Record<string, number> = {
  Completed: 0,
  Analyzing: 1,
  Parsing: 1,
  Queued: 2,
  Failed: 3
};

const AI_LABEL_SCORE: Record<string, number> = {
  "Clearly AI Related": 0,
  "Possibly AI Related": 1,
  "No Clear AI Signal": 2,
  "Parse Exception": 3
};

function scoreString(value: string | null | undefined, mapping: Record<string, number>, fallback: number) {
  if (!value) {
    return fallback;
  }

  return mapping[value] ?? fallback;
}

function scoreText(value: string | null | undefined) {
  if (!value) {
    return 2;
  }

  if (value.length > 500) {
    return 0;
  }

  if (value.length > 150) {
    return 1;
  }

  return 2;
}

export function rankBatchCandidates(candidates: BatchCandidate[]) {
  return [...candidates].sort((left, right) => {
    const stateDiff =
      scoreString(left.processingState, PROCESSING_STATE_SCORE, 2) -
      scoreString(right.processingState, PROCESSING_STATE_SCORE, 2);

    if (stateDiff !== 0) {
      return stateDiff;
    }

    const labelDiff =
      scoreString(left.aiLabel, AI_LABEL_SCORE, 2) -
      scoreString(right.aiLabel, AI_LABEL_SCORE, 2);

    if (labelDiff !== 0) {
      return labelDiff;
    }

    const textDiff =
      scoreText(right.strongestEvidence ?? right.parsedText) -
      scoreText(left.strongestEvidence ?? left.parsedText);

    if (textDiff !== 0) {
      return textDiff;
    }

    return left.originalName.localeCompare(right.originalName);
  });
}
