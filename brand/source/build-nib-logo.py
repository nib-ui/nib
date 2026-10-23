"""Build every Nib logo asset: masters, one-colour variants and web icons.

The mark is a 3x3 ruled grid: seven ink cells, one accent cell (the cursor, where the nib touches
the page) and one empty cell (what comes next). The wordmark is drawn from rectangles on a 2-unit
stroke grid so it keeps the system's square corners; no font is needed.

Run: python3 build-nib-logo.py   (PNG/ICO exports need `rsvg-convert` and ImageMagick `magick`)
"""
import shutil
import subprocess
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent
SURFACE_DARK = "#141413"
THEMES = {
    "light": {"ink": "#141413", "accent": "#02806c", "inset": 0},
    # Light-on-dark reads heavier (irradiation), so reversed cells shrink 1px per side.
    "dark": {"ink": "#faf9f5", "accent": "#00967d", "inset": 1},
}
CELL, GAP = 48, 16
SIDE = 3 * CELL + 2 * GAP  # 176
CURSOR, EMPTY = (2, 1), (2, 2)

# Glyphs as rectangles (x0, y0, x1, y1) in units measured up from the baseline:
# width 10, x-height 12, ascender 16, stroke 2.
GLYPHS = {
    "n": [(0, 0, 2, 12), (8, 0, 10, 12), (0, 10, 10, 12)],
    "i": [(4, 0, 6, 12), (1, 10, 6, 12), (1, 0, 9, 2), (4, 14, 6, 16)],
    "b": [(0, 0, 2, 16), (8, 0, 10, 12), (0, 10, 10, 12), (0, 0, 10, 2)],
}
ADVANCE = 14  # monospaced: every glyph takes the same cell
WORD = "nib"
UNIT = 4  # x-height 48px = one grid cell; the baseline sits on the middle row's bottom edge
WORD_H = 16 * UNIT


def fmt(v):
    return f"{v:g}"


def rect_path(x0, y0, x1, y1):
    return f"M{fmt(x0)} {fmt(y0)}H{fmt(x1)}V{fmt(y1)}H{fmt(x0)}Z"


def mark_paths(inset, ox=0, oy=0, cell=CELL, gap=GAP):
    """Return (ink path data, accent path data) for the grid at an origin."""
    k = inset * cell / CELL
    ink, acc = [], []
    for row in range(3):
        for col in range(3):
            if (row, col) == EMPTY:
                continue
            x, y = ox + col * (cell + gap), oy + row * (cell + gap)
            d = rect_path(x + k, y + k, x + cell - k, y + cell - k)
            (acc if (row, col) == CURSOR else ink).append(d)
    return "".join(ink), "".join(acc)


def small_mark_paths(ox=1, oy=1):
    """Small cut drawn on a 16px pixel grid (cells 4, gaps 1); no irradiation inset at this size."""
    return mark_paths(0, ox, oy, cell=4, gap=1)


def word_path(ox, baseline, unit=UNIT):
    parts = []
    for i, ch in enumerate(WORD):
        gx = ox + i * ADVANCE * unit
        for x0, y0, x1, y1 in GLYPHS[ch]:
            parts.append(rect_path(gx + x0 * unit, baseline - y1 * unit, gx + x1 * unit, baseline - y0 * unit))
    return "".join(parts)


def word_width(unit=UNIT):
    return ((len(WORD) - 1) * ADVANCE + 10) * unit


def svg(w, h, body, title="Nib"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(w)} {fmt(h)}" '
            f'width="{fmt(w)}" height="{fmt(h)}" role="img"><title>{title}</title>{body}</svg>\n')


def paint(ink, accent, ink_d, acc_d, word_d=""):
    body = f'<path fill="{ink}" d="{ink_d}{word_d}"/>'
    return body + (f'<path fill="{accent}" d="{acc_d}"/>' if acc_d else "")


def tile(w, h, line=False):
    rect = f'<rect width="{fmt(w)}" height="{fmt(h)}" fill="{SURFACE_DARK}"/>'
    if line:  # keeps the edge visible where the host page is dark too
        rect += (f'<rect x="0.5" y="0.5" width="{fmt(w - 1)}" height="{fmt(h - 1)}" fill="none" '
                 f'stroke="#faf9f5" stroke-opacity="0.16"/>')
    return rect


def write(name, text):
    (OUT / name).write_text(text)
    print("wrote", name)


def lockups(ink, accent, inset):
    """Return {suffix-less name: svg body args} for symbol, horizontal, stacked and wordmark."""
    tx = SIDE + CELL
    ww = word_width()
    stacked_h = SIDE + CELL + WORD_H
    return {
        "mark": (256, 256, paint(ink, accent, *mark_paths(inset, 40, 40))),
        "horizontal": (tx + ww, SIDE, paint(ink, accent, *mark_paths(inset), word_path(tx, 2 * CELL + GAP))),
        "stacked": (max(ww, SIDE), stacked_h,
                    paint(ink, accent, *mark_paths(inset, (max(ww, SIDE) - SIDE) / 2, 0),
                          word_path((max(ww, SIDE) - ww) / 2, stacked_h))),
        "wordmark": (ww, WORD_H, paint(ink, accent, "", "", word_path(0, WORD_H))),
    }


def build_masters():
    for theme, t in THEMES.items():
        sfx = "" if theme == "light" else "-dark"
        for name, (w, h, body) in lockups(t["ink"], t["accent"], t["inset"]).items():
            write(f"nib-{name}{sfx}.svg", svg(w, h, body))
        write(f"nib-mark-small{sfx}.svg", svg(16, 16, paint(t["ink"], t["accent"], *small_mark_paths())))
    # Banner: the dark lockup on a surface tile, for always-white pages such as a GitHub README.
    px, py = 2 * CELL, 1.5 * CELL
    bw, bh = SIDE + CELL + word_width() + 2 * px, SIDE + 2 * py
    d = THEMES["dark"]
    write("nib-banner.svg", svg(bw, bh, tile(bw, bh, line=True) + paint(
        d["ink"], d["accent"], *mark_paths(d["inset"], px, py), word_path(px + SIDE + CELL, py + 2 * CELL + GAP))))


def build_variants():
    # One-colour: every cell in black or white; the empty cell carries the shape.
    for label, colour in (("black", "#000000"), ("white", "#ffffff")):
        for name, (w, h, body) in lockups(colour, colour, 0).items():
            if name == "wordmark":
                continue
            write(f"variants/nib-{name}-{label}.svg", svg(w, h, body))
    # Square avatar master: light mark on paper, cropped tighter than the 256 symbol canvas.
    t = THEMES["light"]
    write("variants/nib-mark-square.svg", svg(256, 256, '<rect width="256" height="256" fill="#faf9f5"/>'
          + paint(t["ink"], t["accent"], *mark_paths(0, 24, 24, cell=64, gap=16))))


def build_web():
    d = THEMES["dark"]
    icon = tile(16, 16) + paint(d["ink"], d["accent"], *small_mark_paths())
    write("web/favicon.svg", svg(16, 16, icon))
    # App icon: the small cut on a dark tile, scaled up so it stays on the pixel grid.
    write("web/nib-app-icon.svg", svg(256, 256, tile(256, 256) + paint(
        d["ink"], d["accent"], *mark_paths(0, 40, 40, cell=48, gap=16))))
    # Maskable: the mark inside the 80% safe zone of a full-bleed tile.
    write("web/nib-maskable.svg", svg(512, 512, tile(512, 512) + paint(
        d["ink"], d["accent"], *mark_paths(0, 136, 136, cell=64, gap=24))))


def raster(src, dst, w, h=None):
    subprocess.run(["rsvg-convert", "-w", str(w), "-h", str(h or w), "-o", str(OUT / dst), str(OUT / src)], check=True)
    print("wrote", dst)


def build_rasters():
    if not (shutil.which("rsvg-convert") and shutil.which("magick")):
        print("skip PNG/ICO: install librsvg and ImageMagick")
        return
    for label in ("black", "white"):
        raster(f"variants/nib-mark-{label}.svg", f"variants/nib-mark-{label}-512.png", 512)
        raster(f"variants/nib-mark-{label}.svg", f"variants/nib-mark-{label}-1024.png", 1024)
        for name in ("horizontal", "stacked"):
            src = OUT / f"variants/nib-{name}-{label}.svg"
            subprocess.run(["rsvg-convert", "-w", "1200", "-o", str(OUT / f"variants/nib-{name}-{label}-1200.png"),
                            str(src)], check=True)
            print("wrote", f"variants/nib-{name}-{label}-1200.png")
    raster("variants/nib-mark-square.svg", "variants/nib-mark-square-512.png", 512)
    raster("variants/nib-mark-square.svg", "variants/nib-mark-square-1024.png", 1024)
    for size in (16, 32, 48):
        raster("web/favicon.svg", f"web/favicon-{size}.png", size)
    raster("web/nib-app-icon.svg", "web/apple-touch-icon.png", 180)
    raster("web/nib-app-icon.svg", "web/icon-192.png", 192)
    raster("web/nib-app-icon.svg", "web/icon-512.png", 512)
    raster("web/nib-maskable.svg", "web/maskable-512.png", 512)
    subprocess.run(["magick", *(str(OUT / f"web/favicon-{s}.png") for s in (16, 32, 48)),
                    str(OUT / "web/favicon.ico")], check=True)
    print("wrote web/favicon.ico")


def main():
    build_masters()
    build_variants()
    build_web()
    build_rasters()


if __name__ == "__main__":
    main()
