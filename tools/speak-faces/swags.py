"""THE TOP: lace swags draped across the top of the screen, under the pine garland (Nov 22, Kathi: "more lace draped
at the top too"). Drawn from scratch, like the side curtains (curtains.py), with the same lace (lace.py).

  0. A SECOND TIER behind (added when she asked for more): six deeper festoons, offset so their low points fill
     the gaps where the front ones meet
  1. FIVE FESTOONS: lace hung from under the garland, each sagging in a soft curve, its folds running in arcs
     (a swag's folds follow its curve), a scalloped border along its lower edge and a thin sheer lining behind
     (tried: narrow lace tails where they meet; they read as stripes, so the festoons overlap there instead)
  2. CORNER TAILS: lace falling down both top corners of the arch, hem cut on a slant
  3. what's IN FRONT stays in front: the garland itself, its red baubles, the red bow and its tails, the glass
     baubles and their strings. The macrame valance hangs BEHIND the lace now: its fringe shows below the swags.
All positions are in the hall picture's pixels (3200 x 4800)."""
import cv2, numpy as np
import lace
from curtains import lerp, lab2bgr, sample, TILE, TONE, EDGE, ETONE, BAUBLES, STRINGS, R

BOX = (360, 1760, 2800, 2440)             # where the work happens
SS = 2
TOP_Y = 1800                              # the swags hang from here, up behind the garland, so it hides their top
JOINS = [400, 870, 1335, 1815, 2280, 2750]                    # where festoons meet (the outer two tuck behind the garland's arms)
DEPTH = [204, 220, 234, 220, 204]                             # how far each festoon sags (the middle one deepest)
OVERLAP = 30                                                  # neighbours overlap a little where they meet
# THE SECOND TIER (Nov 22, "more lace draped at the top"): a deeper row hung behind the first, offset so each of its
# low points falls under a join of the front row and fills the V there; it shows as a second scalloped edge below
BACK_JOINS = [400, 635, 1102, 1575, 2047, 2515, 2750]
BACK_DEPTH = [228, 288, 296, 296, 288, 228]
BACK_DIM = 0.88                                               # further back, a little more in shadow
# THE CORNER TAILS: lace falling down each top corner of the arch in front of the macrame cascade, its hem cut on a
# slant (longest on the outside), leading the eye down into the side drapes. Left one; the right is its mirror.
CORNER = dict(x0=498, x1=622, hem_in=2235, hem_out=2395)
MID = 1575
# the garland's arms come down the sides of the arch: there, needles, lights and baubles stay in front of the tails
ARMS = [[(372, 1880), (575, 1880), (575, 2460), (372, 2460)], [(2575, 1880), (2790, 1880), (2790, 2460), (2575, 2460)]]
TAIL = dict(w=30, top=2030, slant=46)     # a tail: half-width, where its slanted hem starts, how much it slants
LIGHT = 90                                # a white cloth's brightness up here, under the garland's lights
IVORY = (4.0, 11.5)                       # the lace's colour (a, b), the same warm ivory as the side curtains

# the garland's lower edge (measured): above it, everything is garland and stays in front
GARLAND = [(400, 2300), (470, 2000), (520, 1950), (600, 1885), (700, 1862), (800, 1835), (900, 1850), (1000, 1832),
           (1100, 1842), (1200, 1832), (1300, 1842), (1400, 1832), (1800, 1842), (1900, 1850), (2000, 1840),
           (2100, 1832), (2200, 1850), (2300, 1832), (2400, 1822), (2500, 1850), (2600, 1900), (2650, 1950),
           (2700, 2000), (2760, 2200)]
RED_BAUBLES = [(852, 1882, 50), (2430, 1872, 52), (505, 1945, 38)]   # the garland's red baubles that hang down low
BOW = [[(1400, 1575), (1590, 1575), (1590, 1640), (1572, 1705), (1554, 1958), (1538, 1990), (1500, 1962), (1450, 1890),
        (1446, 1720), (1408, 1702)],
       [(1600, 1575), (1792, 1575), (1786, 1722), (1746, 1732), (1746, 1886), (1692, 1956), (1650, 1992), (1632, 1960),
        (1620, 1705), (1604, 1640)]]

def festoons(X, Y, joins=JOINS, depth=DEPTH, dim=1.0):
    """Colour and cover of one row of festoons (and their soft shadow below)."""
    img = np.zeros(X.shape + (3,), np.float32); a = np.zeros(X.shape, np.float32); shadow = np.zeros(X.shape, np.float32)
    for k in range(len(depth)):
        xa, xb, D = joins[k], joins[k + 1], depth[k]
        xa, xb = xa - OVERLAP, xb + OVERLAP
        s = (X - xa) / (xb - xa)
        on = (s > -0.01) & (s < 1.01)
        sc = np.clip(s, 0, 1)
        yb = TOP_Y + D * (0.14 + 0.86 * np.clip(np.sin(np.pi * sc), 0, 1) ** 0.72)       # the lower edge's curve
        H = np.maximum(yb - TOP_Y, 1)
        r = (Y - TOP_Y) / H                                                # 0 at the top, 1 at the lower edge
        inside = on & (r >= 0) & (r <= 1)
        # folds: arcs that follow the curve, crowding at the ends where all the cloth is gathered into the join
        Nf = 4.5
        phi = 2 * np.pi * Nf * np.clip(r, 0, 1) ** 0.9 + 0.6 * np.sin(sc * 7 + k)
        gathered = np.clip(D / H, 1, 6)
        u = sc * (xb - xa) * 1.25                                          # fabric position along the swag
        v = r * 300 + 300 / Nf / (2 * np.pi) * 0.8 * np.sin(phi)           # ...and down it (300 px of cloth, folded)
        ts = 1.15
        thread = sample(TILE, u * ts, v * ts); tone = sample(TONE, u * ts, v * ts)
        d = yb - Y                                                         # up from the lower edge
        edge = d < 19
        eu = np.clip(d * 1.4, 0, 25.9)
        thread = np.where(edge, sample(EDGE, eu, u * ts), thread); tone = np.where(edge, sample(ETONE, eu, u * ts), tone)
        cov = 1 - (1 - 0.93 * thread) ** np.clip(gathered * (1 + 0.3 * np.cos(phi)), 0.6, 4)
        lining = np.where(edge, 0.0, np.clip(0.62 * gathered, 0.62, 0.92))  # a sheer lining behind the lace (not the border)
        shade = 0.94 - 0.18 * np.cos(phi) + 0.05 * np.cos(2 * phi)
        g = np.interp(X, np.array(GARLAND)[:, 0], np.array(GARLAND)[:, 1])
        shade *= 0.62 + 0.38 * np.clip((Y - g) / 55, 0, 1)                  # in the garland's shadow right under it
        shade *= 0.86 + 0.20 * np.sin(np.pi * sc) ** 2                      # the swag's belly catches the most light
        shade *= 1 - 0.25 * np.clip((gathered - 1.5) / 3, 0, 1)             # the gathered ends sit deeper in shadow
        L = LIGHT * dim * shade * tone
        col = lab2bgr(L, np.full_like(X, IVORY[0]), np.full_like(X, IVORY[1]))
        lin = lab2bgr(LIGHT * dim * 0.80 * shade, np.full_like(X, IVORY[0]), np.full_like(X, IVORY[1] - 1))
        cover = np.clip(lining + (1 - lining) * cov, 0, 1)
        mix = np.where((cover > 0)[..., None], (lin * (lining * (1 - cov))[..., None] + col * cov[..., None]) / np.maximum(cover, 1e-4)[..., None], 0)
        soft = np.clip((yb - Y) + 0.5, 0, 1) * np.clip(Y - TOP_Y + 0.5, 0, 1) * on
        cover = cover * soft
        img = img * (1 - cover[..., None]) + mix * cover[..., None]; a = np.maximum(a, cover)
        below = on & (Y > yb)                                              # the swag's soft shadow on what's behind
        shadow = np.maximum(shadow, below * np.exp(-np.maximum(Y - yb - 4, 0) / 14) * 0.40)
    return img, a, shadow

def corner_tails(X, Y):
    """The two lace tails down the arch's top corners. Worked out in the left one's coordinates (the right reads
    them mirrored about the screen's middle): 4 soft folds, lace on a sheer lining, a scalloped slanted hem."""
    img = np.zeros(X.shape + (3,), np.float32); a = np.zeros(X.shape, np.float32)
    for mirror in (False, True):
        x = 2 * MID - X if mirror else X
        x0, x1 = CORNER['x0'], CORNER['x1']; w = x1 - x0
        f = (x - x0) / w                                                  # 0 on the outside, 1 on the inside
        hem = CORNER['hem_out'] + (CORNER['hem_in'] - CORNER['hem_out']) * f
        on = (f >= 0) & (f <= 1) & (Y > TOP_Y) & (Y < hem)
        phi = 2 * np.pi * 4 * f + 0.5 * np.sin(Y / 90) + 0.3 * np.sin(Y / 37)
        u = f * w * 1.7 + 0.7 * (w * 1.7 / 4) / (2 * np.pi) * np.sin(phi); v = Y - TOP_Y
        ts = 1.15
        thread = sample(TILE, u * ts, v * ts); tone = sample(TONE, u * ts, v * ts)
        d = hem - Y
        edge = d < 18
        thread = np.where(edge, sample(EDGE, np.clip(d * 1.45, 0, 25.9), u * ts), thread)
        tone = np.where(edge, sample(ETONE, np.clip(d * 1.45, 0, 25.9), u * ts), tone)
        cov = 1 - (1 - 0.95 * thread ** 0.8) ** (1.6 * (1 + 0.35 * np.cos(phi)))
        lining = np.where(edge, 0.0, 0.66)
        g = np.interp(np.clip(X, 360, 2800), np.array(GARLAND)[:, 0], np.array(GARLAND)[:, 1])
        shade = (0.95 - 0.16 * np.cos(phi) + 0.05 * np.cos(2 * phi)) * (0.62 + 0.38 * np.clip((Y - g) / 55, 0, 1))
        shade *= 0.80 + 0.20 * f                                          # the outer side turns into the garland's shade
        col = lab2bgr(LIGHT * shade * tone, np.full_like(X, IVORY[0]), np.full_like(X, IVORY[1]))
        lin = lab2bgr(LIGHT * 0.80 * shade, np.full_like(X, IVORY[0]), np.full_like(X, IVORY[1] - 1))
        cover = np.clip(lining + (1 - lining) * cov, 0, 1)
        mix = np.where((cover > 0)[..., None], (lin * (lining * (1 - cov))[..., None] + col * cov[..., None]) / np.maximum(cover, 1e-4)[..., None], 0)
        soft = np.clip(f * w + 0.5, 0, 1) * np.clip((1 - f) * w + 0.5, 0, 1) * np.clip(hem - Y + 0.5, 0, 1) * (Y > TOP_Y)
        cover = cover * soft
        img = img * (1 - cover[..., None]) + mix * cover[..., None]; a = np.maximum(a, cover)
    return img, a

def front(crop, ox, oy):
    sh = crop.shape[:2]
    ys = np.arange(sh[0], dtype=np.float32)[:, None] + oy; xs = np.arange(sh[1], dtype=np.float32)[None, :] + ox
    g = np.array(GARLAND, np.float32); edge = np.interp(xs, g[:, 0], g[:, 1])
    F = np.clip((edge - ys) / 6 + 0.5, 0, 1)                               # everything above the garland's edge
    # the garland's own needles, lights and baubles that dip a little below that line
    lab = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB).astype(np.float32)
    L, aa, bb = lab[..., 0] / 2.55, lab[..., 1] - 128, lab[..., 2] - 128
    dip = (ys < edge + 30) & (((aa < -3) & (np.hypot(aa, bb) > 5)) | (L > 82) | ((np.hypot(aa, bb) > 40) & (L > 22)))
    F = np.maximum(F, cv2.GaussianBlur(dip.astype(np.float32), (0, 0), 0.8))
    arms = np.zeros(sh, np.float32)
    for p in ARMS: cv2.fillPoly(arms, [(np.array(p, np.float32) - [ox, oy]).astype(np.int32)], 1)
    C = np.hypot(aa, bb); hue = np.degrees(np.arctan2(bb, aa))
    arm_front = (arms > 0) & (((aa < -3) & (C > 5)) | (L > 80) | ((C > 40) & (L > 22)) | ((hue > 44) & (C > 20) & (L > 35)))
    F = np.maximum(F, cv2.GaussianBlur(arm_front.astype(np.float32), (0, 0), 0.8))
    m = np.zeros(sh, np.float32)
    for x, y, r in RED_BAUBLES: cv2.circle(m, (int(x - ox), int(y - oy)), int(r), 1, -1, cv2.LINE_AA)
    for p in BOW: cv2.fillPoly(m, [(np.array(p, np.float32) - [ox, oy]).astype(np.int32)], 1, cv2.LINE_AA)
    F = np.maximum(F, cv2.GaussianBlur(m, (0, 0), 1.0))
    for x, y, r in BAUBLES:                                                # the glass baubles: lit glass and metal
        c = np.zeros(sh, np.float32); cv2.circle(c, (int(x - ox), int(y - oy)), int(r), 1, -1, cv2.LINE_AA)
        F = np.maximum(F, c * np.clip((L - 30) / 30, 0, 1))
    for x0, y0, x1, y1, w in STRINGS:
        s = np.zeros(sh, np.float32); cv2.line(s, (int(x0 * R - ox), int(y0 * R - oy)), (int(x1 * R - ox), int(y1 * R - oy)), 1, max(1, int(w * R)), cv2.LINE_AA)
        F = np.maximum(F, s)
    return np.clip(F, 0, 1)

def top(img):
    x0, y0, x1, y1 = BOX
    crop = img[y0:y1, x0:x1].astype(np.float32); h, w = crop.shape[:2]
    yy, xx = np.mgrid[0:h * SS, 0:w * SS].astype(np.float32) / SS
    X, Y = xx + x0, yy + y0
    shrink = lambda m: cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA)
    bi, ba, bs = map(shrink, festoons(X, Y, BACK_JOINS, BACK_DEPTH, BACK_DIM))     # the second tier (behind)
    fi, fa, fs = map(shrink, festoons(X, Y))                                       # the first tier (in front)
    ti, ta = map(shrink, corner_tails(X, Y))                                       # the corner tails
    bs, fs = cv2.GaussianBlur(bs, (0, 0), 3), cv2.GaussianBlur(fs, (0, 0), 3)
    out = crop * (1 - bs[..., None])                                        # each layer's soft shadow on what's behind
    out = out * (1 - ba[..., None]) + bi * ba[..., None]
    out = out * (1 - fs[..., None])
    out = out * (1 - fa[..., None]) + fi * fa[..., None]
    tsh = cv2.GaussianBlur(ta, (0, 0), 6) * 0.30 * (1 - ta)
    out = out * (1 - tsh[..., None])
    out = out * (1 - ta[..., None]) + ti * ta[..., None]
    new = np.clip(ba + fa + ta, 0, 1)
    out += (np.random.default_rng(5).normal(0, 1.6, (h, w)).astype(np.float32) * new)[..., None]
    out = cv2.GaussianBlur(out, (0, 0), 0.45) * new[..., None] + out * (1 - new[..., None])
    F = front(crop.astype(np.uint8), x0, y0)
    out = out * (1 - F[..., None]) + crop * F[..., None]
    img[y0:y1, x0:x1] = np.clip(out, 0, 255).astype(np.uint8)
