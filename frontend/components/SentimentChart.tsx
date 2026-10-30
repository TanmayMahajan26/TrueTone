"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface SentimentChartProps {
  positive: number;
  negative: number;
}

export default function SentimentChart({ positive, negative }: SentimentChartProps) {
  const total = positive + negative;
  const data = [
    { name: "POSITIVE", value: positive },
    { name: "NEGATIVE", value: negative },
  ];

  const COLORS = ["#0A0A0A", "#E10600"];

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center font-mono">
      {/* Absolute wrapper gives the chart a real size; as a flex child it measured ~0 wide. */}
      <div className="absolute inset-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            stroke="#FFFFFF"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index]} 
                style={{ filter: `drop-shadow(0 0 3px ${COLORS[index]}33)` }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      </div>

      {/* Center label: total count in mono */}
      <div className="absolute flex flex-col items-center justify-center select-none pointer-events-none">
        <span className="text-[28px] font-bold text-ink tracking-tighter leading-none">
          {total}
        </span>
        <span className="text-[9px] text-muted-text uppercase tracking-widest mt-1">TOTAL</span>
      </div>

      {/* Custom Legend (No legend icons — use colored mono text labels only) */}
      <div className="absolute bottom-1 flex justify-center gap-6 text-[10px] font-bold tracking-wider select-none">
        <div className="text-accent-green">
          POSITIVE: {positive}
        </div>
        <div className="text-accent-coral">
          NEGATIVE: {negative}
        </div>
      </div>
    </div>
  );
}
