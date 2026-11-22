"""
THE POST'S NEWSSTAND: THE MISSING BULBS PUT BACK          python3 tools/post-newsstand-bulbs.py
(needs Python 3 with numpy and OpenCV, and this folder as a git clone: it reads the room pictures from before Nov 22)

WHAT WENT WRONG (Nov 22, Kathi: "there are lightbulbs missing on the NEWSSTAND"): tools/post-newsstand-front.py laid
the clean Newsstand over the room picture and kept the room's own frame of bulbs by finding each bulb's bright core.
A few bulbs were a little dimmer than the rest (they sat in the old glare), so it didn't find them, and the new stand
was painted over them: four bulbs down the stand's right-hand side (both seasons) and, in autumn, eight along the top
row above the 21-40 and MEMOIRS tabs.

WHAT THIS DOES
  1. THE BEFORE PICTURE: the room pictures as they were just before the clean stand went in (git: the parent of
     commit 9263167), where every bulb is still there.
  2. FIND THE BULBS: every bulb of the frame in the before picture (a peak of warm, bright light lying on the frame's
     line: the four sides of the stand, in the wall's perspective).
  3. WHICH ARE MISSING: a bulb is missing if the current picture has no bright light where the before picture had one.
  4. PUT THEM BACK: each missing bulb is copied from the before picture, its glass and its socket, in exactly the shape
     post-newsstand-front.py uses for the bulbs it kept (the core grown into a bulb, sized for how far along the wall
     it is, plus the socket above it, with soft edges), so the put-back bulbs match their neighbours.
  5. SAVED: room-2400*.webp, and room-1600*.webp made from them (same sizes and quality as before). Nothing else in
     the picture changes. The phone pictures don't show the stand.
"""
import os, subprocess, importlib.util, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(HERE, "..")
ROOM = os.path.join(REPO, "assets", "img", "post", "room2")
BEFORE = "9263167^"                     # the commit before the clean stand went in

spec = importlib.util.spec_from_file_location("front", os.path.join(HERE, "post-newsstand-front.py"))
front = importlib.util.module_from_spec(spec); spec.loader.exec_module(front)
VP, FRAME_ROOM, FRAME_FLAT = front.VP, front.FRAME_ROOM, front.FRAME_FLAT
MINV = cv2.getPerspectiveTransform(np.float32(FRAME_ROOM), np.float32(FRAME_FLAT))
(FX0, FY0), (FX1, _), _, (_, FY1) = FRAME_FLAT


def before(name):
    """1. the room picture as it was before the clean stand"""
    data = subprocess.run(["git", "-C", REPO, "show", f"{BEFORE}:assets/img/post/room2/{name}"],
                          check=True, capture_output=True).stdout
    return cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)


def warm(img):
    """how much warm bulb light each pixel has (bright, saturated, orange-yellow)"""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    return (hsv[..., 2] / 255.) ** 2 * (hsv[..., 1] / 255.) * (hsv[..., 0] < 35)


def along(x):
    """bulbs shrink toward the vanishing point: 1 at the stand's left edge, smaller to the right"""
    return (VP[0] - x) / (VP[0] - FRAME_ROOM[0][0])


def frame_bulbs(img, tol=30):
    """2. the frame's bulbs: peaks of warm light on the frame's line (checked in the flat picture's terms)"""
    w = cv2.GaussianBlur(warm(img), (0, 0), 4)
    peaks = (w == cv2.dilate(w, np.ones((15, 15), np.uint8))) & (w > .12)
    found = []
    for x, y in zip(*np.nonzero(peaks)[::-1]):
        if x > 540 or not 1250 < y < 2480:
            continue
        u, v = cv2.perspectiveTransform(np.float32([[[x, y]]]), MINV)[0, 0]
        side = (abs(u - FX0) < tol or abs(u - FX1) < tol) and FY0 - tol < v < FY1 + tol
        end = (abs(v - FY0) < tol or abs(v - FY1) < tol) and FX0 - tol < u < FX1 + tol
        if side or end:
            found.append((int(x), int(y), float(w[y, x])))
    found.sort(key=lambda p: -p[2])
    kept = []
    for p in found:                                        # one peak per bulb (the strongest)
        if all(np.hypot(p[0] - q[0], p[1] - q[1]) > 22 * along(p[0]) for q in kept):
            kept.append(p)
    return kept


def missing(old, new):
    """3. the bulbs the before picture has and the current one doesn't (no bright light left where it was)"""
    wo, wn = warm(old), warm(new)
    out = []
    for x, y, _ in frame_bulbs(old):
        r = max(4, int(10 * along(x)))
        if wn[y - r:y + r + 1, x - r:x + r + 1].max() < .5 * wo[y - r:y + r + 1, x - r:x + r + 1].max():
            out.append((x, y))
    return out


def bulb_mask(old, spots):
    """4. the shape of each missing bulb in the before picture: its hot core, grown into the bulb, and its socket
    above it (the same sizes as post-newsstand-front.py's keep_in_front), soft-edged"""
    H, W = old.shape[:2]
    w = warm(old)
    mask = np.zeros((H, W), np.float32)
    for cx, cy in spots:
        k = along(cx)
        p = int(40 * k) + 2
        x0, y0 = cx - p, cy - p
        win = w[y0:cy + p + 1, x0:cx + p + 1]
        core = (win > .45 * w[cy - 3:cy + 4, cx - 3:cx + 4].max()).astype(np.uint8)
        n, lab = cv2.connectedComponents(core)
        core = (lab == lab[p, p]).astype(np.uint8) if lab[p, p] else np.zeros_like(core)
        yy, xx = np.mgrid[-p:p + 1, -p:p + 1]
        core &= (np.hypot(xx, yy) <= 12 * k).astype(np.uint8)   # one bulb's core, never the glare beside it
        core[p, p] = 1
        rx, ry = max(2, int(13 * k)), max(2, int(15 * k))
        grown = cv2.dilate(core, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * rx + 1, 2 * ry + 1)))
        up = int(14 * k)
        grown[:-up] |= grown[up:]                                 # and up over the socket
        region = mask[y0:y0 + grown.shape[0], x0:x0 + grown.shape[1]]
        np.maximum(region, grown.astype(np.float32), out=region)
    mask = cv2.GaussianBlur(mask, (0, 0), 2.0)
    return cv2.GaussianBlur(mask, (0, 0), 1.0)


if __name__ == "__main__":
    for season in ("", "-winter"):
        name = f"room-2400{season}.webp"
        path = os.path.join(ROOM, name)
        new, old = cv2.imread(path), before(name)
        spots = missing(old, new)
        m = bulb_mask(old, spots)[..., None]
        out = np.clip(new.astype(np.float32) * (1 - m) + old.astype(np.float32) * m, 0, 255).astype(np.uint8)
        cv2.imwrite(path, out, [cv2.IMWRITE_WEBP_QUALITY, 82])
        small = cv2.resize(out, (1600, 1751), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(ROOM, f"room-1600{season}.webp"), small, [cv2.IMWRITE_WEBP_QUALITY, 82])
        print(f"{name}: {len(spots)} bulbs put back at", sorted(spots, key=lambda s: (s[0] > 480, s[1], s[0])))
