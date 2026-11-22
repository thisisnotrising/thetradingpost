"""
(Nov 22: replaced by tools/post-newsstand-front.py, which lays the whole clean Newsstand, all 20 pockets, into the room.
Kept for the record.)

A NEW COVER ON THE POST'S NEWSSTAND                      python3 tools/post-newsstand-cover.py 20
(needs Python 3 with numpy and OpenCV: pip install numpy opencv-python-headless)

THE POST's room picture (assets/img/post/room2/) has the Newsstand stand baked in, so a new issue doesn't appear there by
itself the way it does on the rack and in the shop window. This paints an issue's cover (its small copy in
assets/img/thumbs/) into its pocket on the stand, in both seasons, then remakes the 1600-wide copies.
The phone pictures (room-phone*.webp) are a slice from the middle of the hall that doesn't include the stand, so they
stay as they are.

HOW IT WORKS
  1. THE POCKET: SLOTS below lists each pocket's four corners in the big picture (2398 x 2624), in the order
     top-left, top-right, bottom-right, bottom-left. The wall turns away from you, so the flat cover is bent into that
     slanted shape. The bottom edge sits on the glass shelf's line, the top edge continues the row's top line, and the
     width matches the cover above it in the same column.
  2. THE ROOM'S LIGHT: the room drew Issue 19's cover (Dan Korus) itself, so we compare its real cover with how the room
     shows it, and give the new cover the same treatment: same blacks, same whites, same warmth, for each season.
  3. THE SOFTNESS AND THE GLASS: a touch of blur, so the cover is no sharper than the covers around it, and the faint
     line of light the glass front puts across each cover.

ADDING A POCKET: measure its corners on a grid over room-2400.webp, add a line to SLOTS, and run the tool with the number.
Run it once per issue. It paints over whatever is in that pocket, so running it twice is harmless.
"""
import os, sys, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
ROOM = os.path.join(ROOT, "assets", "img", "post", "room2")
THUMBS = os.path.join(ROOT, "assets", "img", "thumbs")

# each pocket's corners in the big picture: top-left, top-right, bottom-right, bottom-left (in pixels)
SLOTS = {
    19: [(356.25, 1997), (412.5, 1980.5), (412.5, 2112), (356, 2140)],   # Dan Korus: drawn by the room itself (the reference)
    20: [(416, 1979.5), (487, 1959), (487, 2074), (416, 2112)],          # the last pocket of row 4, under Constantinos (Issue 15)
}
REFERENCE = 19        # the cover whose look in the room the new cover copies
SOFTEN = 0.4          # blur, in pixels of the big picture
GLINT = (.55, .63)    # the glass's line of light: how far down the cover it crosses, at the left and right edge
GLINT_STRENGTH = .3

def warp(cover, corners, size):
    """bend the flat cover into its pocket; also return how much of each pixel it covers (smooth edges)"""
    h, w = cover.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(corners))
    img = cv2.warpPerspective(cover, M, size, flags=cv2.INTER_AREA).astype(np.float32)
    # the edges: drawn 4 times bigger, then shrunk, so they're smooth like the room's own
    k = 4; big = np.zeros((size[1] * k, size[0] * k), np.uint8)
    cv2.fillPoly(big, [np.int32(np.round(np.float32(corners) * k))], 255)
    alpha = cv2.resize(big, size, interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    return img, alpha

def tone_curve(room, ref_cover):
    """how the room shows a cover: its blacks and whites, per colour channel, read off the reference cover"""
    size = (room.shape[1], room.shape[0])
    img, alpha = warp(ref_cover, SLOTS[REFERENCE], size)
    inside = cv2.erode((alpha > .99).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    curves = []
    for c in range(3):
        cov = img[..., c][inside]; rm = room[..., c][inside].astype(np.float32)
        black_in, white_in = np.percentile(cov, .5), np.percentile(cov, 99.5)     # the real cover's black and white
        black_out, white_out = np.percentile(rm, .5), np.percentile(rm, 99.5)     # the same black and white in the room
        curves.append(([black_in, white_in], [black_out, white_out]))
    return curves

def glint(size, corners):
    """the faint line of light the glass front puts across every cover on the stand"""
    w, h = 360, 466
    flat = np.zeros((h, w), np.float32)
    cv2.line(flat, (0, round(h * GLINT[0])), (w, round(h * GLINT[1])), 1.0, 5, cv2.LINE_AA)
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(corners))
    g = cv2.warpPerspective(flat, M, size, flags=cv2.INTER_AREA)
    return cv2.GaussianBlur(g, (0, 0), .8)

def paint(room, cover, n, curves):
    size = (room.shape[1], room.shape[0])
    img, alpha = warp(cover, SLOTS[n], size)
    for c in range(3):
        img[..., c] = np.interp(img[..., c], *curves[c], left=curves[c][1][0], right=None)
    img = cv2.GaussianBlur(img, (0, 0), SOFTEN)
    white = np.float32([c[1][1] for c in curves])
    g = glint(size, SLOTS[n])[..., None] * GLINT_STRENGTH
    img = img * (1 - g) + white * g
    a = alpha[..., None]
    return np.clip(room.astype(np.float32) * (1 - a) + img * a, 0, 255).astype(np.uint8)

if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else sys.exit("which issue? e.g. python3 tools/post-newsstand-cover.py 20")
    if n not in SLOTS: sys.exit(f"no pocket measured for issue {n}: add its corners to SLOTS")
    cover = cv2.imread(os.path.join(THUMBS, f"issue{n:02d}-cover.webp"))
    ref = cv2.imread(os.path.join(THUMBS, f"issue{REFERENCE:02d}-cover.webp"))
    if cover is None: sys.exit(f"assets/img/thumbs/issue{n:02d}-cover.webp is missing")
    for season in ("", "-winter"):
        path = os.path.join(ROOM, f"room-2400{season}.webp")
        room = cv2.imread(path)
        out = paint(room, cover, n, tone_curve(room, ref))
        cv2.imwrite(path, out, [cv2.IMWRITE_WEBP_QUALITY, 82])
        small = cv2.resize(out, (1600, 1751), interpolation=cv2.INTER_AREA)
        cv2.imwrite(os.path.join(ROOM, f"room-1600{season}.webp"), small, [cv2.IMWRITE_WEBP_QUALITY, 82])
        print(f"issue {n} painted into room-2400{season}.webp and room-1600{season}.webp")
