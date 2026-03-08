import math

# These are approximated means and standard deviations from population norms.
# In a real-world scenario, these would continually adjust based on rolling population statistics.
POPULATION_NORMS = {
    "O": {"mean": 50, "std": 15},
    "C": {"mean": 50, "std": 15},
    "E": {"mean": 50, "std": 15},
    "A": {"mean": 50, "std": 15},
    "N": {"mean": 50, "std": 15},
}


def calculate_z_score(score, mean, std):
    if std == 0:
        return 0.0
    return (score - mean) / std


def get_z_scores(ocean_scores):
    z_scores = {}
    for trait, score in ocean_scores.items():
        mean = POPULATION_NORMS[trait]["mean"]
        std = POPULATION_NORMS[trait]["std"]
        z_scores[trait] = calculate_z_score(score, mean, std)
    return z_scores


def determine_archetype(z_scores):
    # Sort absolute Z-scores to find the Top 2 defining characteristics
    sorted_traits = sorted(
        z_scores.items(), key=lambda item: abs(item[1]), reverse=True)

    top1 = sorted_traits[0]
    top2 = sorted_traits[1]

    # Variance check for the "Balanced" archetype
    variance = sum((z**2 for t, z in z_scores.items())) / len(z_scores)
    if variance < 0.25:  # Arbitrary threshold for "balanced" without extreme polarities
        return "Balanced Breaker", "Speculative Researcher"

    t1_trait, t1_val = top1[0], top1[1]
    t2_trait, t2_val = top2[0], top2[1]

    t1_high = t1_val > 0
    t2_high = t2_val > 0

    # 1. Explorer Creator — O is the HIGHEST trait (t1), E is second (t2)
    if t1_trait == "O" and t1_high and t2_trait == "E" and t2_high:
        return "Explorer Creator", "Adventurous Doer"
    # 9. Adventurous Doer — E is the HIGHEST trait (t1), O is second (t2)
    elif t1_trait == "E" and t1_high and t2_trait == "O" and t2_high:
        return "Adventurous Doer", "Explorer Creator"
    # 2. Speculative Researcher (High O, High C)
    elif (t1_trait == "O" and t1_high and t2_trait == "C" and t2_high) or (t1_trait == "C" and t1_high and t2_trait == "O" and t2_high):
        return "Speculative Researcher", "Explorer Creator"
    # 3. Sensitive Empath (High A, High N)
    elif (t1_trait == "A" and t1_high and t2_trait == "N" and t2_high) or (t1_trait == "N" and t1_high and t2_trait == "A" and t2_high):
        return "Sensitive Empath", "Gentle Coordinator"
    # 4. Blunt Challenger (High E, Low A)
    elif (t1_trait == "E" and t1_high and t2_trait == "A" and not t2_high) or (t1_trait == "A" and not t1_high and t2_trait == "E" and t2_high):
        return "Blunt Challenger", "Adventurous Doer"
    # 5. Romantic Idealist (High O, Low C)
    elif (t1_trait == "O" and t1_high and t2_trait == "C" and not t2_high) or (t1_trait == "C" and not t1_high and t2_trait == "O" and t2_high):
        return "Romantic Idealist", "Explorer Creator"
    # 6. Disciplined Achiever (High C, High E)
    elif (t1_trait == "C" and t1_high and t2_trait == "E" and t2_high) or (t1_trait == "E" and t1_high and t2_trait == "C" and t2_high):
        return "Disciplined Achiever", "Steady Executor"
    # 7. Steady Executor (High C, Low E)
    elif (t1_trait == "C" and t1_high and t2_trait == "E" and not t2_high) or (t1_trait == "E" and not t1_high and t2_trait == "C" and t2_high):
        return "Steady Executor", "Disciplined Achiever"
    # 8. Gentle Coordinator (High A, Low N)
    elif (t1_trait == "A" and t1_high and t2_trait == "N" and not t2_high) or (t1_trait == "N" and not t1_high and t2_trait == "A" and t2_high):
        return "Gentle Coordinator", "Sensitive Empath"
    # 10. Independent Observer (High O, Low E or Low A)
    elif (t1_trait == "O" and t1_high and t2_trait == "E" and not t2_high) or (t1_trait == "O" and t1_high and t2_trait == "A" and not t2_high):
        return "Independent Observer", "Romantic Idealist"
    # 11. Stable Guardian (High C, High A or Low O)
    elif (t1_trait == "C" and t1_high and t2_trait == "A" and t2_high) or (t1_trait == "C" and t1_high and t2_trait == "O" and not t2_high):
        return "Stable Guardian", "Disciplined Achiever"
    else:
        # Fallback for other combinations based on primary trait
        return f"{t1_trait} Dominant", "Balanced Breaker"


def calculate_archetype(ocean_scores):
    z_scores = get_z_scores(ocean_scores)
    primary, secondary = determine_archetype(z_scores)
    return z_scores, primary, secondary
