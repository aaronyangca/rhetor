"""Render a stage document (Markdown) to PDF, server-side.

The goal is a plain document that looks like it was typed into Google Docs with
default settings and exported — nothing fancier:

* US Letter, 1-inch margins.
* Arial 11pt, black. The real Arial is used when the OS provides it (it ships on
  macOS and Windows); otherwise the bundled Arimo face is used — it is
  metrically and visually identical to Arial (the same stand-in Google's tooling
  uses), and Microsoft's Arial.ttf is not redistributable.
* 1.15 line spacing, uniform — no extra space between paragraphs, list items, or
  before headings.
* Bold for field labels / emphasis.
* Numbered lists and bullet lists ("jot notes") with a standard hanging indent.

The document is laid out by hand rather than through an HTML renderer so the
spacing, indents and page geometry match Google Docs exactly. Everything the
Markdown might carry beyond the above — headings, inline code spans, italics,
links, block quotes, horizontal rules — is folded down to a plain paragraph,
bold, or a list item.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path

import markdown as _md
from fpdf import FPDF, FontFace

_FONT_DIR = Path(__file__).parent / "fonts"
_FAMILY = "Arial"  # internal fpdf2 family name

# Where to find a real Arial, by OS. Each entry maps style -> filename within a
# directory; the first directory that has all four styles wins. Falls back to
# the bundled Arimo (Arial-metric clone) if none are present.
_ARIAL_SOURCES = [
    # macOS
    (
        "/System/Library/Fonts/Supplemental",
        {"": "Arial.ttf", "B": "Arial Bold.ttf", "I": "Arial Italic.ttf", "BI": "Arial Bold Italic.ttf"},
    ),
    ("/Library/Fonts", {"": "Arial.ttf", "B": "Arial Bold.ttf", "I": "Arial Italic.ttf", "BI": "Arial Bold Italic.ttf"}),
    # Windows
    ("C:/Windows/Fonts", {"": "arial.ttf", "B": "arialbd.ttf", "I": "ariali.ttf", "BI": "arialbi.ttf"}),
    # Linux with msttcorefonts installed
    (
        "/usr/share/fonts/truetype/msttcorefonts",
        {"": "Arial.ttf", "B": "Arial_Bold.ttf", "I": "Arial_Italic.ttf", "BI": "Arial_Bold_Italic.ttf"},
    ),
]
_ARIMO = {"": "Arimo-Regular.ttf", "B": "Arimo-Bold.ttf", "I": "Arimo-Italic.ttf", "BI": "Arimo-BoldItalic.ttf"}


def _font_files() -> dict[str, str]:
    """Resolve the four Arial styles to concrete file paths."""
    for directory, names in _ARIAL_SOURCES:
        paths = {style: Path(directory) / fname for style, fname in names.items()}
        if all(p.is_file() for p in paths.values()):
            return {style: str(p) for style, p in paths.items()}
    return {style: str(_FONT_DIR / fname) for style, fname in _ARIMO.items()}


# --- Google Docs "Normal text" geometry, in points -------------------------
_PAGE = "Letter"
_MARGIN = 72.0            # 1 inch
_FONT_SIZE = 11.0
_LINE_HEIGHT = _FONT_SIZE * 1.15   # Google Docs default 1.15 line spacing
_LIST_INDENT = 36.0      # text indent per nesting level (0.5")
_MARKER_OFFSET = 18.0    # marker sits this far left of its item's text (0.25")
_BULLETS = ["●", "○", "▪"]  # Google Docs level glyphs


# --- parse Markdown -> a flat list of blocks ------------------------------

Run = tuple[str, bool]  # (text, bold)


@dataclass
class Block:
    kind: str                       # "para" | "heading" | "li" | "table"
    runs: list[Run] = field(default_factory=list)
    level: int = 0                  # list nesting, 0-based
    ordered: bool = False
    index: int = 0                  # 1-based position in its list
    rows: list[list[str]] = field(default_factory=list)  # table only


class _Parser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[Block] = []
        self._runs: list[Run] = []
        self._kind: str | None = None
        self._bold = 0
        self._lists: list[list] = []      # stack of [ordered: bool, counter: int]
        self._table: list[list[str]] | None = None
        self._row: list[str] | None = None
        self._cell: list[Run] | None = None
        self._hlevel = 0

    # -- helpers --
    def _flush(self) -> None:
        text_runs = [r for r in self._runs if r[0]]
        if self._kind and text_runs:
            b = Block(kind=self._kind, runs=_merge(text_runs))
            if self._kind == "li" and self._lists:
                b.level = len(self._lists) - 1
                b.ordered = self._lists[-1][0]
                b.index = self._lists[-1][1]
            elif self._kind == "heading":
                b.level = self._hlevel
            self.blocks.append(b)
        self._runs = []
        self._kind = None

    # -- tag handlers --
    def handle_starttag(self, tag: str, attrs) -> None:
        if tag in ("strong", "b"):
            self._bold += 1
        elif tag in ("ul", "ol"):
            self._flush()
            self._lists.append([tag == "ol", 0])
        elif tag == "li":
            self._flush()
            if self._lists:
                self._lists[-1][1] += 1
            self._kind = "li"
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._flush()
            self._kind = "heading"
            self._hlevel = int(tag[1])
        elif tag == "p":
            if self._kind != "li":       # a <p> inside <li> is just continuation
                self._flush()
                self._kind = "para"
        elif tag == "br":
            self._runs.append((" ", self._bold > 0))
        elif tag == "table":
            self._flush()
            self._table = []
        elif tag == "tr":
            self._row = []
        elif tag in ("td", "th"):
            self._cell = []

    def handle_endtag(self, tag: str) -> None:
        if tag in ("strong", "b"):
            self._bold = max(0, self._bold - 1)
        elif tag in ("ul", "ol"):
            self._flush()
            if self._lists:
                self._lists.pop()
        elif tag == "li":
            self._flush()
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self._flush()
        elif tag == "p":
            if self._kind == "para":
                self._flush()
        elif tag in ("td", "th"):
            if self._row is not None and self._cell is not None:
                self._row.append(" ".join("".join(t for t, _ in self._cell).split()))
            self._cell = None
        elif tag == "tr":
            if self._table is not None and self._row:
                self._table.append(self._row)
            self._row = None
        elif tag == "table":
            if self._table:
                self.blocks.append(Block(kind="table", rows=self._table))
            self._table = None

    def handle_data(self, data: str) -> None:
        if self._cell is not None:
            self._cell.append((data, self._bold > 0))
        elif self._kind:
            self._runs.append((data, self._bold > 0))


def _merge(runs: list[Run]) -> list[Run]:
    """Join adjacent runs of the same weight; collapse internal whitespace."""
    out: list[Run] = []
    for text, bold in runs:
        text = " ".join(text.split("\n"))
        while "  " in text:
            text = text.replace("  ", " ")
        if out and out[-1][1] == bold:
            out[-1] = (out[-1][0] + text, bold)
        else:
            out.append((text, bold))
    if out:
        out[0] = (out[0][0].lstrip(), out[0][1])
        out[-1] = (out[-1][0].rstrip(), out[-1][1])
    return [r for r in out if r[0]]


def _parse(markdown_text: str) -> list[Block]:
    html = _md.markdown(markdown_text, extensions=["tables", "fenced_code", "sane_lists"])
    p = _Parser()
    p.feed(html)
    p._flush()
    return p.blocks


# --- render blocks -> PDF -------------------------------------------------

class _Doc(FPDF):
    def __init__(self) -> None:
        super().__init__(format=_PAGE, unit="pt")
        for style, path in _font_files().items():
            self.add_font(_FAMILY, style=style, fname=path)
        self.set_margins(_MARGIN, _MARGIN, _MARGIN)
        self.set_auto_page_break(auto=True, margin=_MARGIN)
        self.add_page()
        self.set_text_color(0, 0, 0)
        self.set_font(_FAMILY, size=_FONT_SIZE)

    def _write_runs(self, runs: list[Run]) -> None:
        for text, bold in runs:
            self.set_font(_FAMILY, "B" if bold else "", _FONT_SIZE)
            self.write(_LINE_HEIGHT, text)
        self.set_font(_FAMILY, "", _FONT_SIZE)
        self.ln(_LINE_HEIGHT)

    def paragraph(self, runs: list[Run]) -> None:
        self.set_x(_MARGIN)
        self.set_left_margin(_MARGIN)
        self._write_runs(runs)

    def heading(self, runs: list[Run], level: int = 1) -> None:
        # Visually just a bold line at the normal pitch; also registers a PDF
        # outline entry so readers get a navigable sidebar (no visible TOC page).
        name = " ".join("".join(t for t, _ in runs).split())
        if name:
            self.start_section(name, level=max(0, min(level - 1, 3)), strict=False)
        self.paragraph([(text, True) for text, _ in runs])

    def list_item(self, block: Block) -> None:
        text_x = _MARGIN + _LIST_INDENT * (block.level + 1)
        marker_x = text_x - _MARKER_OFFSET
        if block.ordered:
            marker = f"{block.index}."
        else:
            marker = _BULLETS[min(block.level, len(_BULLETS) - 1)]
        y = self.get_y()
        self.set_xy(marker_x, y)
        self.cell(_MARKER_OFFSET, _LINE_HEIGHT, marker)
        self.set_left_margin(text_x)
        self.set_xy(text_x, y)
        self._write_runs(block.runs)
        self.set_left_margin(_MARGIN)

    def render_table(self, rows: list[list[str]]) -> None:
        self.set_x(_MARGIN)
        self.set_left_margin(_MARGIN)
        self.set_font(_FAMILY, "", 10)
        self.set_draw_color(180, 180, 180)
        with self.table(
            borders_layout="ALL",
            line_height=10 * 1.15,
            first_row_as_headings=True,
            headings_style=FontFace(emphasis="BOLD", fill_color=(255, 255, 255)),
        ) as table:
            for r in rows:
                row = table.row()
                for cell in r:
                    row.cell(cell)
        self.set_font(_FAMILY, "", _FONT_SIZE)
        self.ln(_LINE_HEIGHT)


def render_pdf(*, title: str, position: str | None, stage: int, markdown_text: str) -> bytes:
    """Return a plain Arial PDF of one stage document as bytes.

    `position` and `stage` are accepted for a stable call signature but not
    rendered — the export is just the document.
    """
    blocks = _parse(markdown_text)
    doc = _Doc()
    doc.set_title(title)

    for b in blocks:
        if b.kind == "heading":
            doc.heading(b.runs, b.level)
        elif b.kind == "li":
            doc.list_item(b)
        elif b.kind == "table":
            doc.render_table(b.rows)
        else:
            doc.paragraph(b.runs)

    return bytes(doc.output())
