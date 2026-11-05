"""
bar-cards.py: the black letter cards on Nebula Cafe's counter.

WHAT IT DOES
  The shelves behind the bar carry black cards with white, widely spaced capital letters
  (WELCOME TO NEBULA CAFE, SELF-AGENCY SPRITZ ...). This script gives the counter the same cards:
    1. the chalkboard on the cake stand becomes a black card reading PASTRIES
    2. the paper tag on the word jar becomes a black card reading TIP A / KIND / WORD
  Each new card is painted exactly over the old sign's outline, so nothing behind the old sign
  has to be invented, and the jar's strips (drawn by the page on top of the picture) still stop
  at the tag's edge (see the "jar-inside" clip in post/cafe.html).

HOW IT WORKS (the bones)
  a. Draw each card flat and big, like a sheet of paper on a desk, 4x larger than it will end up.
  b. Measure the four corners of the old sign in the picture (CARDS below, in pixels of cafe-2400).
  c. Tilt and squeeze the flat card onto those four corners (a "perspective warp").
  d. Shrink it to real size so the edges and letters come out smooth, and lay it over the picture.
  e. The café ships in three sizes. cafe-1600 is cafe-2400 scaled down, and cafe-phone is the
     middle 1200 pixels of cafe-2400 (from x 600), so the same patch is copied into each.

RUN
  python3 tools/bar-cards.py            (from the repo root; it rewrites the three cafe-*.webp files)
"""
import sys
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOM = "assets/img/post/room2/"
FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"   # an Arial-style bold, like the shelf letters
SS = 4                                    # draw 4x big, then shrink: smooth edges

# Colours sampled from the shelf cards in the same picture: warm near-black card, warm off-white letters.
CARD = (24, 20, 17)
INK = (228, 220, 207)
GLOW = (255, 196, 140)    # the colour of the bar's warm light, for the soft sheen on each card

# Each card: its words (one entry per line), the letter spacing (as a share of the letter size; the shelves are
# spaced wide), and the four corners of the old sign in cafe-2400, clockwise from top-left, measured off the
# picture with a pixel grid. "stands" = the card stands on the cake stand, so it gets a thin shadow where it meets it.
# "mirror" = the glossy counter reflects the card: the reflection is the card flipped upside down about the counter
# line (y), running down to where the counter's front edge cuts it off (to), at about a fifth of its brightness.
CARDS = [
    {"name": "pastries", "lines": ["PASTRIES"], "track": 0.36, "stands": True,
     "quad": [(551, 2064), (724, 2045), (738, 2167), (570, 2191)]},
    {"name": "word jar tag", "lines": ["TIP A", "KIND", "WORD"], "track": 0.42, "stands": False,
     "quad": [(1580, 2029), (1718, 2032), (1717, 2219), (1580, 2214)],
     "mirror": {"y": 2228, "to": 2384, "strength": 0.24}},
]


def edge(a, b):
    return float(np.hypot(b[0] - a[0], b[1] - a[1]))


def flat_card(w, h, lines, track):
    """Step a: the card lying flat, w x h pixels, letters centred. Returns an RGBA picture."""
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # the card's face: a gentle top-to-bottom shade (the bar lights hit the top a touch more) ...
    ramp = (yy / h)[..., None]
    face = (np.array(CARD) + 8) * (1 - ramp) + (np.array(CARD) - 7) * ramp
    # ... plus a faint warm sheen across the top-left corner, as if the light glances off it
    sheen = np.clip(1 - (xx / w * 0.8 + yy / h * 1.2), 0, 1)[..., None] ** 2 * 0.07
    face = face * (1 - sheen) + np.array(GLOW) * sheen
    # a hairline of light around the edge, brightest along the top, so the card reads as a solid object
    r = int(min(w, h) * 0.035)                                   # small rounded corners, like the shelf tiles
    rim = Image.new("L", (w, h), 0)
    ImageDraw.Draw(rim).rounded_rectangle((0, 0, w - 1, h - 1), r, outline=255, width=max(2, SS))
    rim = (np.array(rim, np.float32) / 255 * np.linspace(0.5, 0.1, h)[:, None])[..., None]
    face = face * (1 - rim) + np.array((118, 102, 86)) * rim
    card = Image.fromarray(np.clip(face, 0, 255).astype(np.uint8)).convert("RGBA")
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    card.putalpha(mask)

    # the words: as large as fits the widest line
    pad = 0.08 * w
    size = 400
    while True:
        f = ImageFont.truetype(FONT, size)
        widths = [sum(f.getlength(c) for c in ln) + track * size * (len(ln) - 1) for ln in lines]
        cap = f.getbbox("H")[3] - f.getbbox("H")[1]
        block = cap * len(lines) + cap * 0.95 * (len(lines) - 1)
        if max(widths) <= w - 2 * pad and block <= h * 0.6:
            break
        size -= 2
    d = ImageDraw.Draw(card)
    y = (h - block) / 2 - f.getbbox("H")[1]
    for ln, lw in zip(lines, widths):
        x = (w - lw) / 2
        for c in ln:
            d.text((x, y), c, font=f, fill=INK + (255,))
            x += f.getlength(c) + track * size
        y += cap * 1.95
    return card


def paint(img, card_spec):
    """Steps b-d: warp the flat card onto its quad's four corners and lay it over img (an RGB numpy array)."""
    q = np.array(card_spec["quad"], np.float32)
    w = int(round(max(edge(q[0], q[1]), edge(q[3], q[2])) * SS))
    h = int(round(max(edge(q[0], q[3]), edge(q[1], q[2])) * SS))
    card = np.array(flat_card(w, h, card_spec["lines"], card_spec["track"])).astype(np.float32)
    card[..., :3] *= card[..., 3:] / 255                          # colour times coverage, so the edges blend cleanly
    # work inside a small box around the card, drawn 4x big
    x0, y0 = np.floor(q.min(0)).astype(int) - 8
    x1, y1 = np.ceil(q.max(0)).astype(int) + 8
    dst = ((q - [x0, y0]) * SS).astype(np.float32)
    src = np.array([(0, 0), (w, 0), (w, h), (0, h)], np.float32)
    M = cv2.getPerspectiveTransform(src, dst)                     # the tilt-and-squeeze recipe
    big = cv2.warpPerspective(card, M, ((x1 - x0) * SS, (y1 - y0) * SS), flags=cv2.INTER_LINEAR)
    small = cv2.resize(big, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)   # step d: shrink = smooth
    small = cv2.GaussianBlur(small, (0, 0), 0.5)                  # the photo is a touch soft; so is the card
    rgb, a = small[..., :3], small[..., 3:] / 255.0
    patch = img[y0:y1, x0:x1].astype(np.float32)
    if card_spec["stands"]:
        # a thin soft shadow where the card's bottom edge meets the cake stand
        sh = np.zeros(patch.shape[:2], np.float32)
        p3, p2 = (q[3] - [x0, y0] + [0, 2]), (q[2] - [x0, y0] + [0, 2])
        cv2.line(sh, tuple(int(v) for v in p3), tuple(int(v) for v in p2), 1.0, 5)
        sh = cv2.GaussianBlur(sh, (0, 0), 3)[..., None]
        patch *= 1 - 0.45 * sh
    # match the picture's fine grain so the card doesn't look pasted on
    grain = np.random.default_rng(7).normal(0, 2.0, rgb.shape[:2])[..., None] * a
    out = patch * (1 - a) + rgb + grain
    img[y0:y1, x0:x1] = np.clip(out, 0, 255).astype(np.uint8)
    cover = np.maximum(a[..., 0], 0)
    if card_spec["stands"]:
        cover = np.maximum(cover, sh[..., 0])                     # the shadow is a change too
    return (x0, y0, x1, y1), cover


def main(out_dir=ROOM):
    big = np.array(Image.open(ROOM + "cafe-2400.webp").convert("RGB"))
    mid = np.array(Image.open(ROOM + "cafe-1600.webp").convert("RGB"))
    phone = np.array(Image.open(ROOM + "cafe-phone.webp").convert("RGB"))
    before = big.copy()                                           # the picture as it was, for the reflections
    cover = np.zeros(big.shape[:2], np.float32)                  # where the new cards sit (0 = untouched, 1 = card)
    for c in CARDS:
        (x0, y0, x1, y1), a = paint(big, c)
        cover[y0:y1, x0:x1] = np.maximum(cover[y0:y1, x0:x1], a)
        if "mirror" in c:
            # the old sign's reflection is still in the counter. Take away a fifth of the old sign, flipped,
            # and put back a fifth of the new card, flipped (blurred a little: the counter is glossy, not a mirror).
            m = c["mirror"]
            r0 = int(np.ceil(2 * m["y"] - y1))                    # first reflected row
            rows = np.arange(max(r0, y1), m["to"])
            src = np.clip(np.round(2 * m["y"] - rows).astype(int), y0, y1 - 1)   # the card row each one mirrors
            change = (before[src, x0:x1].astype(np.float32) - big[src, x0:x1].astype(np.float32))
            change *= cover[src, x0:x1][..., None]
            change = cv2.GaussianBlur(change, (0, 0), 2.5)
            reg = big[rows, x0:x1].astype(np.float32) - m["strength"] * change
            # the old handwriting still ghosts through, so inside the reflection keep only the glitter:
            # split the counter into its sparkles (small bright dots) and the glow underneath them,
            # smooth the glow (which wipes the ghost strokes), then put the sparkles back on top.
            glow = cv2.medianBlur(np.clip(reg, 0, 255).astype(np.uint8), 9).astype(np.float32)
            sparkles = np.maximum(reg - glow, 0)                  # only what is brighter than the glow: the dots
            where = cv2.GaussianBlur(cover[src, x0:x1], (0, 0), 3)[..., None]   # soft-edged: only under the card
            reg = reg * (1 - where) + (cv2.GaussianBlur(glow, (0, 0), 5) + sparkles) * where
            big[rows, x0:x1] = np.clip(reg, 0, 255).astype(np.uint8)
            cover[rows, x0:x1] = np.maximum(cover[rows, x0:x1], where[..., 0])
    cover = cv2.dilate(cover, np.ones((3, 3), np.uint8))        # one pixel of overlap, so no old edge peeks out

    # step e: only the card areas change in the other two sizes; every other pixel stays as it was
    def blend(old, new, a):
        a = a[..., None]
        return np.clip(old * (1 - a) + new * a, 0, 255).astype(np.uint8)
    PHONE_X = 600                                                 # cafe-phone = cafe-2400 from x 600, 1200 wide
    phone = blend(phone.astype(np.float32), big[:, PHONE_X:PHONE_X + phone.shape[1]].astype(np.float32),
                  cover[:, PHONE_X:PHONE_X + phone.shape[1]])
    size = (mid.shape[1], mid.shape[0])                           # cafe-1600 = cafe-2400 scaled down
    mid = blend(mid.astype(np.float32), cv2.resize(big, size, interpolation=cv2.INTER_AREA).astype(np.float32),
                cv2.resize(cover, size, interpolation=cv2.INTER_AREA))

    # WebP quality 82 keeps each file about the size it was (the site must stay light on phones)
    for name, arr in (("cafe-2400.webp", big), ("cafe-1600.webp", mid), ("cafe-phone.webp", phone)):
        Image.fromarray(arr).save(out_dir + name, "WEBP", quality=82, method=6)
        print("wrote", out_dir + name)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ROOM)
