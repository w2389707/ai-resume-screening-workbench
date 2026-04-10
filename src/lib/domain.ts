export const AI_LABELS = [
  "Clearly AI Related",
  "Possibly AI Related",
  "No Clear AI Signal",
  "Parse Exception"
] as const;

export const EVIDENCE_LEVELS = [
  "Strong Related",
  "Weak Related",
  "Inferred Related"
] as const;

export const MAIN_TYPES = [
  "AI R&D / Algorithm",
  "AI Application / Engineering / Delivery",
  "AI Product / Business / Operations",
  "AI Tool Power User"
] as const;

export const PROCESSING_STATES = [
  "Queued",
  "Parsing",
  "Analyzing",
  "Completed",
  "Failed"
] as const;

export const SUGGESTED_STATUSES = [
  "Suggested Priority Review",
  "Suggested Manual Review",
  "Suggested Ignore",
  "Parse Exception"
] as const;

export type AiLabel = (typeof AI_LABELS)[number];
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];
export type MainType = (typeof MAIN_TYPES)[number];
export type ProcessingState = (typeof PROCESSING_STATES)[number];
export type SuggestedStatus = (typeof SUGGESTED_STATUSES)[number];
