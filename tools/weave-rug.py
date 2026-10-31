"""NOT RISING · THE POST — THE JUTE RUG (the recipe)
-------------------------------------------------------------------
Weaves the thick round jute rug under the lounge, after Kathi's rug photo,
seen from straight above so it can lie flat on the room's floor and take
the room's own perspective.

Run it from the site folder:   python3 tools/weave-rug.py path/to/rug-photo.png
It saves assets/img/post/lounge/rug.webp. The website only shows that picture.

THE DESIGN, from the middle out (as in the photo):
  a tight spiral coil in the centre, a ring of small coiled rosettes, a
  band of braided rope, a ring of big coiled rosettes, then a wide band of
  braided rope out to a bound edge.

HOW IT'S MADE (the same height-map idea as the cushions and the ivy)
  1. HEIGHT MAP. Every point on the rug gets a height: a rope is a rounded
     ridge, and each rope is made of twisted strands (plies), so little
     slanted bumps run along it. Ropes run round in circles (the bands) or
     coil in tight spirals (the centre and the rosettes).
  2. LIGHT. From the slopes of that height map, work out which way each
     point faces and light it from the skylight above; the grooves between
     ropes fall into shadow.
  3. COLOUR. Natural jute colour taken from the photo, every rope a slightly
     different shade, fine hairy fibre noise.
  4. THE PHOTO AS AN OVERLAY. The fine grain of the real jute in Kathi's
     photo (its light-and-dark detail, without its overall shading) is laid
     over the whole rug, so the fibres are real ones.
"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else "rug-photo.png"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "post", "lounge", "rug.webp")
N = 1400                                   # the picture is N x N pixels; the rug fills it
rng = np.random.default_rng(7)
LIGHT = np.array([-.35, -.6, .72]); LIGHT /= np.linalg.norm(LIGHT)

y, x = (np.mgrid[0:N, 0:N].astype(np.float32) - N / 2 + .5) / (N / 2)   # -1..1 across the rug
r = np.hypot(x, y); th = np.arctan2(y, x)
ROPE = .021                               # one rope's width, as a fraction of the rug's radius (about 2.6 cm on a 3.1 m rug)


def rope(t, along, plies=2.6):
    """a rope's height: t = position across the ropes (one rope per 1.0), along = distance along it (in rope widths).
    A rounded ridge per rope, with twisted strands running slantwise across it."""
    f = t - np.floor(t)
    ridge = np.sin(np.pi * f) ** .55
    twist = .5 + .5 * np.cos(2 * np.pi * (along / plies * 2 + f * 1.6))
    return ridge * (.72 + .28 * twist), np.floor(t)


def bands(r0, r1):
    """concentric braided rope between radii r0 and r1"""
    t = r / ROPE
    h, k = rope(t, r * th / ROPE)
    return h, k


def coil(cx, cy, rad, tight=1.0):
    """a flat spiral coil of rope centred at (cx, cy), radius rad: returns height, rope number, and where it is"""
    dx, dy = x - cx, y - cy; rho = np.hypot(dx, dy); phi = np.arctan2(dy, dx)
    t = rho / (ROPE * tight) - phi / (2 * np.pi)
    h, k = rope(t, rho * phi / (ROPE * tight))
    h = h * np.clip((rad - rho) / (ROPE * .6), 0, 1)                        # the coil's outer end tucks in
    return h, k + 500 + int(abs(cx * 977 + cy * 131)) % 400, rho < rad


H = np.zeros((N, N), np.float32); K = np.zeros((N, N), np.float32)

# the zones, as fractions of the radius
Z_CENTRE, Z_SMALL0, Z_SMALL1, Z_BRAID1, Z_BIG0, Z_BIG1, Z_EDGE = .16, .17, .3, .44, .45, .62, .985

hb, kb = bands(0, 1)
H[:] = hb; K[:] = kb                                                         # braided rope everywhere to start with

# the centre spiral
hc, kc, inc = coil(0, 0, Z_CENTRE)
H = np.where(inc, hc, H); K = np.where(inc, kc, K)

# the rings of rosettes: little coils set side by side round a circle, on a bed of fine braid
def rosette_ring(r0, r1, size_k):
    global H, K
    rc, rad = (r0 + r1) / 2, (r1 - r0) / 2 * .96
    n = int(np.round(2 * np.pi * rc / (2 * rad * .98)))                    # as many as fit, just touching
    ring = (r > r0) & (r < r1)
    fine, kf = rope(r / (ROPE * .6), r * th / (ROPE * .6))                # the bed between rosettes: finer, lower braid
    H = np.where(ring, fine * .55, H); K = np.where(ring, kf + 300, K)
    for i in range(n):
        a = 2 * np.pi * i / n + .13
        hc, kc, inside = coil(rc * np.cos(a), rc * np.sin(a), rad, tight=size_k)
        hc = hc * 1.15 + .2 * np.clip(1 - np.hypot(x - rc * np.cos(a), y - rc * np.sin(a)) / rad, 0, 1)   # each rosette domes up a little
        H = np.where(inside & ring, np.maximum(H, hc), H); K = np.where(inside & ring, kc, K)
rosette_ring(Z_SMALL0, Z_SMALL1, .62)
rosette_ring(Z_BIG0, Z_BIG1, .68)

# the bound edge: one thicker rope round the outside
edge = (r > Z_EDGE - .025) & (r <= Z_EDGE)
H = np.where(edge, np.sqrt(np.clip(np.sin(np.pi * np.clip((r - (Z_EDGE - .025)) / .025, 0, 1)), 0, 1)) * 1.15, H)
alpha = np.clip((Z_EDGE - r) * N / 2 / 1.2, 0, 1)

# the whole rug is a touch thicker in the middle than at the rim (it sits up off the floor), and slightly uneven
H = H * .6
H += .04 * np.asarray(Image.fromarray((rng.random((N // 40, N // 40)) * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC), np.float32) / 255

# ---- 2. light it ----
gy, gx = np.gradient(H * 5.5)
nrm = np.dstack([-gx, -gy, np.ones_like(H)]); nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
lam = np.clip(nrm @ LIGHT, 0, 1)
cav = np.clip(H / .6, 0, 1) ** .6                                           # deep grooves between ropes sit in shadow
shade = (.55 + .6 * lam) * (.68 + .32 * cav)

# ---- 3. colour: jute, from the photo ----
photo = np.asarray(Image.open(SRC).convert("RGB"), np.float32) / 255
patch = photo[200:260, 60:320]                                              # a stretch of the rug's outer band in the photo
jute = patch.reshape(-1, 3).mean(0) * 1.12                                  # its average colour, lifted a little (the photo is in shade)
jute = jute + (jute - jute.mean()) * .12                                      # and a little richer: natural golden jute
rope_shade = 1 + (np.random.default_rng(3).random(4000)[(K.astype(int)) % 4000] - .5) * .14   # every rope a slightly different shade
hair = 1 + (rng.random((N, N)) - .5) * .22 + (np.asarray(Image.fromarray((rng.random((N // 2, N // 2)) * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC), np.float32) / 255 - .5) * .12   # fine hairy fibres
rgb = jute[None, None, :] * (shade * rope_shade * hair)[..., None]

# ---- 4. the photo's real fibre grain laid over it ----
# take the fine detail out of the photo (the photo minus a blurred copy of itself), tile it, and add it in
pim = Image.open(SRC).convert("L")
fine = np.asarray(pim, np.float32) - np.asarray(pim.filter(ImageFilter.GaussianBlur(3)), np.float32)
fp = fine[190:270, 40:330]                                                  # only from the rug itself, not the floor or the table
reps = (N // fp.shape[0] + 2, N // fp.shape[1] + 2)
tile = np.tile(np.concatenate([fp, fp[:, ::-1]], 1), (reps[0], reps[1] // 2 + 1))
# turn the grain to run round the rug with the ropes: sample it by (distance round, distance out)
u_ = ((th + np.pi) / (2 * np.pi) * tile.shape[1] * .98).astype(int) % tile.shape[1]
v_ = (r * N * .45).astype(int) % tile.shape[0]
grain = tile[v_, u_] / 255
rgb = rgb * (1 + grain[..., None] * .7)

# a soft shadow just outside the rim, where the thick rug stands up off the floor
rim = np.clip((r - Z_EDGE) * N / 2 / 14, 0, 1)
shadow_a = np.where(r > Z_EDGE, (1 - rim) * .45, 0)
out_a = np.maximum(alpha, shadow_a)
out_rgb = np.where(alpha[..., None] > 0, rgb, 0)
img = Image.fromarray((np.dstack([np.clip(out_rgb, 0, 1), np.clip(out_a, 0, 1)[..., None]]) * 255).astype(np.uint8), "RGBA")
img = img.resize((900, 900), Image.LANCZOS)                                 # (900 px: as sharp as it is ever shown, half the file)
# a touch more contrast and a little less saturation, baked in (it used to be a live CSS filter; see post.css)
from PIL import ImageEnhance
al = img.split()[-1]; img = ImageEnhance.Color(ImageEnhance.Contrast(img.convert("RGB")).enhance(1.08)).enhance(.95).convert("RGBA"); img.putalpha(al)
img.save(OUT, "WEBP", quality=76, method=6)
print("wove rug.webp", img.size, "jute colour", (jute * 255).astype(int))
