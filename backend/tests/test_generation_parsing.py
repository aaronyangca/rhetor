r"""Repairing double-escaped prose from the providers.

A model that writes `\\n` instead of `\n` inside the JSON string leaves a
literal backslash-n after decoding, which renders the whole stage document as
one unbroken line.
"""

from app.llm.base import Generation, unescape_literal_escapes


def test_fully_escaped_document_is_repaired():
    # The shape actually observed: one line, every break written as \n.
    raw = (
        "# Stage 1: Argument Ideation\\n\\n## 1. Motion Classification\\n\\n"
        "* Structural Motion Type: THW (Policy Motion)\\n* Topic Domain: Ethics."
    )
    fixed = unescape_literal_escapes(raw)

    assert "\\n" not in fixed
    assert fixed.startswith("# Stage 1: Argument Ideation\n\n")
    assert fixed.count("\n") == 5


def test_correctly_formatted_markdown_is_left_alone():
    good = "# Heading\n\n* one\n* two\n"
    assert unescape_literal_escapes(good) == good


def test_prose_mentioning_a_backslash_n_once_is_not_rewritten():
    """A single literal among real newlines is likelier content than a defect."""
    text = "# Heading\n\nThe separator is \\n in most languages.\n\nDone.\n"
    assert unescape_literal_escapes(text) == text


def test_mostly_escaped_text_is_repaired_even_with_some_real_newlines():
    raw = "# Heading\n" + "\\n".join(f"* point {i}" for i in range(6))
    fixed = unescape_literal_escapes(raw)

    assert "\\n" not in fixed
    assert fixed.count("\n") == 6


def test_empty_and_plain_strings_are_untouched():
    assert unescape_literal_escapes("") == ""
    assert unescape_literal_escapes("no breaks here") == "no breaks here"


def test_tabs_and_quotes_are_repaired_alongside_newlines():
    raw = 'Claim:\\n\\t\\"Zoos fail\\"\\n'
    fixed = unescape_literal_escapes(raw)

    assert fixed == 'Claim:\n\t"Zoos fail"\n'


def test_generation_repairs_both_prose_fields():
    generation = Generation.from_payload(
        {
            "reply": "Done.\\n\\nSee the document.",
            "document": "# Doc\\n\\n* one\\n* two",
            "title": "Ban zoos",
        }
    )

    assert generation.reply == "Done.\n\nSee the document."
    assert generation.document == "# Doc\n\n* one\n* two"
    # Short fields have no line breaks to mangle and are passed through.
    assert generation.title == "Ban zoos"
