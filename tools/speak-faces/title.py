"""The film's title, sharp: the render's soft painted title is taken off the curtain and set again in a real
font, as projected light that follows the curtain's folds.

  1. find the old letters: anything much brighter than the curtain around it, inside the title box
  2. take them off, one column at a time: the folds run straight down, so each column of a fold is filled in
     from the curtain just above and just below the letters (the fold's light and shade carry straight through)
  3. set the new title (DM Serif Display, SIL Open Font License) at full size in the render's cream light,
     dimmed in the folds' shadows like the rest of the projection, with a faint glow
Coordinates are on the 1024 x 1536 render; s scales them to the picture being worked on."""
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SERIF = os.path.join(HERE, 'fonts', 'DMSerifDisplay-Regular.ttf')
BOX = (528, 762, 802, 982)                 # the area the new title is set in
LINES = [(540, 765, 770, 827),             # the old letters, line by line: Wilbur C.
         (534, 826, 801, 898),             #   Fibbermust
         (530, 840, 562, 912),             #   the F's curled tail
         (622, 874, 768, 910),             #   the swash under it
         (576, 918, 752, 951),             #   by Natalie Nicholson
         (596, 952, 714, 980)]             #   the little ornament
CREAM = (216, 130, 140)                    # warm projector cream (Lab, 0-255 scale): a touch brighter and warmer than the old letters (204, 132, 128)

def erase(img, s):
    x0, y0, x1, y1 = [int(v * s) for v in BOX]
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0]
    bg = cv2.GaussianBlur(L, (0, 0), 12 * s)
    band = np.zeros(L.shape, bool)
    for a0, b0, a1, b1 in LINES: band[int(b0 * s):int(b1 * s), int(a0 * s):int(a1 * s)] = True
    m = (((L - bg) > 26) & band)[y0:y1, x0:x1].astype(np.uint8)
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(5 * s) | 1, int(5 * s) | 1)))
    roi = img[y0:y1, x0:x1].astype(np.float32).copy()
    h = roi.shape[0]
    for x in range(roi.shape[1]):
        col = m[:, x]
        if not col.any(): continue
        y = 0
        while y < h:
            if col[y]:
                a = y
                while y < h and col[y]: y += 1
                b = y                                   # masked run is a..b-1
                top = roi[a - 1] [x] if a > 0 else None
                bot = roi[b][x] if b < h else None
                if top is None: top = bot
                if bot is None: bot = top
                t = (np.arange(a, b) - a + 1) / (b - a + 1)
                roi[a:b, x] = top[None, :] * (1 - t[:, None]) + bot[None, :] * t[:, None]
            else:
                y += 1
    # a whisper of grain so the filled columns don't look smoother than the cloth around them
    noise = np.random.default_rng(7).normal(0, 1.6, roi.shape).astype(np.float32)
    mm = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 1.0)[..., None]
    roi = roi + noise * mm
    # columns filled from the top and bottom can leave a faint seam; smooth only vertically, only where we filled
    sm = cv2.GaussianBlur(roi, (1, int(9 * s) | 1), 0)
    roi = roi * (1 - mm) + sm * mm
    out = img.copy(); out[y0:y1, x0:x1] = np.clip(roi, 0, 255).astype(np.uint8)
    return out

def fit(draw, text, font_path, width_px, max_h):
    lo, hi = 4, 600
    while lo < hi:
        mid = (lo + hi + 1) // 2
        f = ImageFont.truetype(font_path, mid)
        bb = draw.textbbox((0, 0), text, font=f)
        if bb[2] - bb[0] <= width_px and bb[3] - bb[1] <= max_h: lo = mid
        else: hi = mid - 1
    return ImageFont.truetype(font_path, lo)

def letters(W, H, s):
    """The new title as a white-on-black mask the size of the picture, drawn 2x then shrunk (clean edges)."""
    k = 2
    big = Image.new('L', (W * k // 4, H * k // 4), 0)          # only a quarter-size canvas around the box is needed...
    # ...so draw on a canvas the size of the box instead
    x0, y0, x1, y1 = [int(v * s) for v in BOX]
    bw, bh = (x1 - x0) * k, (y1 - y0) * k
    c = Image.new('L', (bw, bh), 0); d = ImageDraw.Draw(c)
    cx = bw * 0.47                                               # a touch left of the box's middle: inside a phone's view
    sc = s * k
    f1 = fit(d, 'Wilbur C.', SERIF, 200 * sc, 60 * sc)
    f2 = fit(d, 'Fibbermust', SERIF, 232 * sc, 66 * sc)
    f3 = fit(d, 'by Natalie Nicholson', SERIF, 150 * sc, 22 * sc)
    def put(text, f, y):
        bb = d.textbbox((0, 0), text, font=f)
        d.text((cx - (bb[0] + bb[2]) / 2, y - bb[1]), text, font=f, fill=255)
        return y + (bb[3] - bb[1])
    y = 10 * sc
    y = put('Wilbur C.', f1, y) + 12 * sc
    y = put('Fibbermust', f2, y) + 16 * sc
    # a fine rule with a small diamond under the title
    def rule(y, half, t):
        d.line([(cx - half, y), (cx - 7 * sc, y)], fill=255, width=max(1, int(t)))
        d.line([(cx + 7 * sc, y), (cx + half, y)], fill=255, width=max(1, int(t)))
        r = 4 * sc; d.polygon([(cx, y - r), (cx + r, y), (cx, y + r), (cx - r, y)], fill=255)
    rule(y, 70 * sc, 1.6 * sc); y += 22 * sc
    y = put('by Natalie Nicholson', f3, y) + 14 * sc
    rule(y, 34 * sc, 1.2 * sc)
    c = c.resize((x1 - x0, y1 - y0), Image.LANCZOS)
    return np.asarray(c, np.float32) / 255

def project(img, s):
    """Lays the new title on the (already erased) curtain as projected light."""
    x0, y0, x1, y1 = [int(v * s) for v in BOX]
    a = letters(img.shape[1], img.shape[0], s)
    roi = img[y0:y1, x0:x1]
    lab = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0]
    fold = np.clip(L / np.maximum(cv2.blur(L, (int(24 * s) | 1, 1)), 1), 0.6, 1.4) ** 0.8   # the folds' light and shade
    a = cv2.GaussianBlur(a, (0, 0), 0.45 * s / 3.125 + 0.35)                               # a projector's soft edge
    glow = cv2.GaussianBlur(a, (0, 0), 6 * s) * 0.18
    col = np.array(CREAM, np.float32)
    txt = np.empty_like(lab); txt[..., 0] = np.clip(col[0] * fold, 0, 255); txt[..., 1] = col[1]; txt[..., 2] = col[2]
    lit = lab.copy(); lit[..., 0] = np.clip(L + glow * (col[0] - L).clip(0), 0, 255)
    out = lit * (1 - a[..., None] * 0.94) + txt * (a[..., None] * 0.94)
    res = img.copy(); res[y0:y1, x0:x1] = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
    return res

if __name__ == '__main__':
    import sys
    im = cv2.imread(sys.argv[1]); s = im.shape[1] / 1024
    cv2.imwrite(sys.argv[2], project(erase(im, s), s))
