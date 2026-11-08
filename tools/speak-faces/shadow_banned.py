"""THE SPEAK hall, opening day (Nov 8): the red door's plaque reads SHADOW / BANNED, white on black.
-------------------------------------------------------------------------------------------
WHY: Kathi kept the original black plaque with its brass rim (from hall8.py) and asked for SHADOW above BANNED,
in white letters, for hard contrast against the crimson door.

HOW (on the 3200 x 4800 hall master, after the faces):
  1. the plaque is drawn again a little taller, so two lines fit, over where the old one hung (it covers it
     completely): the old plaque's own black inside and its own brass rim (both measured from the render), a soft
     shadow on the door, lit from the lamp above (brighter at the top)
  2. SHADOW over BANNED in Oswald (the site's typeface, as on the old plaque), white, both lines the same width,
     with a dark edge under each stroke so the letters sit in the plaque rather than float on it
  Everything is drawn 8x larger, then shrunk, so the edges are clean.
Run:  python3 tools/speak-faces/shadow_banned.py <hall-in.png> <hall-out.png>
"""
import os, sys, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, 'fonts', 'oswald-400.ttf')

OLD = (155, 2782, 305, 2850)            # the old plaque, rim included (x0, y0, x1, y1)
PLATE = (153, 2768, 307, 2866)          # the new one: the same width, taller for two lines
SS = 8


def word_mask(word, w, h):
    """The word in Oswald, filling exactly w x h (cap height = h; letter spacing makes up the width)."""
    f = ImageFont.truetype(FONT, 400)
    cap = f.getbbox('H'); cap_h = cap[3] - cap[1]
    f = ImageFont.truetype(FONT, int(400 * h / cap_h))
    boxes = [f.getbbox(ch) for ch in word]
    widths = [b[2] - b[0] for b in boxes]
    gap = (w - sum(widths)) / (len(word) - 1)
    m = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(m)
    capb = f.getbbox('H')
    x = 0
    for ch, b, wd in zip(word, boxes, widths):
        d.text((x - b[0], -capb[1]), ch, font=f, fill=255)
        x += wd + gap
    return np.asarray(m, np.float32) / 255


def build(img, ref):
    """img: the hall to draw on; ref: a hall that still shows the original plaque (for its colours)."""
    out = img.astype(np.float32)
    ox0, oy0, ox1, oy1 = OLD
    roi = ref[oy0:oy1, ox0:ox1].reshape(-1, 3).astype(np.float32)
    lum = roi.mean(1)
    black = np.median(roi[lum < np.percentile(lum, 30)], 0)
    brass = np.median(roi[lum > np.percentile(lum, 88)], 0)

    x0, y0, x1, y1 = PLATE
    W, H = x1 - x0, y1 - y0
    # 1. shadow on the door
    sh = np.zeros(img.shape[:2], np.float32)
    cv2.rectangle(sh, (x0 + 3, y0 + 5), (x1 + 3, y1 + 6), 1.0, -1)
    out *= (1 - cv2.GaussianBlur(sh, (0, 0), 4.5) * 0.6)[..., None]

    # 2. the plaque, large
    Ws, Hs = W * SS, H * SS
    shape = Image.new('L', (Ws, Hs), 0)
    ImageDraw.Draw(shape).rounded_rectangle((0, 0, Ws - 1, Hs - 1), radius=int(SS * 3.5), fill=255)
    shape = np.asarray(shape, np.float32) / 255
    rim_w = int(SS * 2.6)
    inner = Image.new('L', (Ws, Hs), 0)
    ImageDraw.Draw(inner).rounded_rectangle((rim_w, rim_w, Ws - 1 - rim_w, Hs - 1 - rim_w), radius=int(SS * 2), fill=255)
    inner = cv2.GaussianBlur(np.asarray(inner, np.float32) / 255, (0, 0), SS * 0.5)
    light = np.linspace(1.18, 0.78, Hs, dtype=np.float32)[:, None] * np.ones((1, Ws), np.float32)
    # the rim: brass, a bevel (bright top-left edge, dark bottom-right)
    bev = cv2.GaussianBlur(shape, (0, 0), SS * 1.2)
    gy = cv2.Sobel(bev, cv2.CV_32F, 0, 1, ksize=5); gx = cv2.Sobel(bev, cv2.CV_32F, 1, 0, ksize=5)
    shade = np.clip(1 + 0.012 * (gy + gx) / SS, 0.55, 1.35)
    rim = brass[None, None] * 0.72 * (light * shade)[..., None]      # the old rim's darker gold
    face = black[None, None] * light[..., None]
    col = rim * (1 - inner[..., None]) + face * inner[..., None]

    # 3. the letters: two lines, the same width, white
    pad_x = rim_w + int(SS * 9)
    lw = Ws - 2 * pad_x
    gap = int(SS * 9)
    lh = int((Hs - 2 * rim_w - 2 * SS * 10 - gap) / 2)
    top = (Hs - (2 * lh + gap)) // 2
    txt = np.zeros((Hs, Ws), np.float32)
    for i, word in enumerate(('SHADOW', 'BANNED')):
        y = top + i * (lh + gap)
        txt[y:y + lh, pad_x:pad_x + lw] = word_mask(word, lw, lh)
    edge = cv2.warpAffine(txt, np.float32([[1, 0, 0], [0, 1, SS * 1.1]]), (Ws, Hs))
    col = col * (1 - 0.6 * edge[..., None])
    white = np.float32([236, 240, 242]) * np.clip(light * 0.92 + 0.08, 0, 1.05)[..., None]
    col = col * (1 - txt[..., None]) + white * txt[..., None]

    small = cv2.resize(col, (W, H), interpolation=cv2.INTER_AREA)
    a = cv2.resize(shape, (W, H), interpolation=cv2.INTER_AREA)[..., None]
    out[y0:y1, x0:x1] = out[y0:y1, x0:x1] * (1 - a) + small * a
    return np.clip(out, 0, 255).astype(np.uint8)


if __name__ == '__main__':
    src, dst, ref = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else sys.argv[1])
    cv2.imwrite(dst, build(cv2.imread(src), cv2.imread(ref)))
