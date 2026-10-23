"""Build the Warm Terminal logo masters (symbol, small cut, lockups) as clean SVG.

The mark is a 3x3 ruled grid: seven ink cells, one accent cell (the cursor) and one empty cell
(what comes next). The wordmark is drawn from rectangles on a 2-unit stroke grid so it keeps the
system's square corners; no font is needed. Run: python3 build-warm-terminal-logo.py
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent
THEMES = {
    "light": {"ink": "#141413", "accent": "#c15f3c", "inset": 0},
    # Light-on-dark reads heavier (irradiation), so reversed cells shrink 1px per side.
    "dark": {"ink": "#faf9f5", "accent": "#d97757", "inset": 1},
}
CELL, GAP = 48, 16
CURSOR, EMPTY = (2, 1), (2, 2)

# Glyphs as rectangles (x0, y0, x1, y1) in units: width 10, x-height 12, ascender 16, stroke 2.
GLYPHS = {
    "w": [(0, 0, 2, 12), (4, 0, 6, 8), (8, 0, 10, 12), (0, 0, 10, 2)],
    "a": [(0, 10, 10, 12), (8, 0, 10, 12), (0, 5, 10, 7), (0, 0, 2, 7), (0, 0, 10, 2)],
    "r": [(0, 0, 2, 12), (0, 10, 9, 12)],
    "m": [(0, 0, 2, 12), (4, 0, 6, 12), (8, 0, 10, 12), (0, 10, 10, 12)],
    "t": [(3, 0, 5, 16), (0, 10, 9, 12), (3, 0, 9, 2)],
    "e": [(0, 0, 2, 12), (0, 10, 10, 12), (8, 5, 10, 12), (0, 5, 10, 7), (0, 0, 10, 2)],
    "i": [(4, 0, 6, 12), (1, 10, 6, 12), (1, 0, 9, 2), (4, 14, 6, 16)],
    "n": [(0, 0, 2, 12), (8, 0, 10, 12), (0, 10, 10, 12)],
    "l": [(4, 0, 6, 16), (1, 14, 6, 16), (1, 0, 9, 2)],
    " ": [],
}
ADVANCE = 14  # monospaced: every glyph, space included, takes the same cell
WORD = "warm terminal"
UNIT = 4  # x-height 48px = one grid cell; the baseline sits on the middle row's bottom edge


def fmt(v):
    return f"{v:g}"


def rect_path(x0, y0, x1, y1):
    return f"M{fmt(x0)} {fmt(y0)}H{fmt(x1)}V{fmt(y1)}H{fmt(x0)}Z"


def mark_paths(theme, ox=0, oy=0, cell=CELL, gap=GAP):
    """Return (ink path data, accent path data) for the grid at an origin."""
    t = THEMES[theme]
    k = t["inset"] * cell / CELL
    ink, acc = [], []
    for row in range(3):
        for col in range(3):
            if (row, col) == EMPTY:
                continue
            x, y = ox + col * (cell + gap), oy + row * (cell + gap)
            d = rect_path(x + k, y + k, x + cell - k, y + cell - k)
            (acc if (row, col) == CURSOR else ink).append(d)
    return "".join(ink), "".join(acc)


def word_path(ox, baseline, unit=UNIT):
    parts = []
    for i, ch in enumerate(WORD):
        gx = ox + i * ADVANCE * unit
        for x0, y0, x1, y1 in GLYPHS[ch]:
            parts.append(rect_path(gx + x0 * unit, baseline - y1 * unit, gx + x1 * unit, baseline - y0 * unit))
    return "".join(parts)


def word_width(unit=UNIT):
    return ((len(WORD) - 1) * ADVANCE + 10) * unit


def svg(w, h, body, title="Warm Terminal"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {fmt(w)} {fmt(h)}" role="img">'
            f"<title>{title}</title>{body}</svg>\n")


def paint(theme, ink_d, acc_d, word_d=""):
    t = THEMES[theme]
    return (f'<path fill="{t["ink"]}" d="{ink_d}{word_d}"/>'
            f'<path fill="{t["accent"]}" d="{acc_d}"/>')


def write(name, text):
    (OUT / name).write_text(text)
    print("wrote", name)


def main():
    side = 3 * CELL + 2 * GAP  # 176
    for theme in THEMES:
        sfx = "" if theme == "light" else "-dark"
        # Symbol on the 256 canvas (40px margin), the master for exports.
        write(f"warm-terminal-mark{sfx}.svg", svg(256, 256, paint(theme, *mark_paths(theme, 40, 40))))
        # Small cut for 16-32px: drawn on the 16px pixel grid (cells 4, gaps 1).
        write(f"warm-terminal-mark-small{sfx}.svg",
              svg(16, 16, paint(theme, *mark_paths("light", 1, 1, cell=4, gap=1))
                  .replace(THEMES["light"]["ink"], THEMES[theme]["ink"])
                  .replace(THEMES["light"]["accent"], THEMES[theme]["accent"])))
        # Horizontal: one cell of space (48) between mark and wordmark.
        tx = side + CELL
        write(f"warm-terminal-horizontal{sfx}.svg",
              svg(tx + word_width(), side, paint(theme, *mark_paths(theme), word_path(tx, 2 * CELL + GAP))))
        # Stacked: mark centred over the wordmark, one cell of space between.
        ww = word_width()
        base = side + CELL + 16 * UNIT
        write(f"warm-terminal-stacked{sfx}.svg",
              svg(ww, base, paint(theme, *mark_paths(theme, (ww - side) / 2, 0), word_path(0, base))))
        # Wordmark only.
        write(f"warm-terminal-wordmark{sfx}.svg", svg(ww, 16 * UNIT, paint(theme, "", "", word_path(0, 16 * UNIT))))

    # Banner: the dark lockup on a surface tile, for pages that are always white (GitHub README).
    # A 1px line keeps the edge visible where the host page is dark too.
    px, py = 2 * CELL, 1.5 * CELL
    bw, bh = side + CELL + word_width() + 2 * px, side + 2 * py
    tx = px + side + CELL
    tile = (f'<rect width="{fmt(bw)}" height="{fmt(bh)}" fill="#141413"/>'
            f'<rect x="0.5" y="0.5" width="{fmt(bw - 1)}" height="{fmt(bh - 1)}" fill="none" '
            f'stroke="#faf9f5" stroke-opacity="0.16"/>')
    write("warm-terminal-banner.svg",
          svg(bw, bh, tile + paint("dark", *mark_paths("dark", px, py), word_path(tx, py + 2 * CELL + GAP))))


if __name__ == "__main__":
    main()
