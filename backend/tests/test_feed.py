"""Tests for the feed ranking algorithm."""
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock

from backend.services.feed import rank_feed, calculate_recency_score


def _make_profile(**kwargs):
    """Create a mock PersonalityProfile."""
    defaults = {"o_score": 70, "c_score": 50, "e_score": 60, "a_score": 40, "n_score": 30}
    defaults.update(kwargs)
    p = MagicMock()
    for k, v in defaults.items():
        setattr(p, k, v)
    p.to_ocean_dict.return_value = {
        "O": p.o_score, "C": p.c_score, "E": p.e_score,
        "A": p.a_score, "N": p.n_score,
    }
    return p


def _make_post(id="p1", upvotes=5, minutes_ago=30, **kwargs):
    """Create a mock Post."""
    p = MagicMock()
    p.id = id
    p.author_id = kwargs.get("author_id", "u1")
    p.topic_id = kwargs.get("topic_id", None)
    p.title = kwargs.get("title", f"Post {id}")
    p.body = kwargs.get("body", "Body text")
    p.snapshot_archetype = kwargs.get("snapshot_archetype", "Explorer Creator")
    p.snapshot_o = kwargs.get("snapshot_o", 70)
    p.snapshot_c = kwargs.get("snapshot_c", 50)
    p.snapshot_e = kwargs.get("snapshot_e", 60)
    p.snapshot_a = kwargs.get("snapshot_a", 40)
    p.snapshot_n = kwargs.get("snapshot_n", 30)
    p.upvotes = upvotes
    p.created_at = datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)
    return p


def test_rank_feed_returns_limited_results():
    profile = _make_profile()
    posts = [_make_post(id=f"p{i}", upvotes=i) for i in range(10)]
    result = rank_feed(posts, profile, limit=3, offset=0, seed=42)
    assert len(result) == 3


def test_rank_feed_pagination():
    profile = _make_profile()
    posts = [_make_post(id=f"p{i}", upvotes=i) for i in range(10)]
    page1 = rank_feed(posts, profile, limit=5, offset=0, seed=42)
    page2 = rank_feed(posts, profile, limit=5, offset=5, seed=42)
    page1_ids = {item["id"] for item in page1}
    page2_ids = {item["id"] for item in page2}
    assert page1_ids.isdisjoint(page2_ids), "Pages should not overlap"


def test_rank_feed_stable_with_same_seed():
    profile = _make_profile()
    posts = [_make_post(id=f"p{i}", upvotes=i, minutes_ago=i * 10) for i in range(5)]
    r1 = rank_feed(posts, profile, seed=123)
    r2 = rank_feed(posts, profile, seed=123)
    assert [x["id"] for x in r1] == [x["id"] for x in r2]


def test_rank_feed_empty_posts():
    profile = _make_profile()
    result = rank_feed([], profile, limit=20, offset=0)
    assert result == []


def test_similar_mode_boosts_similar_posts():
    profile = _make_profile(o_score=90, c_score=90, e_score=90, a_score=90, n_score=90)
    similar = _make_post(id="similar", snapshot_o=85, snapshot_c=85, snapshot_e=85, snapshot_a=85, snapshot_n=85, upvotes=1)
    different = _make_post(id="different", snapshot_o=10, snapshot_c=10, snapshot_e=10, snapshot_a=10, snapshot_n=10, upvotes=1)
    result = rank_feed([different, similar], profile, mode="similar", seed=42)
    assert result[0]["id"] == "similar"


def test_opposing_mode_boosts_different_posts():
    profile = _make_profile(o_score=90, c_score=90, e_score=90, a_score=90, n_score=90)
    similar = _make_post(id="similar", snapshot_o=85, snapshot_c=85, snapshot_e=85, snapshot_a=85, snapshot_n=85, upvotes=1)
    different = _make_post(id="different", snapshot_o=10, snapshot_c=10, snapshot_e=10, snapshot_a=10, snapshot_n=10, upvotes=1)
    result = rank_feed([similar, different], profile, mode="opposing", seed=42)
    assert result[0]["id"] == "different"


def test_recency_score_decays():
    recent = datetime.now(timezone.utc) - timedelta(hours=1)
    old = datetime.now(timezone.utc) - timedelta(hours=48)
    assert calculate_recency_score(recent) > calculate_recency_score(old)
