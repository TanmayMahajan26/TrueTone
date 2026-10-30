import React from "react";
import type { Explanation } from "../lib/types";

interface WordHighlightsProps {
  explanation?: Explanation | null;
}

// Words with less influence than this stay unhighlighted, so the text isn't a wall of color.
const MIN_VISIBLE_WEIGHT = 0.08;

function highlightStyle(weight: number): React.CSSProperties | undefined {
  const strength = Math.abs(weight);
  if (strength < MIN_VISIBLE_WEIGHT) return undefined;
  const alpha = 0.2 + strength * 0.8;
  return weight > 0
    ? { background: `rgba(255, 212, 0, ${alpha})`, color: "#0A0A0A" }
    : { background: `rgba(225, 6, 0, ${alpha})`, color: strength > 0.45 ? "#FFFFFF" : "#0A0A0A" };
}

export default function WordHighlights({ explanation }: WordHighlightsProps) {
  if (!explanation) {
    return (
      <div className="font-mono text-[11px] text-muted-text">
        Word-level explanations are available for the LR and NB models.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-sans text-[15px] leading-[1.9] text-ink bg-[#F7F7F5] border-2 border-ink p-4 select-text">
        {explanation.segments.map((segment, index) => {
          const style = highlightStyle(segment.weight);
          if (!style) return <React.Fragment key={index}>{segment.text}</React.Fragment>;
          const direction = segment.weight > 0 ? "positive" : "negative";
          return (
            <mark
              key={index}
              style={style}
              className="px-0.5 font-medium"
              title={`Pushes toward ${direction} (${Math.round(Math.abs(segment.weight) * 100)}% of the strongest word)`}
            >
              {segment.text}
            </mark>
          );
        })}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-muted-text">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-sun border border-ink" /> pushes positive
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-alarm border border-ink" /> pushes negative
        </span>
        <span>Darker = stronger influence</span>
      </div>
    </div>
  );
}
