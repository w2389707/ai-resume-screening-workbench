"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BatchPageHeader } from "@/components/workbench/batch-page-header";
import { BatchSummary } from "@/components/workbench/batch-summary";
import { BatchTabs } from "@/components/workbench/batch-tabs";
import { FilterBar } from "@/components/workbench/filter-bar";
import { CandidateTable } from "@/components/workbench/candidate-table";
import { CandidateDetailPanel } from "@/components/detail/candidate-detail-panel";
import type { CandidateFilterState, CandidateTab } from "@/lib/filters";
import { filterCandidates, getCandidateTab } from "@/lib/filters";
import { rankBatchCandidates, type BatchCandidate } from "@/lib/ranking";

type BatchDetail = {
  id: string;
  name: string;
  items: BatchCandidate[];
};

const DEFAULT_FILTERS: CandidateFilterState = {
  query: "",
  tab: "all",
  label: "all"
};

function buildSummary(items: BatchCandidate[]) {
  return {
    total: items.length,
    completed: items.filter((item) => item.processingState === "Completed").length,
    processing: items.filter((item) => ["Queued", "Parsing", "Analyzing"].includes(item.processingState)).length,
    parseExceptions: items.filter(
      (item) => item.aiLabel === "Parse Exception" || item.processingState === "Failed"
    ).length,
    clearlyAiRelated: items.filter((item) => item.aiLabel === "Clearly AI Related").length,
    possiblyAiRelated: items.filter((item) => item.aiLabel === "Possibly AI Related").length,
    noClearAiSignal: items.filter((item) => item.aiLabel === "No Clear AI Signal").length
  };
}

function getSelectedCandidate(items: BatchCandidate[], selectedCandidateId: string | null) {
  return items.find((item) => item.id === selectedCandidateId) ?? null;
}

function emptyCandidate(): BatchCandidate {
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

export default function BatchWorkbenchPage() {
  const params = useParams<{ batchId?: string }>();
  const batchId = typeof params?.batchId === "string" ? params.batchId : undefined;
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [exportState, setExportState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    let cancelled = false;

    async function loadBatch() {
      try {
        const response = await fetch(`/api/batches/${batchId}`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(response.status === 404 ? "Batch not found." : "Unable to load batch.");
        }

        const detail = (await response.json()) as BatchDetail;

        if (cancelled) {
          return;
        }

        setBatch(detail);
        setError(null);
        setLoading(false);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Unable to load batch.");
        setLoading(false);
      }
    }

    loadBatch();
    const interval = setInterval(loadBatch, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [batchId]);

  const rankedCandidates = useMemo(() => rankBatchCandidates(batch?.items ?? []), [batch]);

  useEffect(() => {
    if (!rankedCandidates.length) {
      setSelectedCandidateId(null);
      return;
    }

    if (!selectedCandidateId || !rankedCandidates.some((candidate) => candidate.id === selectedCandidateId)) {
      setSelectedCandidateId(rankedCandidates[0].id);
    }
  }, [rankedCandidates, selectedCandidateId]);

  const filteredCandidates = useMemo(
    () => filterCandidates(rankedCandidates, filters),
    [filters, rankedCandidates]
  );

  const exportHref = useMemo(() => {
    if (!batchId || !filteredCandidates.length) {
      return null;
    }

    const params = new URLSearchParams();

    filteredCandidates.forEach((candidate) => {
      params.append("itemId", candidate.id);
    });

    return `/api/batches/${batchId}/export?${params.toString()}`;
  }, [batchId, filteredCandidates]);

  async function handleExport() {
    if (!exportHref) {
      setExportState("error");
      setExportMessage("Adjust filters to export at least one candidate.");
      return;
    }

    setExportState("loading");
    setExportMessage(null);

    try {
      const response = await fetch(exportHref);

      if (!response.ok) {
        throw new Error("Unable to export the current view.");
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const batchSlug = batch?.name?.trim().replace(/\s+/g, "-").toLowerCase() || "batch-export";
      anchor.href = downloadUrl;
      anchor.download = `${batchSlug}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      setExportState("success");
      setExportMessage(`Downloaded ${filteredCandidates.length} candidate rows.`);
    } catch (exportError) {
      setExportState("error");
      setExportMessage(
        exportError instanceof Error ? exportError.message : "Unable to export the current view."
      );
    }
  }

  function handleOverrideSaved(updatedCandidate: BatchCandidate) {
    setBatch((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: current.items.map((item) =>
          item.id === updatedCandidate.id ? { ...item, ...updatedCandidate } : item
        )
      };
    });
  }

  const selectedCandidate = getSelectedCandidate(rankedCandidates, selectedCandidateId);

  const counts: Record<CandidateTab, number> = {
    all: rankedCandidates.length,
    completed: rankedCandidates.filter((candidate) => getCandidateTab(candidate) === "completed").length,
    active: rankedCandidates.filter((candidate) => getCandidateTab(candidate) === "active").length,
    failed: rankedCandidates.filter((candidate) => getCandidateTab(candidate) === "failed").length
  };

  return React.createElement(
    "main",
    {
      style: {
        minHeight: "100vh",
        padding: "32px 20px",
        background:
          "radial-gradient(circle at top left, rgba(246, 195, 89, 0.22), transparent 38%), linear-gradient(180deg, #f8f5ec 0%, #f3efe4 100%)"
      }
    },
    React.createElement(
      "div",
      { style: { maxWidth: 1440, margin: "0 auto", display: "grid", gap: 20 } },
      React.createElement(BatchPageHeader, {
        title: batch?.name ?? (loading ? "Loading batch..." : "Batch unavailable"),
        error
      }),
      batch ? React.createElement(BatchSummary, { summary: buildSummary(rankedCandidates) }) : null,
      React.createElement(
        "section",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.7fr) minmax(340px, 0.9fr)",
            gap: 20,
            alignItems: "start"
          }
        },
        React.createElement(
          "div",
          { style: { display: "grid", gap: 16 } },
          React.createElement(BatchTabs, {
            value: filters.tab,
            counts,
            onChange: (tab) => setFilters((current) => ({ ...current, tab }))
          }),
          React.createElement(
            "div",
            {
              style: {
                display: "grid",
                gap: 12
              }
            },
            React.createElement(FilterBar, { value: filters, onChange: setFilters }),
            React.createElement(
              "div",
              { style: { display: "grid", gap: 8, justifyItems: "end" } },
              React.createElement(
                "button",
                {
                  type: "button",
                  disabled: !exportHref || exportState === "loading",
                  onClick: () => {
                    void handleExport();
                  },
                  style: {
                    border: 0,
                    borderRadius: 999,
                    padding: "10px 14px",
                    background: exportHref ? "#111827" : "#9ca3af",
                    color: "white",
                    fontWeight: 600,
                    cursor: exportHref ? "pointer" : "not-allowed"
                  }
                },
                exportState === "loading" ? "Preparing export..." : "Export current view"
              ),
              exportMessage
                ? React.createElement(
                    "p",
                    {
                      role: exportState === "error" ? "alert" : undefined,
                      style: {
                        margin: 0,
                        fontSize: "0.85rem",
                        color: exportState === "error" ? "#991b1b" : "#374151"
                      }
                    },
                    exportMessage
                  )
                : !exportHref
                  ? React.createElement(
                      "p",
                      {
                        style: {
                          margin: 0,
                          fontSize: "0.85rem",
                          color: "#6b7280"
                        }
                      },
                      "Adjust filters to enable export."
                    )
                  : null
            )
          ),
          React.createElement(CandidateTable, {
            candidates: filteredCandidates,
            selectedCandidateId,
            onSelectCandidate: setSelectedCandidateId
          })
        ),
        React.createElement(
          "div",
          { style: { display: "grid", gap: 16 } },
          React.createElement(CandidateDetailPanel, {
            batchId: batch?.id,
            candidate: selectedCandidate ?? emptyCandidate(),
            onOverrideSaved: handleOverrideSaved
          })
        )
      )
    )
  );
}
