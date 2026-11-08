"""THE SPEAK, THE CELLAR (Nov 8): the TV on the barrel shows the message, not a picture.
-------------------------------------------------------------------------------------------
The render's TV screen showed a film still. It is replaced by a glowing black-and-white CRT reading
  BILLION-DOLLAR CORPORATIONS WANT THIS SUPPRESSED. / THE ALGORITHM WILL BURY THIS.
in Oswald (the site's typeface), white letters glowing on dark glass, with scanlines, a vignette toward the
rounded corners, a faint colour fringe like an old tube, and the room's light reflected across the glass.
The cellar keeps its own warmth (Kathi: it's a level deeper, so it stays warmer than the hall).

HOW (on the 3200 x 4800 cellar, after the 4x sharpening):
  1. the screen's shape: a rounded rectangle inside the gold bezel (measured on the 1024 x 1536 render), a little
     larger than the old picture so none of it shows, with the bezel's shadow along the top and left
  2. the glass: dark blue-gray, brightest in the middle (a tube's glow), darker toward the corners
  3. the words: drawn large, centred, then a soft bloom (the glow around lit letters), scanlines and the fringe
  4. a soft diagonal sheen: the room's candles reflected in the glass
Run:  python3 tools/speak-faces/cellar_screen.py <cellar-in.png> <cellar-out.png>
"""
import os, sys, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, 'fonts', 'oswald-400.ttf')

S = 3200 / 1024
SCREEN = (790, 774, 964, 933)            # x0, y0, x1, y1 on the 1024 x 1536 render (just past the old picture's edge)
RADIUS = 13                              # its rounded corners, same units
LINES = [['BILLION-DOLLAR', 'CORPORATIONS WANT', 'THIS SUPPRESSED.'], ['THE ALGORITHM', 'WILL BURY THIS.']]


def text_layer(w, h):
    """The words, white on black, centred: two groups of lines with a gap between them."""
    m = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(m)
    f = ImageFont.truetype(FONT, 400)
    cap = f.getbbox('H'); cap_h = cap[3] - cap[1]
    widest = max(f.getbbox(t)[2] - f.getbbox(t)[0] for g in LINES for t in g)
    size = int(400 * (w * 0.80) / widest)                   # the widest line fills 80% of the screen
    size = min(size, int(400 * (h * 0.105) / cap_h))         # and no line is taller than ~10% of it
    f = ImageFont.truetype(FONT, size)
    cap = f.getbbox('H'); ch = cap[3] - cap[1]
    lead, gap = ch * 1.42, ch * 0.9
    total = lead * (sum(len(g) for g in LINES) - 1) + ch + gap
    y = (h - total) / 2
    for gi, g in enumerate(LINES):
        for t in g:
            bb = f.getbbox(t)
            d.text(((w - (bb[2] - bb[0])) / 2 - bb[0], y - cap[1]), t, font=f, fill=255)
            y += lead
        y += gap - (lead - ch) if gi == 0 else 0
    return np.asarray(m, np.float32) / 255


def build(img):
    H, W = img.shape[:2]
    out = img.astype(np.float32)
    x0, y0, x1, y1 = [int(round(v * S)) for v in SCREEN]
    w, h = x1 - x0, y1 - y0
    r = int(RADIUS * S)
    shape = np.zeros((h, w), np.uint8)
    cv2.rectangle(shape, (r, 0), (w - 1 - r, h - 1), 1, -1); cv2.rectangle(shape, (0, r), (w - 1, h - 1 - r), 1, -1)
    for cx, cy in ((r, r), (w - 1 - r, r), (r, h - 1 - r), (w - 1 - r, h - 1 - r)):
        cv2.circle(shape, (cx, cy), r, 1, -1, lineType=cv2.LINE_AA)
    shape = cv2.GaussianBlur(shape.astype(np.float32), (0, 0), 1.2)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    u, v = (xx - w / 2) / (w / 2), (yy - h / 2) / (h / 2)
    # 2. the glass: the tube's glow in the middle, darker toward the corners
    glow = np.clip(1 - 0.55 * (u ** 2 + v ** 2), 0, 1)
    glass = np.stack([30 + 34 * glow, 30 + 34 * glow, 27 + 30 * glow], -1)          # BGR, a cool blue-gray
    # 3. the words, with their bloom, scanlines and a faint colour fringe
    t = text_layer(w, h)
    bloom = cv2.GaussianBlur(t, (0, 0), 6) * 0.8 + cv2.GaussianBlur(t, (0, 0), 18) * 0.35
    lit = np.clip(t * 0.95 + bloom, 0, 1.4)
    white = np.float32([238, 244, 240])
    col = glass * (1 - np.clip(lit, 0, 1)[..., None]) + white[None, None] * lit[..., None]
    fringe = 2
    col[..., 2] = np.roll(col[..., 2], fringe, axis=1)                          # red a touch right
    col[..., 0] = np.roll(col[..., 0], -fringe, axis=1)                         # blue a touch left
    scan = 0.86 + 0.14 * np.cos(yy / 2.0 * np.pi)                              # a line every 4 pixels
    col *= scan[..., None]
    col *= (1 - 0.35 * np.clip(u ** 4 + v ** 4, 0, 1))[..., None]               # the vignette into the corners
    # 4. the candles reflected in the glass: a soft diagonal sheen, top left
    sheen = np.clip(1 - np.abs((u + v * 0.7) + 0.75) / 0.35, 0, 1) * np.clip(1 - (u ** 2 + v ** 2) * 0.6, 0, 1)
    col += sheen[..., None] * np.float32([120, 150, 180])[None, None] * 0.18
    col += np.random.default_rng(4).standard_normal(col.shape).astype(np.float32) * 3.5   # the tube's grain
    # the bezel's shadow along the top and left inside edge
    edge = shape * np.clip(1 - cv2.warpAffine(shape, np.float32([[1, 0, 9], [0, 1, 12]]), (w, h)), 0, 1)
    col *= (1 - 0.6 * cv2.GaussianBlur(edge, (0, 0), 6))[..., None]

    reg = out[y0:y1, x0:x1]
    out[y0:y1, x0:x1] = reg * (1 - shape[..., None]) + np.clip(col, 0, 255) * shape[..., None]
    # the screen's light falling a little on the bezel around it
    halo = cv2.GaussianBlur(np.pad(shape, 40), (0, 0), 22)[40:-40, 40:-40] * (1 - shape)
    out[y0:y1, x0:x1] += (halo * 18)[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


if __name__ == '__main__':
    cv2.imwrite(sys.argv[2], build(cv2.imread(sys.argv[1])))
