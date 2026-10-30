import numpy as np
import pytest

from backend.ml.explain import _feature_weights, explain_review
from backend.ml.preprocessing import clean_review_text

REVIEW = "The sound is crisp and full of bass. Sadly the microphone is awful and I don't recommend it."


@pytest.mark.parametrize("model_name", ["lr", "nb"])
def test_segments_rebuild_the_original_text(loaded_loader, model_name):
    result = explain_review(REVIEW, loaded_loader, model_name)

    assert "".join(segment["text"] for segment in result["segments"]) == REVIEW
    assert max(abs(segment["weight"]) for segment in result["segments"]) == pytest.approx(1.0)


def test_word_directions_match_their_meaning(loaded_loader):
    weights = {s["text"]: s["weight"] for s in explain_review(REVIEW, loaded_loader, "lr")["segments"]}

    assert weights["crisp"] > 0
    assert weights["awful"] < 0
    assert weights["don't"] < 0  # mapped to the kept negation "not"


def test_contributions_sum_to_the_lr_decision_score(loaded_loader):
    model = loaded_loader.models["lr"]
    features = loaded_loader.vectorizer.transform([clean_review_text(REVIEW)])
    contributions = features.toarray()[0] * _feature_weights(loaded_loader, "lr")

    assert contributions.sum() + model.intercept_[0] == pytest.approx(
        model.decision_function(features)[0]
    )


def test_unknown_model_and_empty_text_return_none(loaded_loader):
    assert explain_review(REVIEW, loaded_loader, "transformer") is None
    assert explain_review("!!!", loaded_loader, "lr") is None
