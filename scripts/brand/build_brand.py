"""
Ilelah Technologies brand asset generator.

Generates the logo mark, wordmark lockups, favicons, app icons and the
default social sharing image from code, so every asset stays consistent
with the website design tokens.

Text in the logo is converted to vector outlines (paths), so the SVGs do
not depend on any font being installed where they are opened.

Usage (from the project root):
    python3 scripts/brand/build_brand.py

Requires: fonttools, brotli, uharfbuzz (pip) and Playwright's Chromium for
PNG export (python package `playwright`). See docs/BRAND_GUIDE.md.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
FONT = ROOT / "node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2"
OUT = ROOT / "public/brand"
PUBLIC = ROOT / "public"

# Brand colours (keep in sync with src/styles/tokens.css)
NAVY = "#0F2A4A"
NAVY_DEEP = "#0A1D35"
GOLD = "#C8A24A"
INK = "#12161C"
WHITE = "#FFFFFF"

_font = TTFont(str(FONT))
_upem = _font["head"].unitsPerEm
# HarfBuzz cannot read compressed WOFF2, so shape from an uncompressed copy.
import io as _io
_ttf = _io.BytesIO()
_font.flavor = None
_font.save(_ttf)
_font = TTFont(_io.BytesIO(_ttf.getvalue()))
_blob = hb.Blob(_ttf.getvalue())
_face = hb.Face(_blob)


def text_path(text: str, weight: float, size: float, x: float, baseline: float, tracking: float = 0.0) -> tuple[str, float]:
    """Return (svg path data, advance width) for text shaped at a given weight."""
    hbfont = hb.Font(_face)
    hbfont.set_variations({"wght": weight})
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    glyphset = _font.getGlyphSet(location={"wght": weight})
    order = _font.getGlyphOrder()
    scale = size / _upem
    pen = SVGPathPen(glyphset)
    cursor = 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        tx = x + (cursor + pos.x_offset) * scale
        ty = baseline - pos.y_offset * scale
        tpen = TransformPen(pen, (scale, 0, 0, -scale, tx, ty))
        glyphset[name].draw(tpen)
        cursor += pos.x_advance + tracking * _upem
    width = cursor * scale - tracking * size
    import re
    d = re.sub(r"-?\d+\.\d+", lambda m: f"{float(m.group()):.1f}".rstrip("0").rstrip("."), pen.getCommands())
    return d, width


def mark(x: float, y: float, s: float, tile: str, stem: str, node: str) -> str:
    """The Ilelah mark: a tile holding a lowercase i whose dot is a diamond node.
    Drawn on a 64-unit grid and scaled to size s."""
    k = s / 64
    def p(v: float) -> str:
        return f"{v * k:.2f}"
    # diamond: side 9 rotated 45deg, centred at (32, 17.5); half-diagonal = 6.364
    cx, cy, h = 32, 17.5, 6.364
    diamond = f"M{p(cx)} {p(cy - h)}L{p(cx + h)} {p(cy)}L{p(cx)} {p(cy + h)}L{p(cx - h)} {p(cy)}Z"
    parts = [f'<g transform="translate({x:.2f} {y:.2f})">']
    if tile != "none":
        parts.append(f'<rect width="{p(64)}" height="{p(64)}" rx="{p(13)}" fill="{tile}"/>')
    parts.append(f'<rect x="{p(26)}" y="{p(27)}" width="{p(12)}" height="{p(25)}" rx="{p(1.5)}" fill="{stem}"/>')
    parts.append(f'<path d="{diamond}" fill="{node}"/>')
    parts.append("</g>")
    return "".join(parts)


def svg(w: float, h: float, body: str, title: str, bg: str | None = None) -> str:
    bgrect = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">'
        f"<title>{title}</title>{bgrect}{body}</svg>\n"
    )


def horizontal(word: str, sub: str, tile: str, stem: str, node: str, sub_fill: str) -> str:
    """Mark + 'Ilelah' + 'Technologies' on one line."""
    m = 64
    gap = 18
    d1, w1 = text_path("Ilelah", 760, 40, m + gap, 46)
    d2, w2 = text_path("Technologies", 480, 40, m + gap + w1 + 11, 46)
    total = m + gap + w1 + 11 + w2
    body = mark(0, 0, m, tile, stem, node) + f'<path d="{d1}" fill="{word}"/><path d="{d2}" fill="{sub_fill}"/>'
    return svg(total + 2, 64, body, "Ilelah Technologies")


def stacked(word: str, tile: str, stem: str, node: str, sub_fill: str) -> str:
    """Mark above a two-line wordmark, centred. For square formats."""
    d1, w1 = text_path("Ilelah", 760, 56, 0, 0)
    d2, w2 = text_path("Technologies", 480, 26, 0, 0, tracking=0.02)
    W = max(w1, w2) + 8
    m = 96
    body = mark((W - m) / 2, 0, m, tile, stem, node)
    d1, _ = text_path("Ilelah", 760, 56, (W - w1) / 2, m + 64)
    d2, _ = text_path("Technologies", 480, 26, (W - w2) / 2, m + 100, tracking=0.02)
    body += f'<path d="{d1}" fill="{word}"/><path d="{d2}" fill="{sub_fill}"/>'
    return svg(W, m + 110, body, "Ilelah Technologies")


def og_image() -> str:
    """1200x630 default social sharing image."""
    W, H = 1200, 630
    body = f'<rect width="{W}" height="{H}" fill="{NAVY_DEEP}"/>'
    # schematic: hub node with signal lines to six division nodes (echoes the hero)
    hubx, huby = 930, 315
    nodes = [(1100, 150), (1130, 315), (1100, 480), (790, 120), (760, 315), (790, 510)]
    for nx, ny in nodes:
        body += f'<path d="M{hubx} {huby}L{nx} {ny}" stroke="#2B4A72" stroke-width="2"/>'
    for nx, ny in nodes:
        body += f'<rect x="{nx-7}" y="{ny-7}" width="14" height="14" transform="rotate(45 {nx} {ny})" fill="{GOLD}"/>'
    body += mark(hubx - 48, huby - 48, 96, WHITE, NAVY, GOLD)
    d1, w1 = text_path("Ilelah Technologies", 760, 64, 80, 250)
    d2, _ = text_path("Software, school systems, ICT support,", 430, 34, 80, 330)
    d3, _ = text_path("design and digital skills training.", 430, 34, 80, 376)
    d4, _ = text_path("Based in Bauchi, Nigeria", 480, 26, 80, 520)
    body += f'<path d="{d1}" fill="{WHITE}"/><path d="{d2}" fill="#C9D3E1"/><path d="{d3}" fill="#C9D3E1"/>'
    body += f'<rect x="80" y="478" width="40" height="4" fill="{GOLD}"/><path d="{d4}" fill="{WHITE}"/>'
    return svg(W, H, body, "Ilelah Technologies")


def write(name: str, content: str) -> Path:
    path = OUT / name
    path.write_text(content, encoding="utf-8")
    return path


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files = {
        # primary mark
        "ilelah-mark.svg": svg(64, 64, mark(0, 0, 64, NAVY, WHITE, GOLD), "Ilelah Technologies"),
        # for navy/dark backgrounds
        "ilelah-mark-reverse.svg": svg(64, 64, mark(0, 0, 64, WHITE, NAVY, GOLD), "Ilelah Technologies"),
        # single-colour versions for embroidery, stamps, engraving
        "ilelah-mark-mono-navy.svg": svg(64, 64, mark(0, 0, 64, NAVY, WHITE, WHITE), "Ilelah Technologies"),
        "ilelah-mark-mono-black.svg": svg(64, 64, mark(0, 0, 64, "#000000", WHITE, WHITE), "Ilelah Technologies"),
        "ilelah-mark-mono-white.svg": svg(64, 64, mark(0, 0, 64, "none", WHITE, WHITE), "Ilelah Technologies"),
        # lockups
        "ilelah-logo-horizontal.svg": horizontal(NAVY, "Technologies", NAVY, WHITE, GOLD, INK),
        "ilelah-logo-horizontal-reverse.svg": horizontal(WHITE, "Technologies", WHITE, NAVY, GOLD, "#C9D3E1"),
        "ilelah-logo-horizontal-mono-black.svg": horizontal("#000000", "Technologies", "#000000", WHITE, WHITE, "#000000"),
        "ilelah-logo-stacked.svg": stacked(NAVY, NAVY, WHITE, GOLD, INK),
        "ilelah-logo-stacked-reverse.svg": stacked(WHITE, WHITE, NAVY, GOLD, "#C9D3E1"),
        "og-default.svg": og_image(),
    }
    for name, content in files.items():
        write(name, content)
    # favicon at site root
    (PUBLIC / "favicon.svg").write_text(files["ilelah-mark.svg"], encoding="utf-8")
    print(f"Wrote {len(files)} SVGs to {OUT.relative_to(ROOT)}")
    export_pngs()


def export_pngs() -> None:
    """Rasterise SVGs to PNG with headless Chromium."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright (python) not installed - skipping PNG export", file=sys.stderr)
        return
    jobs = [
        ("ilelah-mark.svg", PUBLIC / "apple-touch-icon.png", 180, None),
        ("ilelah-mark.svg", PUBLIC / "icon-192.png", 192, None),
        ("ilelah-mark.svg", PUBLIC / "icon-512.png", 512, None),
        ("ilelah-mark.svg", OUT / "ilelah-mark-1024.png", 1024, None),
        ("ilelah-mark-reverse.svg", OUT / "ilelah-mark-reverse-1024.png", 1024, None),
        ("ilelah-logo-horizontal.svg", OUT / "ilelah-logo-horizontal-2000.png", 2000, None),
        ("ilelah-logo-horizontal-reverse.svg", OUT / "ilelah-logo-horizontal-reverse-2000.png", 2000, NAVY),
        ("ilelah-logo-stacked.svg", OUT / "ilelah-logo-stacked-1200.png", 1200, None),
        ("og-default.svg", PUBLIC / "og-default.png", 1200, None),
    ]
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        for src, dest, width, bg in jobs:
            content = (OUT / src).read_text(encoding="utf-8")
            import re
            m = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', content)
            vw, vh = float(m.group(1)), float(m.group(2))
            height = round(width * vh / vw)
            page.set_viewport_size({"width": width, "height": height})
            bgcss = bg or "transparent"
            page.set_content(
                f'<html><body style="margin:0;background:{bgcss}">'
                f'<img src="data:image/svg+xml;base64,{__import__("base64").b64encode(content.encode()).decode()}" '
                f'style="display:block;width:{width}px;height:{height}px"></body></html>'
            )
            page.screenshot(path=str(dest), omit_background=bg is None)
        browser.close()
    print(f"Exported {len(jobs)} PNGs")
    try:
        from PIL import Image
        Image.open(PUBLIC / "icon-512.png").save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
        print("Wrote favicon.ico")
    except ImportError:
        print("Pillow not installed - skipping favicon.ico", file=sys.stderr)


if __name__ == "__main__":
    main()
