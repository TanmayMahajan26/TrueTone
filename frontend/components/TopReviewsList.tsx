import React from "react";
import { BatchReviewItem } from "../lib/types";

interface TopReviewsListProps {
  topComplaints: BatchReviewItem[];
  topPraised: BatchReviewItem[];
}

export default function TopReviewsList({
  topComplaints,
  topPraised,
}: TopReviewsListProps) {

  // Helper to extract aspects dynamically from the actual reviews list
  const extractAspects = (items: BatchReviewItem[]) => {
    const keywordMap: Record<string, string[]> = {
      battery: ["battery", "charge", "power", "hours", "charging", "dies"],
      sound: ["sound", "audio", "volume", "quiet", "muffled", "bass", "loud", "hear"],
      comfort: ["comfortable", "fit", "ears", "size", "feel", "wear", "hurt"],
      price: ["price", "cost", "money", "cheap", "expensive", "value"],
      delivery: ["delivery", "arrived", "shipping", "shipped", "package", "box"],
      mic: ["microphone", "mic", "voice", "call", "calls"],
      quality: ["quality", "build", "material", "materials", "fragile", "broke", "broken"],
      connection: ["connection", "bluetooth", "connect", "connectivity", "pairing", "pair", "cuts"]
    };

    const detected: Record<string, number> = {};
    items.forEach((item) => {
      const text = item.review.toLowerCase();
      Object.entries(keywordMap).forEach(([aspect, keywords]) => {
        if (keywords.some((kw) => text.includes(kw))) {
          detected[aspect] = (detected[aspect] || 0) + 1;
        }
      });
    });

    return Object.entries(detected)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const complaintsAspects = extractAspects(topComplaints);
  const praisedAspects = extractAspects(topPraised);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none font-mono text-[12px] mt-2">
      {/* Top Complaints */}
      <div className="bg-terminal-card border-2 border-ink shadow-[4px_4px_0_0_#0A0A0A] p-6 rounded-[4px] glow-border-hover transition-all duration-300 flex flex-col gap-4">
        <div>
          <span className="text-[11px] text-accent-coral font-bold tracking-widest border-b border-terminal-border/40 pb-2 mb-2 block">
            TOP COMPLAINTS // ANOMALIES
          </span>
          <div className="flex flex-wrap gap-2 mt-3">
            {complaintsAspects.length === 0 ? (
              <span className="text-muted-text text-[11px] uppercase">No specific aspect patterns matched</span>
            ) : (
              complaintsAspects.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 bg-[rgba(225,6,0,0.08)] border border-[rgba(225,6,0,0.2)] text-accent-coral px-2.5 py-1 rounded-[3px]"
                >
                  <span className="font-bold lowercase">{item.name}</span>
                  <span className="bg-[rgba(225,6,0,0.2)] text-ink px-1 py-0.5 rounded-[2px] text-[9px] font-bold">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real review quotes */}
        <div className="flex flex-col gap-2.5 mt-2 border-t border-terminal-border/20 pt-4">
          <span className="text-[9px] text-muted-text uppercase tracking-widest">REPRESENTATIVE ANOMALY EXAMPLES</span>
          <div className="flex flex-col gap-2">
            {topComplaints.map((item, idx) => (
              <div key={idx} className="bg-[#F7F7F5] p-3 rounded-[3px] border border-terminal-border/40 text-body-text italic">
                "{item.review}"
                <div className="text-[9px] text-accent-coral mt-1.5 font-mono uppercase tracking-wider text-right">
                  CONFIDENCE: {(item.confidence * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Praised */}
      <div className="bg-terminal-card border-2 border-ink shadow-[4px_4px_0_0_#0A0A0A] p-6 rounded-[4px] glow-border-hover transition-all duration-300 flex flex-col gap-4">
        <div>
          <span className="text-[11px] text-accent-green font-bold tracking-widest border-b border-terminal-border/40 pb-2 mb-2 block">
            TOP PRAISED // CORE VALUED
          </span>
          <div className="flex flex-wrap gap-2 mt-3">
            {praisedAspects.length === 0 ? (
              <span className="text-muted-text text-[11px] uppercase">No specific aspect patterns matched</span>
            ) : (
              praisedAspects.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 bg-[rgba(10,10,10,0.08)] border border-[rgba(10,10,10,0.2)] text-accent-green px-2.5 py-1 rounded-[3px]"
                >
                  <span className="font-bold lowercase">{item.name}</span>
                  <span className="bg-[rgba(10,10,10,0.2)] text-ink px-1 py-0.5 rounded-[2px] text-[9px] font-bold">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real review quotes */}
        <div className="flex flex-col gap-2.5 mt-2 border-t border-terminal-border/20 pt-4">
          <span className="text-[9px] text-muted-text uppercase tracking-widest">REPRESENTATIVE PRAISED EXAMPLES</span>
          <div className="flex flex-col gap-2">
            {topPraised.map((item, idx) => (
              <div key={idx} className="bg-[#F7F7F5] p-3 rounded-[3px] border border-terminal-border/40 text-body-text italic">
                "{item.review}"
                <div className="text-[9px] text-accent-green mt-1.5 font-mono uppercase tracking-wider text-right">
                  CONFIDENCE: {(item.confidence * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
