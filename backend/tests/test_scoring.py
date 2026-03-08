import pytest
from backend.services.scoring import determine_archetype, get_z_scores

def test_balanced_breaker():
    # Z-scores near zero (variance < 0.25)
    z_scores = {"O": 0.1, "C": 0.1, "E": 0.1, "A": 0.1, "N": 0.1}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Balanced Breaker"

def test_explorer_creator():
    # High O (t1), High E (t2)
    z_scores = {"O": 2.0, "C": 0.0, "E": 1.5, "A": 0.0, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Explorer Creator"
    assert secondary == "Adventurous Doer"

def test_adventurous_doer():
    # High E (t1), High O (t2)
    z_scores = {"O": 1.5, "C": 0.0, "E": 2.0, "A": 0.0, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Adventurous Doer"
    assert secondary == "Explorer Creator"

def test_speculative_researcher():
    # High O, High C
    z_scores = {"O": 2.0, "C": 1.8, "E": 0.0, "A": 0.0, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Speculative Researcher"

def test_sensitive_empath():
    # High A, High N
    z_scores = {"O": 0.0, "C": 0.0, "E": 0.0, "A": 2.0, "N": 1.8}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Sensitive Empath"

def test_blunt_challenger():
    # High E, Low A
    z_scores = {"O": 0.0, "C": 0.0, "E": 2.0, "A": -1.8, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Blunt Challenger"

def test_romantic_idealist():
    # High O, Low C
    z_scores = {"O": 2.0, "C": -1.8, "E": 0.0, "A": 0.0, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Romantic Idealist"

def test_disciplined_achiever():
    # High C, High E
    z_scores = {"O": 0.0, "C": 2.0, "E": 1.8, "A": 0.0, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Disciplined Achiever"

def test_steady_executor():
    # High C, Low E
    z_scores = {"O": 0.0, "C": 2.0, "E": -1.8, "A": 0.0, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Steady Executor"

def test_gentle_coordinator():
    # High A, Low N
    z_scores = {"O": 0.0, "C": 0.0, "E": 0.0, "A": 2.0, "N": -1.8}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Gentle Coordinator"

def test_independent_observer():
    # High O, Low E
    z_scores = {"O": 2.0, "C": 0.0, "E": -1.8, "A": 0.0, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Independent Observer"

def test_stable_guardian():
    # High C, High A
    z_scores = {"O": 0.0, "C": 2.0, "E": 0.0, "A": 1.8, "N": 0.0}
    primary, secondary = determine_archetype(z_scores)
    assert primary == "Stable Guardian"
