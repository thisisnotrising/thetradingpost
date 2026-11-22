"""THE REST: the walls papered like Kathi's own dictionary-papered restroom ("The Rest", her photo of Jan 18, 2016),
with Kevin Kermes's 3x5 Napkin and her four notes tiled all through it: one even grid, every page's place split into two
squares, a half page of dictionary in one and a napkin or a note in the other, alternating like a checkerboard; one
napkin to every three notes. All one layer of paper, all in greyscale.
-------------------------------------------------------------------------------------------
WHAT GOES IN
  the sharpened restroom render (4096 x 6144, from rest_room.py's first steps)
  dictionary.py: the pages (her own words: the headwords and meanings come from her 3x5 Interview answers and her
  2016 poem, her-words.txt);  notes.py: her four notes, lettered on cream squares;  Kevin's napkin
  (originals/napkin-kevin.png), exactly as he drew it, in the room's light

THE GRID (positions in the render's own 1024 x 1536 pixels)
  A page's place is 120 wide by 240 tall: two squares of 120 x 120, one above the other.
  Back wall: columns every 120 from x 555; rows every 240 counted up from y 866 (the last row is cut by the black tile
  at y 937). On the left wall the same rows, in perspective (its lines run toward a vanishing point at x 4000, y 1035,
  as the old paper's did).
  The squares alternate like a checkerboard: in each column, square by square up the wall, napkin-or-note, dictionary,
  napkin-or-note... and the next column starts the other way. Of every four squares one is Kevin's napkin and three are
  notes (the four notes taking turns); one napkin sits centred over the mirror (x 555-675, y 506-626).
  One colour throughout: every page the same white, and the notes on the napkin's own kraft paper colour.

THE STEPS
  1. What stays: everything in front of the walls (the chandelier, the mirror, the two wall lamps, the pothos and its
     pot, the black pillars and the vault, the towel and its bar). The room's old paper notes go with the old paper.
  2. The paper's light: the old wallpaper with its ink lifted off (a morphological closing), then smoothed, so the new
     paper keeps the room's light exactly: the chandelier's glow, the lamps' pools of light, the shadows. (The old notes
     and the old portrait were a different paper, so they're left out of it.)
  3. The new paper: each page pasted a hair off square; the napkins and notes square in their places; all in greyscale
     (pages, notes and napkins alike), times the brightness of the paper's light, so it sits in the room's light.
  The chandelier's rings and chains are traced (RINGS, CHAINS), so every chain of both tiers stays as the render drew it.
"""
import os, sys, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import dictionary, notes

S = 4
TOP = 960                                     # everything above the black tile is in rows 0..960
PAGE_W, PAGE_H = 480, 960                     # one dictionary page at full size (4x pixels): 120 x 240 in the render
SQ = 480                                      # a square: half a page
COL0 = 555                                    # back wall: a column starts here (render x): the napkin's left edge
V_OFF = 71                                    # rows start at 71 above the tile (render pixels): y 866, 626, 386, 146
LEFT_SHEET = 13 * PAGE_W - 4 * 106.7          # the left wall's place on the sheet: its column 13 starts at u 106.7
COLS, ROWS = 16, 5                            # the sheet: back wall in columns 4-9, left wall in columns 12-14
NAPKIN = os.path.join(HERE, 'originals', 'napkin-kevin.png')
NOTE_ORDER = ['thousand', 'voices', 'absurdity', 'director']


def motif(c, h):
    """What goes in the square at column c, half-row h (counted up from the tile): None for dictionary, 'napkin', or a
    note. Squares alternate like a checkerboard with the dictionary; of every four squares, one is Kevin's napkin and
    three are notes (the four notes taking turns), in a repeat 2 squares by 2 along the diagonals."""
    if (c + h) % 2:
        return None
    a, b = (c + h) // 2, (c - h) // 2
    k = (a % 2) + 2 * (b % 2)                      # 0: the napkin; 1, 2, 3: the three notes of this repeat
    if k == 0:
        return 'napkin'
    return NOTE_ORDER[(k - 1 + 2 * (a // 2) + b // 2) % 4]   # (chosen so a note is never next to itself, all four equally)


def napkin_square(size):
    """Kevin's napkin as albedo, size x size: nothing in the drawing changes; as a kraft napkin beside the cream paper it
    gives back a little less light (lightness x0.9), nudged from his photo's yellow toward the room's peach."""
    im = np.asarray(Image.open(NAPKIN).convert('RGB').resize((size, size), Image.LANCZOS))
    lab = cv2.cvtColor(im, cv2.COLOR_RGB2LAB).astype(np.float32)
    lab[..., 0] *= .9; lab[..., 1] += 3; lab[..., 2] = (lab[..., 2] - 128) * .8 + 128
    alb = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB).astype(np.float32) / 255 / .93
    alb[:2, :] *= .84; alb[:, :2] *= .84; alb[-2:, :] *= .9; alb[:, -2:] *= .9      # where it meets the paper beside it
    return np.clip(alb, 0, 1)


def napkin_paper(nap):
    """The napkin's own paper, where there's no ink anywhere near (its clean corners and gaps): its average colour,
    and how much its fine weave and its soft creases vary it, so the notes are on the same paper."""
    lum = nap @ np.array([.3, .59, .11], np.float32)
    clean = cv2.erode((lum > np.percentile(lum, 35)).astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
    clean[:8] = clean[-8:] = False; clean[:, :8] = clean[:, -8:] = False
    fine = lum - cv2.GaussianBlur(lum, (0, 0), 3)
    soft = cv2.GaussianBlur(lum, (0, 0), 3) - cv2.GaussianBlur(lum, (0, 0), 25)
    m = lum[clean].mean()
    return nap[clean].mean(axis=0), (float(fine[clean].std() / m), float(soft[clean].std() / m))


# what stays in front of the walls (render coordinates)
MIRROR = (615.5, 811, 160.5, 174)             # the mirror: centre x, y, half-width, half-height
FOOT_L = (916, 0.03)                          # the left wall meets the black tile at y = 916 + 0.03 x
FOOT_B = 937                                  # the back wall meets it at y = 937
VP_L = 4000                                   # the left wall's lines run toward x 4000 (its horizon, y 1035)
SCONCES = [
    [(418, 700), (428, 700), (430, 722), (446, 726), (452, 733), (452, 765), (446, 770), (444, 752), (442, 836), (443, 850),
     (431, 852), (430, 868), (416, 868), (415, 852), (401, 849), (402, 836), (403, 753), (400, 748), (401, 727), (415, 722)],
    [(797, 672), (808, 672), (810, 700), (826, 703), (833, 712), (834, 742), (828, 745), (826, 825), (828, 840), (812, 843),
     (811, 862), (797, 862), (796, 843), (780, 840), (781, 826), (782, 735), (776, 730), (777, 705), (794, 700)],
]
POT = [(238, 672), (310, 672), (322, 735), (322, 750), (228, 750), (232, 735)]
TOWEL = [(840, 960), (840, 890), (848, 886), (865, 880), (890, 876), (915, 874), (934, 876), (946, 884), (954, 895), (956, 960)]
BAR = [(809, 895), (845, 895), (940, 883), (991, 881), (991, 915), (940, 915), (845, 922), (809, 922)]
CHANDELIER = [(292, 0), (640, 0), (640, 340), (585, 340), (585, 505), (318, 505), (318, 340), (292, 340)]
# the chandelier, traced: its two iron rings (centre, outer half-axes, inner half-axes) and its chains (each a run of
# straight pieces from point to point, 9 pixels wide): from the ceiling down to the top ring, and from the top ring
# down to the second ring (seen through the top ring's middle and below it). Kept exactly as the render drew them.
RINGS = [((465.5, 241), (159, 90), (140, 67)), ((448, 445), (123, 55), (104, 37))]
CHAINS = [[(406, 0), (350, 147)], [(440, 0), (407, 157)], [(493, 0), (530, 157)], [(505, 0), (535, 135)],
          [(522, 0), (583, 167)],                                                   # ceiling to the top ring
          [(470, 13), (465, 393)],                                                  # the centre chain, to the second ring
          [(409, 183), (371, 398)], [(538, 190), (553, 250), (559, 290), (562, 352), (567, 428)],
          [(356, 302), (330, 428)], [(418, 321), (414, 392)], [(512, 324), (531, 393)]]   # top ring to the second
PLANT = [(175, 590), (390, 590), (390, 960), (175, 960)]
NOTE_BOXES = [(72, 296, 248, 706), (383, 486, 604, 652), (752, 186, 982, 424), (836, 638, 982, 736)]   # where each note is:
#            As Director.. / It looks like.. / Voices that want to.. / Absurdity is essential.
NOT_NOTES = [(560, 360), (800, 360), (800, 470), (560, 470)]      # the old portrait's paper backdrop: not a note


def poly(shape, pts, s=1):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.round(np.array(pts) * s).astype(np.int32)], 1)
    return m


def ell(k):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))


def masks_1024(render):
    """At the render's size: the notes, and a rough map of what stands in front of the walls (0/1 arrays, TOP rows).
    The rough map is refined at full size in repaper(), so the edges follow the things themselves."""
    im = render[:TOP]
    H, W = im.shape[:2]
    lab = cv2.cvtColor(im, cv2.COLOR_RGB2LAB).astype(np.float32)
    L = lab[..., 0] * 100 / 255
    hsv = cv2.cvtColor(im, cv2.COLOR_RGB2HSV)
    # the notes: smooth cream paper (little texture), grown over the words on them; in each note's box, the biggest
    m = cv2.blur(L, (9, 9)); sd = np.sqrt(np.maximum(cv2.blur(L * L, (9, 9)) - m * m, 0))
    close = cv2.morphologyEx(L, cv2.MORPH_CLOSE, ell(7))
    smooth = ((sd < 6) & (close > 55)).astype(np.uint8)
    smooth = cv2.morphologyEx(smooth, cv2.MORPH_CLOSE, ell(15))      # over the handwriting
    smooth[poly((H, W), NOT_NOTES) > 0] = 0
    notes = np.zeros((H, W), np.uint8)
    for x0, y0, x1, y1 in NOTE_BOXES:
        box = np.zeros((H, W), np.uint8); box[y0:y1, x0:x1] = smooth[y0:y1, x0:x1]
        n, cc, st, _ = cv2.connectedComponentsWithStats(box)
        if n > 1:
            notes |= (cc == 1 + int(np.argmax(st[1:, 4]))).astype(np.uint8)
    ff = notes.copy(); cv2.floodFill(ff, np.zeros((H + 2, W + 2), np.uint8), (0, 0), 1)
    notes = notes | (1 - ff)                                           # no holes inside a note
    notes = cv2.morphologyEx(notes, cv2.MORPH_OPEN, ell(5))
    notes = cv2.morphologyEx(notes, cv2.MORPH_CLOSE, ell(25))         # notches where leaves crossed
    notes = cv2.dilate(notes, ell(5))                                  # and its torn, darkened edge
    # dark, solid things (iron, the pillars, the vault, the mirror's frame) wherever the old wallpaper had no big
    # drawings of its own; inside the drawings' boxes, only wide dark (the vault, the pillars) counts
    dark = (L < 20).astype(np.uint8)                  # (paper in the arches' shadow is dim, but not this dark)
    solid = cv2.morphologyEx(dark, cv2.MORPH_OPEN, ell(5))
    n, cc, st, _ = cv2.connectedComponentsWithStats(solid)             # a small dark blob is old ink, not a thing
    small = np.isin(cc, 1 + np.nonzero(st[1:, 4] < 250)[0])
    ch, pl = poly((H, W), CHANDELIER), poly((H, W), PLANT)
    solid[small & (pl == 0)] = 0
    drawings = np.zeros((H, W), np.uint8)       # where the old wallpaper's own big drawings were (they go)
    for pts in [[(10, 0), (250, 0), (250, 905), (10, 905)],                     # the left wall: leaves, buildings
                [(560, 360), (830, 360), (830, 720), (560, 720)],               # the old portrait
                [(365, 560), (455, 560), (455, 720), (365, 720)],               # sprig left of the mirror
                [(780, 0), (965, 0), (965, 240), (780, 240)],                   # leaves, top right
                [(830, 400), (965, 400), (965, 680), (830, 680)],               # leaves, right
                [(838, 720), (975, 720), (975, 900), (838, 900)]]:              # the typewriter
        drawings |= poly((H, W), pts)
    drawings &= 1 - ch
    wide = cv2.morphologyEx(dark, cv2.MORPH_OPEN, ell(25))             # the vault, the pillars: wide dark
    wide[poly((H, W), [(560, 360), (830, 360), (830, 720), (560, 720)]) > 0] = 0   # (but not the old portrait's hair)
    objects = solid * (1 - drawings) | wide
    # the chandelier's bulbs, each with its socket just below it (rounded, a little bigger than the glass)
    bright = ((L > 84) & (ch > 0)).astype(np.uint8)
    bulbs = cv2.dilate(bright, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 11)))   # (refined at full size: glass())
    # the pothos
    green = ((hsv[..., 0] >= 19) & (hsv[..., 0] <= 40) & (hsv[..., 1] > 90) & (hsv[..., 2] > 40)).astype(np.uint8) * pl   # (the lit
    #                                                                       paper's hue is 11-17, the leaves' 19-28)
    n, cc, st, _ = cv2.connectedComponentsWithStats(green)              # a leaf is a good-sized patch of green
    green[np.isin(cc, 1 + np.nonzero(st[1:, 4] < 30)[0])] = 0
    return notes, objects, bulbs, green, drawings


def texture(cols=COLS, rows=ROWS, seed=11):
    """The whole sheet of wallpaper as albedo (how much light it gives back, RGB 0..255): dictionary pages in one even
    grid, each pasted a hair off square and a little lighter or greyer than its neighbours, a faint seam where two
    meet; and the napkins and notes in their squares (motif()). Row 0 is at the bottom of the sheet."""
    rng = np.random.default_rng(seed)
    Wt, Ht = cols * PAGE_W, rows * PAGE_H
    alb = np.zeros((Ht, Wt, 3), np.float32)
    pages = [dictionary.page(1000 * seed + i, PAGE_W, PAGE_H + 2) for i in range(16)]   # 16 different pages, reused
    for r in range(rows):
        y = (rows - 1 - r) * PAGE_H
        for c in range(cols):
            pg = pages[int(rng.integers(len(pages)))].copy()
            pg[:2, :] = np.maximum(pg[:2, :], .16); pg[:, :2] = np.maximum(pg[:, :2], .16)   # its top and left edge
            ang = float(rng.normal(0, .12)); dx, dy = rng.integers(-2, 3, 2)
            a = np.asarray(Image.fromarray((pg * 255).astype(np.uint8)).rotate(ang, Image.BICUBIC)).astype(np.float32) / 255
            tone = .97                                   # every page the same colour
            page = (tone * (1 - .86 * a))[..., None] * np.ones(3, np.float32)
            x0, y0 = c * PAGE_W + int(dx), y + int(dy)
            xa, ya = max(0, x0), max(0, y0); xb, yb = min(Wt, x0 + PAGE_W), min(Ht, y0 + PAGE_H + 2)
            alb[ya:yb, xa:xb] = page[ya - y0:yb - y0, xa - x0:xb - x0]
    nap = napkin_square(SQ)
    paper, crinkle = napkin_paper(nap)
    squares = {k: notes.square(k, SQ, seed=i, paper_rgb=paper, crinkle=crinkle) for i, k in enumerate(NOTE_ORDER)}
    squares['napkin'] = nap
    for c in range(cols):
        for h in range(2 * rows):
            m = motif(c, h)
            if m:
                y = Ht - (h + 1) * SQ
                alb[y:y + SQ, c * PAGE_W:c * PAGE_W + SQ] = squares[m]
    return np.clip(alb * 255 + .5, 0, 255).astype(np.uint8)


def light(render, paper, drawings, notes1):
    """The paper's light at the render's size (RGB): the old paper with its ink lifted off, smoothed, only from paper.
    The old drawings' solid shapes (leaves, the portrait) are left out of it; shadows are kept: they're the light."""
    im = render[:TOP].astype(np.float32)
    lifted = np.stack([cv2.morphologyEx(im[..., c], cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)) for c in range(3)], -1)
    Lc = cv2.cvtColor(np.clip(lifted, 0, 255).astype(np.uint8), cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32)
    # leave out what is still dark after lifting inside the old drawings (their solid leaves): it isn't the light
    local = cv2.dilate(Lc, np.ones((41, 41), np.uint8))
    w = (paper > 0) & ~((Lc < local * .72) & (drawings > 0)) & (cv2.dilate(notes1, ell(9)) == 0)
    w &= poly(paper.shape, [(560, 360), (830, 360), (830, 720), (560, 720)]) == 0          # the old portrait's paper
    w = w.astype(np.float32)
    # smoothed from the paper around each point, coarse to fine: where there's paper close by, its own light; across a
    # big gap (where the old notes and portrait were), the light of the paper further off
    est = None
    for sig in (300, 120, 40, 12):
        num = cv2.GaussianBlur(lifted * w[..., None], (0, 0), sig)
        den = cv2.GaussianBlur(w, (0, 0), sig)[..., None]
        val = num / np.maximum(den, 1e-12)
        conf = np.clip(den / 0.25, 0, 1)
        est = val if est is None else val * conf + est * (1 - conf)
    return est


def wall_at(Hc, Wc, s):
    """The papered walls, in pixels of an image s times the render's size: above the black tile, inside the arches."""
    yy, xx = np.mgrid[0:Hc, 0:Wc].astype(np.float32) / s
    foot = np.where(xx < 290, FOOT_L[0] + FOOT_L[1] * xx, FOOT_B)
    arch = np.where(yy < 250, 163 + 85 * np.sqrt(np.clip(yy, 0, 250) / 250), np.where(yy < 700, 250, 290))
    pillar = 970 + 7 * np.clip((yy - 500) / 200, 0, 1)            # the black pillar at the right starts here, to x 999
    # (the left wall ends at its arch, then at the pillar, which is narrower below the pot; the strip at the far left
    #  edge is a door frame)
    return ((yy < foot) & (xx >= 12) & ((xx < pillar) | (xx >= 999)) & ((xx > 300) | (xx <= arch))).astype(np.uint8)


def glass(near, L4):
    """The bulbs, at full size: each one's glass (the bright rim, the filament and what's inside the rim; not the paper
    glowing around it) and its brass socket below it (a narrow cylinder, half the glass's width, half its height)."""
    g = (near & (L4 > 45)).astype(np.uint8)
    ff = g.copy(); cv2.floodFill(ff, np.zeros((g.shape[0] + 2, g.shape[1] + 2), np.uint8), (0, 0), 1)
    g |= 1 - ff                                                       # what's inside the rim
    g = cv2.morphologyEx(g, cv2.MORPH_OPEN, ell(5))
    n, cc, st, _ = cv2.connectedComponentsWithStats(g)
    out = g.copy()
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 300:
            out[cc == i] = 0
            continue
        cx = x + w / 2
        cv2.rectangle(out, (round(cx - w * .27), round(y + h * .9)), (round(cx + w * .27), round(y + h * 1.5)), 1, -1)
    return cv2.dilate(out, ell(5)) > 0


def up(m, Wc, Hc, soft=1.0):
    """A 0/1 map from the render's size up to full size, with round edges."""
    u = cv2.resize(m.astype(np.float32), (Wc, Hc), interpolation=cv2.INTER_CUBIC)
    return cv2.GaussianBlur(u, (0, 0), soft * S) > .5


def repaper(room4, render):
    """room4: the sharpened room (4096 x 6144). Returns it with the walls re-papered (and the paper map, for checking)."""
    notes1, objects1, bulbs1, green1, drawings1 = masks_1024(render)
    Hc, Wc = TOP * S, room4.shape[1]
    top = room4[:Hc]
    L4 = cv2.cvtColor(top, cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32) * 100 / 255
    hsv4 = cv2.cvtColor(top, cv2.COLOR_RGB2HSV)
    # what stays, at full size: the rough map's dark things, where the picture really is dark; the bulbs; the
    # pothos's leaves, where the picture really is leaf; the traced things; the mirror; the notes
    keep = up(cv2.dilate(objects1, ell(5)), Wc, Hc) & (L4 < 22)
    keep |= glass(up(bulbs1, Wc, Hc, 1.5), L4)
    hue = up(cv2.dilate(green1, ell(5)), Wc, Hc) & (hsv4[..., 0] >= 19) & (hsv4[..., 0] <= 40) & (hsv4[..., 1] > 80)
    keep |= hue | ((cv2.dilate(hue.astype(np.uint8), ell(9)) > 0) & (L4 < 25))    # leaves, and their dark edges
    traced = np.zeros((Hc, Wc), np.uint8)
    for pts in SCONCES + [POT, TOWEL, BAR]:
        cv2.fillPoly(traced, [np.round(np.array(pts) * S).astype(np.int32)], 1)
    keep |= traced > 0
    iron = np.zeros((Hc, Wc), np.uint8)                       # the chandelier's rings and chains
    for (cx, cy), (ao, bo), (ai, bi) in RINGS:
        ring = np.zeros((Hc, Wc), np.uint8)
        cv2.ellipse(ring, (round(cx * S), round(cy * S)), (round((ao + 2) * S), round((bo + 2) * S)), 0, 0, 360, 1, -1)
        cv2.ellipse(ring, (round(cx * S), round(cy * S)), (round((ai - 2) * S), round((bi - 2) * S)), 0, 0, 360, 0, -1)
        iron |= ring
    for pts in CHAINS:
        cv2.polylines(iron, [np.round(np.array(pts, float) * S).astype(np.int32)], False, 1, 9 * S)
    keep |= iron > 0
    yy, xx = np.mgrid[0:Hc, 0:Wc].astype(np.float32)
    cx, cy, a, b = [v * S for v in MIRROR]
    keep |= (((xx - cx) / (a + 8)) ** 2 + ((yy - cy) / (b + 8)) ** 2) <= 1
    # tidy: specks of old ink left beside things go; specks of paper left inside things stay put
    k8 = keep.astype(np.uint8)
    n, cc, st, _ = cv2.connectedComponentsWithStats(k8)
    k8[np.isin(cc, 1 + np.nonzero(st[1:, 4] < 400)[0])] = 0
    paper = wall_at(Hc, Wc, S) * (1 - k8)
    n, cc, st, _ = cv2.connectedComponentsWithStats(paper)
    paper[np.isin(cc, 1 + np.nonzero(st[1:, 4] < 120)[0])] = 0
    # the paper's light, from the render (at its size) up to full size
    paper1 = cv2.resize(paper, (render.shape[1], TOP), interpolation=cv2.INTER_AREA)
    lit = cv2.resize(light(render, paper1, drawings1, notes1), (Wc, Hc), interpolation=cv2.INTER_CUBIC)
    m = cv2.GaussianBlur(paper.astype(np.float32), (0, 0), 1.0)
    # where on the sheet each pixel falls
    D = VP_L * S
    left = xx < 290 * S
    f = np.where(left, (D - xx) / D, 1.0)
    foot = np.where(left, (FOOT_L[0] + FOOT_L[1] * xx / S) * S, FOOT_B * S)
    u = np.where(left, D * xx / np.maximum(D - xx, 1) + LEFT_SHEET, xx - COL0 * S + 6 * PAGE_W)
    v = (foot - yy) / f - V_OFF * S                                              # height above the first row's foot
    T = texture()
    Ht, Wt = T.shape[:2]
    mapx = (u % Wt).astype(np.float32)
    mapy = (Ht - 1 - (v % Ht)).astype(np.float32)
    alb = cv2.remap(T, mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP).astype(np.float32) / 255
    del T
    # a little paper grain, so it isn't flatter than the paper it replaces
    rng = np.random.default_rng(3)
    grain = cv2.GaussianBlur(rng.normal(0, 1, (Hc, Wc)).astype(np.float32), (0, 0), 1.2)
    grain = grain / grain.std() * .018
    # all the paper in greyscale: the pages, the notes and the napkins one grey, in the room's light (its brightness only)
    luma = np.array([.299, .587, .114], np.float32)
    new = ((lit @ luma) * (alb @ luma) * (1 + grain))[..., None] * np.ones(3, np.float32)
    out = room4.astype(np.float32).copy()
    # beside the new paper, what's kept and dark (the old paper's shadowed edges along the vault, the pillars and the
    # arches) goes grey too, fading out over 12 pixels, so no warm fringe of the old paper is left; not the chandelier
    d = cv2.distanceTransform((paper == 0).astype(np.uint8), cv2.DIST_L2, 5)
    fade = np.clip(1 - d / (12 * S), 0, 1) * (L4 < 35) * (iron == 0) * (paper == 0)
    grey = (out[:Hc] @ luma)[..., None]
    out[:Hc] = out[:Hc] * (1 - fade[..., None]) + grey * fade[..., None]
    out[:Hc] = out[:Hc] * (1 - m[..., None]) + new * m[..., None]
    return np.clip(out + .5, 0, 255).astype(np.uint8), paper
