import type { BatchRowResult } from "./types";

const COLUMNS = ["row", "review", "sentiment", "confidence", "reliability", "trust_score", "flags"] as const;

/** Quote a CSV cell when it contains a comma, quote or line break. */
function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function batchResultsToCsv(rows: BatchRowResult[]): string {
  const lines = [COLUMNS.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.row,
        r.review,
        r.sentiment === 1 ? "positive" : "negative",
        r.confidence,
        r.reliability,
        r.trust_score,
        r.flags.join("; "),
      ]
        .map(csvCell)
        .join(",")
    );
  }
  // Byte-order mark so Excel opens the file as UTF-8.
  return "﻿" + lines.join("\r\n");
}

/** Name for the exported file, based on the uploaded file's name. */
export function exportFileName(uploadedName: string | null): string {
  const base = (uploadedName ?? "reviews").replace(/\.csv$/i, "");
  return `${base}-reviewlens.csv`;
}

export function downloadTextFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
