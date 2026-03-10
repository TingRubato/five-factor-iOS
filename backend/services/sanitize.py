import re


def sanitize_text(text: str, max_length: int = 5000) -> str:
    """Strip control characters and excessive whitespace from user input."""
    # Remove control characters (except newline and tab)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    # Collapse excessive whitespace (more than 3 consecutive newlines)
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    return text[:max_length].strip()
