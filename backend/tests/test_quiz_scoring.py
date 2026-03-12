"""Tests for _score_answers — core psychometric scoring pipeline."""
import os

os.environ.setdefault("ENV", "test")
os.environ.setdefault("SECRET_KEY", "test-key-that-is-at-least-32-chars-long")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_quiz_scoring.db")

import pytest

from backend.routes import quiz as quiz_mod


@pytest.fixture(autouse=True, scope="module")
def _load():
    quiz_mod.load_question_bank()


def test_all_neutral_produces_50s():
    version = "ipip-15-v1"
    answers = {str(q["id"]): 3 for q in quiz_mod._QUESTION_BANK[version]["questions"]}
    scores = quiz_mod._score_answers(answers, version)
    assert all(s == 50 for s in scores.values())


def test_all_fives_produces_valid_range():
    version = "ipip-15-v1"
    answers = {str(q["id"]): 5 for q in quiz_mod._QUESTION_BANK[version]["questions"]}
    scores = quiz_mod._score_answers(answers, version)
    for dim in ["O", "C", "E", "A", "N"]:
        assert 0 <= scores[dim] <= 100


def test_unknown_version_raises():
    with pytest.raises(ValueError, match="Unknown quiz version"):
        quiz_mod._score_answers({"1": 3}, "nonexistent-v9")
