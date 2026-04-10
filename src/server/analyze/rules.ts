import type { AnalysisResult, EvidenceItem } from "./types";

const strongPatterns = [
  /\brag\b/i,
  /\bllm\b/i,
  /fine-?tuning/i,
  /\bretrieval chain\b/i,
  /\bprompt evaluation\b/i,
  /\brecommendation\b/i,
  /\bnlp\b/i,
  /\bocr\b/i,
  /\bembedding\b/i,
  /\bvector\b/i
];

const weakPatterns = [
  /\bchatgpt\b/i,
  /\bclaude\b/i,
  /\bcursor\b/i,
  /\bmidjourney\b/i
];

function splitSentences(text: string) {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[.!?\u3002\uFF1B;])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildEvidence(sentences: string[]): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  for (const sentence of sentences) {
    if (strongPatterns.some((pattern) => pattern.test(sentence))) {
      evidence.push({
        level: "Strong Related",
        sentence,
        labels: ["Explicit AI Work"]
      });
      continue;
    }

    if (weakPatterns.some((pattern) => pattern.test(sentence))) {
      evidence.push({
        level: "Weak Related",
        sentence,
        labels: ["AI Tool Usage"]
      });
    }
  }

  return evidence;
}

function hasMetricSignal(text: string) {
  return /(\b\d+%|\b\d+(?:\.\d+)?\s*(?:x|times|months?|years?|days?)\b|accuracy|precision|recall|improved|reduced|increased)/i.test(
    text
  );
}

function getMainType(evidence: EvidenceItem[]) {
  if (!evidence.length) {
    return null;
  }

  if (
    evidence.some((item) =>
      /llm|rag|fine-?tuning|nlp|ocr|embedding|vector/i.test(item.sentence)
    )
  ) {
    return "AI Application / Engineering / Delivery";
  }

  return "AI Tool Power User";
}

export async function analyzeResumeWithRules(
  text: string
): Promise<AnalysisResult> {
  const sentences = splitSentences(text);
  const evidence = buildEvidence(sentences);
  const hasStrongEvidence = evidence.some((item) => item.level === "Strong Related");
  const hasWeakEvidence = evidence.some((item) => item.level === "Weak Related");
  const hasAnyEvidence = evidence.length > 0;

  return {
    label: hasStrongEvidence
      ? "Clearly AI Related"
      : hasAnyEvidence
        ? "Possibly AI Related"
        : "No Clear AI Signal",
    suggestedStatus: hasStrongEvidence
      ? "Suggested Priority Review"
      : hasAnyEvidence
        ? "Suggested Manual Review"
        : "Suggested Ignore",
    mainType: getMainType(evidence),
    secondaryLabels: evidence.flatMap((item) => item.labels),
    aiStrength: hasStrongEvidence ? "High" : hasWeakEvidence ? "Medium" : "Low",
    evidenceCompleteness: hasMetricSignal(text)
      ? "High"
      : hasStrongEvidence
        ? "Medium"
        : "Low",
    strongestEvidence: evidence[0]?.sentence ?? null,
    evidence
  };
}
