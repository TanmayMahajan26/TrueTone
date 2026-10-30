import React from 'react';

interface ReliabilityTagProps {
  reliability: "HIGH" | "MEDIUM" | "LOW";
}

export default function ReliabilityTag({ reliability }: ReliabilityTagProps) {
  const styles = {
    HIGH: "bg-[rgba(10,10,10,0.15)] text-accent-green border border-[rgba(10,10,10,0.3)]",
    MEDIUM: "bg-[rgba(255,212,0,0.15)] text-accent-amber border border-[rgba(255,212,0,0.3)]",
    LOW: "bg-[rgba(225,6,0,0.15)] text-accent-coral border border-[rgba(225,6,0,0.3)]",
  };

  return (
    <div className={`rounded-full py-1 px-3.5 font-mono text-[10px] font-bold uppercase tracking-wider select-none w-fit ${styles[reliability]}`}>
      {reliability} RELIABILITY
    </div>
  );
}
