import React from "react";
import { parseEvidenceJson } from "@/lib/evidence";
import type { BatchCandidate } from "@/lib/ranking";
import { getCandidateSecondaryLabels } from "@/lib/filters";

type LegacyEvidence = {
  level: string;
  sentence: string;
  labels?: string[];
};

type LegacyItem = {
  id?: string;
  originalName?: string;
  aiLabel?: string | null;
  suggestedStatus?: string | null;
  mainType?: string | null;
  processingState?: string;
  parsedText?: string | null;
  evidence?: LegacyEvidence[];
  secondaryLabels?: string[];
  strongestEvidence?: string | null;
  aiStrength?: string | null;
  evidenceCompleteness?: string | null;
  parseError?: string | null;
  secondaryLabelsJson?: string;
  overrides?: BatchCandidate["overrides"];
};

type EvidenceGroupsProps = {
  candidate: BatchCandidate | LegacyItem;
  evidence?: LegacyEvidence[];
  secondaryLabels?: string[];
};

const EVIDENCE_ORDER = ["Strong Related", "Weak Related", "Inferred Related"] as const;

function renderEvidenceItems(evidence: LegacyEvidence[]) {
  return EVIDENCE_ORDER.flatMap((level) => {
    const group = evidence.filter((entry) => entry.level === level);

    if (!group.length) {
      return [];
    }

    return React.createElement(
      "div",
      { key: level, style: { display: "grid", gap: 8 } },
      React.createElement("strong", null, level),
      ...group.map((entry, index) =>
        React.createElement(
          "div",
          {
            key: `${entry.level}-${index}`,
            style: {
              display: "grid",
              gap: 4,
              padding: 12,
              borderRadius: 16,
              background: "rgba(255, 255, 255, 0.55)"
            }
          },
          React.createElement("p", { style: { margin: 0 } }, entry.sentence),
          entry.labels?.length
            ? React.createElement(
                "p",
                { style: { margin: 0, color: "#6b7280", fontSize: "0.85rem" } },
                entry.labels.join(", ")
              )
            : null
        )
      )
    );
  });
}

export function EvidenceGroups({ candidate, evidence, secondaryLabels }: EvidenceGroupsProps) {
  const candidateSecondaryLabels = secondaryLabels ?? ("secondaryLabels" in candidate && candidate.secondaryLabels
    ? candidate.secondaryLabels
    : getCandidateSecondaryLabels(candidate as BatchCandidate));
  const candidateEvidence = evidence ?? ("evidence" in candidate && candidate.evidence
    ? candidate.evidence
    : "evidenceJson" in candidate
      ? parseEvidenceJson(candidate.evidenceJson)
      : []);
  const strongestEvidence = "strongestEvidence" in candidate ? candidate.strongestEvidence : null;

  return React.createElement(
    "section",
    {
      "aria-label": "Evidence groups",
      style: {
        display: "grid",
        gap: 12,
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(17, 24, 39, 0.12)",
        background: "rgba(248, 246, 239, 0.9)"
      }
    },
    React.createElement("h3", { style: { margin: 0, fontSize: "1rem" } }, "Evidence groups"),
    candidateEvidence.length
      ? React.createElement(
          "div",
          { style: { display: "grid", gap: 8 } },
          renderEvidenceItems(candidateEvidence)
        )
      : React.createElement(
          "div",
          { style: { display: "grid", gap: 8 } },
          React.createElement(
            "div",
            null,
            React.createElement("strong", null, "Strongest evidence"),
            React.createElement(
              "p",
              { style: { margin: "4px 0 0" } },
              strongestEvidence ?? "No evidence captured."
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement("strong", null, "Secondary labels"),
            React.createElement(
              "p",
              { style: { margin: "4px 0 0" } },
              candidateSecondaryLabels.length ? candidateSecondaryLabels.join(", ") : "None captured."
            )
          ),
          React.createElement(
            "div",
            null,
            React.createElement("strong", null, "AI strength"),
            React.createElement("p", { style: { margin: "4px 0 0" } }, candidate.aiStrength ?? "Unknown")
          ),
          React.createElement(
            "div",
            null,
            React.createElement("strong", null, "Evidence completeness"),
            React.createElement(
              "p",
              { style: { margin: "4px 0 0" } },
              candidate.evidenceCompleteness ?? "Unknown"
            )
          ),
          candidate.parseError
            ? React.createElement(
                "div",
                null,
                React.createElement("strong", null, "Parse error"),
                React.createElement("p", { style: { margin: "4px 0 0" } }, candidate.parseError)
              )
            : null
        )
  );
}
