"""NOT RISING · THE POST — CUTTING THE EVIL EYE OUT OF KATHI'S PHOTO
--------------------------------------------------------------------
Takes Kathi's photo of her evil-eye cuff (tools/ref/evil-eye.jpg, 600 x 758)
and keeps ONLY the blue glass eye and the round stamped-brass disc it is set
in. Everything else (her wrist, the cuff's strap and its rivets, the railing
and the garden behind) is made see-through.

HOW THE CUT IS MADE
  The disc is a near-perfect circle in the photo (it was measured: a circle
  fitted to its edge all the way round is out by less than a pixel), so the
  cut is simply that circle:
      centre (315.5, 357.1) in the photo's pixels, radius 122
  (a hair inside the disc's true edge, 123.5, so no skin shows at the rim).
  The circle is drawn 8x bigger and shrunk, which gives it a smooth,
  anti-aliased edge instead of jagged steps.

It comes out as assets/img/post/evil-eye.webp, a square picture with a
see-through background. post.js hangs it on the café wall (STEP 5, THE BACK
WALL), and post.css (.nrp-eye) dims it to the light on that wall.

Run:  python3 tools/cut-eye.py      (needs numpy and pillow)
"""
import os
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "ref", "evil-eye.jpg")
OUT = os.path.join(HERE, "..", "assets", "img", "post", "evil-eye.webp")

CX, CY, R = 315.5, 357.1, 122.0     # the disc, in the photo's pixels
PAD = 1                             # a pixel of clear space round the edge

photo = Image.open(SRC).convert("RGB")

# 1 · the square around the disc
x0, y0 = int(np.floor(CX - R - PAD)), int(np.floor(CY - R - PAD))
size = int(np.ceil(2 * (R + PAD))) + 1
square = photo.crop((x0, y0, x0 + size, y0 + size))

# 2 · the round mask, drawn 8x big then shrunk (a soft, clean edge)
S = 8
big = Image.new("L", (size * S, size * S), 0)
cx, cy = (CX - x0) * S, (CY - y0) * S
ImageDraw.Draw(big).ellipse([cx - R * S, cy - R * S, cx + R * S, cy + R * S], fill=255)
mask = big.resize((size, size), Image.LANCZOS)

# 3 · put them together and save
square.putalpha(mask)
square.save(OUT, "WEBP", quality=92, method=6)
print("wrote", OUT, square.size, round(os.path.getsize(OUT) / 1024), "KB")
