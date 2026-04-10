import type {
  AiLabel,
  EvidenceLevel,
  MainType,
  SuggestedStatus
} from "@/lib/domain";
import {
  AI_LABELS,
  EVIDENCE_LEVELS,
  MAIN_TYPES,
  SUGGESTED_STATUSES
} from "@/lib/domain";
import { z } from "zod";

export type AnalyzerMode = "rules" | "openai";
export type StrengthLevel = "High" | "Medium" | "Low";

export type EvidenceItem = {
  level: EvidenceLevel;
  sentence: string;
  labels: string[];
};

export type AnalysisResult = {
  label: AiLabel;
  suggestedStatus: SuggestedStatus;
  mainType: MainType | null;
  secondaryLabels: string[];
  aiStrength: StrengthLevel;
  evidenceCompleteness: StrengthLevel;
  strongestEvidence: string | null;
  evidence: EvidenceItem[];
};

export type Analyzer = (text: string) => Promise<AnalysisResult>;

export const strengthLevels = ["High", "Medium", "Low"] as const;

export const evidenceItemSchema = z.object({
  level: z.enum(EVIDENCE_LEVELS),
  sentence: z.string(),
  labels: z.array(z.string())
});

export const analysisResultSchema = z.object({
  label: z.enum(AI_LABELS),
  suggestedStatus: z.enum(SUGGESTED_STATUSES),
  mainType: z.enum(MAIN_TYPES).nullable(),
  secondaryLabels: z.array(z.string()),
  aiStrength: z.enum(strengthLevels),
  evidenceCompleteness: z.enum(strengthLevels),
  strongestEvidence: z.string().nullable(),
  evidence: z.array(evidenceItemSchema)
});
