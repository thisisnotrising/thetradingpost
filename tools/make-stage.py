"""
MAKE THE WINTER STAGE PICTURE          python3 tools/make-stage.py
(needs Python 3 with Pillow, numpy and OpenCV: pip install pillow numpy opencv-python-headless)

Kathi's snowy holiday picture of the shop (tools/ref/winter-stage-ref.webp) is the winter street.
This gets it ready to be the stage, in five steps, and saves it twice: a sharper copy for bigger
screens and a lighter one for phones.

  1. The frozen flakes: the picture has falling snow painted in. The live snow (assets/snowfall.js)
     falls over it, so painted flakes would hang frozen in the air. They're painted out on the dark
     parts where they show (tools/clean-stage.py does this part).
  2. The marquee: its painted words are wiped, leaving the clean striped board, so the real words
     from data.js (SIGNS.marquee) can be set on it live and changed any time.
  3. The Newsstand window: the painted covers are made-up faces, not NOT RISING's features, so
     they're swapped for the dim bookshop behind the glass. The real covers are set on it live.
  4. The Speakeasy sign: only SPEAK is lit; EASY has almost worn away (the shop's look since it opened).
     (The Best Storyteller poster isn't changed here: the live poster from POSTERS in data.js hangs over it.)
  5. Saved as assets/img/storefront/winter-desk-stage.webp (1.5 times the picture's size, sharpened
     a little) and winter-phone-stage.webp (860 pixels wide).

All positions are in the reference picture's own pixels (1295 x 1215), the same numbers as the
STAGES plan in storefront.js.
"""
import os, sys, numpy as np, cv2
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
sys.path.insert(0, HERE)
from importlib import import_module
clean = import_module("clean-stage")

REF = os.path.join(HERE, "ref", "winter-stage-ref.webp")   # her picture, saved without any loss
IMG = os.path.join(ROOT, "assets", "img")
OUT = os.path.join(IMG, "storefront")

im = cv2.imread(REF)
assert im is not None and im.shape[:2] == (1215, 1295), "the reference picture should be 1295 x 1215"

# 1. paint out the frozen flakes
mask, n = clean.find(im)
im = cv2.inpaint(im, mask, 4, cv2.INPAINT_TELEA)
print("1. painted flakes removed:", n)

# 2. the marquee: every row of the board is the same stripe all the way across, so each row of the words is
#    refilled with that row's own colour, blended from just left of the words to just right of them
a = im.astype(np.float32)
X0, X1, Y0, Y1 = 500, 801, 396, 472          # the words
for y in range(Y0, Y1):
    left = np.median(a[y, 470:498], axis=0)
    right = np.median(a[y, 803:831], axis=0)
    for x in range(X0, X1):
        t = (x - X0) / (X1 - X0)
        fill = left * (1 - t) + right * t
        edge = min(1, (x - X0) / 6, (X1 - 1 - x) / 6)      # blend in over the first and last 6 pixels
        a[y, x] = a[y, x] * (1 - edge) + fill * edge
rng = np.random.default_rng(7)
a[Y0:Y1, X0:X1] += rng.normal(0, 1.6, (Y1 - Y0, X1 - X0, 1))  # the board's fine grain, so the patch doesn't look too smooth
im = np.clip(a, 0, 255).astype(np.uint8)
print("2. marquee board cleared")

# 3. the Newsstand window: the bookshop behind the glass, out of focus and dim, where the painted covers were
NX0, NY0, NX1, NY1 = 684, 766, 968, 998
shop = Image.open(os.path.join(OUT, "winter-desk-window-2.webp")).convert("RGB")
shop = shop.resize((NX1 - NX0, NY1 - NY0), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3))
shop = cv2.cvtColor(np.asarray(shop), cv2.COLOR_RGB2BGR).astype(np.float32) * .42
h, w = NY1 - NY0, NX1 - NX0
yy, xx = np.mgrid[0:h, 0:w]
feather = np.clip(np.minimum.reduce([xx / 16, (w - 1 - xx) / 16, yy / 8, (h - 1 - yy) / 3]), 0, 1)[..., None]
part = im[NY0:NY1, NX0:NX1].astype(np.float32)
im[NY0:NY1, NX0:NX1] = np.clip(part * (1 - feather) + shop * feather, 0, 255).astype(np.uint8)
print("3. Newsstand window cleared for the real covers")

# 4. the Speakeasy sign: only SPEAK is lit. EASY (x 164 to 220) has almost worn away: its gilt fades into the
#    dark glass (a little of it still shows), and SPEAK gets a warm glow, as if lit from behind
SX0, SX1, SY0, SY1 = 88, 222, 704, 744
f = im.astype(np.float32)
sign = f[SY0:SY1, SX0:SX1]
dark = cv2.morphologyEx(sign, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))     # the glass with the letters lifted out
split = 164 - SX0
worn = dark + (sign - dark) * .16
sign[:, split - 2:] = worn[:, split - 2:]
b_, g_, r_ = sign[..., 0], sign[..., 1], sign[..., 2]
gilt = ((r_ > 120) & (r_ - b_ > 30)).astype(np.float32)
gilt[:, split - 2:] = 0                                                         # SPEAK's letters only
glow = cv2.GaussianBlur(gilt, (0, 0), 4)[..., None] * np.array([70, 150, 235], np.float32) * .85   # warm light (blue, green, red)
sign = sign + glow + gilt[..., None] * sign * .12
f[SY0:SY1, SX0:SX1] = sign
im = np.clip(f, 0, 255).astype(np.uint8)
print("4. Speakeasy sign: SPEAK lit, EASY worn away")

# 5. save
pic = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
desk = pic.resize((round(1295 * 1.5), round(1215 * 1.5)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 45, 2))
desk.save(os.path.join(OUT, "winter-desk-stage.webp"), "WEBP", quality=80, method=6)
phone = pic.resize((860, round(1215 * 860 / 1295)), Image.LANCZOS)
phone.save(os.path.join(OUT, "winter-phone-stage.webp"), "WEBP", quality=78, method=6)
for f in ("winter-desk-stage.webp", "winter-phone-stage.webp"):
    print("5.", f, os.path.getsize(os.path.join(OUT, f)) // 1024, "KB")
