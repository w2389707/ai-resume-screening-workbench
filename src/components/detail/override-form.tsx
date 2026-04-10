"use client";

import React, { useEffect, useState, useTransition } from "react";
import { AI_LABELS, SUGGESTED_STATUSES } from "@/lib/domain";
import type { BatchCandidate } from "@/lib/ranking";

const REASON_OPTIONS = [
  { value: "", label: "No reason selected" },
  { value: "tool-term over-trigger", label: "Tool term over-trigger" },
  { value: "company background over-trigger", label: "Company background over-trigger" },
  { value: "insufficient evidence", label: "Insufficient evidence" },
  { value: "actually not ai-related", label: "Actually not AI-related" },
  { value: "should be classified stronger", label: "Should be classified stronger" }
] as const;

type OverrideFormProps = {
  batchId: string;
  itemId: string;
  currentLabel: string | null;
  currentStatus: string | null;
  onSaved?: (candidate: BatchCandidate) => void;
};

export function OverrideForm({
  batchId,
  itemId,
  currentLabel,
  currentStatus,
  onSaved
}: OverrideFormProps) {
  const [finalLabel, setFinalLabel] = useState(currentLabel ?? "Possibly AI Related");
  const [finalStatus, setFinalStatus] = useState(currentStatus ?? "Suggested Manual Review");
  const [reasonTag, setReasonTag] = useState("");
  const [freeTextReason, setFreeTextReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFinalLabel(currentLabel ?? "Possibly AI Related");
  }, [currentLabel, itemId]);

  useEffect(() => {
    setFinalStatus(currentStatus ?? "Suggested Manual Review");
  }, [currentStatus, itemId]);

  useEffect(() => {
    setReasonTag("");
    setFreeTextReason("");
    setError(null);
  }, [itemId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/batches/${batchId}/items/${itemId}/override`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            finalLabel,
            finalStatus,
            reasonTag: reasonTag || undefined,
            freeTextReason: freeTextReason.trim() || undefined
          })
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Unable to save override.");
        }

        const updatedItem = (await response.json()) as BatchCandidate;
        onSaved?.(updatedItem);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Unable to save override.");
      }
    });
  }

  return React.createElement(
    "form",
    {
      onSubmit: handleSubmit,
      style: {
        display: "grid",
        gap: 12,
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(17, 24, 39, 0.12)",
        background: "rgba(255, 255, 255, 0.88)"
      }
    },
    React.createElement("h3", { style: { margin: 0, fontSize: "1rem" } }, "Recruiter override"),
    React.createElement(
      "label",
      { style: { display: "grid", gap: 6 } },
      React.createElement("span", { style: { fontSize: "0.85rem", color: "#374151" } }, "Final label"),
      React.createElement(
        "select",
        {
          value: finalLabel,
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setFinalLabel(event.target.value),
          disabled: isPending,
          style: {
            border: "1px solid rgba(17, 24, 39, 0.14)",
            borderRadius: 14,
            padding: "10px 12px",
            background: "white"
          }
        },
        ...AI_LABELS.map((label) =>
          React.createElement("option", { key: label, value: label }, label)
        )
      )
    ),
    React.createElement(
      "label",
      { style: { display: "grid", gap: 6 } },
      React.createElement("span", { style: { fontSize: "0.85rem", color: "#374151" } }, "Final status"),
      React.createElement(
        "select",
        {
          value: finalStatus,
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setFinalStatus(event.target.value),
          disabled: isPending,
          style: {
            border: "1px solid rgba(17, 24, 39, 0.14)",
            borderRadius: 14,
            padding: "10px 12px",
            background: "white"
          }
        },
        ...SUGGESTED_STATUSES.map((status) =>
          React.createElement("option", { key: status, value: status }, status)
        )
      )
    ),
    React.createElement(
      "label",
      { style: { display: "grid", gap: 6 } },
      React.createElement("span", { style: { fontSize: "0.85rem", color: "#374151" } }, "Reason tag"),
      React.createElement(
        "select",
        {
          value: reasonTag,
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) => setReasonTag(event.target.value),
          disabled: isPending,
          style: {
            border: "1px solid rgba(17, 24, 39, 0.14)",
            borderRadius: 14,
            padding: "10px 12px",
            background: "white"
          }
        },
        ...REASON_OPTIONS.map((option) =>
          React.createElement("option", { key: option.value || "empty", value: option.value }, option.label)
        )
      )
    ),
    React.createElement(
      "label",
      { style: { display: "grid", gap: 6 } },
      React.createElement("span", { style: { fontSize: "0.85rem", color: "#374151" } }, "Optional note"),
      React.createElement("textarea", {
        value: freeTextReason,
        onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => setFreeTextReason(event.target.value),
        disabled: isPending,
        rows: 3,
        placeholder: "Add optional context for this override",
        style: {
          border: "1px solid rgba(17, 24, 39, 0.14)",
          borderRadius: 14,
          padding: "10px 12px",
          background: "white",
          resize: "vertical"
        }
      })
    ),
    error
      ? React.createElement("p", { role: "alert", style: { margin: 0, color: "#991b1b" } }, error)
      : null,
    React.createElement(
      "button",
      {
        type: "submit",
        disabled: isPending,
        style: {
          border: 0,
          borderRadius: 999,
          padding: "10px 14px",
          background: "#111827",
          color: "white",
          fontWeight: 600,
          cursor: isPending ? "wait" : "pointer"
        }
      },
      isPending ? "Saving..." : "Save override"
    )
  );
}
