"""THE CELLAR (Nov 22): the books on the brass coffee table become a stack of TO BE HUMAN, Season 2 (Garrett Rees).
-------------------------------------------------------------------------------------------
Kathi's photo of the printed copies (black covers, white page edges, glossy) is the reference; the cover on top is
the real cover (originals/tbh-s2-cover.png, her file TBH_Garrett_Rees.png). The amethyst that sat on the books stays
exactly where it was, now resting on the magazines; the votive candle in front stays in front.

HOW (on the 3200 x 4800 cellar, after the coherence filter):
  1. THE BOOKS OUT: the two leather books (and the ribbon on them) are cut out and the brass tabletop, its rim and the
     floor behind are filled in from around them (PatchMatch, the same fill as THE REST's sheepskin). The amethyst
     and the votive are kept out of the fill.
  2. THE STACK, BUILT: eleven copies, each a thin box the size of the magazine (8.5 x 11 in, 3.1 mm thick), laid flat
     where the books were, each nudged a few millimetres and turned a degree or so, like a real stack. Seen the way
     the room's camera sees the table (looking down about 15 degrees: the table's top is an ellipse four times wider
     than deep). Each copy: black cover, cream page edges with fine lines, a dark seam between copies. The top copy
     carries the cover, squeezed into the table's perspective; the copies under it show only where they peek out.
  3. THE LIGHT: the votive in front and the lanterns to the left light the stack from the front left (brighter near
     the candle, falling off to the right); the glossy cover reflects the room behind it, faintly, as gloss does at
     a low angle; a soft contact shadow on the brass, thrown to the right and back.
  4. FINISH: the amethyst and the votive laid back over the stack, the room's grain added, so it sits in the picture.
Run:  python3 tools/speak-faces/cellar_tbh.py <cellar-in.png> <cellar-out.png>
"""
import os, sys, cv2, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
COVER = os.path.join(HERE, 'originals', 'tbh-s2-cover.png')

# all positions on the 3200 x 4800 cellar
CROP = (1000, 3540, 1660, 3960)                  # x0, y0, x1, y1: the working area around the table's books
BOOKS = [(1143, 3710), (1235, 3698), (1430, 3699), (1452, 3684), (1492, 3708), (1494, 3758), (1516, 3768),
         (1517, 3870), (1490, 3881), (1300, 3879), (1222, 3876), (1117, 3861), (1115, 3758), (1140, 3750)]
AMETHYST_BOX = (1220, 3542, 1424, 3717)        # (its foot ends at 3716: below that is the book it sat on)
VOTIVE = (1146, 3768, 1217, 3888)                # the small glass candle in front of the books (it stays in front)
PILLAR = (1012, 3734, 1121, 3886)                # the bigger glass candle to its left (it stays in front too)
FLAME = (1182, 3792)                             # its flame: the stack's key light

THETA = np.radians(15.0)                         # the camera looks down at the table by about 15 degrees
S = 21.0                                         # pixels per centimetre at the stack's front edge
DIST = 250.0                                     # the camera's distance (cm): a real lens, so the far edge is a little narrower
W, D, T = 21.6, 27.9, 0.31                       # the magazine: width, depth (portrait, cover's foot toward us), thickness (cm)
N = 9                                            # copies in the stack (its top meets the amethyst's foot, where the books' did)
TURN = 6.0                                       # the whole stack turned a little (degrees), so it plainly lies flat
FRONT = (1330.0, 3884.0)                         # the stack's front-bottom middle, on screen
# (FRONT, S, N and TURN were solved together, fit_stack in the notes below: of every placement tried, this one covers
#  all but 89 pixels of where the books were, with the amethyst's foot resting on the cover's far edge)


def rim(x):
    """The tabletop's back edge on screen (measured right of the books, where it shows; flatter toward the middle)."""
    x = np.asarray(x, np.float32)
    return np.where(x > 1500, 3763 + (x - 1500) * 0.18, 3763 - (1500 - x) * 0.05)


def ell(n):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))


def masks(img):
    """The books (to fill), the amethyst and the votive (to keep in front), in the CROP's coordinates."""
    x0, y0, x1, y1 = CROP
    h, w = y1 - y0, x1 - x0
    books = np.zeros((h, w), np.uint8)
    cv2.fillPoly(books, [(np.array(BOOKS) - [x0, y0]).astype(np.int32)], 1)
    # the amethyst: purple, lavender and white crystal, against dark leather, dark floor and orange glints
    ax0, ay0, ax1, ay1 = AMETHYST_BOX
    lab = cv2.cvtColor(img[ay0:ay1, ax0:ax1], cv2.COLOR_BGR2LAB).astype(np.float32)
    L, a, b = lab[..., 0] * 100 / 255, lab[..., 1] - 128, lab[..., 2] - 128
    purple = (a > 6) & (b < 2) & (L > 18)
    pale = (L > 62) & (np.hypot(a, b) < 16) & (b < 6) & (a > -2)
    seed = (purple | pale).astype(np.uint8)
    seed = cv2.morphologyEx(seed, cv2.MORPH_CLOSE, ell(9))
    n, cc, st, _ = cv2.connectedComponentsWithStats(seed)
    am = (cc == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    ff = am.copy(); cv2.floodFill(ff, np.zeros((ff.shape[0] + 2, ff.shape[1] + 2), np.uint8), (0, 0), 1)
    am = am | (1 - ff)                                                                   # fill its dark inner facets
    # refine the edge with GrabCut (sure crystal inside, sure background far outside)
    gc = np.where(cv2.erode(am, ell(9)) > 0, cv2.GC_FGD, np.where(cv2.dilate(am, ell(15)) > 0, cv2.GC_PR_FGD, cv2.GC_BGD)).astype(np.uint8)
    bgd, fgd = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(np.ascontiguousarray(img[ay0:ay1, ax0:ax1]), gc, None, bgd, fgd, 4, cv2.GC_INIT_WITH_MASK)
    am = np.isin(gc, (cv2.GC_FGD, cv2.GC_PR_FGD)).astype(np.uint8)
    n, cc, st, _ = cv2.connectedComponentsWithStats(am)
    am = (cc == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    warmgrey = (b > 8) & (a < 14)                                                        # leather, not crystal
    am[warmgrey & (np.arange(am.shape[0])[:, None] > am.shape[0] - 22)] = 0
    amethyst = np.zeros((h, w), np.uint8); amethyst[ay0 - y0:ay1 - y0, ax0 - x0:ax1 - x0] = am
    votive = np.zeros((h, w), np.uint8)
    vx0, vy0, vx1, vy1 = VOTIVE
    cv2.rectangle(votive, (vx0 - x0 + 6, vy0 - y0), (vx1 - x0 - 6, vy1 - y0), 1, -1)
    cv2.rectangle(votive, (vx0 - x0, vy0 - y0 + 10), (vx1 - x0, vy1 - y0 - 8), 1, -1)
    for cx in (vx0 - x0 + 7, vx1 - x0 - 7):
        cv2.circle(votive, (cx, vy1 - y0 - 8), 7, 1, -1)
    px0, py0, px1, py1 = PILLAR
    cv2.ellipse(votive, ((px0 + px1) // 2 - x0, py0 - y0 + 14), ((px1 - px0) // 2, 14), 0, 0, 360, 1, -1)
    cv2.rectangle(votive, (px0 - x0, py0 - y0 + 14), (px1 - x0, py1 - y0 - 10), 1, -1)
    cv2.ellipse(votive, ((px0 + px1) // 2 - x0, py1 - y0 - 10), ((px1 - px0) // 2, 10), 0, 0, 360, 1, -1)
    return books, amethyst, votive


def clear_books(img, books, amethyst, votive, stack=None):
    """Fill where the books were and the stack won't be (with the stack's coverage given, only those slivers)."""
    from patchmatch import patch_match
    x0, y0, x1, y1 = CROP
    crop = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2RGB)
    keep_front = cv2.dilate(((amethyst > 0) | (votive > 0)).astype(np.uint8), ell(3))
    hole = cv2.dilate(books, ell(9)) & (1 - keep_front)
    if stack is not None:
        hole &= (cv2.erode((stack > 0.98).astype(np.uint8), ell(5)) == 0).astype(np.uint8)
    # copy only from like with like: behind the table's back rim, the floor and the cowhide; in front of it, the brass
    # tabletop. Never from the books, the crystal, the candles, the brass lantern or the vase (everything left of x 1225
    # above the table), nor anything candle-bright.
    yy, xx = np.mgrid[y0:y1, x0:x1]
    Lc = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2LAB)[..., 0]
    no_src = (cv2.dilate(books, ell(15)) > 0) | (keep_front > 0) | (xx < 1225) | (cv2.dilate((Lc > 215).astype(np.uint8), ell(9)) > 0)
    behind = yy < rim(xx)
    out = crop
    # the thin top strip (between the books' top and where the stack's far edge will be) is smoothed from its edges
    # afterwards; patches alone leave steps in a strip that thin
    for part, src in ((hole & behind, behind & (yy < rim(xx) - 4)), (hole & ~behind, ~behind & (yy > rim(xx) + 4) & (yy < 3895))):
        if not part.any(): continue
        keep = ((no_src | ~src) & (part == 0)).astype(np.uint8) * 255
        out = patch_match.inpaint(out, part.astype(np.uint8) * 255, global_mask=keep, patch_size=9)
    yy_, xx_ = np.mgrid[y0:y1, x0:x1]
    top = (hole & behind & (xx_ < 1440) & (yy_ < 3722)).astype(np.uint8)
    if top.any():
        smooth = cv2.inpaint(crop, top * 255, 7, cv2.INPAINT_TELEA).astype(np.float32)
        grain = np.random.default_rng(3).standard_normal(smooth.shape).astype(np.float32) * 2.5
        mix = cv2.GaussianBlur(top.astype(np.float32), (0, 0), 1.5)[..., None] * 0.7
        out = np.clip(out * (1 - mix) + (smooth + grain) * mix, 0, 255).astype(np.uint8)
    res = img.copy()
    res[y0:y1, x0:x1] = cv2.cvtColor(out, cv2.COLOR_RGB2BGR)
    return res


def project(X, Y, Z):
    """Table centimetres (X right, Y up, Z away from us; 0 = the stack's front-bottom middle) -> screen pixels, through
    a pinhole camera DIST cm away, looking down THETA (so the origin lands on FRONT at S pixels per cm)."""
    st, ct = np.sin(THETA), np.cos(THETA)
    vy, vz = Y - DIST * st, Z + DIST * ct                      # from the camera to the point
    yc = vy * ct + vz * st                                     # up, in the camera's view
    zc = -vy * st + vz * ct                                    # straight ahead, in the camera's view
    F = S * DIST
    return FRONT[0] + F * X / zc, FRONT[1] - F * yc / zc


def copies():
    """Each copy's offset (cm) and turn (degrees), bottom to top: a neat stack, not a block."""
    rng = np.random.default_rng(22)
    out = []
    for i in range(N):
        dx, dz, a = rng.normal(0, 0.18), rng.normal(0, 0.15), rng.normal(0, 0.35)
        if i == N - 1: dx, dz, a = 0.1, 0.05, 0.0                # the top copy: neat
        if i == 4: dx, dz, a = dx - 0.45, dz - 0.3, a - 0.6      # one copy a little proud of the rest at the front, like her photo
        out.append((dx, dz, a + TURN))                           # every copy turns about its own middle: the stack turns TURN
    return out


def corners(dx, dz, a, y, table=False):
    """The copy's four corners at height y: back-left, back-right, front-right, front-left (screen pixels, or the
    table centimetres X, Z with table=True)."""
    r = np.radians(a)
    loc = np.array([[-W / 2, D / 2], [W / 2, D / 2], [W / 2, -D / 2], [-W / 2, -D / 2]])
    rot = loc @ np.array([[np.cos(r), np.sin(r)], [-np.sin(r), np.cos(r)]])
    X, Z = rot[:, 0] + dx, rot[:, 1] + D / 2 + dz
    if table: return np.stack([X, Z], 1)
    sx, sy = project(X, y, Z)
    return np.stack([sx, sy], 1)


def render_stack(room, cover_bgr, k=4):
    """The stack, drawn at k times the size and brought down (smooth edges). Returns colour and coverage (alpha)
    over the CROP, plus the top copy's corners (for the hover spot)."""
    x0, y0, x1, y1 = CROP
    h, w = (y1 - y0) * k, (x1 - x0) * k
    col = np.zeros((h, w, 3), np.float32); alpha = np.zeros((h, w), np.float32)
    def to_canvas(p): return ((p - [x0, y0]) * k).astype(np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    sx, sy = xx / k + x0, yy / k + y0
    # the key light: the votive in front-left, falling off with distance; a warm fill from the left; a dim ambient
    d = np.hypot((sx - FLAME[0]) / 1.0, (sy - FLAME[1]) * 1.6)
    key = 1.0 / (1.0 + (d / 210.0) ** 2)
    left = np.clip((1500 - sx) / 400, 0, 1) * 0.35
    warm = np.float32([0.80, 0.90, 1.0])                                         # BGR: candle-warm, within the graded room
    paper = np.float32([196, 214, 228])                                          # BGR: cream page edges
    ink = np.float32([22, 20, 22])                                               # the black cover stock
    top_y = 0
    for i, (dx, dz, a) in enumerate(copies()):
        yb, yt = i * T, (i + 1) * T - 0.015
        cb, ct = corners(dx, dz, a, yb), corners(dx, dz, a, yt)
        tb = corners(dx, dz, a, yb, table=True)
        # the faces that look toward us: front (the cover's foot: page edges), and, when the copy is turned, a sliver of
        # its left (the spine's fold) or right (the pages' fore-edge)
        faces = [(3, 2, 'front'), (0, 3, 'left'), (2, 1, 'right')]
        for p, q, name in faces:
            ex, ez = tb[q] - tb[p]
            nz = -ex / max(np.hypot(ex, ez), 1e-6)                     # the face's outward normal, toward us if < 0
            if nz > -0.004: continue
            quad = np.array([to_canvas(ct[p]), to_canvas(ct[q]), to_canvas(cb[q]), to_canvas(cb[p])])
            m = np.zeros((h, w), np.uint8); cv2.fillConvexPoly(m, np.round(quad).astype(np.int32), 1, lineType=cv2.LINE_8)
            if not m.any(): continue
            # down the face: 0 at its top edge, 1 at its bottom edge
            ytop = np.interp(xx, [quad[0][0], quad[1][0]], [quad[0][1], quad[1][1]]) if quad[1][0] != quad[0][0] else np.full_like(xx, quad[0][1])
            hpx = max(np.abs(quad[3][1] - quad[0][1]), 1.0)
            v = np.clip((yy - ytop) / hpx, 0, 1)
            if name == 'left':                                                     # the spine: the cover's black fold
                base = ink[None, None] * (1 + 0 * v[..., None])
            else:                                                                  # the foot / fore-edge: pages between black covers
                lines = 0.93 + 0.07 * np.cos(v * np.pi * 26)
                base = paper[None, None] * lines[..., None]
                cov = (v < 0.13) | (v > 0.87)
                base = np.where(cov[..., None], ink[None, None], base)
                base = base * (1 - 0.55 * np.clip((v - 0.82) / 0.18, 0, 1))[..., None]   # the seam under it
            shade = 0.16 + 0.95 * key + left * (0.6 if name == 'front' else 0.3)
            c = base * shade[..., None] * warm[None, None]
            sel = m > 0
            col[sel] = c[sel]; alpha[sel] = 1
        # the top face: the cover (the top copy) or a shaded black cover (the ones under it)
        quad = np.array([to_canvas(p) for p in ct])
        src = np.float32([[0, 0], [cover_bgr.shape[1], 0], [cover_bgr.shape[1], cover_bgr.shape[0]], [0, cover_bgr.shape[0]]])
        M = cv2.getPerspectiveTransform(src, quad)
        tex = cv2.warpPerspective(cover_bgr.astype(np.float32), M, (w, h), flags=cv2.INTER_AREA)
        m = cv2.warpPerspective(np.ones(cover_bgr.shape[:2], np.float32), M, (w, h), flags=cv2.INTER_LINEAR) > 0.5
        if i < N - 1: tex = tex * 0.35                                              # in the shade of the copy on it
        shade = 0.30 + 0.55 * key + left * 0.35
        c = tex * shade[..., None] * warm[None, None]
        col[m] = c[m]; alpha[m] = 1
        if i == N - 1: top_quad = ct
    # the gloss: the cover reflects the room behind it at this low angle (Fresnel), and the candle's sheen
    top = np.zeros((h, w), np.uint8); cv2.fillConvexPoly(top, np.round(np.array([to_canvas(p) for p in top_quad])).astype(np.int32), 1)
    back_y = int(min(top_quad[0][1], top_quad[1][1]))
    band = room[max(back_y - 160, 0):back_y, x0:x1].astype(np.float32)               # what stands behind the stack
    refl = cv2.resize(cv2.GaussianBlur(band[::-1], (0, 0), 3.5), (w, band.shape[0] * k), interpolation=cv2.INTER_LINEAR)
    ry0 = int((back_y - y0) * k)
    full = np.zeros_like(col); hh = min(refl.shape[0], h - ry0); full[ry0:ry0 + hh] = refl[:hh]
    fres = 0.12 + 0.38 * np.clip(1 - (yy - ry0) / (120 * k), 0, 1) ** 1.3          # a glossy cover at a low angle: a mirror at the far edge
    col = np.where(top[..., None] > 0, col + full * fres[..., None], col)
    sheen = np.exp(-((sx - (FLAME[0] + 40)) / 120) ** 2 - ((sy - (top_quad[3][1] - 18)) / 22) ** 2) * 55
    col += (top > 0)[..., None] * sheen[..., None] * np.float32([0.85, 0.93, 1.0])
    # back to the room's size: smooth edges
    col = cv2.resize(col, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    alpha = cv2.resize(alpha, (x1 - x0, y1 - y0), interpolation=cv2.INTER_AREA)
    return col, alpha, top_quad


def contact_shadow(alpha):
    """A soft shadow on the brass, under the stack and thrown right and back (the light is front-left)."""
    a = (alpha > 0.5).astype(np.float32)
    shifted = cv2.warpAffine(a, np.float32([[1, 0, 12], [0, 1, 3]]), (a.shape[1], a.shape[0]))
    sh = cv2.GaussianBlur(np.maximum(a, shifted), (0, 0), 11)
    tight = cv2.GaussianBlur(a, (0, 0), 2.0)
    s = np.clip(sh * 0.32 + tight * 0.28, 0, 0.5)
    yy = np.mgrid[0:a.shape[0], 0:a.shape[1]][0] + CROP[1]
    return s * (yy > 3760)                                     # only on the tabletop, below its back rim


def build(img):
    H, W_ = img.shape[:2]
    assert (W_, H) == (3200, 4800), 'run on the 3200 x 4800 cellar'
    x0, y0, x1, y1 = CROP
    books, amethyst, votive = masks(img)
    cover = cv2.imread(COVER)
    room = clear_books(img, books, amethyst, votive)           # the whole book area, like with like
    col, alpha, top_quad = render_stack(room, cover)
    reg = room[y0:y1, x0:x1].astype(np.float32)
    reg *= (1 - contact_shadow(alpha))[..., None]
    rng = np.random.default_rng(5)
    col += rng.standard_normal(col.shape).astype(np.float32) * 2.2               # the room's grain
    col = cv2.GaussianBlur(col, (0, 0), 0.5)
    # the stack in the polished brass: its front, mirrored under its foot, faint and soft (like the votive's)
    hh = alpha.shape[0]
    foot = int(np.max(np.nonzero(alpha.max(1) > 0.5)[0]))
    span = min(60, hh - foot - 1)
    mir_c = col[foot - span:foot][::-1]; mir_a = alpha[foot - span:foot][::-1]
    fade = np.linspace(0.22, 0.0, span, dtype=np.float32)[:, None]
    ra = cv2.GaussianBlur(mir_a * fade, (0, 0), 2.5); rc = cv2.GaussianBlur(mir_c, (0, 0), 2.5)
    seg = reg[foot:foot + span]
    reg[foot:foot + span] = seg * (1 - ra[..., None]) + rc * ra[..., None]
    reg = reg * (1 - alpha[..., None]) + col * alpha[..., None]
    # the crystal and the candle stay in front, exactly as rendered (soft edged)
    orig = img[y0:y1, x0:x1].astype(np.float32)
    front = cv2.GaussianBlur(np.maximum(amethyst, votive).astype(np.float32), (0, 0), 1.0)
    # the crystal's own shadow on the top cover, where it sits
    am_sh = cv2.GaussianBlur(cv2.warpAffine(amethyst.astype(np.float32), np.float32([[1, 0, 10], [0, 1, 4]]), (x1 - x0, y1 - y0)), (0, 0), 6)
    reg *= (1 - 0.5 * am_sh * alpha)[..., None]
    reg = reg * (1 - front[..., None]) + orig * front[..., None]
    out = img.copy()
    out[y0:y1, x0:x1] = np.clip(reg, 0, 255).astype(np.uint8)
    return out, top_quad


if __name__ == '__main__':
    out, q = build(cv2.imread(sys.argv[1]))
    cv2.imwrite(sys.argv[2], out)
    print('top cover corners (screen):', np.round(q).astype(int).tolist())
