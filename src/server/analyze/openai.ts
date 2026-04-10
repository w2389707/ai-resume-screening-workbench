import OpenAI from "openai";
import { analysisResultSchema, type AnalysisResult } from "./types";

function createClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when ANALYZER_MODE=openai");
  }

  return new OpenAI({ apiKey });
}

export async function analyzeResumeWithOpenAI(
  text: string
): Promise<AnalysisResult> {
  const client = createClient();
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "Analyze the resume for AI-related evidence and return JSON only with the required analysis fields."
          }
        ]
      },
      {
        role: "user",
        content: [{ type: "input_text", text }]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "resume_analysis",
        schema: {
          type: "object",
          additionalProperties: false,
          required: [
            "label",
            "suggestedStatus",
            "mainType",
            "secondaryLabels",
            "aiStrength",
            "evidenceCompleteness",
            "strongestEvidence",
            "evidence"
          ],
          properties: {
            label: { type: "string" },
            suggestedStatus: { type: "string" },
            mainType: { type: ["string", "null"] },
            secondaryLabels: {
              type: "array",
              items: { type: "string" }
            },
            aiStrength: { type: "string" },
            evidenceCompleteness: { type: "string" },
            strongestEvidence: { type: ["string", "null"] },
            evidence: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["level", "sentence", "labels"],
                properties: {
                  level: { type: "string" },
                  sentence: { type: "string" },
                  labels: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  return analysisResultSchema.parse(
    JSON.parse(response.output_text)
  ) as AnalysisResult;
}
