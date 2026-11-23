"""
Ilelah Technologies brand assets, generated from the official logo.

Source files (supplied by Ilelah Technologies):
  scripts/brand/source/ilelah-logo-source.png   primary logo, transparent background
  scripts/brand/source/ilelah-seal-source.png   circular company seal (documents only)

This script cuts the official logo into the pieces the website and
stationery need: the symbol alone, a horizontal lockup for headers,
light-on-dark ("reverse") versions, favicons, app icons and the social
sharing image. Nothing is redrawn: every piece is the supplied artwork.

Usage (from the project root):
    pip install pillow
    python3 scripts/brand/build_brand.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "scripts/brand/source/ilelah-logo-source.png"
SEAL = ROOT / "scripts/brand/source/ilelah-seal-source.png"
OUT = ROOT / "public/brand"
PUBLIC = ROOT / "public"


def bands(img: Image.Image) -> list[tuple[int, int, int, int]]:
    """Horizontal bands of artwork separated by fully transparent rows: (left, top, right, bottom)."""
    a = img.getchannel("A").point(lambda v: 255 if v > 24 else 0)
    w, h = img.size
    rows = [a.crop((0, y, w, y + 1)).getbbox() is not None for y in range(h)]
    out, start = [], None
    for y, filled in enumerate(rows + [False]):
        if filled and start is None:
            start = y
        if not filled and start is not None:
            box = a.crop((0, start, w, y)).getbbox()
            out.append((box[0], start, box[2], y))
            start = None
    return out


def reverse(img: Image.Image) -> Image.Image:
    """Navy parts become white; gold parts stay gold. For dark backgrounds."""
    img = img.copy()
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a and r < 110:  # navy (gold always has a high red channel)
                px[x, y] = (255, 255, 255, a)
    return img


def fit_height(img: Image.Image, h: int) -> Image.Image:
    return img.resize((round(img.width * h / img.height), h), Image.LANCZOS)


def on_canvas(img: Image.Image, size: tuple[int, int], bg=(0, 0, 0, 0), pad: float = 0.1) -> Image.Image:
    W, H = size
    scale = min(W * (1 - 2 * pad) / img.width, H * (1 - 2 * pad) / img.height)
    art = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", size, bg)
    canvas.alpha_composite(art, ((W - art.width) // 2, (H - art.height) // 2))
    return canvas


def save(img: Image.Image, path: Path) -> None:
    img.save(path, optimize=True)
    print(f"  {path.relative_to(ROOT)}  {img.width}x{img.height}  {path.stat().st_size // 1024} KB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    logo = Image.open(SRC).convert("RGBA")
    b = bands(logo)
    if len(b) != 4:
        raise SystemExit(f"Expected 4 parts (symbol, Ilelah, Technologies, tagline); found {len(b)}")
    symbol, ilelah, technologies, tagline = (logo.crop(box) for box in b)
    full = logo.crop((min(x[0] for x in b), b[0][1], max(x[2] for x in b), b[3][3]))
    stacked = logo.crop((min(x[0] for x in b[:3]), b[0][1], max(x[2] for x in b[:3]), b[2][3]))

    # Horizontal lockup: symbol beside "Ilelah" over "Technologies", all original artwork.
    gap_words = round(ilelah.height * 0.09)
    text_h = ilelah.height + gap_words + technologies.height
    text = Image.new("RGBA", (max(ilelah.width, technologies.width), text_h))
    text.alpha_composite(ilelah, (0, 0))
    text.alpha_composite(technologies, (round((ilelah.width - technologies.width) / 2) if technologies.width < ilelah.width else 0, ilelah.height + gap_words))
    sym_h = round(text_h * 1.08)
    sym = fit_height(symbol, sym_h)
    gap = round(text_h * 0.16)
    horiz = Image.new("RGBA", (sym.width + gap + text.width, sym_h))
    horiz.alpha_composite(sym, (0, 0))
    horiz.alpha_composite(text, (sym.width + gap, sym_h - text_h - round(sym_h * 0.02)))

    print("Writing brand assets:")
    # Master files (full resolution)
    save(full, OUT / "ilelah-logo-full.png")
    save(stacked, OUT / "ilelah-logo-stacked.png")
    save(horiz, OUT / "ilelah-logo-horizontal.png")
    save(reverse(horiz), OUT / "ilelah-logo-horizontal-reverse.png")
    save(reverse(full), OUT / "ilelah-logo-full-reverse.png")
    save(on_canvas(symbol, (1024, 1024), pad=0.06), OUT / "ilelah-mark-1024.png")
    save(on_canvas(reverse(symbol), (1024, 1024), pad=0.06), OUT / "ilelah-mark-reverse-1024.png")

    # Website sizes (3x the displayed height, for sharp phone screens)
    save(fit_height(horiz, 150), OUT / "ilelah-logo-horizontal-web.png")
    save(fit_height(reverse(horiz), 150), OUT / "ilelah-logo-horizontal-reverse-web.png")
    save(on_canvas(symbol, (256, 256), pad=0.04), OUT / "ilelah-mark-256.png")

    # Icons: symbol on white, so it shows on dark browser tabs and phone home screens
    white = (255, 255, 255, 255)
    for size, name in [(180, "apple-touch-icon.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
        save(on_canvas(symbol, (size, size), bg=white, pad=0.14), PUBLIC / name)
    fav = on_canvas(symbol, (256, 256), bg=white, pad=0.08)
    fav.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    save(fit_height(fav, 64), PUBLIC / "favicon-64.png")

    # Social sharing image (1200x630): the full logo on white
    og = on_canvas(full, (1200, 630), bg=white, pad=0.1).convert("RGB")
    og.save(PUBLIC / "og-default.png", optimize=True)
    print(f"  public/og-default.png  1200x630")

    # Company seal for letters and certificates (not used on the website)
    if SEAL.exists():
        save(Image.open(SEAL).convert("RGBA"), OUT / "ilelah-seal.png")


if __name__ == "__main__":
    main()
