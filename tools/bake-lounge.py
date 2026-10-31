"""NOT RISING · THE POST — THE LOUNGE TEXTURES (the recipe)
-------------------------------------------------------------------
This script paints the pictures the rattan lounge is built from, once,
and saves them in assets/img/post/lounge/. The website never runs it;
it only shows the finished pictures. Keep it so they can be re-painted.

Run it from the site folder:   python3 tools/bake-lounge.py
(needs Python 3 with Pillow and numpy: pip install pillow numpy)

THE BIG IDEA: a "height map"
Every soft thing (a seat cushion, a pillow, the throw) is painted the
same way:
  1. Decide its outline (where the fabric is) and how high the fabric
     puffs up at every point inside it: the HEIGHT MAP. Middle = high,
     edges = rolling down to nothing, like a pillow lying on a table.
  2. Work out which way the surface faces at every point (the slope of
     the height map), then light it from the skylight above: a point
     facing the light is bright, a point turned away is in shadow.
  3. Multiply in a fabric texture (fine noise for linen, ribs for knit,
     loops for bouclé), so it reads as cloth, not plastic.
Because the light is worked out from the shape, the cushions look
stuffed and soft instead of like flat cut-outs.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "post", "lounge")
os.makedirs(OUT, exist_ok=True)
PX = 500                    # pixels per metre the soft things are painted at
rng = np.random.default_rng(1111)

# ---- the palette, warmed up from the colours in Kathi's couch photo ----
LINEN   = (236, 229, 217)   # the seat and back cushions: natural white linen
TERRA   = (170, 84, 60)     # terracotta velvet pillow
MUSTARD = (204, 152, 64)    # mustard velvet pillow
OAT     = (214, 196, 168)   # chunky oat knit pillow
BOUCLE  = (240, 234, 224)   # cream bouclé pillow
BLUSH   = (196, 134, 112)   # dusty-rose linen pillow
THROW   = (206, 168, 122)   # the caramel knit throw (warm against the white linen)
RATTAN  = (176, 132, 82)    # the woven base
LIGHT = np.array([-0.35, -0.75, 0.75]); LIGHT = LIGHT / np.linalg.norm(LIGHT)   # from above, a little from the left


def blur_noise(h, w, size, amount=1.0):
    """soft random lumps about `size` pixels across (used for wrinkles and for fabric texture)"""
    n = rng.random((max(2, h // size + 2), max(2, w // size + 2)))
    img = Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return (np.asarray(img, dtype=np.float32) / 255 - .5) * amount


def shade(height, colour, fabric, sheen=0.0, ambient=.55, strength=.62, scale=40.0):
    """light a height map from the skylight and paint it in a colour; returns an RGB float array (0-1)"""
    gy, gx = np.gradient(height * scale)
    n = np.dstack([-gx, -gy, np.ones_like(height)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    lam = np.clip((n @ LIGHT), 0, 1)
    light = ambient + strength * lam
    if sheen:                                   # velvet: a soft glow where the fabric rolls away from you
        rim = 1 - n[..., 2]
        light += sheen * rim ** 1.5
    c = np.array(colour, dtype=np.float32) / 255
    rgb = c[None, None, :] * light[..., None] * fabric[..., None]
    return np.clip(rgb, 0, 1)


def save(name, rgb, alpha):
    a = (np.clip(alpha, 0, 1) * 255).astype(np.uint8)
    im = Image.fromarray((rgb * 255).astype(np.uint8)).convert("RGBA")
    im.putalpha(Image.fromarray(a))
    im.save(os.path.join(OUT, name), "WEBP", quality=88, method=6)
    print("painted", name, im.size)


def fabric_linen(h, w):
    """linen: fine slubby threads running both ways"""
    f = 1 + blur_noise(h, w, 3, .10) + blur_noise(h, w, 18, .06)
    f += (rng.random((h, 1)) - .5) * .05 + (rng.random((1, w)) - .5) * .05
    return f


def fabric_velvet(h, w):
    return 1 + blur_noise(h, w, 2, .05) + blur_noise(h, w, 30, .08)


def fabric_boucle(h, w):
    """bouclé: little loops, so lots of tiny bright and dark dots"""
    return 1 + blur_noise(h, w, 2, .32) + blur_noise(h, w, 5, .18)


def fabric_knit(h, w, rib=26):
    """chunky knit: vertical rows of little V stitches"""
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    col = (x % rib) / rib
    v = np.abs(((y + np.abs(col - .5) * rib * .9) % (rib * .7)) / (rib * .7) - .5) * 2
    stitch = 1 - .28 * (np.abs(col - .5) * 2) ** 2 - .14 * v
    return stitch + blur_noise(h, w, 3, .06)


# ------------------------------------------------------------------
# 1. THE SEAT CUSHIONS (one cushion is 0.9 m wide, 0.9 m deep, 0.17 m thick)
#    top = the puffy square you sit on;  front = the rolled front edge you see
# ------------------------------------------------------------------
def seat_top():
    w = h = int(.9 * PX)
    y, x = np.mgrid[-1:1:h * 1j, -1:1:w * 1j]
    # a stuffed cushion is fullest in the middle and rolls over at every edge
    height = (1 - np.abs(x) ** 6) * (1 - np.abs(y) ** 6) + .06 * (1 - x ** 2) * (1 - y ** 2)
    height += blur_noise(h, w, 60, .05) + blur_noise(h, w, 14, .012)     # where people have sat: soft dents
    rgb = shade(height, LINEN, fabric_linen(h, w), ambient=.66, strength=.42, scale=30)
    # rounded corners
    r = .08
    alpha = np.ones((h, w))
    cx, cy = np.maximum(np.abs(x) - (1 - r), 0), np.maximum(np.abs(y) - (1 - r), 0)
    alpha[(cx ** 2 + cy ** 2) > r ** 2] = 0
    save("seat-top.webp", rgb, alpha)


def seat_front():
    w, h = int(.9 * PX), int(.17 * PX)
    y, x = np.mgrid[-1:1:h * 1j, -1:1:w * 1j]
    # rolled like a bolster top to bottom, squared off at the ends
    height = np.sqrt(np.clip(1 - y ** 2, 0, 1)) * (1 - np.abs(x) ** 14)
    height += blur_noise(h, w, 24, .03)
    rgb = shade(height, LINEN, fabric_linen(h, w), ambient=.48, strength=.55, scale=6)
    # a piped seam along the top edge, a shadow tucked under the bottom
    seam = np.exp(-((y + .78) / .05) ** 2) * .12
    under = np.clip((y - .55) / .45, 0, 1) ** 2 * .35
    rgb = np.clip(rgb * (1 + seam - under)[..., None], 0, 1)
    alpha = np.ones((h, w))
    save("seat-front.webp", rgb, alpha)


# ------------------------------------------------------------------
# 2. THE BACK CUSHIONS (0.9 m wide, 0.55 m tall, leaning against the back)
# ------------------------------------------------------------------
def back_cushion():
    w, h = int(.9 * PX), int(.55 * PX)
    y, x = np.mgrid[-1:1:h * 1j, -1:1:w * 1j]
    height = (1 - np.abs(x) ** 4) * (1 - np.abs(y) ** 3.5)
    height += blur_noise(h, w, 50, .06) + blur_noise(h, w, 12, .015)
    # pinched in a little at the middle of the top, where the seam pulls
    height -= .08 * np.exp(-(x / .25) ** 2) * np.clip(-y, 0, 1) ** 4
    rgb = shade(height, LINEN, fabric_linen(h, w), ambient=.5, strength=.55, scale=26)
    under = np.clip((y - .6) / .4, 0, 1) ** 2 * .3            # the seat cushion's shadow at its foot
    rgb = np.clip(rgb * (1 - under)[..., None], 0, 1)
    r = .16
    sx, sy = r, r * w / h
    cx, cy = np.maximum(np.abs(x) - (1 - sx), 0) / sx, np.maximum(np.abs(y) - (1 - sy), 0) / sy
    alpha = np.clip((1 - np.sqrt(cx ** 2 + cy ** 2)) * 12, 0, 1)
    save("back-cushion.webp", rgb, alpha)


# ------------------------------------------------------------------
# 3. THE PILLOWS (0.5 m square): the outline has "ears" at the corners and edges
#    that pull in between them, the way a stuffed pillow does
# ------------------------------------------------------------------
def pillow(name, colour, fabric, sheen=0.0, size=.5, tilt=0.0, seed=0):
    global rng
    rng = np.random.default_rng(seed)
    w = h = int(size * PX)
    y, x = np.mgrid[-1.08:1.08:h * 1j, -1.08:1.08:w * 1j]
    th = np.arctan2(y, x)
    m = 5.0
    square = 1 / (np.abs(np.cos(th)) ** m + np.abs(np.sin(th)) ** m) ** (1 / m)
    edge = square * (1 + .035 * np.cos(4 * th + np.pi)) * .93          # corners out, edges in
    edge *= 1 + blur_noise(h, w, 40, .04)
    d = np.sqrt(x ** 2 + y ** 2) / edge
    inside = d < 1
    height = np.sqrt(np.clip(1 - d ** 2.4, 0, 1))
    # creases running in from each corner
    for k in range(4):
        a = np.pi / 4 + k * np.pi / 2
        u = x * np.cos(a) + y * np.sin(a); v = -x * np.sin(a) + y * np.cos(a)
        height -= .06 * np.exp(-(v / .05) ** 2) * np.clip((u - .35) / .6, 0, 1)
    height += blur_noise(h, w, 22, .04)
    fab = fabric(h, w)
    rgb = shade(height, colour, fab, sheen=sheen, ambient=.5, strength=.6, scale=22)
    alpha = np.clip((1 - d) * 40, 0, 1)
    im_rgb, im_a = rgb, alpha
    if tilt:
        pil = Image.fromarray((np.dstack([rgb, alpha[..., None]]) * 255).astype(np.uint8), "RGBA").rotate(tilt, Image.BICUBIC, expand=False)
        arr = np.asarray(pil, dtype=np.float32) / 255
        im_rgb, im_a = arr[..., :3], arr[..., 3]
    save(name, im_rgb, im_a)


# ------------------------------------------------------------------
# 3b. THE BOHEMIAN PILLOWS (Oct 2026): bigger and bunched up, with woven patterns and trims.
#     Same puffy height map as the plain pillows, but the colour is a PATTERN (a kilim, mudcloth, stripes...)
#     instead of one colour, and a trim (tassels, pom-poms, fringe) is added around the edge afterwards.
#     The picture has a margin around the pillow (PAD) so the trims have room to hang.
# ------------------------------------------------------------------
from PIL import ImageDraw
PAD = 1.28                       # the picture runs from -PAD to +PAD; the pillow itself fills -1 to +1
RUST, MUST, CREAM, CHAR, CLAY, BLUSH2 = (166, 72, 44), (206, 152, 58), (238, 228, 208), (54, 47, 44), (190, 104, 72), (204, 146, 124)

def tint(mask, col, base):
    """paint colour col wherever mask is True, on top of base (an H x W x 3 picture)"""
    base[mask] = np.array(col, dtype=np.float32) / 255
    return base

def pat_kilim(u, v):
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), RUST, img)
    fu = (((u + 1) / .5) % 1) - .5                         # a chain of diamonds across the middle
    m = np.abs(fu) * 2 + np.abs(v) / .42
    for lim, col in [(1.0, CHAR), (.8, CREAM), (.58, MUST), (.3, RUST)]: tint(m < lim, col, img)
    tint((np.abs(v) > .5) & (np.abs(v) < .57), CHAR, img)      # a dark line above and below
    zig = np.abs(((u * 4) % 1) - .5)                            # cream zigzag teeth along the top and bottom
    tint((np.abs(v) > .66) & (np.abs(v) - .66 < zig * .5), CREAM, img)
    tint((np.abs(v) > .9), MUST, img)
    return img

def pat_mudcloth(u, v):
    rr = np.random.default_rng(5)
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), CREAM, img)
    jit = blur_noise(u.shape[0], u.shape[1], 14, .05)          # hand-painted: nothing quite straight
    vv = v + jit
    rows = np.floor((vv + 1) / (2 / 7)); fv = ((vv + 1) / (2 / 7)) % 1 - .5
    for r in range(7):
        on = rows == r; kind = r % 4
        if kind == 0: mark = (np.abs(fv) < .09)                                     # a painted line
        elif kind == 1: mark = (np.abs(fv) < .2) & ((((u + jit) * 6) % 1) < .55)     # dashes
        elif kind == 2:                                                              # little crosses
            fu = (((u + jit) * 5) % 1) - .5
            mark = ((np.abs(fu) < .07) & (np.abs(fv) < .32)) | ((np.abs(fv) < .07) & (np.abs(fu) < .3))
        else:                                                                        # dots
            fu = (((u + jit) * 7) % 1) - .5
            mark = (fu ** 2 + (fv * .8) ** 2) < .045
        tint(on & mark, CHAR, img)
    return img

def pat_stripe(u, v):
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), CREAM, img)
    band = ((u + 1) / 2 * 11).astype(int)
    for k, col in enumerate([CLAY, CREAM, RUST, CREAM, CLAY, MUST, CLAY, CREAM, RUST, CREAM, CLAY]):
        tint(band == k, col, img)
    weave = ((np.floor((v + 1) * 40) + np.floor((u + 1) * 40)) % 2) * .06      # a tiny woven check
    return img * (1 - weave[..., None])

def pat_lumbar(u, v):
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), CREAM, img)
    m = np.abs(u) / .55 + np.abs(v) / .8                                         # an embroidered medallion in the middle
    for lim, col in [(1.0, RUST), (.82, CREAM), (.66, MUST), (.44, CHAR), (.24, MUST)]: tint(m < lim, col, img)
    side = np.abs(((u * 3) % 1) - .5) * 2                                        # rows of little triangles out to each end
    tint((np.abs(u) > .62) & (np.abs(v) < .45 - side * .45) & (np.abs(v) > .12), RUST, img)
    tint((np.abs(u) > .62) & (np.abs(v) < .06), CHAR, img)
    tint((np.abs(v) > .82), CLAY, img)
    return img

# ---- THE LEATHER AND MUDCLOTH SET (Oct 2026, after Kathi's pillow photos): cognac leather, white mudcloth with
#      black dashes, black mudcloth with white dashes, and the mixes of them; plus spotted faux fur from her fur photo ----
LEATHER, MUDW, MUDB = (150, 86, 52), (236, 230, 216), (28, 26, 25)

def leather(u, v):
    """cognac leather: a warm brown with a fine pebbled grain and soft creases"""
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), LEATHER, img)
    grain = 1 + blur_noise(u.shape[0], u.shape[1], 2, .09) + blur_noise(u.shape[0], u.shape[1], 18, .1)
    return img * grain[..., None]

def dashes(u, v, ink, seed, cols=3, rows=6, lenr=(.32, .5), thick=.055):
    """hand-painted mudcloth dashes, on a loose staggered grid: a mask"""
    r = np.random.default_rng(seed); m = np.zeros(u.shape, bool)
    for j in range(rows):
        for i in range(cols):
            cx = -1 + (i + .5 + (.35 if j % 2 else -.1) + r.normal(0, .08)) * 2 / cols
            cy = -1 + (j + .5 + r.normal(0, .08)) * 2 / rows
            L = r.uniform(*lenr); tilt = r.normal(0, .04)
            m |= (np.abs(u - cx) < L / 2) & (np.abs(v - cy - (u - cx) * tilt) < thick * (1 + .12 * np.sin((u - cx) * 9 + j)))
    return m

def pat_mudwhite(u, v):
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), MUDW, img)
    tint(dashes(u, v, 0, 41), MUDB, img)
    tint(np.abs(u - .02) < .006, (200, 194, 180), img)                      # the faint seam where two strips are sewn
    return img

def pat_mudblack(u, v):
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), MUDB, img)
    tint(dashes(u, v, 0, 42, cols=2, rows=5, lenr=(.28, .42)), MUDW, img)
    tint(np.abs(u + .05) < .007, (60, 56, 52), img)
    return img

def pat_leathersplit(u, v):
    img = leather(u, v)
    panel = (u > -.62) & (u < .02)                                           # a white mudcloth panel down the left side
    tint(panel, MUDW, img)
    tint(panel & (np.abs(v - .02) < .045) & (u > -.5) & (u < -.08), MUDB, img)   # with one black dash across it
    return img

def pat_centrestripe(u, v):
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), MUDW, img)
    tint(np.abs(u) < .16, MUDB, img)                                        # a black woven band down the middle...
    img[np.abs(u) < .16] *= (1 + (np.sin(v[np.abs(u) < .16] * 140) * .12))[..., None]
    tint(np.abs(u) < .055, LEATHER, img)                                    # ...with a strip of leather down its centre
    return img

def pat_arrow(u, v):
    img = np.zeros(u.shape + (3,), np.float32); tint(np.ones(u.shape, bool), MUDW, img)
    for row in (-.72, -.32, .08):                                           # three rows of black arrowheads (>>>)
        fu = ((u + 1) * 3.2) % 1
        chev = np.abs(fu - .5 + np.abs(v - row) * 1.9) < .1
        tint(chev & (np.abs(v - row) < .17) & (u > -.92) & (u < .92), MUDB, img)
    tint(v > .36, LEATHER, img)                                             # and the bottom third cognac leather
    img[v > .36] *= (1 + blur_noise(u.shape[0], u.shape[1], 2, .09)[v > .36])[..., None]
    return img

FURPHOTO = None
def pat_fur(ox, oy):
    """spotted faux fur: Kathi's fur photo itself, mapped onto the pillow (ox, oy = which part of the photo)"""
    def f(u, v):
        global FURPHOTO
        if FURPHOTO is None: FURPHOTO = np.asarray(Image.open(os.path.join(os.path.dirname(__file__), "ref", "faux-fur.webp")).convert("RGB"), np.float32) / 255
        H_, W_ = FURPHOTO.shape[:2]; span = .62
        x = np.clip(((u * .5 + .5) * span + ox) * W_, 0, W_ - 1).astype(int)
        y = np.clip(((v * .5 + .5) * span + oy) * H_, 0, H_ - 1).astype(int)
        return FURPHOTO[y, x] * 1.05
    return f

def fabric_fur(h, w):
    """fur: long soft strands, so streaks running downward"""
    n = np.random.default_rng(9).random((max(2, h // 14), w // 2 + 2))
    streak = np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
    return .9 + .2 * streak

def solid(col): return lambda u, v: np.broadcast_to(np.array(col, np.float32) / 255, u.shape + (3,)).copy()

def boho_pillow(name, wm, hm, pattern, fabric, trim=None, trim_col=CREAM, sheen=0.0, seed=0):
    global rng
    rng = np.random.default_rng(seed)
    w, h = int(wm * PAD * PX), int(hm * PAD * PX)
    v, u = np.mgrid[-PAD:PAD:h * 1j, -PAD:PAD:w * 1j]
    th = np.arctan2(v, u)
    m = 5.0
    square = 1 / (np.abs(np.cos(th)) ** m + np.abs(np.sin(th)) ** m) ** (1 / m)
    edge = square * (1 + .04 * np.cos(4 * th + np.pi)) * .97 * (1 + blur_noise(h, w, 40, .03))
    d = np.sqrt(u ** 2 + v ** 2) / edge
    height = np.sqrt(np.clip(1 - d ** 2.2, 0, 1))
    for k in range(4):                                               # creases from the corners, where it is stuffed tight
        a = np.pi / 4 + k * np.pi / 2
        p_ = u * np.cos(a) + v * np.sin(a); q_ = -u * np.sin(a) + v * np.cos(a)
        height -= .07 * np.exp(-(q_ / .05) ** 2) * np.clip((p_ - .3) / .6, 0, 1)
    height += blur_noise(h, w, 26, .05)
    # the pattern bends with the fabric: sample it a little pulled in where the pillow puffs up
    col = pattern(u * (1 + .06 * height), v * (1 + .06 * height))
    gy, gx = np.gradient(height * 22)
    n = np.dstack([-gx, -gy, np.ones_like(height)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    light = .5 + .6 * np.clip(n @ LIGHT, 0, 1) + sheen * (1 - n[..., 2]) ** 1.5
    rgb = np.clip(col * (light * fabric(h, w))[..., None], 0, 1)
    alpha = np.clip((1 - d) * 40, 0, 1)
    im = Image.fromarray(np.dstack([rgb * 255, alpha[..., None] * 255]).astype(np.uint8), "RGBA")
    # THE TRIM, drawn on top
    dr = ImageDraw.Draw(im)
    px = lambda x, y: ((x + PAD) / (2 * PAD) * w, (y + PAD) / (2 * PAD) * h)
    tc = tuple(int(c) for c in trim_col)
    dark = tuple(int(c * .7) for c in trim_col)
    unit = w / (2 * PAD)                                           # pixels per half-pillow-width
    if trim == "fur":                                              # faux fur: hairs standing out past the outline, all round
        src = np.asarray(im, np.float32)
        rr2 = np.random.default_rng(seed + 100)
        for k in range(2600):
            t = rr2.random() * 2 * np.pi
            e = (1 / (abs(np.cos(t)) ** 5 + abs(np.sin(t)) ** 5) ** .2) * .93      # a point just inside the edge
            x0, y0 = px(np.cos(t) * e, np.sin(t) * e)
            ix, iy = int(np.clip(x0, 0, w - 1)), int(np.clip(y0, 0, h - 1))
            c = tuple(int(v) for v in src[iy, ix, :3]) + (int(200 + rr2.random() * 55),)
            L = unit * (.05 + .09 * rr2.random()); a2 = t + rr2.normal(0, .35)
            dr.line([(x0, y0), (x0 + np.cos(a2) * L, y0 + np.sin(a2) * L + L * .25)], fill=c, width=max(1, int(unit * .008)))
    if trim == "tassels":                                          # a tassel hanging from each corner
        for sx in (-1, 1):
            for sy in (-1, 1):
                cx, cy = px(sx * .93, sy * .9)
                L = unit * .26
                for k in range(16):
                    ox = (k - 7.5) / 7.5 * unit * .05
                    dr.line([(cx, cy), (cx + ox * 1.6 + sx * unit * .03, cy + L)], fill=(dark if k % 3 == 0 else tc), width=max(1, int(unit * .012)))
                dr.ellipse([cx - unit * .05, cy - unit * .05, cx + unit * .05, cy + unit * .06], fill=tc)
                dr.line([(cx - unit * .045, cy + unit * .06), (cx + unit * .045, cy + unit * .06)], fill=dark, width=max(1, int(unit * .02)))
    if trim == "pompoms":                                          # little balls of wool all round the edge
        r = unit * .055
        for t in np.linspace(0, 1, 15)[:-1]:
            for (x0, y0, x1, y1) in [(-1, -1, 1, -1), (1, -1, 1, 1), (1, 1, -1, 1), (-1, 1, -1, -1)]:
                x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
                x *= .97 - .03 * abs(np.sin(np.pi * t)); y *= .97 - .03 * abs(np.sin(np.pi * t))
                cx, cy = px(x * 1.04, y * 1.04)
                dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=dark)
                dr.ellipse([cx - r * .85, cy - r * .95, cx + r * .7, cy + r * .6], fill=tc)
    if trim == "fringe":                                           # a fringe of loose threads along the top and bottom
        for sy in (-1, 1):
            for k in range(70):
                x = -.92 + 1.84 * k / 69
                cx, cy = px(x, sy * .97)
                L = unit * (.12 + .04 * np.sin(k * 1.7))
                dr.line([(cx, cy), (cx + unit * .01 * np.sin(k), cy + sy * L)], fill=(dark if k % 4 == 0 else tc), width=max(1, int(unit * .014)))
    # its soft shadow, baked in (down a little, in the margin round the pillow; it used to be a live CSS drop-shadow)
    sh = Image.new("RGBA", im.size, (40, 24, 12, 0))
    sh.putalpha(im.split()[-1].filter(ImageFilter.GaussianBlur(unit * .05)).point(lambda v: int(v * .35)))
    sh = sh.transform(sh.size, Image.AFFINE, (1, 0, 0, 0, 1, -unit * .035)); sh.alpha_composite(im); im = sh
    im.save(os.path.join(OUT, name), "WEBP", quality=88, method=6)
    print("painted", name, im.size)


# ------------------------------------------------------------------
# 4. THE THROW: a cream knit blanket tossed over the corner seat.
#    top = the part lying on the seat (0.95 x 0.75 m), with soft folds
#    fall = the part hanging over the front edge (0.95 x 0.32 m), with a fringe
# ------------------------------------------------------------------
def throw():
    global rng
    rng = np.random.default_rng(7)
    w, h = int(.95 * PX), int(.75 * PX)
    y, x = np.mgrid[0:1:h * 1j, 0:1:w * 1j]
    folds = .5 + .5 * np.sin((x * 3.1 + y * 1.4 + blur_noise(h, w, 80, .6)) * np.pi * 2)
    height = folds * .5 + blur_noise(h, w, 40, .3)
    rgb = shade(height, THROW, fabric_knit(h, w, rib=18), ambient=.62, strength=.45, scale=12)
    # a ragged, tossed outline (not a neat rectangle)
    edge = .04 + blur_noise(h, w, 160, .05)
    # (the top of the picture lies at the back of the seat; the bottom is the front edge, where it runs on
    #  over the edge into the hanging part, so that edge stays straight)
    alpha = np.clip((np.minimum(np.minimum(x, 1 - x), y) - np.clip(edge, 0, .2)) * 60, 0, 1)
    alpha = np.maximum(alpha, (y > .9) * np.clip(np.minimum(x, 1 - x) * 80, 0, 1))
    save("throw-top.webp", rgb, alpha)
    # the same piece turned a quarter, for lying across the END of a seat (its straight edge on the right, at the end)
    im = Image.open(os.path.join(OUT, "throw-top.webp")).rotate(90, expand=True)
    im.save(os.path.join(OUT, "throw-end.webp"), "WEBP", quality=88, method=6); print("painted throw-end.webp", im.size)

    w, h2 = int(.95 * PX), int(.34 * PX)
    y, x = np.mgrid[0:1:h2 * 1j, 0:1:w * 1j]
    folds = .5 + .5 * np.sin((x * 6.3 + blur_noise(h2, w, 60, .5)) * np.pi * 2)   # hanging folds run straight down
    height = folds * .7
    rgb = shade(height, THROW, fabric_knit(h2, w, rib=18), ambient=.52, strength=.5, scale=10)
    rgb *= (1 - .25 * y)[..., None]                       # a little darker toward the bottom
    hem = .78 + blur_noise(h2, w, 50, .14)                # the uneven hem, then a fringe of tassels below it
    fringe = (np.sin(x * w / 5.5) > .1) & (y < hem + .16)
    alpha = np.where(y < hem, 1.0, np.where(fringe, 1.0, 0.0))
    alpha *= np.clip(np.minimum(x, 1 - x) * 80, 0, 1)
    save("throw-fall.webp", np.clip(rgb, 0, 1), alpha)


# ------------------------------------------------------------------
# 5. THE RATTAN: the woven base of the sofa (one repeat is 0.4 x 0.2 m).
#    Flat reeds (the "weavers") run across, passing over one upright stake and under the next.
#    Where a weaver dips under, you see the stake instead: that makes the little checkerboard of wicker.
# ------------------------------------------------------------------
def rattan():
    global rng
    rng = np.random.default_rng(3)
    w, h = 480, 240                                       # 1200 px per metre: fine enough to see the weave
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    row, stake = 15.0, 24.0
    r = np.floor(y / row); fy = (y % row) / row
    c = np.floor(x / stake); fx = (x % stake) / stake
    over = ((r + c) % 2 == 0)                             # True: the weaver is on top here
    weaver = .55 + .5 * np.sin(fy * np.pi) ** .7          # a weaver is a flat rounded strip (lit across its middle)
    weaver *= .8 + .2 * np.sin(fx * np.pi)                # it bends down at each end of its run
    sx = np.abs(fx - .5) / .32                            # the stake, seen in the gap: a round upright reed
    stk = np.where(sx < 1, .45 + .45 * np.sqrt(np.clip(1 - sx ** 2, 0, 1)), .3)
    stk *= .75 + .25 * np.sin(fy * np.pi)                 # in the shadow of the weavers above and below it
    tone = np.where(over, weaver, stk)
    shade_row = rng.random(int(h // row) + 2)[r.astype(int)]
    tone *= 1 + (shade_row - .5) * .16                    # every weaver a slightly different shade
    tone *= 1 + blur_noise(h, w, 5, .10) + blur_noise(h, w, 2, .07)   # the grain of the cane
    col = np.array(RATTAN, dtype=np.float32) / 255
    rgb = np.clip(col[None, None, :] * tone[..., None] * 1.12, 0, 1)
    save("rattan.webp", rgb, np.ones((h, w)))


# ------------------------------------------------------------------
# 6. THE POUF: the round tufted pouf from Kathi's couch photo, painted whole (the photo had cut it off).
#    0.6 m across and 0.4 m tall, seen from standing height, so its top is a flattened circle.
#    Its velvet is pulled into puffed diamonds by buttons, on the top and all round the side.
# ------------------------------------------------------------------
def pouf():
    global rng
    rng = np.random.default_rng(21)
    R, T, K = .3, .4, .3                                  # radius, height (m); K = how flat the top looks
    w, h = int(2 * R * PX), int((T + 2 * R * K) * PX)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    X = (xx - w / 2) / PX                                 # metres from the middle
    Y = yy / PX                                           # metres down from the top of the picture
    yc = R * K                                            # the middle of the top circle
    # the sides bulge a little, like a stuffed drum
    def bulge(v): return 1 + .05 * np.sin(np.clip(v, 0, 1) * np.pi)
    Xn = np.clip(X / R, -1, 1)
    topEdge = yc + R * K * np.sqrt(np.clip(1 - Xn ** 2, 0, 1))      # the near rim of the top
    v = (Y - topEdge) / T                                 # 0 at the rim, 1 at the floor
    bottom = topEdge + T
    rTop = np.sqrt(X ** 2 + ((Y - yc) / K) ** 2) / R      # how far across the top circle (0 middle, 1 rim)
    isTop = (rTop <= 1) & (Y <= topEdge + .003)
    isSide = (~isTop) & (np.abs(X) <= R * bulge(v)) & (Y > yc) & (Y <= bottom)

    # the tufting: puffed diamonds between buttons (on a lattice turned 45 degrees)
    def diamonds(a, b, n):
        p, q = (a + b) * n, (a - b) * n
        fp, fq = p - np.floor(p), q - np.floor(q)
        puff = (np.sin(fp * np.pi) * np.sin(fq * np.pi)) ** .6
        return puff
    theta = np.arcsin(Xn)                                 # where round the side we are
    side_h = diamonds(theta / np.pi * 2.2, v * 1.1, 2.0)
    tX, tZ = X / R, (Y - yc) / (R * K)
    top_h = diamonds(tX * .9, tZ * .9, 1.6) * np.clip((1 - rTop) * 4, 0, 1)
    hgt = np.where(isTop, top_h, side_h)
    gy, gx = np.gradient(hgt * 6)
    # the basic way each surface faces: the top faces up; the side faces out (and a little up near the top)
    nx = np.where(isTop, 0, Xn * .95)
    ny = np.where(isTop, -.95, -.35 * (1 - 2 * np.clip(v, 0, 1)))
    nz = np.where(isTop, .3, np.sqrt(np.clip(1 - Xn ** 2, 0, 1)))
    roll = np.clip((rTop - .82) / .18, 0, 1) * isTop      # the top rolls over into the side at its rim
    ny = ny * (1 - roll) + (-.2) * roll; nz = nz * (1 - roll) + .9 * roll
    n = np.dstack([nx - gx, ny - gy, nz]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    lam = np.clip(n @ LIGHT, 0, 1)
    light = .42 + .62 * lam + .25 * (1 - n[..., 2]) ** 2            # velvet sheen where it turns away
    # the buttons: little dark dimples at the lattice points
    light *= 1 - .45 * np.exp(-(hgt / .12) ** 2) * (isTop | isSide)
    light *= np.where(isSide, 1 - .35 * np.clip((v - .75) / .25, 0, 1), 1)   # darker at the floor
    colour = np.array((196, 124, 104), dtype=np.float32) / 255
    rgb = np.clip(colour[None, None, :] * light[..., None] * fabric_velvet(h, w)[..., None], 0, 1)
    alpha = (isTop | isSide).astype(np.float32)
    alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0)), dtype=np.float32) / 255
    save("pouf.webp", rgb, alpha)


if __name__ == "__main__":
    seat_top(); seat_front(); back_cushion()
    # (the first, plain pillows - pillow() - were replaced by the bohemian ones below in Oct 2026)
    throw(); rattan(); pouf()
    # (the first bohemian set - kilim, mudcloth with tassels, pom-poms, stripe, lumbar, rust, boucle - was replaced
    #  in Oct 2026 by the leather-and-mudcloth set below; its pattern recipes are still above)
    boho_pillow("boho-leather.webp", .6, .6, leather, fabric_linen, None, sheen=.25, seed=51)
    boho_pillow("boho-mudwhite.webp", .6, .6, pat_mudwhite, fabric_linen, None, seed=52)
    boho_pillow("boho-mudblack.webp", .58, .58, pat_mudblack, fabric_linen, None, seed=53)
    boho_pillow("boho-split.webp", .62, .62, pat_leathersplit, fabric_linen, None, sheen=.15, seed=54)
    boho_pillow("boho-centre.webp", .6, .6, pat_centrestripe, fabric_linen, None, seed=55)
    boho_pillow("boho-arrow.webp", .6, .6, pat_arrow, fabric_linen, None, sheen=.1, seed=56)
    boho_pillow("boho-fur1.webp", .62, .62, pat_fur(.1, .12), fabric_fur, "fur", seed=57)
    boho_pillow("boho-fur2.webp", .58, .58, pat_fur(.3, .25), fabric_fur, "fur", seed=58)

    # ------------------------------------------------------------------
    # FINISHING (Oct 2026, for speed): the small colour tweaks the website used to make LIVE with CSS filters
    # (a touch of warm sepia on the linen, the rattan a little darker, the throw a little brighter) are baked into
    # the pictures here instead. A filter in a 3D room makes the browser redraw that piece on every frame, so
    # baking them in is what keeps the room smooth when you scroll.
    # ------------------------------------------------------------------
    def finish(name, bright=1.0, sepia=0.0, sat=1.0):
        path = os.path.join(OUT, name); im = Image.open(path).convert("RGBA")
        a = np.asarray(im, np.float32) / 255; rgb, al = a[..., :3], a[..., 3:]
        if sepia:
            sp = rgb @ np.array([[.393, .349, .272], [.769, .686, .534], [.189, .168, .131]], np.float32)
            rgb = rgb * (1 - sepia) + np.clip(sp, 0, 1) * sepia
        if sat != 1: g = rgb.mean(axis=2, keepdims=True); rgb = g + (rgb - g) * sat
        rgb = np.clip(rgb * bright, 0, 1)
        Image.fromarray((np.dstack([rgb, al]) * 255).astype(np.uint8), "RGBA").save(path, "WEBP", quality=88, method=6)
    finish("seat-top.webp", 1.04, .08); finish("seat-front.webp", 1.0, .08); finish("back-cushion.webp", .97, .08)
    finish("rattan.webp", .92, 0, .95); finish("throw-end.webp", 1.05); finish("throw-fall.webp", .95)
