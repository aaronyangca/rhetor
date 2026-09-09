from app.pdf import render_pdf

# A document that exercises the things fpdf2's HTML renderer is fussy about:
# a GFM table with bold text inside a cell, em dashes, and curly quotes.
TRICKY_MARKDOWN = """\
# 1. Abolition relocates selection from the fee to the postcode

Provisionally your first argument — not yet scored; the evidence stage is the
weakest part.

- **Claim.** Abolishing private schools does not remove selective education.
- **Mechanism.** Families look for the nearest available market — housing.

| # | Argument | Result |
| --- | --- | --- |
| 2 | Primary risk falls on the self | Confirmed — states the disputed conclusion |
| 4 | Visible, not new | **Rewritten** — see above |

The client said “it marked my second argument down for relevance and it was
right.”
"""


def test_render_pdf_returns_pdf_bytes():
    out = render_pdf(
        title="This House Would abolish private schools",
        position="OO",
        stage=2,
        markdown_text=TRICKY_MARKDOWN,
    )
    assert isinstance(out, bytes)
    assert out.startswith(b"%PDF-")
    assert out.rstrip().endswith(b"%%EOF")
    assert len(out) > 1000


def test_render_pdf_tolerates_missing_position_and_odd_title():
    out = render_pdf(
        title="New motion",
        position=None,
        stage=1,
        markdown_text="# Seeds\n\n1. One idea\n2. Another idea\n",
    )
    assert out.startswith(b"%PDF-")
