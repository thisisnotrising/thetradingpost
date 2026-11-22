"""THE CELLAR, the library (Nov 22): the TV on the barrel says its words right, sharp, in the site's own letters.
-------------------------------------------------------------------------------------------
WHY: the set designer's render drew the words itself and dropped a letter: its screen reads THIS SUPPESSED.
Like every sign in THE SPEAK, the words are taken off the picture and set again in Oswald (the site's typeface):
  BILLION-DOLLAR / CORPORATIONS WANT / THIS SUPPRESSED
(the same three lines as the live cellar's screen, and the TV's popup).

HOW (on the 3200 x 4800 cellar, after the 4x sharpening and the coherence grade). Everything else about the TV
(its curved glass, the bezel, the room's light on it) stays exactly as rendered.
  1. THE GLASS: inside the bezel (BOX), the dark pixels are the glass; the old letters are the holes in it.
  2. THE OLD WORDS OFF: anything on the glass brighter than the glass around it (the letters and their glow) is
     filled in from the glass around it, smoothed, and given back the tube's grain.
  3. THE WORDS: Oswald Medium (the weight the render used), centred, the widest line 80% of the glass, white
     with a soft bloom (lit letters glow on a tube), faint scanlines and a hair of colour fringe, like an old set.
Run:  python3 tools/speak-faces/cellar_tv.py <cellar-in.png> <cellar-out.png>
"""
import os, sys, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, 'fonts', 'Oswald-VF.ttf')        # Google Fonts' Oswald (OFL-Oswald.txt), weight axis 200-700
WEIGHT = 500                                               # Medium

BOX = (826, 862, 986, 1014)        # x0, y0, x1, y1 around the glass, on the 1024 x 1536 render
LINES = ['BILLION-DOLLAR', 'CORPORATIONS WANT', 'THIS SUPPRESSED']
WIDEST = 0.80                      # the widest line's share of the glass's width (the render's own: 0.80)
MIDDLE = 0.493                     # where the block's middle sits, down the glass (the render's own)


def font(size):
    f = ImageFont.truetype(FONT, size)
    f.set_variation_by_axes([WEIGHT])
    return f


def glass_mask(img, box):
    """The glass inside the bezel: dark, colourless pixels (the cabinet's dark wood is as dark but reddish), the
    biggest such patch, its holes (the letters) filled."""
    x0, y0, x1, y1 = box
    lab = cv2.GaussianBlur(cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2LAB).astype(np.float32), (0, 0), 2)
    chroma = np.hypot(lab[..., 1] - 128, lab[..., 2] - 128)
    dark = ((lab[..., 0] < 100) & (chroma < 7)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark, 8)
    big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    g = (lab == big).astype(np.uint8)
    # fill the holes: everything not reachable from the box's edge without crossing the glass
    flood = g.copy(); h, w = g.shape
    ff = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(flood, ff, (0, 0), 1)
    holes = (flood == 0).astype(np.uint8)
    g = np.maximum(g, holes)
    g = cv2.morphologyEx(g, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    return g


def words_off(img, box, glass):
    """Lift the old letters (and their glow) off the glass, filling from the glass around them."""
    x0, y0, x1, y1 = box
    reg = img[y0:y1, x0:x1].copy()
    L = cv2.cvtColor(reg, cv2.COLOR_BGR2LAB)[..., 0].astype(np.float32)
    bg = cv2.medianBlur(np.clip(L, 0, 255).astype(np.uint8), 61).astype(np.float32)
    s = (x1 - x0) / 500
    inner = cv2.erode(glass, np.ones((int(30 * s) | 1,) * 2, np.uint8))            # keep clear of the curved edge
    text = ((L - bg > 10) & (inner > 0)).astype(np.uint8)
    # the letters sit in one block: take the block (its rows and columns) and everything bright in it, with its glow
    ys, xs = np.nonzero(text)
    bx0, bx1 = np.percentile(xs, [0.5, 99.5]); by0, by1 = np.percentile(ys, [0.5, 99.5])
    pad = int(26 * s)
    block = np.zeros_like(text)
    block[max(0, int(by0) - pad):int(by1) + pad, max(0, int(bx0) - pad):int(bx1) + pad] = 1
    block &= inner
    # fill: inpaint on a quarter-size copy (fast, smooth), then soften inside the block only
    small = cv2.resize(reg, None, fx=0.25, fy=0.25, interpolation=cv2.INTER_AREA)
    msmall = cv2.resize(block * 255, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    filled = cv2.inpaint(small, cv2.dilate(msmall, np.ones((3, 3), np.uint8)), 9, cv2.INPAINT_TELEA)
    filled = cv2.GaussianBlur(filled, (0, 0), 3)
    filled = cv2.resize(filled, (reg.shape[1], reg.shape[0]), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    # the tube's grain, measured on the glass outside the block
    calm = (inner > 0) & (block == 0)
    hp = reg.astype(np.float32) - cv2.GaussianBlur(reg.astype(np.float32), (0, 0), 3)
    sd = float(hp[calm].std()) if calm.any() else 3.0
    filled += np.random.default_rng(7).standard_normal(filled.shape).astype(np.float32) * sd
    m = cv2.GaussianBlur(block.astype(np.float32), (0, 0), 6 * s)[..., None]
    out = reg.astype(np.float32) * (1 - m) + filled * m
    return np.clip(out, 0, 255), (int(bx0), int(by0), int(bx1), int(by1))


def text_layer(w, h, cx, cy, width):
    """The words, white on black, centred on (cx, cy), the widest line `width` pixels wide."""
    probe = font(400)
    cap = probe.getbbox('H'); cap_h = cap[3] - cap[1]
    widest = max(probe.getbbox(t)[2] - probe.getbbox(t)[0] for t in LINES)
    size = int(400 * width / widest)
    f = font(size)
    cap = f.getbbox('H'); ch = cap[3] - cap[1]
    lead = ch * 1.70                                         # the render's line spacing (cap height x 1.7)
    total = lead * (len(LINES) - 1) + ch
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
    y = cy - total / 2
    for t in LINES:
        bb = f.getbbox(t)
        d.text((cx - (bb[2] - bb[0]) / 2 - bb[0], y - cap[1]), t, font=f, fill=255)
        y += lead
    return np.asarray(m, np.float32) / 255


def build(img):
    H, W = img.shape[:2]
    s = W / 1024
    x0, y0, x1, y1 = [int(round(v * s)) for v in BOX]
    box = (x0, y0, x1, y1)
    glass = glass_mask(img, box)
    reg, _ = words_off(img, box, glass)
    gy, gx = np.nonzero(glass)
    gx0, gx1, gy0, gy1 = gx.min(), gx.max(), gy.min(), gy.max()
    cx, cy = (gx0 + gx1) / 2, gy0 + (gy1 - gy0) * MIDDLE
    w, h = x1 - x0, y1 - y0
    t = text_layer(w, h, cx, cy, (gx1 - gx0) * WIDEST)
    k = w / 500
    # the tube lit from behind the words: a soft cool glow in the middle of the glass, as rendered
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    tube = np.exp(-(((xx - cx) / ((gx1 - gx0) * 0.34)) ** 2 + ((yy - cy) / ((gy1 - gy0) * 0.30)) ** 2))
    reg = reg + tube[..., None] * np.float32([30, 27, 24])[None, None]
    bloom = cv2.GaussianBlur(t, (0, 0), 4 * k) * 0.6 + cv2.GaussianBlur(t, (0, 0), 14 * k) * 0.4
    lit = np.clip(t * 0.96 + bloom, 0, 1.3)
    white = np.float32([236, 242, 240])                                       # BGR: a cool tube white
    col = reg * (1 - np.clip(lit, 0, 1)[..., None]) + white[None, None] * lit[..., None]
    f = 1
    col[..., 2] = np.roll(col[..., 2], f, axis=1)                             # red a hair right
    col[..., 0] = np.roll(col[..., 0], -f, axis=1)                            # blue a hair left
    yy = np.arange(h, dtype=np.float32)[:, None, None]
    scan = 0.93 + 0.07 * np.cos(yy / (2.0 * k) * np.pi)                       # faint scanlines
    col = col * scan
    g = cv2.GaussianBlur(glass.astype(np.float32), (0, 0), 1.2 * k)[..., None]
    out = img.astype(np.float32)
    out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - g) + col * g
    return np.clip(out, 0, 255).astype(np.uint8)


if __name__ == '__main__':
    cv2.imwrite(sys.argv[2], build(cv2.imread(sys.argv[1])))
