"""
MAKE THE WINTER PHONE STAGE              python3 tools/make-phone-stage.py
(needs Python 3 with Pillow, numpy and OpenCV: pip install pillow numpy opencv-python-headless)

Phones get their own winter picture: Kathi's tall snowy holiday picture of the shop
(tools/ref/winter-phone-stage-ref.webp, 941 x 1672), made for a phone held upright. Bigger screens keep
the wide one (tools/make-stage.py). This gets it ready the same way, in six steps:

  1. The frozen flakes: the falling snow painted into the picture is painted out where it shows (the
     night sky, the dark doors, the fascia, the upstairs window, the pavement), so only the live snow
     (assets/snowfall.js) falls. tools/clean-stage.py does this part.
  2. The marquee: the painted words (NOW SOARING / DAN KORUS) are wiped, row by row, leaving the clean
     striped board; the real words from data.js (SIGNS) are set on it live.
  3. The Newsstand window: the painted covers are made-up faces, so they're swapped for the dim bookshop
     behind the glass; the real covers are set on it live (all of Vol. 1, 5 across and 4 high).
  4. The poster window: the painted Poetic Drift poster is painted black; the live Best Storyteller
     poster (POSTERS in data.js) hangs over it.
  5. The Speakeasy sign: only SPEAK is lit; EASY has almost worn away.
  6. Saved as assets/img/storefront/winter-phone-stage.webp, 1080 pixels wide (a touch sharpened).

All positions are in the picture's own pixels (941 x 1672), the same numbers as STAGES.winter.phone in
storefront.js.
"""
import os, sys, numpy as np, cv2
from PIL import Image, ImageFilter
from importlib import import_module

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
clean = import_module("clean-stage")
OUT = os.path.join(HERE, "..", "assets", "img", "storefront")

ZONES = [   # where painted flakes show
    (470, 0, 941, 150),       # the night sky, right of the snowy branches
    (360, 300, 600, 505),     # the upstairs window
    (40, 735, 850, 865),      # the black fascia (THE POST)
    (40, 900, 170, 1305),     # the Speakeasy sign and the red door
    (755, 945, 848, 1295),    # door 10
    (215, 1195, 770, 1315),   # the panels under the windows
    (0, 1330, 941, 1672),     # the wet pavement
]
KEEP = [    # lettering and pictures never touched
    (290, 755, 650, 845),     # THE POST / 777 DAYDREAM ST.
    (48, 912, 165, 995),      # SPEAKEASY and 9 3/4
    (785, 960, 835, 995),     # 10
    (785, 1035, 828, 1145),   # OPEN
    (140, 1195, 240, 1345),   # the A-frame sign
    (600, 1295, 680, 1345), (300, 1295, 360, 1345),   # the lanterns
]

im = cv2.imread(os.path.join(HERE, "ref", "winter-phone-stage-ref.webp"))
assert im is not None and im.shape[:2] == (1672, 941), "the phone picture should be 941 x 1672"

# 1. the frozen flakes
mask, n = clean.find(im, ZONES, KEEP)
im = cv2.inpaint(im, mask, 4, cv2.INPAINT_TELEA)
print("1. painted flakes removed:", n)

# 2. the marquee: each row of the board is one stripe all the way across, so each row of the words is
#    refilled with that row's own colour, blended from just left of the words to just right of them
a = im.astype(np.float32)
X0, X1, Y0, Y1 = 326, 626, 597, 671
for y in range(Y0, Y1):
    # the row's own colour, from the clean board either side of the words (the red ivy leaf on its top left is skipped)
    side = np.concatenate([a[y, 232:324], a[y, 630:716]])
    clean_px = side[(side[:, 2] - side[:, 1]) < 45]                                   # (red minus green: the leaf is very red)
    fill = np.median(clean_px if len(clean_px) > 20 else side, axis=0)
    for x in range(X0, X1):
        edge = min(1, (x - X0) / 6, (X1 - 1 - x) / 6)
        a[y, x] = a[y, x] * (1 - edge) + fill * edge
a[Y0:Y1, X0:X1] += np.random.default_rng(7).normal(0, 1.6, (Y1 - Y0, X1 - X0, 1))
im = np.clip(a, 0, 255).astype(np.uint8)
print("2. marquee board cleared")

# 3. the Newsstand window: the dim bookshop where the painted covers were (under THE NEWSSTAND lettering)
NX0, NY0, NX1, NY1 = 480, 978, 692, 1182
shop = Image.open(os.path.join(OUT, "winter-desk-window-2.webp")).convert("RGB")      # the street's bookshop, 602 x 576
shop = shop.resize((331, 317), Image.LANCZOS).crop((60, 40, 60 + NX1 - NX0, 40 + NY1 - NY0))   # books the size of the picture's own
shop = shop.filter(ImageFilter.GaussianBlur(1.1))                                       # a little out of focus, behind the glass
shop = cv2.cvtColor(np.asarray(shop), cv2.COLOR_RGB2BGR).astype(np.float32) * .5
h, w = NY1 - NY0, NX1 - NX0
yy, xx = np.mgrid[0:h, 0:w]
feather = np.clip(np.minimum.reduce([xx / 10, (w - 1 - xx) / 10, yy / 6, (h - 1 - yy) / 6]), 0, 1)[..., None]
part = im[NY0:NY1, NX0:NX1].astype(np.float32)
im[NY0:NY1, NX0:NX1] = np.clip(part * (1 - feather) + shop * feather, 0, 255).astype(np.uint8)
print("3. Newsstand window cleared for the real covers")

# 4. the poster window: the painted poster becomes plain black (the live poster hangs over it)
PX0, PY0, PX1, PY1 = 260, 938, 424, 1167
f = im.astype(np.float32)
blk = np.full((PY1 - PY0, PX1 - PX0, 3), 18, np.float32)
h, w = PY1 - PY0, PX1 - PX0
yy, xx = np.mgrid[0:h, 0:w]
feather = np.clip(np.minimum.reduce([xx / 3, (w - 1 - xx) / 3, yy / 3, (h - 1 - yy) / 3]), 0, 1)[..., None]
f[PY0:PY1, PX0:PX1] = f[PY0:PY1, PX0:PX1] * (1 - feather) + blk * feather
im = np.clip(f, 0, 255).astype(np.uint8)
print("4. poster window ready for the live poster")

# 5. the Speakeasy sign: EASY (x 112 to 160) fades into the dark panel; SPEAK gets a warm glow
SX0, SX1, SY0, SY1 = 48, 165, 914, 954
f = im.astype(np.float32)
sign = f[SY0:SY1, SX0:SX1]
dark = cv2.morphologyEx(sign, cv2.MORPH_OPEN, np.ones((7, 7), np.uint8))   # the panel with the letters lifted out
split = 112 - SX0
sign[:, split:] = (dark + (sign - dark) * .1)[:, split:]
b_, g_, r_ = sign[..., 0], sign[..., 1], sign[..., 2]
gilt = ((r_ > 120) & (r_ - b_ > 30)).astype(np.float32)
gilt[:, split:] = 0
glow = cv2.GaussianBlur(gilt, (0, 0), 3)[..., None] * np.array([70, 150, 235], np.float32) * .8
f[SY0:SY1, SX0:SX1] = sign + glow + gilt[..., None] * sign * .12
im = np.clip(f, 0, 255).astype(np.uint8)
print("5. Speakeasy sign: SPEAK lit, EASY worn away")

# 6. save
pic = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
out = pic.resize((1080, round(1672 * 1080 / 941)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.0, 40, 2))
dst = os.path.join(OUT, "winter-phone-stage.webp")
out.save(dst, "WEBP", quality=74, method=6)
print("6. winter-phone-stage.webp", out.size, os.path.getsize(dst) // 1024, "KB")
