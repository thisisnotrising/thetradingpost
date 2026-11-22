"""THE SPEAK, THEATER MODE, MOCKUP (Nov 22): the red velvet drapes either side of the cinema screen become
cream LACE drapes tied back in the old rope, a plain SHEER hanging behind them, and a MACRAME HEART panel lining
each edge of the screen. The pine garland, its red bow and the white macrame valance stay exactly as they are.

Everything new is DRAWN here, from scratch (inspired by Kathi's reference photo, nothing cut from it), as layers:

   back  1. SHEER         (a plain panel hanging straight where the dark backstage was; stops at the screen's frame)
         2. LACE drape    (in the old velvet's place and shape, tied in the old rope; lace.py draws the pattern)
         3. MACRAME panel (cords, square knots, two hearts, long fringe), with a soft shadow on what's behind it
   front 4. what was ALREADY in front stays in front: the valance and its side cascades, the rope and tassel, the
            snowy trees, poinsettias, lanterns and glass baubles (the FRONT matte, below)

All positions are in the hall picture's own pixels (3200 x 4800). The right side is the left side mirrored about
the screen's middle (x 1575), with its own tie-back and its own front objects.
Run it through lace_stage.py (it does the sides, then swags.py does the top)."""
import cv2, numpy as np
import lace

MID = 1575                     # the screen's middle (x): the right side is the left side mirrored about it
SS = 2                         # the cloth is worked out at 2x and shrunk, so its edges and threads come out soft
rng = np.random.default_rng(7)

def lerp(y, pts):              # a value that changes smoothly down the picture, from (y, value) points
    p = np.array(pts, np.float32); return np.interp(y, p[:, 0], p[:, 1]).astype(np.float32)

def lab2bgr(L, a, b):          # L 0-100, a and b as plus/minus numbers -> an 8-bit BGR picture
    lab = np.dstack([np.clip(L * 2.55, 0, 255), np.clip(a + 128, 0, 255), np.clip(b + 128, 0, 255)]).astype(np.uint8)
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR).astype(np.float32)

# ---------------------------------------------------------------- THE LEFT SIDE'S MEASUREMENTS (the right mirrors)
BOX = (420, 1950, 960, 3300)                         # the part of the picture the left side's work happens in
TOP, BOT = 1990, 3215                                # everything hangs from behind the valance to the stage floor
SHEER_OUT, SHEER_IN = 440, 706                       # the sheer: a plain straight panel behind, edge to edge
LACE = [(1990, 452, 706), (2200, 454, 700), (2300, 460, 686), (2400, 468, 664), (2500, 480, 641),
        (2580, 494, 621), (2640, 509, 607), (2668, 517, 601), (2700, 517, 605), (2800, 510, 624),
        (2950, 500, 645), (3100, 488, 663), (3215, 468, 692)]   # the lace drape: (y, outer x, inner x), tied at 2668
TIE_Y = 2668                                         # the old rope tie-back's height
PANEL_X, PANEL_Y = 604, 2195                         # the macrame panel's top-left corner (its rod hides under the valance)

# ---------------------------------------------------------------- LIGHT (how bright a white cloth is at each height)
# measured off the valance's own threads (L 62 up top, ~40 lower down, highlights 70-77), so the new cloth
# is lit like the old macrame; the lace hangs further back, so it's a little dimmer than the sheer and the panel
LACE_LIGHT = [(1990, 30), (2150, 78), (2250, 86), (2450, 84), (2650, 78), (2850, 77), (3050, 82), (3215, 86)]
SHEER_LIGHT = [(1990, 6), (2200, 56), (2300, 62), (2450, 60), (2650, 56), (2850, 56), (3050, 62), (3215, 66)]
PANEL_LIGHT = [(2200, 88), (2350, 87), (2500, 83), (2700, 77), (2850, 77), (3030, 81)]
LANTERN = (700, 3150, 230, 12)                       # the candle-lanterns' glow on the cloth: x, y, reach, how much
IVORY = dict(lace=(4.0, 11.5), sheer=(3.5, 9.5), panel=(3.5, 9.0))   # each cloth's colour (a, b): warm ivory

# ======================================================================================== 1. THE SHEER (behind)
TILE, TONE = lace.tile()
EDGE, ETONE = lace.scallop_edge()
def sample(img, u, v):         # read the repeating pattern at fabric position (u, v), smoothly
    h, w = img.shape
    return cv2.remap(np.tile(img, (2, 2)), (u % w).astype(np.float32), (v % h).astype(np.float32),
                     cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)

def glow(X, Y, k=1.0):         # the candle-lanterns' light, strongest near the floor by the screen
    lx, ly, lr, lg = LANTERN; return k * lg * np.exp(-((X - lx) ** 2 + (Y - ly) ** 2) / (2 * lr ** 2))

def sheer_layer(X, Y):
    """A plain sheer muslin panel hanging straight behind the lace, where the dark backstage was: soft vertical folds,
    the dark showing faintly through it. It stops at the screen's frame (nothing new covers the film)."""
    lam = 44 + 14 * (Y - TOP) / (BOT - TOP)
    phi = 2 * np.pi * (X - 430) / lam + 0.8 * np.sin(Y / 210) + 0.35 * np.sin(Y / 73 + 1)
    L = lerp(Y, SHEER_LIGHT) * (0.80 + 0.22 * np.cos(phi) + 0.06 * np.cos(2 * phi)) + glow(X, Y, 0.7)
    L *= 0.55 + 0.45 * np.clip((X - SHEER_OUT) / 150, 0, 1)             # a little into shadow at the outer edge...
    inside = np.clip(SHEER_IN - X + 0.5, 0, 1) * np.clip((X - SHEER_OUT) / 130, 0, 1) ** 1.3 * np.clip((Y - TOP) / 4, 0, 1) * np.clip((BOT - Y) / 4, 0, 1)
    return lab2bgr(L, np.full_like(X, IVORY['sheer'][0]), np.full_like(X, IVORY['sheer'][1])), inside   # ...and fades out there

# ======================================================================================== 2. THE LACE DRAPE
# on the LEFT only, the old velvet swooped over the screen's top-left corner (measured: out to x 820 at y 2250,
# back to 745 by 2400); the lace drape follows it there so no red is left. The right velvet never crossed the screen.
SWOOP_L = [(2110, 700), (2165, 762), (2215, 808), (2265, 824), (2310, 822), (2345, 768), (2395, 750), (2440, 746), (2480, 722), (2530, 690)]

OUT_R = [(1990, 452), (2500, 470), (2620, 446), (3000, 444), (3215, 448)]   # (in the left side's mirrored coordinates)

def lace_layer(X, Y, sheer, left=True):
    """The lace drape, in the old velvet's place and shape: hanging from the top, gathered into the rope tie-back,
    falling to the floor. Its folds run into the knot (they're counted across the drape, so where it narrows they
    crowd together, as real folds do), and a scalloped border runs down its inner edge. Where the lace is open,
    the sheer behind shows through."""
    p = np.array(LACE, np.float32)
    xo = np.interp(Y, p[:, 0], p[:, 1]); xi = np.interp(Y, p[:, 0], p[:, 2])
    if not left:                                                    # the right velvet reached further out: cover it all
        ro = np.array(OUT_R, np.float32); xo = np.minimum(xo, np.interp(Y, ro[:, 0], ro[:, 1]))
    if left:
        sw = np.array(SWOOP_L, np.float32)
        xi = np.maximum(xi, np.where((Y > sw[0, 0]) & (Y < sw[-1, 0]), np.interp(Y, sw[:, 0], sw[:, 1]), 0))
    W = np.maximum(xi - xo, 1); t = (X - xo) / W
    N, Wf = 7, 400                                                  # 7 folds; the cloth is 400 px across, laid flat
    phi = 2 * np.pi * N * t + 0.5 * np.sin(Y / 160) + 0.3 * np.sin(Y / 57 + 2)
    u = (1 - t) * Wf + 0.75 * (Wf / N) / (2 * np.pi) * np.sin(phi)   # fabric position across, from the inner edge
    v = (Y - TOP) + 3 * np.sin(phi)
    ts = 1.15
    thread = sample(TILE, u * ts, v * ts); tone = sample(TONE, u * ts, v * ts)
    d = xi - X                                                      # distance in from the inner edge (screen px)
    edge = d < 17
    eu = np.clip(d * 1.5, 0, 25.9)
    thread = np.where(edge, sample(EDGE, eu, v * ts), thread); tone = np.where(edge, sample(ETONE, eu, v * ts), tone)
    squeeze = np.clip((Wf / W) / 1.6, 0.6, 4.0) * (1 + 0.35 * np.cos(phi))   # cloth per pixel: more where it's gathered
    cov = 1 - (1 - 0.95 * thread ** 0.8) ** squeeze
    shade = 0.98 - 0.17 * np.cos(phi) + 0.05 * np.cos(2 * phi)
    near_tie = np.exp(-((Y - TIE_Y) / 26) ** 2); shade *= 1 - 0.22 * near_tie     # the cloth dips into the rope
    L = (lerp(Y, LACE_LIGHT) + glow(X, Y)) * shade * tone
    L *= np.where(edge, 1, 0.42 + 0.58 * np.clip((X - xo) / 110, 0, 1) ** 1.4)   # the outer side turns away into shadow
    col = lab2bgr(L, np.full_like(X, IVORY['lace'][0]), np.full_like(X, IVORY['lace'][1]))
    img = sheer + (col - sheer) * cov[..., None]
    inside = np.clip(d + 0.5, 0, 1) * np.clip((X - xo) / 22, 0, 1) * np.clip((Y - TOP) / 4, 0, 1) * np.clip((BOT - Y) / 4, 0, 1)
    return img, inside

# ======================================================================================== 3. THE MACRAME PANEL
def macrame_panel(seed=11):
    """Drawn 3x big on its own canvas, then shrunk. Returns shade (0-1.1) and alpha, 120 x 840 picture pixels.
    Layout (y down from the rod): rod 10 | a row of knots 30 | the big HEART 45-165 | alternating square knots
    185-265 (a diamond lattice) | a small heart 285-350 | a gathering row 372 | the long fringe to ~830."""
    r = np.random.default_rng(seed)
    S = 3; Wp, Hp = 120, 840
    A = np.zeros((Hp * S, Wp * S), np.float32); SH = np.zeros_like(A)
    HANG = 245                                                           # the hanging cords, drawn on top of the panel's canvas
    n = 16; xs = 4 + np.arange(n) * 7.4                                  # 16 cords, 7.4 px apart
    cw = 3.6                                                             # a cord's thickness
    def P(pts): return (np.array(pts, np.float32) * S).astype(np.int32)
    knots = []                                                           # (x, y) of every square knot
    rows = [(30, 0), (186, 0), (206, 2), (226, 0), (246, 2), (266, 0), (372, 0)]   # (y, first cord): groups of 4
    for y, f in rows:
        for g in range(f, n - 3, 4): knots.append(((xs[g] + xs[g + 3]) / 2, y, g))
    knots.append(((xs[6] + xs[9]) / 2, 100, 6))                          # one knot in the heart's middle
    # each cord's path: straight down, pulled in to the middle of every knot it goes through
    ends = 800 + 25 * (1 - np.abs(np.arange(n) - 7.5) / 7.5) + r.uniform(-8, 8, n)
    paths = []
    for i in range(n):
        way = [(xs[i], 8)]
        for kx, ky, g in sorted(knots, key=lambda k: k[1]):
            if g <= i <= g + 3:
                pull = kx + (xs[i] - kx) * 0.42
                way += [(pull, ky - 6), (pull, ky + 6)]
        way.append((xs[i], 392))
        yy = np.arange(392, ends[i], 6.0)                                   # the fringe: a gentle wave, fanning out
        fan = (xs[i] - 58) * 0.10 * (yy - 392) / 430
        way += [(xs[i] + fan[k] + 1.2 * np.sin(yy[k] / 37 + i), yy[k]) for k in range(len(yy))]
        paths.append(np.array(way, np.float32))
    # cords: body, then a highlight down their left (the light is up and to the left), and a rope twist
    for pth in paths:
        cv2.polylines(A, [P(pth)], False, 1, int(cw * S), cv2.LINE_AA)
        cv2.polylines(SH, [P(pth)], False, 0.72, int(cw * S), cv2.LINE_AA)
    hl = np.zeros_like(A)
    for pth in paths: cv2.polylines(hl, [P(pth - [cw * 0.22, 0])], False, 1, max(1, int(cw * 0.38 * S)), cv2.LINE_AA)
    yy, xx = np.mgrid[0:Hp * S, 0:Wp * S].astype(np.float32) / S
    twist = 0.07 * np.sin(2 * np.pi * (yy + xx * 0.8) / 5.0)
    SH = np.where(A > 0, SH / np.maximum(A, 1e-3) + 0.28 * hl + twist, 0) * A
    # the fringe's ends come undone: brush them out into fine fibres, fading
    for i, pth in enumerate(paths):
        x0, y0 = pth[-1]
        for k in range(5):
            dx = (k - 2) * 1.3 + r.uniform(-0.6, 0.6); ln = r.uniform(14, 26)
            cv2.line(A, P([(x0, y0 - 6)])[0], P([(x0 + dx, y0 + ln)])[0], 0.55, max(1, int(0.9 * S)), cv2.LINE_AA)
            cv2.line(SH, P([(x0, y0 - 6)])[0], P([(x0 + dx, y0 + ln)])[0], 0.55 * 0.80, max(1, int(0.9 * S)), cv2.LINE_AA)
    def blob(cx, cy, rx, ry, ang):                                        # one lit, rounded bump of knotted cord
        m = np.zeros_like(A); cv2.ellipse(m, P([(cx, cy)])[0], (int(rx * S), int(ry * S)), ang, 0, 360, 1, -1, cv2.LINE_AA)
        h = np.zeros_like(A); cv2.ellipse(h, P([(cx - rx * 0.25, cy - ry * 0.3)])[0], (max(1, int(rx * 0.55 * S)), max(1, int(ry * 0.45 * S))), ang, 0, 360, 1, -1, cv2.LINE_AA)
        h = cv2.GaussianBlur(h, (0, 0), 1.2 * S)
        s = 0.62 + 0.42 * h
        np.copyto(SH, SH * (1 - m) + s * m); np.copyto(A, np.maximum(A, m))
    for kx, ky, g in knots:                                               # a square knot: two interlocked loops
        blob(kx - 4.2, ky - 1.0, 6.0, 4.4, 15); blob(kx + 4.2, ky + 1.0, 6.0, 4.4, -15)
        blob(kx, ky - 3.2, 4.0, 2.6, 0)
    def bar(curve):                                                        # a clove-hitch bar: a chain of little knots
        c = np.array(curve, np.float32)
        seg = np.hypot(*np.diff(c, axis=0).T); d = np.r_[0, np.cumsum(seg)]
        for s in np.arange(0, d[-1], 3.6):
            x = np.interp(s, d, c[:, 0]); y = np.interp(s, d, c[:, 1])
            k = min(np.searchsorted(d, s), len(c) - 1); k0 = max(k - 1, 0)
            ang = np.degrees(np.arctan2(c[k, 1] - c[k0, 1], c[k, 0] - c[k0, 0]))
            blob(x, y, 2.7, 4.8, ang)
    def heart(cx, top, w, h):
        t = np.linspace(-np.pi, np.pi, 240)
        x = 16 * np.sin(t) ** 3; y = -(13 * np.cos(t) - 5 * np.cos(2 * t) - 2 * np.cos(3 * t) - np.cos(4 * t))
        x = cx + x / 32 * w; y = top + (y - y.min()) / (y.max() - y.min()) * h
        bar(np.stack([x, y], 1))
    heart(58, 45, 100, 118)
    heart(58, 286, 56, 62)
    # the wooden rod at the top (it sits behind the valance's fringe, so only glimpses show)
    rod = np.zeros_like(A); cv2.rectangle(rod, P([(0, 5)])[0], P([(Wp, 14)])[0], 1, -1)
    A = np.maximum(A, rod); SH = np.where(rod > 0, 0.62, SH)
    # two hanging cords from the rod's ends, straight up behind the valance and the swags
    top = np.zeros(((HANG) * S, Wp * S), np.float32); tsh = np.zeros_like(top)
    for x in (9, Wp - 9):
        cv2.line(top, (int(x * S), 0), (int(x * S), HANG * S), 1, int(2.6 * S), cv2.LINE_AA)
        cv2.line(tsh, (int(x * S), 0), (int(x * S), HANG * S), 0.74, int(2.6 * S), cv2.LINE_AA)
        cv2.line(tsh, (int((x - 0.5) * S), 0), (int((x - 0.5) * S), HANG * S), 0.98, max(1, int(0.9 * S)), cv2.LINE_AA)
    A = np.vstack([top, A]); SH = np.vstack([tsh, SH]); rod = np.vstack([np.zeros_like(top), rod]); Hp += HANG
    shade = cv2.resize(SH, (Wp, Hp), interpolation=cv2.INTER_AREA); alpha = cv2.resize(A, (Wp, Hp), interpolation=cv2.INTER_AREA)
    shade = np.where(alpha > 1e-3, shade / np.maximum(alpha, 1e-3), 0)
    rodm = cv2.resize(rod, (Wp, Hp), interpolation=cv2.INTER_AREA)
    return np.clip(shade, 0, 1.15), np.clip(alpha, 0, 1), rodm

# ======================================================================================== 4. WHAT STAYS IN FRONT
def polyfill(shape, polys, ox, oy, feather=1.5):
    m = np.zeros(shape, np.float32)
    for p in polys: cv2.fillPoly(m, [(np.array(p, np.float32) - [ox, oy]).astype(np.int32)], 1, cv2.LINE_AA)
    return cv2.GaussianBlur(m, (0, 0), feather) if feather else m

# lanterns and baubles: the screen's own FRONT shapes (theater_hall.py, set v2), on the 1024-wide render, x3.125
R = 3200 / 1024
FRONT_POLYS = [[(222, 913), (229, 926), (247, 932), (250, 954), (250, 1046), (200, 1046), (200, 954), (204, 932), (216, 926)],
               [(257, 954), (262, 970), (276, 973), (277, 985), (277, 1045), (238, 1045), (238, 985), (245, 973), (253, 970)],
               [(277, 979), (281, 990), (288, 992), (289, 999), (289, 1043), (263, 1043), (263, 999), (266, 992), (274, 990)],
               [(810, 913), (816, 927), (830, 935), (831, 954), (831, 1046), (787, 1046), (787, 954), (790, 935), (804, 927)],
               [(775, 958), (779, 975), (788, 978), (789, 987), (789, 1045), (756, 1045), (756, 987), (759, 978), (771, 975)],
               [(775, 1003), (797, 1003), (797, 1045), (775, 1045)],
               [(291, 648), (299, 648), (299, 661), (291, 661)], [(722, 666), (730, 666), (730, 679), (722, 679)],
               [(754, 704), (762, 704), (762, 717), (754, 717)]]
FRONT_POLYS = [[(x * R, y * R) for x, y in p] for p in FRONT_POLYS]
BAUBLES = [(295 * R, 677.5 * R, 19 * R), (726 * R, 695 * R, 19 * R), (757.5 * R, 735 * R, 19 * R)]
STRINGS = [(295, 598, 295, 651, 1.4), (295, 695, 295, 703, 2), (726, 612, 726, 670, 1.4), (726, 712, 726, 727, 2.2),
           (757.5, 640, 757.5, 707, 1.4), (757.5, 752, 757.5, 765, 2.2)]
# traced on the hall picture: where the valance's side cascade, the rope + tassel and the trees are; inside these,
# only things that look like them (cream thread, green needles, snow, brass, lights) count as in front
ZONES_L = dict(
    cascade=[(440, 1990), (720, 1990), (720, 2200), (690, 2240), (640, 2290), (590, 2350), (545, 2420), (515, 2500), (505, 2580), (505, 2665), (440, 2665)],
    rope=[(445, 2595), (475, 2600), (545, 2638), (618, 2672), (620, 2740), (603, 2848), (577, 2848), (574, 2735), (530, 2710), (445, 2668)],
    tree=[(455, 2598), (485, 2650), (525, 2720), (565, 2800), (603, 2880), (630, 2960), (645, 3012), (300, 3012), (320, 2880), (380, 2760), (425, 2680)],
    poinsettia=[(300, 2990), (420, 2984), (560, 3005), (642, 3058), (655, 3150), (610, 3205), (560, 3300), (330, 3300), (296, 3200)],
    daisies=[(718, 2280), (960, 2280), (960, 2530), (718, 2530)])
ZONES_R = dict(
    cascade=[(2430, 1990), (2722, 1990), (2722, 2722), (2638, 2722), (2632, 2560), (2592, 2452), (2542, 2362), (2492, 2262), (2452, 2150), (2430, 2080)],
    rope=[(2528, 2678), (2600, 2648), (2700, 2610), (2724, 2648), (2622, 2702), (2608, 2866), (2578, 2866), (2574, 2722), (2528, 2722)],
    tree=[(2598, 2688), (2640, 2760), (2700, 2850), (2742, 2950), (2782, 3035), (2458, 3035), (2478, 2950), (2518, 2850), (2558, 2760)],
    poinsettia=[(2448, 3058), (2520, 3016), (2650, 3008), (2800, 3028), (2862, 3120), (2852, 3242), (2722, 3342), (2558, 3342), (2466, 3232)])

def front_matte(crop, ox, oy, zones):
    lab = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB).astype(np.float32)
    L, a, b = lab[..., 0] / 2.55, lab[..., 1] - 128, lab[..., 2] - 128
    C = np.hypot(a, b); hue = np.degrees(np.arctan2(b, a))
    base = cv2.GaussianBlur(cv2.erode(L, np.ones((9, 9), np.uint8)), (0, 0), 5)
    cream = (C < 19) & (L > 30) & ((L - base) > 8)                      # thread, snow, rope: pale and lit
    green = (a < -3) & (C > 5)
    bright = L > 70
    brass = (hue > 44) & (C > 14) & (L > 26)
    ys = np.arange(crop.shape[0])[:, None] + oy
    velvet = (hue < 36) & (C > 7) & (L < 64)
    bauble_red = (C > 40) & (L > 22) & (ys < 2250)                   # the garland's red baubles, up in the cascade only
    velvet &= ~bauble_red
    looks_front = (cream | green | bright | brass | bauble_red) & ~velvet
    sh = crop.shape[:2]
    F = np.zeros(sh, np.float32)
    for name in ('cascade', 'rope'):
        z = polyfill(sh, [zones[name]], ox, oy, 0) > 0.5
        F = np.maximum(F, (z & looks_front).astype(np.float32))
    zt = polyfill(sh, [zones['tree']], ox, oy, 0) > 0.5                 # the tree: its dark needles count too,
    core = zt & looks_front                                             # but only right beside its snow and green
    near = cv2.dilate(core.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    F = np.maximum(F, (core | (near & (L < 30) & ~velvet)).astype(np.float32))
    F = cv2.morphologyEx(F, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    F = cv2.GaussianBlur(F, (0, 0), 0.8)
    if 'daisies' in zones:                                               # the film's daisies: white petals, orange hearts
        zd = polyfill(sh, [zones['daisies']], ox, oy, 0) > 0.5
        F = np.maximum(F, cv2.GaussianBlur((zd & ((L > 58) | ((hue > 45) & (C > 30) & (L > 40)))).astype(np.float32), (0, 0), 0.8))
    F = np.maximum(F, polyfill(sh, [zones['poinsettia']], ox, oy, 1.5))
    F = np.maximum(F, polyfill(sh, FRONT_POLYS, ox, oy, 1.5) * (1 - cv2.GaussianBlur(velvet.astype(np.float32), (0, 0), 1)))
    for x, y, r in BAUBLES:                                              # a glass bauble: only its lit glass and metal
        c = np.zeros(sh, np.float32); cv2.circle(c, (int(x - ox), int(y - oy)), int(r), 1, -1, cv2.LINE_AA)
        F = np.maximum(F, c * np.clip((L - 30) / 30, 0, 1))
    for x0, y0, x1, y1, w in STRINGS:
        s = np.zeros(sh, np.float32); cv2.line(s, (int(x0 * R - ox), int(y0 * R - oy)), (int(x1 * R - ox), int(y1 * R - oy)), 1, max(1, int(w * R)), cv2.LINE_AA)
        F = np.maximum(F, s)
    return np.clip(F, 0, 1)

def valance_threads(crop, ox, oy):
    """Over the screen's top corner (where the sheer now crosses), the valance's fringe hangs in front: pale threads."""
    lab = cv2.cvtColor(crop, cv2.COLOR_BGR2LAB).astype(np.float32)
    L, a, b = lab[..., 0] / 2.55, lab[..., 1] - 128, lab[..., 2] - 128
    base = cv2.GaussianBlur(cv2.erode(L, np.ones((9, 9), np.uint8)), (0, 0), 5)
    t = ((L - base) > 14) & (np.hypot(a, b) < 22) & (L > 32)
    ys = np.arange(crop.shape[0])[:, None] + oy
    t &= ys < 2240                                                       # the fringe ends above here over the screen
    return cv2.GaussianBlur(cv2.morphologyEx(t.astype(np.float32), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)), (0, 0), 0.7)

# ======================================================================================== PUT ONE SIDE TOGETHER
def side(img, mirror):
    x0, y0, x1, y1 = BOX
    if mirror: x0, x1 = 2 * MID - x1, 2 * MID - x0
    crop = img[y0:y1, x0:x1].astype(np.float32)
    h, w = crop.shape[:2]
    # the cloth, worked out at 2x in the LEFT side's coordinates (the right reads them mirrored)
    yy, xx = np.mgrid[0:h * SS, 0:w * SS].astype(np.float32) / SS
    X = xx + x0; Y = yy + y0
    if mirror: X = 2 * MID - X
    sheer_img, sheer_in = sheer_layer(X, Y)
    lace_img, lace_in = lace_layer(X, Y, sheer_img, left=not mirror)
    shrink = lambda m: cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA)
    sheer_img, sheer_in, lace_img, lace_in = shrink(sheer_img), shrink(sheer_in), shrink(lace_img), shrink(lace_in)
    out = crop * (1 - sheer_in[..., None]) + sheer_img * sheer_in[..., None]     # 1. the sheer, where the dark backstage was
    lace_sh = cv2.GaussianBlur(np.roll(lace_in, 6 if not mirror else -6, 1), (0, 0), 6) * 0.30 * (1 - lace_in)
    out *= (1 - lace_sh[..., None])                                                # (the drape's soft shadow on the sheer)
    out = out * (1 - lace_in[..., None]) + lace_img * lace_in[..., None]           # 2. the lace drape, in the velvet's place
    # 3. the macrame panel, with its soft shadow on whatever's behind
    sh_, al, rod = macrame_panel()
    if mirror: sh_, al, rod = sh_[:, ::-1], al[:, ::-1], rod[:, ::-1]
    ph, pw = al.shape
    px = PANEL_X - x0 if not mirror else (2 * MID - PANEL_X - pw) - x0
    py = PANEL_Y - 245 - y0                                                         # (the hanging cords sit above it)
    A = np.zeros((h, w), np.float32); S = np.zeros((h, w), np.float32); RD = np.zeros((h, w), np.float32)
    A[py:py + ph, px:px + pw] = al; S[py:py + ph, px:px + pw] = sh_; RD[py:py + ph, px:px + pw] = rod
    shadow = cv2.GaussianBlur(np.roll(np.roll(A, 7, 0), 5 if not mirror else -5, 1), (0, 0), 5) * 0.38
    out *= (1 - shadow[..., None])
    Yg = (np.arange(h, dtype=np.float32)[:, None] + y0) * np.ones((1, w), np.float32)
    Xg = (np.arange(w, dtype=np.float32)[None, :] + x0) * np.ones((h, 1), np.float32)
    if mirror: Xg = 2 * MID - Xg
    lx, ly, lr, lg = LANTERN
    PL = lerp(Yg, PANEL_LIGHT) + 0.9 * lg * np.exp(-((Xg - lx) ** 2 + (Yg - ly) ** 2) / (2 * lr ** 2))
    pa, pb = IVORY['panel']
    pcol = lab2bgr(PL * S, np.full_like(S, pa) + 2 * RD, np.full_like(S, pb) + 12 * RD)   # the rod is wood: warmer
    out = out * (1 - A[..., None]) + pcol * A[..., None]
    # the render's own fine grain, so the new cloth isn't cleaner than everything round it
    new = np.clip(lace_in + sheer_in + A, 0, 1)
    out += (rng.normal(0, 1.6, out.shape[:2]).astype(np.float32) * new)[..., None]
    out = cv2.GaussianBlur(out, (0, 0), 0.45) * new[..., None] + out * (1 - new[..., None])
    # 4. everything that hung or stood in front of the old velvet goes back in front
    zones = ZONES_R if mirror else ZONES_L
    F = front_matte(crop.astype(np.uint8), x0, y0, zones)
    if not mirror:                                                       # the valance's fringe tips hang in front of the swoop
        xs_ = np.arange(w)[None, :] + x0
        F = np.maximum(F, valance_threads(crop.astype(np.uint8), x0, y0) * (xs_ > 700))
    out = out * (1 - F[..., None]) + crop * F[..., None]
    img[y0:y1, x0:x1] = np.clip(out, 0, 255).astype(np.uint8)
    return F
