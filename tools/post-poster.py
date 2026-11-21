"""
SWAP THE POSTER ON THE POST'S BLACK WALL         python3 tools/post-poster.py
(needs Python 3 with numpy and OpenCV: pip install numpy opencv-python-headless)

The room picture (assets/img/post/room2/room-2400.webp) has the Best Storyteller poster baked in, seen at an
angle on the black wall. When the poster changes (tools/render-poster.js makes the new one), this puts the new one
in its place, in all three room pictures (room-2400, room-1600 and the phone slice room-phone).

HOW IT WORKS
  1. FIND THE OLD POSTER: the old poster picture (tools/ref/poster-previous.webp, the wall copy that was baked in) is
     lined up with the room picture (its corners first, then its lettering and cover), which gives the exact angle
     and size it hangs at.
  2. THE ROOM'S LIGHT ON IT: where the old poster shows, the room picture divided by the old poster says how much
     light falls on each part of it (darker toward the corner, a little brighter under the bulbs).
  3. THE NEW POSTER, hung the same way and lit by that same light, replaces the old one, except where ivy hangs in
     front of it: there, the room picture stays as it was.
After running it, copy the new wall poster to tools/ref/poster-previous.webp, ready for the next swap.
"""
import os, sys, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOM = os.path.join(HERE, "..", "assets", "img", "post", "room2")
OLD = os.path.join(HERE, "ref", "poster-previous.webp")
NEW = os.path.join(HERE, "..", "assets", "img", "post", "poster-best-storyteller-wall.webp")
X0 = 719                                  # where the phone slice starts in the big picture

def find(room, old):
    """where the old poster hangs: a first guess from its corners (measured by eye in the picture), then refined
    by lining up its lettering and cover with the room picture until they match (OpenCV's ECC image alignment)"""
    h, w = old.shape[:2]
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    quad = np.float32([[1683, 1282], [1803, 1233], [1803, 1713], [1683, 1708]])   # the dark poster and its frame
    c = quad.mean(0); quad = c + (quad - c) * .94                                  # the poster itself, inside the frame
    s = .25; S = np.diag([s, s, 1]).astype(np.float32)                             # line up at a quarter size (faster)
    small = cv2.cvtColor(cv2.resize(old, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32)
    warp = (cv2.getPerspectiveTransform(src, quad) @ np.linalg.inv(S)).astype(np.float32)
    gray = cv2.cvtColor(room, cv2.COLOR_BGR2GRAY).astype(np.float32)
    for blur in (5, 3):
        cc, warp = cv2.findTransformECC(small, gray, warp, cv2.MOTION_HOMOGRAPHY,
                                        (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), None, blur)
    print(f"1. old poster found (match {cc:.2f} out of 1)")
    return warp @ S

def swap(room, H, old, new):
    h, w = room.shape[:2]
    new = cv2.resize(new, (old.shape[1], old.shape[0]), interpolation=cv2.INTER_AREA)
    o = cv2.warpPerspective(old, H, (w, h), flags=cv2.INTER_LINEAR).astype(np.float32)
    n = cv2.warpPerspective(new, H, (w, h), flags=cv2.INTER_LINEAR).astype(np.float32)
    inside = cv2.warpPerspective(np.full(old.shape[:2], 255, np.uint8), H, (w, h))
    inside = cv2.erode(inside, np.ones((3, 3), np.uint8)) / 255.0
    r = room.astype(np.float32)
    # 2. the light: room / old poster, smoothed (only measured where the poster is light enough to measure it)
    lum_o = cv2.cvtColor(o.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
    lum_r = cv2.cvtColor(room, cv2.COLOR_BGR2GRAY).astype(np.float32)
    ok = (inside > .5) & (lum_o > 40)
    gain = np.where(ok, (lum_r + 4) / (lum_o + 4), 0).astype(np.float32)
    wts = cv2.GaussianBlur(ok.astype(np.float32), (0, 0), 25)
    gain = cv2.GaussianBlur(gain, (0, 0), 25) / np.maximum(wts, 1e-3)
    gain = np.clip(gain, .3, 1.6)
    # 3. the new poster goes in everywhere on the poster except where ivy hangs in front of it: strongly coloured
    #    pixels in the room that the old poster itself didn't have (its cover had some gold, so that's left out)
    def coloured(img):
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        return ((hsv[..., 1] > 110) & (hsv[..., 2] > 70)).astype(np.uint8)
    ivy = coloured(room) & ~cv2.dilate(coloured(o.astype(np.uint8)), np.ones((9, 9), np.uint8)).astype(bool)
    ivy = cv2.dilate(ivy.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float32)
    clear = cv2.GaussianBlur(inside * (1 - ivy), (0, 0), .8)
    out = r * (1 - clear[..., None]) + np.clip(n * gain[..., None], 0, 255) * clear[..., None]
    return out.astype(np.uint8), clear

if __name__ == "__main__":
    old = cv2.imread(OLD); new = cv2.imread(NEW)
    big = cv2.imread(os.path.join(ROOM, "room-2400.webp"))
    H = find(big, old)
    out, clear = swap(big, H, old, new)
    print(f"3. new poster in: {int(clear.sum())} pixels replaced")
    cv2.imwrite(os.path.join(ROOM, "room-2400.webp"), out, [cv2.IMWRITE_WEBP_QUALITY, 82])
    cv2.imwrite(os.path.join(ROOM, "room-1600.webp"), cv2.resize(out, (1600, 1751), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 82])
    cv2.imwrite(os.path.join(ROOM, "room-phone.webp"), out[:, X0:X0 + 960], [cv2.IMWRITE_WEBP_QUALITY, 82])
    for f in ("room-2400.webp", "room-1600.webp", "room-phone.webp"):
        print("  ", f, os.path.getsize(os.path.join(ROOM, f)) // 1024, "KB")
