import { analyzeResumeWithOpenAI } from "./openai";
import { analyzeResumeWithRules } from "./rules";
import type { Analyzer, AnalyzerMode } from "./types";

export function getAnalyzer(
  mode: AnalyzerMode = (process.env.ANALYZER_MODE as AnalyzerMode | undefined) ??
    "rules"
): Analyzer {
  return mode === "openai" ? analyzeResumeWithOpenAI : analyzeResumeWithRules;
}

export async function analyzeResume(text: string) {
  return getAnalyzer()(text);
}
