import math
import random
from typing import List, Optional
from .. import models


def euclidean_distance(p1, p2):
    return math.sqrt(
        (p1.o_score - p2.snapshot_o)**2 +
        (p1.c_score - p2.snapshot_c)**2 +
        (p1.e_score - p2.snapshot_e)**2 +
        (p1.a_score - p2.snapshot_a)**2 +
        (p1.n_score - p2.snapshot_n)**2
    )


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

    for post in posts:
        # TopicScore — upvote count (decay logic can be inserted here later)
        topic_score = post.upvotes

        # Similarity: inverse of normalised euclidean distance
        dist = euclidean_distance(user_profile, post)
        similarity = 1.0 / (1.0 + (dist / 100.0))

        # Serendipity term (deterministic when seed is set)
        serendipity = random.random()

        rank_score = (alpha * topic_score) + \
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
