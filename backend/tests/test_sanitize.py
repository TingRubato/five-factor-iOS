"""Tests for sanitize_text — security-critical input sanitization."""
from backend.services.sanitize import sanitize_text


def test_strips_null_bytes():
    assert sanitize_text("hello\x00world") == "helloworld"


def test_strips_control_chars():
    assert sanitize_text("a\x01b\x7fc") == "abc"


def test_preserves_newlines_and_tabs():
    result = sanitize_text("line1\nline2\ttab")
    assert result == "line1\nline2\ttab"


def test_collapses_excessive_newlines():
    assert sanitize_text("a\n\n\n\n\nb") == "a\n\n\nb"


def test_enforces_max_length():
    assert len(sanitize_text("x" * 10000, max_length=5000)) == 5000


def test_strips_whitespace():
    assert sanitize_text("  hello  ") == "hello"


def test_empty_string():
    assert sanitize_text("") == ""
