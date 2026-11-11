# TrueTone: PPT Script

**Title:** TrueTone: Trust-Aware Review Insight Engine
**One-liner:** TrueTone reads product reviews and tells you how customers feel, which features they love or hate, and how much each review can be trusted.

Target length: about 12 minutes, 13 slides.

---

## Slide 1: Title
**On slide:** TrueTone, Trust-Aware Review Insight Engine. Your name, date.
**Say:** "Hi everyone. I'm presenting TrueTone, a system that turns raw product reviews into reliable, feature-level insight. The word to remember is *trust*: it tells you what customers feel and how far to believe each prediction."

## Slide 2: The Problem
**On slide:**
- Thousands of reviews per product, and nobody reads them all
- Star ratings hide detail: "great sound, terrible battery" becomes 3 stars
- Fake or low-effort reviews distort the picture
- Most sentiment tools give a label with no sign of how sure they are
**Say:** "A seller or buyer faces review overload. Averages hide which feature is the problem, spam pollutes the data, and a model that says 'positive' never admits when it is guessing."

## Slide 3: Our Solution
**On slide:** Four outputs for every review: Sentiment, Aspects, Trust score, Reliability tier.
**Say:** "TrueTone answers four questions. What is the sentiment? Which features are mentioned and how does each one fare? Does this review look genuine? And how confident is the model in its own answer?"

## Slide 4: Key Features
**On slide:**
- Multi-model sentiment: Naive Bayes, Logistic Regression, optional SVM and fine-tuned DistilRoBERTa
- Uncertainty flagging: High / Medium / Low reliability
- Aspect extraction: battery, sound, comfort, build quality, connectivity, delivery, price, microphone
- Trust analysis: penalties for caps shouting, repetition, excess "!!!", very short text
- Single-review analyzer, batch CSV upload, dashboard with top compliments and complaints
**Say:** Walk through each bullet in one sentence. Stress that low-confidence predictions are flagged, not hidden.

## Slide 5: System Architecture
**On slide:** Diagram: User → Next.js frontend → FastAPI backend → ML pipeline → JSON → Dashboard.
**Say:** "The Next.js 16 frontend calls a FastAPI backend. The backend holds the preprocessing, the models, the aspect extractor and the trust analyzer. Everything returns as JSON and the frontend renders it with Recharts."

## Slide 6: The ML Pipeline
**On slide:** Raw text → strip HTML/URLs → expand contractions → tokenize and lemmatize → remove stopwords (keep negations) → TF-IDF → classifier.
**Say:** "One detail matters here: we keep negations like 'not' and 'never'. Remove them and 'not good' becomes 'good'. After cleaning, TF-IDF turns text into numbers for the classifier."

## Slide 7: Models and Accuracy
**On slide:** Table comparing Naive Bayes, Logistic Regression and the DistilRoBERTa transformer. The README reports the transformer beating the TF-IDF models by 3.6 accuracy points on a 200k-review Amazon sample.
**Say:** "We start with fast, interpretable baselines. The fine-tuned transformer is optional and gains 3.6 points, with calibration so its confidence means something. Users can compare models side by side in the app."

## Slide 8: Uncertainty and Reliability
**On slide:** Confidence score → High / Medium / Low tier; low tier flagged for human review.
**Say:** "Accuracy alone is not enough. If the model is 52% sure, the user should know. We map confidence to three tiers and flag the weak ones, so people know when to read a review themselves."

## Slide 9: Aspect-Based Insight
**On slide:** Example: "The battery is great but the mic is bad!" → battery: positive, microphone: negative.
**Say:** "We split a review into sentences, find aspect mentions, and score each aspect separately. That is how a mixed review becomes two clear findings instead of a vague 3 stars."

## Slide 10: Trust Analysis
**On slide:** Heuristic score with penalties: ALL CAPS, repeated words, excessive "!!!", too short.
**Say:** "Spam often looks a certain way. We apply transparent rule-based penalties and produce a trust score. Because the rules are heuristics and not a black box, every penalty can be explained to the user."

## Slide 11: Live Demo
**On slide:** Screenshots: Analyzer, Batch upload, Dashboard.
**Say / do:**
1. Paste a mixed review in the Analyzer and show sentiment, aspects, trust and reliability.
2. Upload a CSV from `test_csvs/` in Batch.
3. Open the Dashboard: charts, top compliments, top complaints, CSV export.

## Slide 12: Deployment and Engineering
**On slide:** Docker (backend and frontend), docker-compose, Vercel, Railway, Google Cloud Run. FastAPI `/health` endpoint, CORS via `ALLOW_ORIGINS`, CI on GitHub Actions with pytest, lint and build.
**Say:** "It is deploy-ready. One `docker compose up` runs the whole stack locally. The backend honours the host's PORT, exposes a health check, and has tests running in CI."

## Slide 13: Impact, Limits, Next Steps
**On slide:**
- Impact: faster product feedback, feature-level priorities, safer decisions
- Limits: English only, Amazon-style data, heuristic trust rules, fixed aspect list
- Next: learned spam detection, automatic aspect discovery, multilingual support, live review feeds
**Say:** "TrueTone does not just classify. It tells you what, which feature, and how much to trust it. Thank you, I'm happy to take questions."

---

## Likely Q&A
- **Why TF-IDF models when a transformer is better?** They are fast, cheap and explainable. The transformer is an optional upgrade.
- **How is trust computed?** Rule-based penalties, not a trained model, so each reason is visible.
- **How do you handle sarcasm?** A known failure mode. Low-confidence flagging is the safety net.
- **Can it scale?** The API is stateless, so scale it by adding workers or instances.
