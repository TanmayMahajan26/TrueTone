"""Word-level explanations for the TF-IDF models.

Both TF-IDF models are linear in the TF-IDF features, so a feature's contribution to the
decision is exact: tfidf_value * weight. The weight is the Logistic Regression coefficient, or
for Naive Bayes the log-probability difference between the positive and negative class.
Positive contributions push toward "positive", negative ones toward "negative".

Contributions are computed on the cleaned text the model saw, then mapped back onto the words
of the original review so the frontend can highlight them in place. A bigram's contribution is
split evenly between its two words.
"""

import re
from collections import defaultdict
from typing import Any, Dict, List, Optional

import numpy as np
from nltk.stem import WordNetLemmatizer

from .preprocessing import clean_review_text

_TOKEN_RE = re.compile(r"[A-Za-z0-9']+|[^A-Za-z0-9']+")
_NEGATION_RE = re.compile(r"n't$|^cannot$|^cant$|^wont$|^dont$|^isnt$|^wasnt$|^doesnt$|^didnt$")
_LEMMATIZER = WordNetLemmatizer()


def _feature_weights(loader, model_name: str) -> Optional[np.ndarray]:
    model = loader.models.get(model_name)
    if model is None:
        return None
    if hasattr(model, "coef_"):
        return np.asarray(model.coef_[0]).ravel()
    if hasattr(model, "feature_log_prob_"):
        log_prob = np.asarray(model.feature_log_prob_)
        return log_prob[1] - log_prob[0]
    return None


def _word_form(token: str) -> str:
    """The cleaned form a raw word becomes, matching clean_review_text's output."""
    lower = token.lower()
    if _NEGATION_RE.search(lower):
        return "not"
    return _LEMMATIZER.lemmatize(lower.strip("'"))


def explain_review(raw_text: str, loader, model_name: str = "lr") -> Optional[Dict[str, Any]]:
    """Return per-word contributions for a TF-IDF model, or None if it can't be explained.

    Result: {"segments": [{"text", "weight"}], "top_positive": [...], "top_negative": [...]}
    ``weight`` on segments is scaled to [-1, 1] by the largest absolute contribution.
    """
    weights = _feature_weights(loader, model_name)
    vectorizer = getattr(loader, "vectorizer", None)
    if weights is None or vectorizer is None:
        return None

    cleaned = clean_review_text(raw_text)
    if not cleaned:
        return None

    row = vectorizer.transform([cleaned]).tocoo()
    feature_names = vectorizer.get_feature_names_out()

    by_form: Dict[str, float] = defaultdict(float)
    for index, value in zip(row.col, row.data):
        contribution = float(value * weights[index])
        words = feature_names[index].split(" ")
        for word in words:
            by_form[word] += contribution / len(words)

    segments: List[Dict[str, Any]] = []
    for match in _TOKEN_RE.finditer(raw_text):
        text = match.group(0)
        weight = 0.0
        if text[0].isalnum() or text[0] == "'":
            weight = by_form.get(_word_form(text), 0.0)
        segments.append({"text": text, "weight": weight})

    largest = max((abs(s["weight"]) for s in segments), default=0.0)
    if largest > 0:
        for segment in segments:
            segment["weight"] = round(segment["weight"] / largest, 3)

    ranked = sorted(by_form.items(), key=lambda item: item[1])
    top_negative = [{"term": t, "weight": round(w, 4)} for t, w in ranked if w < 0][:5]
    top_positive = [{"term": t, "weight": round(w, 4)} for t, w in reversed(ranked) if w > 0][:5]

    return {"segments": segments, "top_positive": top_positive, "top_negative": top_negative}
