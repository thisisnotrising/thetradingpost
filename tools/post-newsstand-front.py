"""
THE POST'S NEWSSTAND, CLEAN                          python3 tools/post-newsstand-front.py
(needs Python 3 with numpy and OpenCV: pip install numpy opencv-python-headless)

THE POST's room picture (assets/img/post/room2/room-*.webp) has the Newsstand baked in, and the baked one had gone
wrong (Nov 22, Kathi): yellow smears of glare under every row, the cover grid uneven from row to row, no ISSUE labels
or tabs, and the bulbs not framing the whole stand. This lays the real Newsstand over it, straight from the room's own
recipe, so it is the same stand visitors open: 20 covers in an even 5 x 4 grid, each with its ISSUE tag, clear glass
shelves, the 01-20 / 21-40 / MEMOIRS tabs. The room's own frame of glowing bulbs round it, and its NOW SOARING sign and
striped awning above it (a real box, standing off the wall), stay as they are.

WHAT GOES IN
  tools/ref/newsstand-front.webp   the Newsstand straight on, on its white brick (1420 x 2842): the kiosk that
                                   post/recipe.html builds on the left wall (assets/post.js, kiosk()), drawn at its own
                                   full width (1180 px) instead of shrunk onto the wall, with 600 px of the same brick
                                   above it and 300 below. To make it again: open post/recipe.html, move the
                                   .nrp-kiosk into a box of that size with the brick (baked/brick-white.webp) behind it
                                   at 1.44 times the kiosk's scale (the room picture's bricks are that much bigger
                                   against the stand: a course every 36 pixels by the stand, not 25), hide its frame
                                   of bulbs (.nrp-marquee), take off its scale(), and screenshot the box. FRAME_FLAT
                                   is where that frame's corner bulbs were.
  the room pictures                room-2400.webp (autumn) and room-2400-winter.webp

THE STEPS (all positions in pixels of the big room picture, 2398 x 2624)
  1. THE WALL'S PERSPECTIVE: the stand's frame of bulbs is a rectangle on the wall; in the room picture its four
     corner bulbs are at FRAME_ROOM (they line up on the wall's vanishing point, about x 1205, y 1598). The flat
     picture's corner bulbs (FRAME_FLAT) are mapped onto them, and the whole flat picture follows: the new frame
     lands exactly on the old one.
  2. WHERE IT GOES: the frame and everything in it, from just above its top row of bulbs (under the awning) to just
     under its foot, between its left and right bulbs; not the sign, the awning or the Wishing Wall beside it.
  3. THE ROOM'S LIGHT: how the room lights its brick is read off plain brick in and round the stand (the room's brick
     divided by the flat brick, colour by colour, smoothed into one gentle surface), and the new stand is lit the same
     way. The bulbs are lit like the room's other bulbs (a bright warm core and a soft glow round each). A touch of
     blur, so it's no sharper than the room round it.
  4. WHAT STAYS: the bench in front of the stand's foot, and the room's own frame of glowing bulbs. The flat picture
     is made without the stand's frame, and the room's bulbs sit exactly on the new frame's line, so they stay as they
     are, all round the stand.
  5. SAVED: room-2400*.webp, and room-1600*.webp made from it. The phone pictures don't show the stand, so they stay.

tools/post-newsstand-cover.py (painting one cover into the old stand's pocket) isn't needed any more: this stand has
all 20 pockets, and later issues go on the 21-40 tab.
"""
import os, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOM = os.path.join(HERE, "..", "assets", "img", "post", "room2")
FLAT = os.path.join(HERE, "ref", "newsstand-front.webp")

FRAME_FLAT = [(110.1, 1003.9), (1310.3, 1003.8), (1311.0, 2549.2), (111.5, 2549.9)]   # TL, TR, BR, BL corner bulbs
FRAME_ROOM = [(45.7, 1326.6), (505.4, 1434.3), (505.4, 2089.2), (45.6, 2412.6)]
VP = (1205, 1598)                       # the wall's vanishing point (where its level lines meet)
X_LEFT, X_RIGHT = 14, 521              # 2. the area: from the frame's left bulbs to its right ones (with their glow)
ABOVE_TOP = 26                          # how far above the frame's top row of bulbs (at the left; less to the right)
FOOT_BELOW = 42                         # how far under the frame's bottom row of bulbs
BENCH = (400, 2010, 730, 2340)          # 4. the bench's box


def on_wall_line(x, x0, y0):
    """y at x on the wall's level line through (x0, y0) (it heads for the vanishing point)"""
    return y0 + (VP[1] - y0) * (x - x0) / (VP[0] - x0)


def area(H, W):
    """2. where the new stand goes (soft-edged): the frame, from just above its top row of bulbs to just under its foot"""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    top = on_wall_line(xx, FRAME_ROOM[0][0], FRAME_ROOM[0][1] - ABOVE_TOP)
    foot = on_wall_line(xx, FRAME_ROOM[3][0], FRAME_ROOM[3][1] + FOOT_BELOW)
    m = ((xx >= X_LEFT) & (xx <= X_RIGHT) & (yy >= top) & (yy <= foot)).astype(np.float32)
    return cv2.GaussianBlur(m, (0, 0), 2.5)


def keep_in_front(room):
    """4. what the new stand must not cover: the bench in front of its foot, and the room's own frame of bulbs (the
    flat picture is made without its frame, so the room's glowing bulbs, which sit exactly on the new frame's line,
    stay as they are: every bulb round all four sides)"""
    H, W = room.shape[:2]
    hsv = cv2.cvtColor(room, cv2.COLOR_BGR2HSV)
    # the bench: the one big blob of brown wood in its box
    x0, y0, x1, y1 = BENCH
    sub = hsv[y0:y1, x0:x1]
    wood = ((sub[..., 0] < 25) & (sub[..., 1] > 70) & (sub[..., 2] > 50) & (sub[..., 2] < 215)).astype(np.uint8)
    wood = cv2.morphologyEx(wood, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(wood)
    bench = np.zeros((H, W), np.float32)
    if n > 1:
        big = 1 + int(np.argmax(st[1:, 4]))
        bench[y0:y1, x0:x1] = (lab == big)
    # the frame's bulbs: each one's hot core (the brightest, most saturated warm light: strict, so the glare under
    # the awning doesn't run them together), kept if it lies on the frame's line (checked in the flat picture's
    # terms); round each core, the whole bulb and its socket, sized for how far along the wall it is (bulbs shrink
    # toward the vanishing point)
    core = ((hsv[..., 2] > 235) & (hsv[..., 0] < 35) & (hsv[..., 1] > 120)).astype(np.uint8)
    core = cv2.morphologyEx(core, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, cen = cv2.connectedComponentsWithStats(core)
    Minv = cv2.getPerspectiveTransform(np.float32(FRAME_ROOM), np.float32(FRAME_FLAT))
    (fx0, fy0), (fx1, _), _, (_, fy1) = FRAME_FLAT
    bulbs = np.zeros((H, W), np.float32)
    for i in range(1, n):
        if not 60 <= st[i, 4] <= 2000:
            continue
        u, v = cv2.perspectiveTransform(np.float32([[cen[i]]]), Minv)[0, 0]
        on_side = (abs(u - fx0) < 45 or abs(u - fx1) < 45) and fy0 - 45 < v < fy1 + 45
        on_end = (abs(v - fy0) < 45 or abs(v - fy1) < 45) and fx0 - 45 < u < fx1 + 45
        if not (on_side or on_end):
            continue
        # the bulb round its core (a core can run two or three bulbs together, so the core's own shape is grown, not
        # a single bulb drawn at its middle), and its socket above it
        cx, cy = cen[i]
        k = (VP[0] - cx) / (VP[0] - FRAME_ROOM[0][0])
        x, y, w, h = st[i, :4]
        p = int(40 * k) + 2
        y0c, x0c = max(0, y - p), max(0, x - p)
        crop = (lab[y0c:y + h + p, x0c:x + w + p] == i).astype(np.uint8)
        rx, ry = max(2, int(13 * k)), max(2, int(15 * k))
        grown = cv2.dilate(crop, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * rx + 1, 2 * ry + 1)))
        up = int(14 * k)
        grown[:-up or None] |= grown[up:]                             # and up over the socket
        region = bulbs[y0c:y0c + grown.shape[0], x0c:x0c + grown.shape[1]]
        np.maximum(region, grown.astype(np.float32), out=region)
    bulbs = cv2.GaussianBlur(bulbs, (0, 0), 2.0)
    return cv2.GaussianBlur(np.maximum(bench, bulbs), (0, 0), 1.0)


def relight(room, flat_w, inside):
    """3. the room's light on its brick: room / flat brick, colour by colour, on the brick round the stand, smoothed
    into a quadratic surface over the wall, then applied to the new stand"""
    H, W = room.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    near = cv2.dilate(inside, np.ones((81, 81), np.uint8)) > 0                # the stand and the wall round it
    covered = flat_w[..., 3] > .99
    rlab = cv2.cvtColor(room, cv2.COLOR_BGR2LAB).astype(np.float32)
    flab = cv2.cvtColor(np.clip(flat_w[..., :3], 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
    neutral = lambda lab: np.hypot(lab[..., 1] - 128, lab[..., 2] - 128) < 9
    # plain brick in both: light and neutral in the room and in the flat picture (not covers, bulbs, text or glare)
    sample = near & covered & neutral(rlab) & neutral(flab) & (rlab[..., 0] > 150) & (flab[..., 0] > 150)
    sample = cv2.erode(sample.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    ys, xs = np.nonzero(sample)
    X = lambda x, y: np.stack([np.ones_like(x), x, y, x * x, x * y, y * y], 1).astype(np.float64)
    out = np.empty_like(flat_w[..., :3])
    rb = cv2.GaussianBlur(room.astype(np.float32), (0, 0), 6)
    fb = cv2.GaussianBlur(flat_w[..., :3], (0, 0), 6)
    for c in range(3):
        g = rb[..., c][ys, xs] / np.maximum(fb[..., c][ys, xs], 1)
        coef, *_ = np.linalg.lstsq(X(xs / 1000., ys / 1000.), g, rcond=None)
        gain = (X(xx.ravel() / 1000., yy.ravel() / 1000.) @ coef).reshape(H, W).astype(np.float32)
        out[..., c] = flat_w[..., c] * gain
    # then one overall touch so the plain brick inside the stand is exactly as bright as the brick round it
    olab = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
    inner = (inside > 0) & covered & neutral(olab) & neutral(flab) & (flab[..., 0] > 150)
    outer = near & ~(cv2.dilate(inside, np.ones((9, 9), np.uint8)) > 0) & neutral(rlab) & (rlab[..., 0] > 150)
    if inner.sum() > 500 and outer.sum() > 500:
        out *= np.median(rlab[..., 0][outer]) / np.median(olab[..., 0][inner])
    return out


def lay(room, flat):
    H, W = room.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32(FRAME_FLAT), np.float32(FRAME_ROOM))
    fa = np.dstack([flat.astype(np.float32), np.full(flat.shape[:2], 255, np.float32)])
    fw = cv2.warpPerspective(fa, M, (W, H), flags=cv2.INTER_AREA, borderValue=(0, 0, 0, 0))
    fw[..., 3] /= 255
    inside = area(H, W)
    lit = relight(room, fw, (inside > .5).astype(np.uint8))
    lit = cv2.GaussianBlur(lit, (0, 0), .55)
    a = (inside * fw[..., 3] * (1 - keep_in_front(room)))[..., None]
    return np.clip(room.astype(np.float32) * (1 - a) + lit * a, 0, 255).astype(np.uint8)


if __name__ == "__main__":
    flat = cv2.imread(FLAT)
    for season in ("", "-winter"):
        path = os.path.join(ROOM, f"room-2400{season}.webp")
        room = cv2.imread(path)
        out = lay(room, flat)
        cv2.imwrite(path, out, [cv2.IMWRITE_WEBP_QUALITY, 82])
        small = cv2.resize(out, (1600, 1751), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(ROOM, f"room-1600{season}.webp"), small, [cv2.IMWRITE_WEBP_QUALITY, 82])
        print(f"the clean Newsstand laid into room-2400{season}.webp and room-1600{season}.webp")
