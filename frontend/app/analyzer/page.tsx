"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { analyzeReview, fetchModels, FALLBACK_MODELS } from '../../lib/api';
import type { ModelId, ModelInfo, PredictResponse } from '../../lib/types';

import SentimentBadge from '../../components/SentimentBadge';
import ConfidenceBar from '../../components/ConfidenceBar';
import ReliabilityTag from '../../components/ReliabilityTag';
import AspectChips from '../../components/AspectChips';
import FlagsList from '../../components/FlagsList';
import TrustScoreCircle from '../../components/TrustScoreCircle';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ExampleChips from '../../components/ExampleChips';
import WordHighlights from '../../components/WordHighlights';
import ModelComparison from '../../components/ModelComparison';

export default function AnalyzerPage() {
  const [review, setReview] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>("lr");
  const [models, setModels] = useState<ModelInfo[]>(FALLBACK_MODELS);
  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [comparison, setComparison] = useState<Partial<Record<ModelId, PredictResponse>>>({});
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);

  // Ask the backend which models it offers (the transformer is optional).
  useEffect(() => {
    let active = true;
    fetchModels().then((available) => {
      if (active) setModels(available);
    });
    return () => {
      active = false;
    };
  }, []);

  // Pipeline steps shown while loading; they describe what the selected model really does.
  const steps = selectedModel === "transformer"
    ? [
        { label: "READ", desc: "Raw Text, No Cleaning" },
        { label: "TOKEN", desc: "Subword Tokenization" },
        { label: "ENCODE", desc: "Transformer Encoder" },
        { label: "INFERENCE", desc: "Temperature-Calibrated Estimate" }
      ]
    : [
        { label: "CLEAN", desc: "HTML & URL Scrubbing" },
        { label: "TOKEN", desc: "Lemmatization & Negations" },
        { label: "VECTOR", desc: "TF-IDF Matrix Mapping" },
        { label: "INFERENCE", desc: "Probability Estimate" }
      ];

  // Animate steps during loading
  useEffect(() => {
    if (isLoading) {
      setActiveStep(0);
      const timers = [
        setTimeout(() => setActiveStep(1), 500),
        setTimeout(() => setActiveStep(2), 1000),
        setTimeout(() => setActiveStep(3), 1500),
      ];
      return () => timers.forEach(clearTimeout);
    } else {
      setActiveStep(-1);
    }
  }, [isLoading]);

  const handleAnalyze = useCallback(async () => {
    const trimmed = review.trim();
    if (trimmed.length < 10) return;

    setIsLoading(true);
    setError(null);
    setPrediction(null);
    setComparison({});
    setShowResults(false);

    // The other models run alongside for the comparison panel; a failure there
    // only hides that row, it never blocks the main result.
    const otherModels = models.filter((m) => m.id !== selectedModel);
    const otherResults = Promise.all(
      otherModels.map((m) =>
        analyzeReview(trimmed, m.id).then(
          (r) => [m.id, r] as const,
          () => null
        )
      )
    );

    try {
      const result = await analyzeReview(trimmed, selectedModel);
      const others = await otherResults;
      const byModel: Partial<Record<ModelId, PredictResponse>> = { [selectedModel]: result };
      for (const entry of others) {
        if (entry) byModel[entry[0]] = entry[1];
      }
      setPrediction(result);
      setComparison(byModel);
    } catch (err: any) {
      setError(err.message || "Failed to analyze review");
    } finally {
      setIsLoading(false);
    }
  }, [review, selectedModel, models]);

  const handleExampleClick = useCallback((example: string) => {
    setReview(example);
    setError(null);
  }, []);

  useEffect(() => {
    if (prediction && !isLoading) {
      const timer = setTimeout(() => setShowResults(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [prediction, isLoading]);

  return (
    <div className="w-full min-h-[calc(100vh-56px)] flex items-center justify-center p-6 select-none animate-fade-up">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* Left 45%: Input Panel */}
        <div className="w-full md:w-[45%] flex flex-col justify-between bg-terminal-card border-2 border-ink shadow-[4px_4px_0_0_#0A0A0A] p-6 rounded-[3px] relative hover-border-transition transition-all duration-300">
          <div className="flex flex-col gap-6">
            {/* Wordmark */}
            <div className="font-sans text-[22px] font-bold tracking-tight text-ink">
              Analyze a review<span className="text-alarm">.</span>
            </div>

            {/* Model Selector Pills */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">Select Model</span>
              <div className="flex gap-2 w-full">
                {models.map(({ id: m, name }) => (
                  <button
                    key={m}
                    type="button"
                    title={name}
                    onClick={() => setSelectedModel(m)}
                    disabled={isLoading}
                    className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase tracking-wider border-2 transition-all duration-200 cursor-pointer ${
                      selectedModel === m
                        ? "border-ink text-ink bg-sun"
                        : "border-ink bg-paper text-ink hover:bg-sun-soft"
                    }`}
                  >
                    {m === "lr" ? "LR" : m === "nb" ? "NB" : "Transformer"}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">Your review</span>
              <textarea
                value={review}
                onChange={(e) => {
                  setReview(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                placeholder="Paste a product review here, or pick an example below..."
                className="w-full min-h-[160px] bg-[#F7F7F5] border-2 border-ink p-4 font-sans text-[15px] text-body-text placeholder-muted-text focus:outline-none focus:bg-sun-soft/40 disabled:opacity-50 resize-none"
              />
            </div>

            {/* Example Chips */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">Try an example</span>
              <ExampleChips onChipClick={handleExampleClick} />
            </div>

            {/* AI Neural Pipeline Map */}
            <div className="border border-terminal-border/40 bg-[#F7F7F5] p-4 rounded-[3px] flex flex-col gap-3 font-mono">
              <span className="text-[9px] text-muted-text uppercase tracking-widest">What happens when you click analyze</span>
              <div className="grid grid-cols-4 gap-1 relative">
                {steps.map((st, i) => {
                  const isActive = activeStep >= i;
                  const isCurrent = activeStep === i;
                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col items-center text-center p-1.5 border rounded-[3px] transition-all duration-300 ${
                        isCurrent 
                          ? "border-ink bg-sun text-ink" 
                          : isActive 
                            ? "border-ink bg-ink text-sun" 
                            : "border-ink/20 text-muted-text"
                      }`}
                    >
                      <span className="text-[10px] font-bold tracking-tight">{st.label}</span>
                      <span className="text-[8px] opacity-80 hidden sm:block mt-0.5">{st.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAnalyze}
            disabled={review.trim().length < 10 || isLoading}
            className="w-full h-12 bg-ink text-sun border-2 border-ink font-sans text-[15px] font-bold tracking-wide mt-6 transition-colors hover:bg-alarm hover:text-paper disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? "Analyzing…" : "Analyze review →"}
          </button>
        </div>

        {/* Right 55%: Results Panel */}
        <div className="w-full md:w-[55%] flex flex-col justify-center bg-terminal-card border-2 border-ink shadow-[4px_4px_0_0_#0A0A0A] p-6 rounded-[3px] min-h-[420px] relative hover-border-transition transition-all duration-300">
          
          {isLoading && (
            <div className="absolute inset-0 p-6 bg-terminal-card z-10">
              <LoadingSkeleton />
            </div>
          )}

          {error && (
            <div className="w-full border-2 border-alarm bg-alarm-soft p-4 font-mono text-[12px] text-accent-coral flex items-start gap-2 select-text">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {!prediction && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <div className="font-mono text-[12px] text-muted-text uppercase tracking-widest">
                Results will appear here
              </div>
              <div className="font-mono text-[11px] text-muted-text/60 mt-2">
                Paste a review or pick an example, then press Analyze.
              </div>
            </div>
          )}

          {prediction && !isLoading && !error && (
            <div className={`flex flex-col gap-6 transition-all duration-500 transform ${
              showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-terminal-border pb-4">
                <SentimentBadge sentiment={prediction.sentiment} />
                <ReliabilityTag reliability={prediction.reliability} />
              </div>

              {/* Confidence Meter */}
              <ConfidenceBar confidence={prediction.confidence} sentiment={prediction.sentiment} />

              {/* Aspects and Trust Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start mt-2">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">EXTRACTED ASPECTS</span>
                    <AspectChips aspects={prediction.aspects} />
                  </div>
                </div>

                <div className="flex justify-start sm:justify-center">
                  <TrustScoreCircle score={prediction.trust_score} />
                </div>
              </div>

              {/* Flags Section */}
              <div className="flex flex-col gap-2 border-t border-terminal-border/40 pt-4 mt-2">
                <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">RELIABILITY FLAGS</span>
                <FlagsList flags={prediction.flags} />
              </div>

              {/* Why this verdict */}
              <div className="flex flex-col gap-2 border-t border-terminal-border/40 pt-4">
                <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">WHY THIS VERDICT</span>
                <WordHighlights explanation={prediction.explanation} />
              </div>

              {/* Model comparison */}
              {Object.keys(comparison).length > 1 && (
                <div className="flex flex-col gap-2 border-t border-terminal-border/40 pt-4">
                  <span className="font-mono text-[10px] text-muted-text uppercase tracking-widest">SAME REVIEW, EVERY MODEL</span>
                  <ModelComparison models={models} results={comparison} selectedModel={selectedModel} />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
