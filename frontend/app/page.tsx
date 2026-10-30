import React from "react";
import Link from "next/link";
import { fetchStats } from "../lib/api";

export const metadata = {
  title: "ReviewLens AI - Read every review in seconds",
  description:
    "ReviewLens reads product reviews and tells you if they are positive or negative, which product features people mention, how sure the model is, and whether a review looks fake.",
};

export default async function LandingPage() {
  let statsData = null;
  try {
    statsData = await fetchStats();
  } catch {
    // Backend offline or build time: the page still renders with placeholders.
  }

  const totalReviews = statsData?.total_reviews
    ? statsData.total_reviews.toLocaleString()
    : "—";

  const lrAccuracy = statsData?.models?.lr?.accuracy
    ? `${(statsData.models.lr.accuracy * 100).toFixed(1)}%`
    : "—";

  const avgConfidence = statsData?.avg_confidence
    ? `${Math.round(statsData.avg_confidence * 100)}%`
    : "—";

  const stats = [
    { value: totalReviews, label: "Amazon reviews used to train and test the models" },
    { value: lrAccuracy, label: "Accuracy of the default model on reviews it has never seen" },
    { value: avgConfidence, label: "Average confidence across predictions" },
    { value: "8", label: "Product aspects it can pick out, from battery to delivery" },
  ];

  const steps = [
    {
      n: "01",
      title: "Paste or upload",
      desc: "Type in a single review, or drop a CSV with up to 2,000 of them.",
    },
    {
      n: "02",
      title: "Clean the text",
      desc: "Links and HTML are stripped, words are reduced to their root form, and negations like “not” are kept so meaning isn’t lost.",
    },
    {
      n: "03",
      title: "Score it",
      desc: "A trained model (Logistic Regression, Naive Bayes, or an optional transformer) decides positive or negative and says how sure it is.",
    },
    {
      n: "04",
      title: "Break it down",
      desc: "Each sentence is checked for product features, and the review is scanned for signs it might be spam.",
    },
  ];

  const outputs = [
    {
      tag: "Sentiment",
      title: "Positive or negative?",
      desc: "A clear verdict for every review, with a confidence score so you know how much to trust it.",
      tone: "bg-ink text-sun",
    },
    {
      tag: "Aspects",
      title: "What exactly did they like?",
      desc: "Battery, sound, comfort, build, connectivity, delivery, price and microphone, each marked up or down.",
      tone: "bg-sun text-ink",
    },
    {
      tag: "Reliability",
      title: "Can you trust the call?",
      desc: "Predictions are graded High, Medium or Low. Mixed or borderline reviews get flagged instead of hidden.",
      tone: "bg-paper text-ink",
    },
    {
      tag: "Trust score",
      title: "Is the review even real?",
      desc: "ALL CAPS, repeated words, a pile of exclamation marks or very short text lower the trust score.",
      tone: "bg-alarm text-paper",
    },
  ];

  const pages = [
    {
      href: "/analyzer",
      name: "Analyzer",
      desc: "Check one review and see the full breakdown.",
    },
    {
      href: "/batch",
      name: "Batch",
      desc: "Upload a CSV and get top complaints and praise across all reviews.",
    },
    {
      href: "/dashboard",
      name: "Dashboard",
      desc: "Compare the models and see where they still get it wrong.",
    },
  ];

  const tickerWords = [
    "battery", "sound", "comfort", "build quality", "connectivity",
    "delivery", "price", "microphone",
  ];

  return (
    <div className="w-full font-sans text-ink">
      {/* Hero */}
      <section className="border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 items-center animate-fade-up">
          <div className="flex flex-col gap-6">
            <span className="w-fit bg-ink text-sun font-mono text-[11px] font-bold uppercase tracking-[0.2em] px-2.5 py-1">
              Review intelligence
            </span>
            <h1 className="text-[40px] sm:text-[58px] font-bold leading-[1.02] tracking-tight">
              Stop reading reviews.
              <br />
              Start <span className="marker">understanding</span> them
              <span className="text-alarm">.</span>
            </h1>
            <p className="text-[17px] leading-relaxed text-body-text max-w-xl">
              ReviewLens is a machine-learning tool that reads customer reviews for you. It
              tells you whether each one is positive or negative, which parts of the product
              people are talking about, how confident it is, and whether the review looks fake.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/analyzer"
                className="h-12 px-6 bg-sun text-ink border-2 border-ink shadow-[4px_4px_0_0_#0A0A0A] font-bold text-[14px] flex items-center justify-center transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                Try the analyzer →
              </Link>
              <Link
                href="/batch"
                className="h-12 px-6 bg-paper text-ink border-2 border-ink font-bold text-[14px] flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
              >
                Upload a CSV
              </Link>
            </div>
          </div>

          {/* Sample result card */}
          <div className="relative">
            <div className="absolute -top-3 -left-3 bg-alarm text-paper font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-1 border-2 border-ink z-10">
              Example output
            </div>
            <div className="bg-paper border-2 border-ink shadow-[8px_8px_0_0_#0A0A0A] p-6 flex flex-col gap-5">
              <p className="text-[15px] leading-relaxed italic border-l-4 border-sun pl-4">
                “Great sound for the price but the microphone is terrible and the delivery
                took three weeks.”
              </p>
              <div className="flex items-center justify-between border-y-2 border-ink py-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted-text">
                  Verdict
                </span>
                <span className="text-[22px] font-bold text-alarm">NEGATIVE · 73%</span>
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-[12px]">
                {["sound", "price", "mic", "delivery"].map((a) => (
                  <span key={a} className="px-2.5 py-1 border-2 border-alarm text-alarm">
                    {a} ↓
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="bg-sun-soft border-2 border-ink px-3 py-2">
                  <div className="text-muted-text uppercase tracking-widest text-[9px]">Reliability</div>
                  <div className="font-bold text-[13px]">MEDIUM</div>
                </div>
                <div className="bg-paper border-2 border-ink px-3 py-2">
                  <div className="text-muted-text uppercase tracking-widest text-[9px]">Trust score</div>
                  <div className="font-bold text-[13px]">1.00 / 1.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker of aspects */}
      <div className="bg-sun border-b-2 border-ink overflow-hidden py-2.5" aria-hidden="true">
        <div className="flex w-max animate-marquee font-mono text-[13px] font-bold uppercase tracking-widest">
          {[...tickerWords, ...tickerWords, ...tickerWords, ...tickerWords].map((w, i) => (
            <span key={i} className="px-5 flex items-center gap-5">
              {w}
              <span className="text-alarm">✱</span>
            </span>
          ))}
        </div>
      </div>

      {/* What is it */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-alarm">
          What is ReviewLens?
        </h2>
        <div className="flex flex-col gap-5 text-[17px] leading-relaxed max-w-3xl">
          <p>
            Online stores collect thousands of reviews, and nobody has time to read them all.
            Star ratings alone hide the detail: a 3-star review might love the sound and hate
            the battery.
          </p>
          <p>
            ReviewLens was trained on <strong>a million Amazon product reviews</strong> to
            spot that detail automatically. Unlike a plain sentiment tool, it is upfront about
            its limits. When a review is mixed, sarcastic or too short to judge, it lowers its
            confidence and flags the result instead of guessing.
          </p>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-ink text-paper border-y-2 border-ink">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-paper/20">
          {stats.map((st, i) => (
            <div
              key={i}
              className="bg-ink px-4 sm:px-6 py-8"
            >
              <div className="text-[34px] sm:text-[42px] font-bold text-sun leading-none tracking-tight">
                {st.value}
              </div>
              <div className="text-[13px] text-paper/75 mt-3 leading-snug">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-alarm">
            How it works
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight leading-tight">
            From raw text to a verdict in four steps
          </h2>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-ink border-2 border-ink">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className={`p-6 flex flex-col gap-3 ${i === 0 ? "bg-sun" : "bg-paper"}`}
            >
              <span className="font-mono text-[28px] font-bold leading-none">{s.n}</span>
              <h3 className="text-[18px] font-bold">{s.title}</h3>
              <p className="text-[14px] leading-relaxed text-body-text">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What you get */}
      <section className="border-t-2 border-ink bg-[#F7F7F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-alarm">
              What you get
            </span>
            <h2 className="text-[32px] sm:text-[40px] font-bold tracking-tight leading-tight">
              Four answers for every review
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {outputs.map((o) => (
              <div
                key={o.tag}
                className={`${o.tone} border-2 border-ink shadow-[4px_4px_0_0_#0A0A0A] p-6 flex flex-col gap-3 hover-border-transition`}
              >
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">
                  {o.tag}
                </span>
                <h3 className="text-[22px] font-bold leading-tight">{o.title}</h3>
                <p className="text-[15px] leading-relaxed opacity-90">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where to go next */}
      <section className="border-t-2 border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col gap-8">
          <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight">Pick where to start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pages.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group border-2 border-ink p-6 flex flex-col gap-2 hover:bg-sun transition-colors"
              >
                <span className="text-[22px] font-bold flex items-center justify-between">
                  {p.name}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
                <span className="text-[14px] text-body-text">{p.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-paper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row justify-between gap-2 font-mono text-[11px] uppercase tracking-widest">
          <span>
            ReviewLens<span className="text-alarm">.</span> AI
          </span>
          <span className="text-paper/60">FastAPI · scikit-learn · Next.js</span>
        </div>
      </footer>
    </div>
  );
}
