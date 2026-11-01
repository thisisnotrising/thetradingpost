"""NOT RISING · THE POST — THE OBSIDIAN COUNTER (the recipe)
-------------------------------------------------------------------
Paints the front of Nebula Cafe's counter: a thick block of polished black
stone that glitters like a nebula (after Kathi's black galaxy-stone photo).

Run it from the site folder:   python3 tools/polish-obsidian.py
It saves assets/img/post/obsidian.webp: 2 m of counter, 1.15 m tall (floor to
the top of the slab), repeating sideways with no seam. The website only shows
the picture (plus a few twinkling sparkles added by post.js and post.css).

HOW IT'S MADE, layer by layer, from the inside of the stone out:
  1. THE BLACK. Not flat black: a very dark glassy body with faint clouds of
     deep indigo, violet and plum drifting inside it, like a nebula seen
     through dark glass.
  2. THE GLITTER. Thousands of tiny flecks of mica-like mineral, mostly
     silver-white, some warm gold, a few faintly blue. Most are pinpricks;
     a few are bigger and brighter, with a soft bloom of light round them.
     Flecks deeper in the stone are dimmer, so the glitter has depth.
  3. THE POLISH. The front face is mirror-polished, so it reflects the
     bright room: soft vertical bands of reflected light (the skylight
     and the floor), strongest low down where it reflects the pale stone floor.
  4. THE SLAB'S TOP AND EDGE. The top 7 cm is the counter top seen just from
     above: brighter, because it faces the skylight, with the glitter
     catching it; then a crisp bright line where the polished edge turns
     the corner. At the foot, a dark recessed toe-kick in shadow.
Every random pattern wraps round left to right, so copies sit side by side
along the counter with no seam.
"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

import sys
# WHICH PIECE: python3 tools/polish-obsidian.py [counter | floor]
#   counter = the front of the café counter (the default): 2 m wide, 1.15 m tall, repeating sideways
#   floor   = the floor of the whole room: a 2 m square of the same stone, repeating in every direction, seen from
#             above, so it has no top edge or toe-kick, just the polished black, the nebula, the glitter and a soft sheen
FLOOR = len(sys.argv) > 1 and sys.argv[1] == "floor"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "post", "obsidian-floor.webp" if FLOOR else "obsidian.webp")
PXM = 360                                   # pixels per metre
W, H = int(2.0 * PXM), int((2.0 if FLOOR else 1.15) * PXM)
YWRAP = "wrap" if FLOOR else "nearest"      # the floor repeats up and down too
rng = np.random.default_rng(1111)
TOP, LIP, KICK = .07, .012, .1              # the top surface's height, the bright edge, the toe-kick (metres)
yy = np.arange(H)[:, None] / PXM            # metres down from the top of the slab


def clouds(scale_m, seed):
    """soft random clouds, wrapping left-right (scale in metres)"""
    r = np.random.default_rng(seed).random((H, W))
    return gaussian_filter(r, scale_m * PXM, mode=(YWRAP, "wrap"))


def norm(a): a = a - a.min(); return a / max(a.max(), 1e-6)


# ---- 1. the black, with a nebula inside ----
c1, c2, c3 = norm(clouds(.12, 1)), norm(clouds(.05, 2)), norm(clouds(.25, 3))
neb = np.clip((c1 * .6 + c2 * .4 - .45) * 2.2, 0, 1) ** 1.6                   # wisps
body = np.zeros((H, W, 3), np.float32) + np.array([.018, .017, .022])
body += neb[..., None] * np.array([.085, .045, .14])                           # violet-indigo haze
body += (np.clip((c3 - .55) * 3, 0, 1) ** 2)[..., None] * np.array([.06, .016, .035])   # here and there, deep plum

# ---- 2. the glitter ----
def flecks(n, rmin, rmax, bright, seed):
    r = np.random.default_rng(seed)
    out = np.zeros((H, W, 3), np.float32)
    xs, ys = r.random(n) * W, r.random(n) * H
    rad = rmin + (rmax - rmin) * r.random(n) ** 3                             # mostly small
    depth = .25 + .75 * r.random(n) ** .7                                     # deeper = dimmer
    kind = r.random(n)
    col = np.where(kind[:, None] < .66, np.array([1, 1, 1]), np.where(kind[:, None] < .92, np.array([1, .84, .55]), np.array([.75, .85, 1])))
    nb = (neb[ys.astype(int) % H, xs.astype(int) % W] * .9 + .4)              # a little denser in the nebula clouds
    for x, y, rr, d, c, k in zip(xs, ys, rad, depth, col, nb):
        R = int(np.ceil(rr * 3)) + 1
        gx = (np.arange(-R, R + 1) + int(x)) % W
        gy = np.arange(-R, R + 1) + int(y)
        if FLOOR: gy = gy % H; ok = np.ones(len(gy), bool)
        else: ok = (gy >= 0) & (gy < H); gy = gy[ok]
        dx = (np.arange(-R, R + 1) + int(x) - x)[None, :]; dy = (np.arange(-R, R + 1) + int(y) - y)[ok][:, None]
        g = np.exp(-(dx ** 2 + dy ** 2) / (2 * (rr * .55) ** 2)) * bright * d * k
        out[np.ix_(gy, gx)] += g[..., None] * c
    return out


# (the flecks are drawn bigger than real mica, about 0.3-2 cm, so they still sparkle when seen from across the room)
glitter = flecks(3200, 1.0, 1.8, .6, 5) + flecks(850, 1.6, 2.8, 1.0, 6) + flecks(150, 2.6, 4.6, 1.8, 7)
bloom = gaussian_filter(glitter, (4, 4, 0), mode=(YWRAP, "wrap", "nearest")) * 1.6   # the soft halo round the bright ones

# ---- 3. the polish: reflected room light ----
bands = norm(gaussian_filter(np.random.default_rng(9).random(W), 70, mode="wrap"))[None, :]
front = (yy > TOP)
floor_reflection = np.clip((yy - .5) / .55, 0, 1) ** 1.5 * .055            # the pale floor, reflected low down
sheen = (bands ** 3 * .05 + floor_reflection) * front
if FLOOR: sheen = norm(clouds(.35, 11)) ** 2 * .05                          # the floor: soft, slow patches of polish
rgb = body + glitter + bloom + sheen[..., None] * np.array([1, .98, .95])

# ---- THE FLOOR IS SNOWFLAKE OBSIDIAN (Oct 2026, after Kathi's photo): glossy black volcanic glass with white
#      "snowflakes" in it (little blooms of white crystal), no nebula. So the floor is painted fresh here:
#   a. the black: near-black glass with very faint grey clouds in it
#   b. the snowflakes: thousands of white blooms, mostly small (1-2 cm), some bigger (up to 4 cm), each a soft
#      irregular blot with a feathery edge, a little greyer at the rim; some in loose clusters, like the photo
#   c. the polish: broad soft reflections of the skylight sliding across it, and a fine sharp glint here and there
if FLOOR:
    rr = np.random.default_rng(31)
    base = np.zeros((H, W, 3), np.float32) + .028
    base += (norm(clouds(.2, 21)) ** 3 * .035)[..., None]                       # faint grey clouds in the glass
    flake = np.zeros((H, W), np.float32)
    def bloom(x, y, rad, k):
        R = int(rad * 1.8) + 2
        gx = (np.arange(-R, R + 1) + int(x)) % W; gy = (np.arange(-R, R + 1) + int(y)) % H
        dx = (np.arange(-R, R + 1) + int(x) - x)[None, :]; dy = (np.arange(-R, R + 1) + int(y) - y)[:, None]
        ang = np.arctan2(dy, dx); d = np.hypot(dx, dy)
        edge = rad * (1 + .12 * np.sin(ang * 2 + rr.random() * 6))                         # round to a little oval
        core = np.clip((edge - d) / 1.6 + .5, 0, 1)                                        # a crisp white spot (anti-aliased edge)
        feather = np.exp(-np.clip(d - edge, 0, None) / 1.8) * .12                          # the faintest haze at its rim
        v = np.maximum(core, np.clip(feather, 0, 1) * (d > edge)) * k
        sub = flake[np.ix_(gy, gx)]; flake[np.ix_(gy, gx)] = np.maximum(sub, v)
    PXcm = PXM / 100
    centres = rr.random((90, 2)) * [W, H]                                           # loose clusters
    for i in range(2300):
        if rr.random() < .45: cx, cy = centres[rr.integers(len(centres))] + rr.normal(0, 7 * PXcm, 2)
        else: cx, cy = rr.random() * W, rr.random() * H
        rad = max(1.6, (.3 + 1.1 * rr.random() ** 2.8) * PXcm)                       # mostly 0.6-1.5 cm across, a few up to 3 cm
        bloom(cx % W, cy % H, rad, .78 + .22 * rr.random())
    white = np.array([.9, .9, .88], np.float32); grey = np.array([.55, .55, .55], np.float32)
    tone = norm(clouds(.03, 23))[..., None]                                          # some blooms whiter, some greyer
    fcol = white * (.75 + .25 * tone) * (1 - .25 * (1 - flake[..., None])) + grey * 0
    rgb = base * (1 - flake[..., None]) + fcol * flake[..., None]
    gloss = norm(clouds(.3, 25)); gloss = np.clip((gloss - .5) * 2.2, 0, 1) ** 2 * .14      # broad soft reflections
    rgb += gloss[..., None] * np.array([.95, .96, 1])
    glint = (np.random.default_rng(27).random((H, W)) > .9997) * 1.0                # fine sharp glints
    rgb += gaussian_filter(glint, .8, mode="wrap")[..., None] * 1.2
    img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)); img.save(OUT, "WEBP", quality=80, method=6)   # (Oct 31: 80 not 90, a quarter lighter, no visible change)
    print("polished", os.path.basename(OUT), img.size); sys.exit()

# ---- 4. the top, the edge, the toe-kick (the counter only) ----
if FLOOR:
    img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)); img.save(OUT, "WEBP", quality=90, method=6)
    print("polished", os.path.basename(OUT), img.size); sys.exit()
topf = (yy <= TOP)
t = np.clip(yy / TOP, 0, 1)
top_light = (.16 - .1 * t) * topf                                            # the top faces the skylight: brighter at the back
rgb = rgb * np.where(topf[..., None], 1.6, 1) + top_light[..., None] * np.array([.95, .93, .98])
lip = np.exp(-((yy - TOP) / (LIP * .28)) ** 2)                                # the crisp polished edge where top meets front
rgb += lip[..., None] * np.array([.55, .53, .52])
rgb += np.exp(-((yy - TOP - LIP * 1.2) / (LIP * 1.6)) ** 2)[..., None] * -.012  # a hair of dark just under the edge
kick = yy > (1.15 - KICK)
rgb = np.where(kick[..., None], rgb * .25 + np.array([.004, .004, .005]), rgb)
rgb += (np.exp(-(((1.15 - KICK) - yy) / .006) ** 2) * (yy < 1.15 - KICK))[..., None] * np.array([.12, .12, .12])   # the bottom edge of the slab

img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
img.save(OUT, "WEBP", quality=90, method=6)
print("polished obsidian.webp", img.size)
