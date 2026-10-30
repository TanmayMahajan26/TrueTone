"use client";

import React, { useState } from "react";
import UploadZone from "../../components/UploadZone";
import BatchSummary from "../../components/BatchSummary";
import BatchCharts from "../../components/BatchCharts";
import TopReviewsList from "../../components/TopReviewsList";
import BatchSkeleton from "../../components/BatchSkeleton";
import { uploadBatch } from "../../lib/api";
import { batchResultsToCsv, downloadTextFile, exportFileName } from "../../lib/exportResults";
import { BatchResponse } from "../../lib/types";

export default function BatchPage() {
  const [results, setResults] = useState<BatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string>("");

  const handleFileSelect = async (file: File) => {
    // Pre-validate file size: 5MB limit
    const fiveMegabytes = 5 * 1024 * 1024;
    if (file.size > fiveMegabytes) {
      setError("File exceeds 5MB limit");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await uploadBatch(file);
      setResults(data);
      setFileName(file.name);
      setAnalyzedAt(new Date().toLocaleString());
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload batch";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!results?.results) return;
    downloadTextFile(batchResultsToCsv(results.results), exportFileName(fileName), "text/csv;charset=utf-8");
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 select-none print:px-0 print:py-0 print:gap-5">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b-2 border-ink pb-5">
        <div className="font-sans text-[30px] font-bold tracking-tight text-ink">
          Batch analysis<span className="text-alarm">.</span>
        </div>
        <p className="font-sans text-[15px] text-muted-text">
          {results && fileName
            ? <>Report for <strong className="text-ink">{fileName}</strong> · {analyzedAt} · model: {results.model_used?.toUpperCase()}</>
            : "Upload a CSV file to analyze multiple reviews at once"}
        </p>
      </div>

      {/* Upload Zone */}
      {!results && !isLoading && (
        <UploadZone
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          error={error}
          onErrorDismiss={() => setError(null)}
        />
      )}

      {/* Loading Radar Sweep */}
      {isLoading && <BatchSkeleton />}

      {/* Results View */}
      {results && !isLoading && (
        <div className="flex flex-col gap-8 animate-fade-up">
          {/* Export actions */}
          <div className="flex flex-col sm:flex-row gap-3 print:hidden">
            <button
              onClick={handleDownloadCsv}
              disabled={!results.results?.length}
              className="h-11 px-5 bg-sun text-ink border-2 border-ink shadow-[4px_4px_0_0_#0A0A0A] font-sans text-[14px] font-bold whitespace-nowrap cursor-pointer transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↓ Download results (CSV)
            </button>
            <button
              onClick={() => window.print()}
              className="h-11 px-5 bg-paper text-ink border-2 border-ink font-sans text-[14px] font-bold whitespace-nowrap cursor-pointer hover:bg-ink hover:text-paper transition-colors"
            >
              Save report as PDF
            </button>
            <span className="font-mono text-[11px] text-muted-text self-center">
              CSV has one line per review: verdict, confidence, reliability, trust score and flags.
            </span>
          </div>

          {/* Summary Cards Row */}
          <BatchSummary results={results} />

          {/* Charts Row */}
          <BatchCharts results={results} />

          {/* Complaints / Praised Aspect Chips Grid */}
          <TopReviewsList
            topComplaints={results.top_complaints}
            topPraised={results.top_praised}
          />

          {/* Warning Message Box for Skipped Rows */}
          {results.skipped > 0 && (
            <div className="border border-accent-amber/40 bg-[rgba(255,212,0,0.08)] p-4 rounded-[4px] font-mono text-[12px] text-accent-amber flex items-center gap-2 select-text">
              <span>⚠</span>
              <span>
                <strong>{results.skipped}</strong> input review record(s) skipped due to formatting anomalies or null content.
              </span>
            </div>
          )}

          {/* Upload Another File Button */}
          <button
            onClick={handleReset}
            className="print:hidden w-full h-12 border border-terminal-border bg-terminal-card hover:bg-terminal-border/20 text-ink font-mono text-[12px] font-bold uppercase tracking-[0.15em] rounded-[4px] mt-4 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            Upload Another File
          </button>
        </div>
      )}
    </div>
  );
}
