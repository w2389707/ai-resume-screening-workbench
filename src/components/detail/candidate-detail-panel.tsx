import React from "react";
import { getCandidateDisplayName, getCandidateFileStem } from "@/lib/candidate-display";
import type { BatchCandidate } from "@/lib/ranking";
import { parseEvidenceJson } from "@/lib/evidence";
import { EvidenceGroups } from "./evidence-groups";
import { OverrideForm } from "./override-form";
import { ResumeViewer } from "./resume-viewer";

type LegacyEvidence = {
  level: string;
  sentence: string;
  labels?: string[];
};

type LegacyItem = {
  id: string;
  originalName: string;
  aiLabel?: string | null;
  suggestedStatus?: string | null;
  mainType?: string | null;
  aiStrength?: string | null;
  evidenceCompleteness?: string | null;
  parsedText?: string | null;
  parseError?: string | null;
  strongestEvidence?: string | null;
  secondaryLabels?: string[];
  evidence?: LegacyEvidence[];
  overrides?: BatchCandidate["overrides"];
};

type CandidateDetailPanelProps = {
  batchId?: string;
  candidate?: BatchCandidate;
  item?: LegacyItem;
  onOverrideSaved?: (candidate: BatchCandidate) => void;
};

function normalizeCandidate(props: CandidateDetailPanelProps): BatchCandidate | LegacyItem {
  if (props.candidate) {
    return props.candidate;
  }

  if (props.item) {
    return {
      ...props.item,
      secondaryLabelsJson: JSON.stringify(props.item.secondaryLabels ?? []),
      evidenceJson: JSON.stringify(props.item.evidence ?? []),
      processingState: "Completed",
      overrides: props.item.overrides ?? []
    };
  }

  return {
    id: "empty",
    originalName: "No candidate selected",
    processingState: "Queued",
    aiLabel: null,
    suggestedStatus: null,
    mainType: null,
    evidenceJson: "[]",
    strongestEvidence: null,
    aiStrength: null,
    evidenceCompleteness: null,
    parsedText: null,
    parseError: null,
    secondaryLabelsJson: "[]",
    overrides: []
  };
}

function getResumeText(candidate: BatchCandidate | LegacyItem) {
  if ("parsedText" in candidate && candidate.parsedText) {
    return candidate.parsedText;
  }

  if ("evidence" in candidate && candidate.evidence?.length) {
    return candidate.evidence.map((entry) => `${entry.level}: ${entry.sentence}`).join("\n\n");
  }

  return null;
}

export function CandidateDetailPanel(props: CandidateDetailPanelProps) {
  const candidate = normalizeCandidate(props);
  const resumeText = getResumeText(candidate);
  const displayName = getCandidateDisplayName(candidate);
  const fileStem = getCandidateFileStem(candidate.originalName);
  const evidence = "evidence" in candidate && candidate.evidence
    ? candidate.evidence
    : "evidenceJson" in candidate
      ? parseEvidenceJson(candidate.evidenceJson)
      : [];
  const processingState =
    "processingState" in candidate ? candidate.processingState : "Completed";
  const isParseException = candidate.aiLabel === "Parse Exception" || Boolean(candidate.parseError);

  return React.createElement(
    "aside",
    {
      "aria-label": "Candidate detail",
      style: {
        display: "grid",
        gap: 16,
        minWidth: 0,
        padding: 20,
        borderRadius: 28,
        border: "1px solid rgba(17, 24, 39, 0.12)",
        background: "rgba(255, 255, 255, 0.78)",
        boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)"
      }
    },
    React.createElement(
      "header",
      { style: { display: "grid", gap: 8 } },
      React.createElement(
        "p",
        {
          style: {
            margin: 0,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "0.72rem"
          }
        },
        "Selected candidate"
      ),
      React.createElement(
        "h2",
        { style: { margin: 0, fontSize: "1.4rem", lineHeight: 1.1 } },
        displayName
      ),
      displayName !== fileStem
        ? React.createElement(
            "p",
            { style: { margin: 0, color: "#6b7280", fontSize: "0.92rem" } },
            candidate.originalName
          )
        : null,
      React.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, color: "#374151" } },
        React.createElement("span", null, processingState),
        candidate.aiLabel ? React.createElement("span", null, candidate.aiLabel) : null,
        candidate.mainType ? React.createElement("span", null, candidate.mainType) : null,
        "aiStrength" in candidate && candidate.aiStrength
          ? React.createElement("span", null, candidate.aiStrength)
          : null,
        "evidenceCompleteness" in candidate && candidate.evidenceCompleteness
          ? React.createElement("span", null, candidate.evidenceCompleteness)
          : null
      )
    ),
    isParseException
      ? React.createElement(
          "section",
          {
            role: "alert",
            style: {
              display: "grid",
              gap: 6,
              padding: 16,
              borderRadius: 20,
              border: "1px solid rgba(185, 28, 28, 0.2)",
              background: "rgba(254, 242, 242, 0.96)",
              color: "#991b1b"
            }
          },
          React.createElement("strong", null, "Parsing needs manual review"),
          React.createElement(
            "p",
            { style: { margin: 0 } },
            candidate.parseError ?? "This resume could not be parsed into structured text."
          )
        )
      : null,
    React.createElement(EvidenceGroups, {
      candidate,
      evidence,
      secondaryLabels: "secondaryLabels" in candidate ? candidate.secondaryLabels : undefined
    }),
    props.batchId && candidate.id !== "empty"
      ? React.createElement(OverrideForm, {
          batchId: props.batchId,
          itemId: candidate.id,
          currentLabel: candidate.aiLabel ?? null,
          currentStatus: candidate.suggestedStatus ?? null,
          onSaved: props.onOverrideSaved
        })
      : null,
    React.createElement(ResumeViewer, {
      text: resumeText,
      parseError: candidate.parseError ?? null
    })
  );
}
