import React from 'react';

interface ExampleChipsProps {
  onChipClick: (example: string) => void;
}

// Each example shows off a different part of the analysis.
const EXAMPLES = [
  {
    label: "Happy traveller",
    hint: "positive + battery",
    text: "Wore these on a 12-hour flight and forgot they were on. Super comfortable, and the battery still had 40% left when we landed.",
  },
  {
    label: "Mixed feelings",
    hint: "one aspect up, one down",
    text: "The sound is crisp and full of bass. Sadly the microphone is awful and people cannot hear me on calls.",
  },
  {
    label: "Angry buyer",
    hint: "strong negative",
    text: "The left earbud stopped charging after one week and the battery is completely dead. Support keeps sending the same reply. Avoid.",
  },
  {
    label: "Sarcasm test",
    hint: "can the model be fooled?",
    text: "Oh great, another charger that broke after exactly two days. Really impressive engineering.",
  },
  {
    label: "Spam check",
    hint: "watch the trust score",
    text: "BEST BEST BEST PRODUCT EVER!!!!! BUY NOW!!!!!",
  },
];

export default function ExampleChips({ onChipClick }: ExampleChipsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
      {EXAMPLES.map((example) => (
        <button
          key={example.label}
          type="button"
          onClick={() => onChipClick(example.text)}
          title={example.text}
          className="text-left border-2 border-ink bg-paper px-3 py-2 hover:bg-sun transition-colors duration-150 select-none cursor-pointer"
        >
          <span className="block font-sans text-[13px] font-bold text-ink leading-tight">
            {example.label}
          </span>
          <span className="block font-mono text-[10px] text-muted-text mt-0.5 leading-snug">
            {example.hint}
          </span>
        </button>
      ))}
    </div>
  );
}
