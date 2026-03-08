from datetime import datetime, timezone
import math
import random
from typing import List, Optional
from .. import models


from .psychometrics import euclidean_distance_profiles


def calculate_recency_score(created_at: datetime) -> float:
    """Calculate a decay multiplier based on post age."""
    # Ensure created_at has timezone info for comparison
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    
    now = datetime.now(timezone.utc)
    delta = now - created_at
    hours = delta.total_seconds() / 3600
    
    # Gravity factor: how fast things decay. 
    # 1.8 is common for Hacker News style decay.
    # Higher = faster decay.
    gravity = 1.2
    return 1.0 / ((hours + 2) ** gravity)


def rank_feed(
    posts: List[models.Post],
    user_profile: models.PersonalityProfile,
    mode: str = "default",
    limit: int = 20,
    offset: int = 0,
    seed: Optional[int] = None,
) -> List[dict]:
    """
    Rank posts for a user and return a paginated slice.

    Mode names (aligned with mobile client):
      - "default"   — quality + personality blend (alpha=0.6, beta=0.2, gamma=0.2)
      - "similar"   — high personality match / My Tribe (alpha=0.5, beta=0.5, gamma=0.0)
      - "opposing"  — opposite thinkers / Other Side (alpha=0.6, beta=-0.4, gamma=0.0)

    Serendipity values are deterministic when `seed` is provided, which keeps
    the order stable across paginated requests for the same viewer+page.

    Returns dicts whose keys match FeedItemResponse (id, author_id, title, …,
    rank_score).
    """
    if mode == "default":
        alpha, beta, gamma = 0.6, 0.2, 0.2
    elif mode == "similar":
        alpha, beta, gamma = 0.5, 0.5, 0.0
    elif mode == "opposing":
        alpha, beta, gamma = 0.6, -0.4, 0.0
    else:
        alpha, beta, gamma = 0.6, 0.2, 0.2  # fallback to default

    if seed is not None:
        random.seed(seed)

    ranked = []

    # Prepare user score dict once
    user_scores = {
        "O": user_profile.o_score,
        "C": user_profile.c_score,
        "E": user_profile.e_score,
        "A": user_profile.a_score,
        "N": user_profile.n_score,
    }

    for post in posts:
        # Base quality score from upvotes
        quality_score = math.log1p(max(0, post.upvotes)) + 1.0

        # Recency decay
        recency_multiplier = calculate_recency_score(post.created_at)
        
        # Topic Affinity (Bonus if topic is assigned, for now)
        # In future, this would check user's preferred topics.
        topic_bonus = 1.2 if post.topic_id else 1.0

        # Quality + Recency + Topic
        base_relevance = quality_score * recency_multiplier * topic_bonus

        # Personality Similarity: inverse of normalised euclidean distance
        post_scores = {
            "O": post.snapshot_o or 50,
            "C": post.snapshot_c or 50,
            "E": post.snapshot_e or 50,
            "A": post.snapshot_a or 50,
            "N": post.snapshot_n or 50,
        }
        dist = euclidean_distance_profiles(user_scores, post_scores)
        similarity = 1.0 / (1.0 + (dist / 100.0))

        # Serendipity term (deterministic when seed is set)
        serendipity = random.random()

        rank_score = (alpha * base_relevance) + \
            (beta * similarity) + (gamma * serendipity)

        ranked.append({
            # Keys match FeedItemResponse schema
            "id": post.id,
            "author_id": post.author_id,
            "topic_id": post.topic_id,
            "title": post.title,
            "body": post.body,
            "snapshot_archetype": post.snapshot_archetype,
            "snapshot_o": post.snapshot_o,
            "snapshot_c": post.snapshot_c,
            "snapshot_e": post.snapshot_e,
            "snapshot_a": post.snapshot_a,
            "snapshot_n": post.snapshot_n,
            "upvotes": post.upvotes,
            "created_at": post.created_at,
            "rank_score": rank_score,
        })

    # Sort descending by rank score
    ranked.sort(key=lambda x: x["rank_score"], reverse=True)

    # Apply pagination on the sorted result
    return ranked[offset: offset + limit]
