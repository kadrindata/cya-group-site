#!/usr/bin/env python3
"""
Add the "not official materials / do not distribute" notice to the top of
every page of the group's PDFs.

    python3 tools/stamp_notice.py materials/session-2/*.pdf

Safe to run more than once: a PDF that already has the notice is skipped.
Needs: pip install pypdf reportlab
"""
import io
import sys

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import Color
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

NOTICE = ("These are not official materials from How (Not) to Read the Bible. "
          "They were developed solely for use by our group's members. Please do not distribute.")
MARKER = "/CYANotice"  # stored in the PDF metadata so we never stamp twice


def overlay(width, height):
    """One transparent page carrying the notice, sized to match the target page."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(width, height))
    wide = width > height  # slides are landscape

    size = 13 if wide else 7
    font = "Helvetica-Oblique"
    text_w = stringWidth(NOTICE, font, size)
    # Shrink to fit if a page is unusually narrow
    max_w = width * (0.9 if wide else 0.84)
    if text_w > max_w:
        size = size * max_w / text_w
        text_w = stringWidth(NOTICE, font, size)

    x = (width - text_w) / 2
    y = height - (34 if wide else 40)  # sits in the empty top band, above the content

    # Light pill behind the text so it reads on dark and light slide backgrounds
    pad_x, pad_y = (14, 7) if wide else (6, 3)
    c.setFillColor(Color(1, 1, 1, alpha=0.88))
    c.setStrokeColor(Color(0.55, 0.6, 0.65, alpha=0.6))
    c.setLineWidth(0.6)
    c.roundRect(x - pad_x, y - pad_y, text_w + 2 * pad_x, size + 2 * pad_y - size * 0.25,
                radius=(size + 2 * pad_y) / 2, stroke=1, fill=1)

    c.setFillColor(Color(0.29, 0.33, 0.39))
    c.setFont(font, size)
    c.drawString(x, y + size * 0.05, NOTICE)
    c.save()
    buf.seek(0)
    return PdfReader(buf).pages[0]


def stamp(path):
    reader = PdfReader(path)
    meta = dict(reader.metadata or {})
    if meta.get(MARKER) == "yes":
        print(f"skip (already has notice): {path}")
        return
    writer = PdfWriter()
    for page in reader.pages:
        w, h = float(page.mediabox.width), float(page.mediabox.height)
        page.merge_page(overlay(w, h))
        writer.add_page(page)
    meta[MARKER] = "yes"
    writer.add_metadata(meta)
    with open(path, "wb") as f:
        writer.write(f)
    print(f"stamped {len(reader.pages)} pages: {path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for p in sys.argv[1:]:
        stamp(p)
