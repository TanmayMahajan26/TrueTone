import React from "react";
import type { ModelId, ModelInfo, PredictResponse } from "../lib/types";

interface ModelComparisonProps {
  models: ModelInfo[];
  results: Partial<Record<ModelId, PredictResponse>>;
  selectedModel: ModelId;
}

function shortName(id: ModelId): string {
  if (id === "lr") return "Logistic Regression";
  if (id === "nb") return "Naive Bayes";
  return "Transformer";
}

export default function ModelComparison({ models, results, selectedModel }: ModelComparisonProps) {
  const answered = models.filter((m) => results[m.id]);
  if (answered.length < 2) return null;

  const verdicts = new Set(answered.map((m) => results[m.id]!.sentiment));
  const allAgree = verdicts.size === 1;

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`border-2 border-ink px-3 py-2 font-sans text-[13px] font-bold ${
          allAgree ? "bg-sun text-ink" : "bg-alarm text-paper"
        }`}
      >
        {allAgree
          ? `All ${answered.length} models agree.`
          : "The models disagree. Treat this verdict with care; the review is probably mixed or tricky."}
      </div>

      <div className="border-2 border-ink divide-y-2 divide-ink">
        {answered.map((model) => {
          const result = results[model.id]!;
          const isPositive = result.sentiment === 1;
          const percent = Math.round(result.confidence * 100);
          const isSelected = model.id === selectedModel;
          return (
            <div
              key={model.id}
              className={`grid grid-cols-[1fr_auto] sm:grid-cols-[150px_1fr_auto] items-center gap-x-4 gap-y-1 px-3 py-2.5 ${
                isSelected ? "bg-sun-soft" : "bg-paper"
              }`}
            >
              <span className="font-sans text-[13px] font-bold text-ink">
                {shortName(model.id)}
                {isSelected && <span className="font-mono text-[9px] text-muted-text ml-1.5">SHOWN</span>}
              </span>
              <div className="hidden sm:block h-[8px] bg-[#EDEDED] border border-ink">
                <div
                  className={`h-full ${isPositive ? "bg-ink" : "bg-alarm"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span
                className={`font-mono text-[12px] font-bold text-right ${
                  isPositive ? "text-ink" : "text-alarm"
                }`}
              >
                {isPositive ? "POSITIVE" : "NEGATIVE"} · {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
