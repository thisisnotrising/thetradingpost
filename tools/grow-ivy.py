"""NOT RISING · THE POST — THE IVY, GROWN (the recipe)
-------------------------------------------------------------------
Grows the Boston ivy that crawls down from the top of THE POST's two long
walls, vine by vine and leaf by leaf, and renders it like a photograph:
lit leaves, waxy shine, veins, leaves tilted toward and away from the
light, and every leaf casting a soft shadow on the brick (and on the
leaves behind it). The colours come from Kathi's ivy photo.

Run it from the site folder:   python3 tools/grow-ivy.py
It saves assets/img/post/ivy-wall.webp (6.4 m of wall, repeating with no seam).
The website only shows that picture.

HOW IT WORKS (in the order the script does it)
  1. GROW THE VINES. Lots of stems start at the top of the wall. Each one
     creeps downward a little at a time, wandering left and right and now
     and then branching. Most stems are short, a few are long, so the ivy
     is thick at the top and crawls down in uneven tongues.
  2. HANG THE LEAVES. Along each stem a leaf every 5-7 cm, on alternate
     sides, each on its own little stalk, getting smaller toward the young
     tip. Each vine has its own colour (crimson, rose, coral, gold, a few
     green), each leaf varies a little from its vine, and the young tips
     turn gold and green.
  3. GIVE EVERY LEAF DEPTH. Each leaf hangs a different distance off the
     wall (0-8 cm) and is tilted a different way. Its shape is a 3-lobed
     Boston ivy leaf with a toothed edge; its surface is a gentle dome,
     folded along the middle vein, with veins pressed in.
  4. LIGHT IT. From the shape, work out which way each tiny bit of leaf
     faces, and light it from the skylight above: facing the light =
     bright, turned away = dark, plus a waxy glint. Leaves nearer the wall
     sit in more shade.
  5. CAST SHADOWS. Before each leaf is drawn, its shadow is laid down,
     pushed down and to the right (away from the light) and softened; the
     further the leaf stands off the wall, the further and softer its
     shadow. Leaves are drawn from the wall outward, so a front leaf's
     shadow falls on the leaves behind it, the way it really would.
Everything is drawn at twice the final size and then shrunk, for smooth edges.
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import sys
# WHICH IVY TO GROW: python3 tools/grow-ivy.py [wall | archtop | corner]
#   wall    = the long side walls: 6.4 m of wall, 2.5 m down from the top, repeating along the wall (the default)
#   archtop = across the top of the arch wall: a short fringe (most of it 15-60 cm) that drapes just over the
#             crown of the arch without hiding it; 6.4 m, repeating
#   corner  = one corner of the arch wall (the left; post.js mirrors it for the right): long cascades crowded into
#             the corner, trailing far down it, getting shorter and sparser away from the corner; not repeating
MODE = sys.argv[1] if len(sys.argv) > 1 else "wall"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "post", {"wall": "ivy-wall.webp", "archtop": "ivy-arch-top.webp", "corner": "ivy-arch-corner.webp"}[MODE])
WM, HM_ = {"wall": (6.4, 2.5), "archtop": (6.4, 1.0), "corner": (1.5, 4.6)}[MODE]   # metres wide, metres down from the top
WRAP = MODE != "corner"            # does it repeat left-right with no seam?
OFFS = (-1, 0, 1) if WRAP else (0,)
FINAL = 340                        # pixels per metre in the saved picture
S = FINAL * 2                      # pixels per metre while drawing (twice, then shrunk)
W, H = int(WM * S), int(HM_ * S)
rng = np.random.default_rng(1111)

# THE COLOURS, from Kathi's ivy photo, in order from wine through red, pink, orange and gold to green.
# The second number is how common that colour is.
FAMILY = [((128, 26, 46), .03), ((186, 36, 48), .2), ((212, 56, 52), .13), ((206, 70, 96), .14), ((226, 116, 138), .08),
          ((226, 100, 68), .1), ((214, 128, 50), .08), ((222, 170, 64), .1), ((234, 204, 110), .05), ((150, 150, 62), .04), ((72, 112, 70), .05)]
COLS = np.array([c for c, _ in FAMILY], np.float32) / 255
WEIGHTS = np.array([w for _, w in FAMILY])
if MODE != "wall": WEIGHTS[-2:] *= 4.5        # the arch wall's ivy: red AND green (more of the olive and green vines)
WEIGHTS /= WEIGHTS.sum()
LIGHT = np.array([-.3, -.78, .55]); LIGHT /= np.linalg.norm(LIGHT)          # from above, a little from the left (y points down)
HALF = (LIGHT + np.array([0, 0, 1])); HALF /= np.linalg.norm(HALF)         # for the waxy glint

# the picture, as colour x alpha already multiplied together ("premultiplied"), so layering is simple
canvas = np.zeros((H, W, 4), np.float32)


def over(patch, x0, y0):
    """lay a premultiplied RGBA patch over the canvas at (x0, y0), wrapping round left and right so the ivy repeats with no seam"""
    ph, pw = patch.shape[:2]
    for off in (o * W for o in OFFS):
        xa, ya = x0 + off, y0
        cx0, cy0, cx1, cy1 = max(0, xa), max(0, ya), min(W, xa + pw), min(H, ya + ph)
        if cx0 >= cx1 or cy0 >= cy1: continue
        p = patch[cy0 - ya:cy1 - ya, cx0 - xa:cx1 - xa]
        c = canvas[cy0:cy1, cx0:cx1]
        c[:] = p + c * (1 - p[..., 3:4])


def shadow_of(alpha, d):
    """a leaf's (or stem's) shadow on the wall: its outline, softened and darkened; d = how far off the wall (0-1)"""
    sig = 2 + 7 * d
    a = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(sig)), np.float32) / 255
    a *= .5 * (1 - .35 * d)
    out = np.zeros(alpha.shape + (4,), np.float32); out[..., 3] = a        # black, so colour x alpha = 0
    return out


# ------------------------------------------------------------------
# 1. GROW THE VINES
# ------------------------------------------------------------------
STEP = .02 * S                     # a stem grows 2 cm at a time
vines = []


def grow(x, y, theta, length, fam, depth=0):
    pts = [(x, y)]; n = int(length * S / STEP)
    for i in range(n):
        theta += rng.normal(0, .16) - theta * .07                 # wander, but keep being pulled downward
        theta = float(np.clip(theta, -1.25, 1.25))
        x += np.sin(theta) * STEP; y += np.cos(theta) * STEP
        pts.append((x, y))
        left = (n - i) * STEP / S
        if depth < 2 and left > .25 and rng.random() < .018:          # now and then a side branch
            grow(x, y, theta + rng.choice([-1, 1]) * rng.uniform(.5, 1.0), left * rng.uniform(.3, .75),
                 int(np.clip(fam + rng.integers(-1, 2), 0, len(FAMILY) - 1)), depth + 1)
    vines.append({"pts": np.array(pts), "fam": fam, "thick": (3.2 if depth == 0 else 2.4) * S / 680})


if MODE == "wall":
    for i in range(165):                                              # stems starting along the top of the wall
        L = .22 + 2.15 * rng.beta(1.15, 2.7)                          # most short, a few long (metres)
        if i % 12 == 0: L = rng.uniform(1.6, 2.35)                    # and a handful that really trail
        grow(rng.uniform(0, W), rng.uniform(-.06, .12) * S, rng.normal(0, .35), L, rng.choice(len(FAMILY), p=WEIGHTS))
elif MODE == "archtop":
    for i in range(120):                                              # a fringe along the top: short, and a few a little longer
        L = .12 + .45 * rng.beta(1.2, 3.2)
        if i % 9 == 0: L = rng.uniform(.6, .9)
        grow(rng.uniform(0, W), rng.uniform(-.05, .06) * S, rng.normal(0, .3), L, rng.choice(len(FAMILY), p=WEIGHTS))
else:
    # THE CORNER (x = 0 is the corner itself). Stems start along the top, and also all the way down the corner edge
    # (where the ivy has climbed round from the side wall); the nearer the corner, the longer they trail.
    for i in range(44):
        f = rng.beta(1.0, 1.8)                                        # how far from the corner (0 = in it), mostly near
        L = (.2 + 4.2 * (1 - f) ** 2.6) * rng.uniform(.4, 1.05)
        grow(f * W, rng.uniform(-.05, .08) * S, rng.normal(.1, .3), L, rng.choice(len(FAMILY), p=WEIGHTS))
    for i in range(12):
        y0 = rng.uniform(.2, 2.6)
        grow(rng.uniform(0, .08) * S, y0 * S, rng.uniform(.2, .7), rng.uniform(.4, 4.3 - y0) * .9, rng.choice(len(FAMILY), p=WEIGHTS))

# ------------------------------------------------------------------
# 2. HANG THE LEAVES
# ------------------------------------------------------------------
leaves = []
for v in vines:
    pts = v["pts"]; seg = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]; total = seg[-1]
    if total < STEP: continue
    s, side = rng.uniform(0, .03) * S, rng.choice([-1, 1])
    while s < total:
        k = min(np.searchsorted(seg, s), len(pts) - 1)
        x, y = pts[k]; a = np.arctan2(*(pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)])[::-1]) if len(pts) > 1 else np.pi / 2
        toTip = (total - s) / S
        young = toTip < .18
        R = rng.uniform(.052, .074) * S * (.5 + .5 * min(1, toTip / .35))   # leaf radius, smaller toward the tip
        fam = v["fam"]
        if rng.random() < .3: fam += rng.integers(-1, 2)
        if young and rng.random() < .5: fam += rng.integers(1, 3)              # young leaves: more gold and green
        fam = int(np.clip(fam, 0, len(FAMILY) - 1))
        pet = rng.uniform(.02, .045) * S                                       # the little stalk
        pa = a + side * rng.uniform(.6, 1.3)                                   # it sticks out to one side
        px, py = x + np.cos(pa) * pet, y + np.sin(pa) * pet
        blade = np.pi / 2 + (pa - np.pi / 2) * .45 + rng.normal(0, .35)          # the leaf hangs mostly downward, a bit outward
        leaves.append(dict(x=x, y=y, px=px, py=py, R=R, ang=blade, fam=fam, d=rng.random(),
                           tilt=rng.uniform(0, 1.05), psi=rng.uniform(0, np.pi), flip=rng.choice([-1, 1]),
                           tint=rng.uniform(.85, 1.12), seed=int(rng.integers(1e9))))
        if toTip > .3 and seg[k] / S < .5 and rng.random() < .6:             # the thick mat at the top: an extra leaf at the node
            leaves.append(dict(leaves[-1], ang=leaves[-1]["ang"] + rng.normal(0, .6), d=rng.random(), seed=int(rng.integers(1e9)),
                               R=R * rng.uniform(.8, 1.05), tilt=rng.uniform(0, 1.05), psi=rng.uniform(0, np.pi)))
        s += rng.uniform(.045, .07) * S; side = -side
print(len(vines), "vines,", len(leaves), "leaves")


# ------------------------------------------------------------------
# 3-4. ONE LEAF: shape, surface, colour and light
# ------------------------------------------------------------------
LOBES = np.array([0.0, 1.25, -1.25])          # the middle lobe points along the leaf; the side lobes out at about 72 degrees


def render_leaf(L):
    r = np.random.default_rng(L["seed"]); R = L["R"]
    n = int(R * 2.6) | 1; half = n // 2
    cx, cy = L["px"] + np.cos(L["ang"]) * R * .42, L["py"] + np.sin(L["ang"]) * R * .42   # the leaf's middle, out along its blade
    yy, xx = np.mgrid[-half:half + 1, -half:half + 1].astype(np.float32)
    # undo the tilt (a leaf turned away from you looks narrower in one direction)
    ps, cs = np.sin(L["psi"]), np.cos(L["psi"]); fore = np.cos(L["tilt"])
    a1 = xx * cs + yy * ps; a2 = -xx * ps + yy * cs; a1 = a1 / fore
    x2, y2 = a1 * cs - a2 * ps, a1 * ps + a2 * cs
    # into the leaf's own frame: "u" runs from the stalk toward the tip, "w" across
    ca, sa = np.cos(L["ang"]), np.sin(L["ang"])
    u = (x2 * ca + y2 * sa) / R + .42; w = (-x2 * sa + y2 * ca) / R
    rho = np.hypot(u - .42, w); phi = np.arctan2(w, u - .42)
    # the outline: three rounded lobes, a notch at the stalk, a toothed edge
    lob = np.max([np.exp(-((np.angle(np.exp(1j * (phi - c)))) / .5) ** 2) * (1 if c == 0 else .82) for c in LOBES], axis=0)
    edge = .62 + .42 * lob - .25 * np.exp(-((np.abs(phi) - np.pi) / .35) ** 2)
    edge *= 1 + .045 * np.sin(phi * (17 + r.integers(0, 6))) + r.normal(0, .02)
    inside = rho / edge
    mask = np.clip((1 - inside) * R * .9, 0, 1)
    if mask.max() == 0: return None
    # the surface: a gentle dome, folded along the middle vein, veins pressed in, a few wrinkles
    hgt = np.sqrt(np.clip(1 - inside ** 2, 0, 1)) * .45
    along = np.abs(w * np.cos(0) - 0)
    hgt += .1 * np.abs(np.sin(phi)) * np.clip(rho / edge, 0, 1) * L["flip"]
    veins = 0
    for c in LOBES:
        dvec = np.abs(rho * np.sin(np.angle(np.exp(1j * (phi - c)))))        # distance from the vein running out to this lobe
        on = (np.cos(np.angle(np.exp(1j * (phi - c)))) > 0)
        veins = np.maximum(veins, np.exp(-(dvec / .045) ** 2) * on * np.clip(1 - rho / edge, 0, 1) ** .3)
    hgt -= .07 * veins
    hgt += .02 * r.normal(0, 1, hgt.shape).cumsum(0).cumsum(1).std() * 0     # (kept flat: no noise in the height)
    gy, gx = np.gradient(hgt * R * .9)
    # the leaf's own tilt adds to the slope of its surface
    nt = np.array([np.sin(L["tilt"]) * np.cos(L["psi"] + np.pi / 2), np.sin(L["tilt"]) * np.sin(L["psi"] + np.pi / 2), np.cos(L["tilt"])]) * np.array([L["flip"], L["flip"], 1])
    N = np.dstack([-gx + nt[0], -gy + nt[1], np.full_like(gx, nt[2])]); N /= np.linalg.norm(N, axis=2, keepdims=True)
    diff = np.clip(N @ LIGHT, 0, 1)
    spec = np.clip(N @ HALF, 0, 1) ** 28 * .32                                  # the waxy glint
    # colour: the vine's colour, a little lighter and yellower in the middle, deeper at the edges, veins paler,
    # a mottle of tiny spots, and leaves near the wall a bit darker (they sit in the others' shade)
    base = COLS[L["fam"]] * L["tint"]
    mid = np.clip(1 - rho / edge, 0, 1)
    col = base[None, None, :] * (.95 + .18 * mid[..., None])
    col = col * (1 - .15 * (1 - mid[..., None]) ** 3) + np.array([.95, .78, .35])[None, None, :] * (.12 * mid[..., None] ** 2) * r.uniform(0, 1)
    col = col + veins[..., None] * .12 * (np.array([1, .9, .6]) - col)
    mott = np.asarray(Image.fromarray((r.random((n // 3 + 2, n // 3 + 2)) * 255).astype(np.uint8)).resize((n, n), Image.BICUBIC), np.float32) / 255
    col = col * (.92 + .16 * mott[..., None])
    shade = .78 + .22 * L["d"]                                                 # nearer the wall = more in shade
    lit = col * (.55 + .68 * diff[..., None]) * shade + spec[..., None]
    lit = np.clip(lit, 0, 1)
    rgba = np.dstack([lit * mask[..., None], mask])
    return rgba, int(round(cx)) - half, int(round(cy)) - half


# ------------------------------------------------------------------
# DRAW: stem shadows, stems, then each leaf (its shadow first), from the wall outward
# ------------------------------------------------------------------
stem_layer = Image.new("RGBA", (W, H)); sd = ImageDraw.Draw(stem_layer)
for v in vines:
    p = v["pts"]
    for off in (o * W for o in OFFS):
        for i in range(len(p) - 1):
            t = v["thick"] * (1 - .55 * i / len(p))
            sd.line([(p[i][0] + off, p[i][1]), (p[i + 1][0] + off, p[i + 1][1])], fill=(92, 42, 34, 255), width=max(1, int(t)))
st = np.asarray(stem_layer, np.float32) / 255
st_a = st[..., 3]
# little holdfasts: the ivy's tiny gripping tendrils, dark specks along the stems
for v in vines:
    for (x, y) in v["pts"][::6]:
        if rng.random() < .5:
            for off in (o * W for o in OFFS):
                sd.line([(x + off, y), (x + off + rng.normal(0, 5), y + rng.normal(4, 3))], fill=(70, 34, 28, 200), width=1)
st = np.asarray(stem_layer, np.float32) / 255
canvas[:] = shadow_of(st[..., 3], .15) + canvas * 0                              # the stems' shadow on the wall
sh = np.roll(np.roll(canvas, int(.004 * S), axis=1), int(.008 * S), axis=0); canvas[:] = sh
stem_rgb = st[..., :3] * (1 + .25 * np.roll(st[..., 3], -1, axis=1)[..., None] - .25 * np.roll(st[..., 3], 1, axis=1)[..., None])   # a lit side and a dark side
over(np.dstack([np.clip(stem_rgb, 0, 1) * st[..., 3:4], st[..., 3:4]]), 0, 0)

leaves.sort(key=lambda L: L["d"])
for i, L in enumerate(leaves):
    out = render_leaf(L)
    if out is None: continue
    rgba, x0, y0 = out
    d = L["d"]
    sh = shadow_of(rgba[..., 3], d)
    over(sh, x0 + int(.3 * (.01 + .06 * d) * S), y0 + int(.8 * (.01 + .06 * d) * S))
    over(rgba, x0, y0)

# ------------------------------------------------------------------
# SAVE: shrink to the final size (smooth edges) and write
# ------------------------------------------------------------------
a = canvas[..., 3:4]
rgb = np.where(a > 1e-4, canvas[..., :3] / np.maximum(a, 1e-4), 0)
img = Image.fromarray((np.dstack([np.clip(rgb, 0, 1), np.clip(a, 0, 1)]) * 255).astype(np.uint8), "RGBA")
img = img.resize((int(WM * FINAL), int(HM_ * FINAL)), Image.LANCZOS)
# SMALLER FILE, SAME LOOK (Oct 2026): most of this picture's weight is its see-through-ness (every leaf's soft shadow).
# Rounding that to 43 levels instead of 256 is invisible, and blanking the colour where it is fully see-through
# (nobody can see it there) lets the file squeeze far smaller: about a quarter less to download.
arr = np.asarray(img).copy(); al = (np.round(arr[..., 3] / 6) * 6).clip(0, 255).astype(np.uint8); arr[..., 3] = al; arr[..., :3][al == 0] = 0
img = Image.fromarray(arr, "RGBA")
img.save(OUT, "WEBP", quality=78, method=6)
print("grew", os.path.basename(OUT), img.size)
