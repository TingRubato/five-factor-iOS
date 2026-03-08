import math
from typing import Dict, Any

def euclidean_distance_profiles(p1_scores: Dict[str, float], p2_scores: Dict[str, float]) -> float:
    """
    Calculate Euclidean distance between two personality score sets.
    Expected keys: O, C, E, A, N. Values 0-100.
    """
    return math.sqrt(
        (p1_scores.get("O", 50) - p2_scores.get("O", 50))**2 +
        (p1_scores.get("C", 50) - p2_scores.get("C", 50))**2 +
        (p1_scores.get("E", 50) - p2_scores.get("E", 50))**2 +
        (p1_scores.get("A", 50) - p2_scores.get("A", 50))**2 +
        (p1_scores.get("N", 50) - p2_scores.get("N", 50))**2
    )

def calculate_compatibility_score(p1_scores: Dict[str, float], p2_scores: Dict[str, float]) -> int:
    """
    Returns a compatibility percentage (0-100).
    Max distance for 5 dims (0-100) is sqrt(5 * 100^2) ≈ 223.6.
    """
    dist = euclidean_distance_profiles(p1_scores, p2_scores)
    # 223.6 is the theoretical maximum distance
    score = max(0, round(100 * (1 - dist / 223.6)))
    return score
