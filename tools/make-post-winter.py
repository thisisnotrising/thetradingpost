"""
THE POST IN WINTER                     python3 tools/make-post-winter.py
(needs Python 3 with numpy, Pillow and OpenCV: pip install numpy pillow opencv-python-headless)

Makes winter copies of THE POST's room picture from the autumn ones (assets/img/post/room2/room-*.webp) and
Kathi's winter mockup (tools/ref/post-winter-mockup.webp). Her mockup is the phone slice of the room (the middle
40%) redone in winter: snowy branches and red leaves seen through the glass roof, string lights along the roof,
the fans' lights on. It lines up with the phone slice to within 2 pixels, so its roof can be laid straight in.

  1. THE ROOF, MIDDLE: the mockup's roof (its frames line up with the room's), laid over the room's roof inside
     the slice it covers, blended into the sides over 160 pixels at each edge.
  2. THE ROOF, SIDES: the big screens show more roof than the mockup. There, the room's own view through each
     pane is turned to winter: its lightness re-spread to match the mockup's (dark snowy branches, white snow),
     its colour the mockup's soft grey, the red leaves on the glass kept. The string lights carry on along their
     rafters to the walls.
  3. BRIGHTER: the whole room is lifted (midtones up, highlights kept), as Kathi asked.
  4. The masks for the live snow (assets/img/post/room2/roof-glass-*.webp): white where the glass is, black where
     the frames, fans and ivy are, so the falling snow is only seen through the glass.
  5. SAVED as room-2400-winter.webp, room-1600-winter.webp and room-phone-winter.webp. (The autumn pictures stay
     as they are, so the weather dial in assets/season.js can switch THE POST back.)

The Best Storyteller poster on the black wall is swapped separately, in both seasons, by tools/post-poster.py.
All positions are in pixels of the big room picture (2398 x 2624). The phone slice is x 719 to 1679.
"""
import os, sys, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOM = os.path.join(HERE, "..", "assets", "img", "post", "room2")
X0, X1 = 719, 1679                      # the phone slice
W, H = 2398, 2624
ROOF = np.array([[230, 0], [2160, 0], [1540, 1018], [868, 1018]], np.int32)   # the glass roof (a generous outline)
EXPOSURE = dict(gamma=.84, lift=1.06)   # 3. brighter: midtones up (gamma below 1), then everything a touch up

def roof_mask():
    m = np.zeros((H, W), np.uint8)
    cv2.fillPoly(m, [ROOF], 255)
    return m

def load_mockup():
    m = cv2.imread(os.path.join(HERE, "ref", "post-winter-mockup.webp"))
    m = cv2.resize(m, (X1 - X0, H), interpolation=cv2.INTER_CUBIC)
    # the small offset measured between the mockup and the phone slice (SIFT matches, 423 of them agreeing)
    A = np.float32([[1.0022, .0005, .24], [.0002, 1.001, 1.26]])
    return cv2.warpAffine(m, A, (X1 - X0, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

def snowy(view, red_keep, mock_glass_L, mock_ab):
    """the room's own autumn view through the glass (at the sides, where the mockup doesn't reach), turned to
    winter: its lightness is re-spread to match the mockup's view through the glass (same share of dark snowy
    branches and white snow), and its colour set to the mockup's soft grey; the red leaves on the glass stay red"""
    lab = cv2.cvtColor(view, cv2.COLOR_BGR2LAB)
    L = lab[..., 0]
    src = np.sort(L[~red_keep].ravel()); dst = np.sort(mock_glass_L)
    q = np.searchsorted(src, np.arange(256)) / max(1, len(src) - 1)        # where each lightness sits in the room's spread
    lut = np.interp(q, np.linspace(0, 1, len(dst)), dst).astype(np.uint8)  # ...and the mockup's lightness at that same spot
    out = np.dstack([lut[L], np.full_like(L, mock_ab[0]), np.full_like(L, mock_ab[1])])
    out = cv2.cvtColor(out, cv2.COLOR_LAB2BGR)
    k = red_keep.astype(np.float32)[..., None]
    return (out * (1 - k) + view * k).astype(np.uint8)

def string_lights(out):
    """carry the mockup's two strings of lights on along their rafters, out to the walls (big screens only):
    a thin dark wire, and on it a warm bulb every 37 pixels with a soft glow round it, like the mockup's"""
    f = out.astype(np.float32)
    yy, xx = np.mgrid[-18:19, -18:19]; d = np.hypot(xx, yy)
    halo = (np.exp(-(d / 9) ** 2) * .75)[..., None]                   # the warm light round each bulb (tints the glass gold)
    core = np.exp(-(d / 3) ** 2)[..., None]                            # the bulb itself
    tint, bulb = np.float32([.62, .84, 1]), np.float32([150, 222, 255])   # (blue, green, red)
    for (sx, sy, slope, step) in [(X0 + 6, 391, .41, -37), (X0 + 948, 372, .41, 37)]:
        pts, x, k = [], sx, 0
        while True:
            y = sy + slope * abs(x - sx) + (3 * np.sin(k * 1.7) ** 2 if k else 0)
            edge = 230 + (868 - 230) * y / 1018 if step < 0 else 2160 - (2160 - 1540) * y / 1018
            if (step < 0 and x < edge + 30) or (step > 0 and x > edge - 30): break
            pts.append((x, y)); x += step; k += 1
        wire = np.zeros(f.shape[:2], np.uint8)
        cv2.polylines(wire, [np.int32(pts)], False, 255, 1, cv2.LINE_AA)
        f *= 1 - wire[..., None] / 255 * .45
        for (x, y) in pts[1:]:
            xi, yi = int(round(x)), int(round(y)) + 4                 # each bulb hangs just under the wire
            p = f[yi - 18:yi + 19, xi - 18:xi + 19]
            p[:] = p * (1 - halo) + np.minimum(255, p * tint * 1.05 + 20) * halo
            p[:] = p * (1 - core) + bulb * core
    return np.clip(f, 0, 255).astype(np.uint8)

def winter(room):
    mock = load_mockup()
    roof = roof_mask()[:1060] > 0
    top = room[:1060]
    hsv = cv2.cvtColor(top, cv2.COLOR_BGR2HSV); h, s_, v = [hsv[..., i].astype(int) for i in range(3)]
    L = cv2.cvtColor(top, cv2.COLOR_BGR2GRAY).astype(int)
    frames = (L < 95) & (s_ < 90)                                     # the roof's black frames and the fans
    ivy = cv2.blur(((s_ > 95) & (v > 60)).astype(np.float32), (51, 51)) > .5   # the ivy on the walls (thick clumps)
    ivy = cv2.dilate(ivy.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    red = (((h < 8) | (h > 160)) & (s_ > 110))                        # red leaves stuck on the glass
    glass = roof & ~ivy & ~frames
    # the mockup's view through the glass: how light it is, and its colour (frames, lights and red leaves left out)
    mt = mock[:1060]; mlab = cv2.cvtColor(mt, cv2.COLOR_BGR2LAB)
    mh = cv2.cvtColor(mt, cv2.COLOR_BGR2HSV)
    mglass = (cv2.cvtColor(mt, cv2.COLOR_BGR2GRAY) > 90) & (mh[..., 1] < 110) & roof[:, X0:X1] & ~ivy[:, X0:X1]
    m_L = mlab[..., 0][mglass]
    m_ab = np.median(mlab[..., 1][mglass]), np.median(mlab[..., 2][mglass])
    # 2. the sides: the room's own frames and ivy, with winter through every pane
    S = snowy(top, cv2.dilate(red.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0, m_L, m_ab)
    g = cv2.GaussianBlur(glass.astype(np.float32), (0, 0), .8)[..., None]
    sides = (top * (1 - g) + S * g)
    # 1. the middle: the mockup itself (its frames line up with the room's), blended into the sides over 160 pixels
    #    at each edge; the thick ivy on the walls stays the room's own
    t = np.zeros(W, np.float32); t[X0 + 80:X1 - 80] = 1
    t = cv2.blur(t[None], (161, 1))[0][None, :, None] * np.ones((1060, 1, 1), np.float32)
    t *= cv2.GaussianBlur(roof.astype(np.float32), (0, 0), 12)[..., None]
    t *= 1 - cv2.GaussianBlur(ivy.astype(np.float32), (0, 0), 6)[..., None]
    full = sides.copy(); full[:, X0:X1] = mt
    out = room.copy()
    out[:1060] = np.clip(sides * (1 - t) + full * t, 0, 255).astype(np.uint8)
    # the string lights carried on from the mockup's to the walls
    out = string_lights(out)
    return out, glass

def brighten(img):
    f = img.astype(np.float32) / 255
    f = np.power(f, EXPOSURE["gamma"]) * EXPOSURE["lift"]
    return np.clip(f * 255, 0, 255).astype(np.uint8)

def finish(img):
    """3. brighter, everywhere"""
    return brighten(img)

def save(img, name, q=82):
    cv2.imwrite(os.path.join(ROOM, name), img, [cv2.IMWRITE_WEBP_QUALITY, q])
    print("  ", name, img.shape[1], "x", img.shape[0], os.path.getsize(os.path.join(ROOM, name)) // 1024, "KB")

if __name__ == "__main__":
    room = cv2.imread(os.path.join(ROOM, "room-2400.webp"))
    assert room.shape[:2] == (H, W)
    out, glass = winter(room)
    out = finish(out)
    print("5. the winter room:")
    save(out, "room-2400-winter.webp")
    save(cv2.resize(out, (1600, 1751), interpolation=cv2.INTER_AREA), "room-1600-winter.webp")
    save(out[:, X0:X1], "room-phone-winter.webp", 78)
    # 4. the masks for the live snow: see-through (alpha) only where the glass is, over the roof's top 1060 pixels
    #    (small, and saved without loss: a mask only needs its shape; the browser stretches it over the roof)
    from PIL import Image
    m = cv2.erode((glass > .5).astype(np.uint8) * 255, np.ones((5, 5), np.uint8))
    print("4. the masks for the snow through the glass:")
    for name, part, size in (("roof-glass-desk.webp", m, (800, 353)), ("roof-glass-phone.webp", m[:, X0:X1], (320, 353))):
        a = Image.fromarray(cv2.resize(part, size, interpolation=cv2.INTER_AREA))
        Image.merge("RGBA", (a.point(lambda v: 255),) * 3 + (a,)).save(os.path.join(ROOM, name), "WEBP", lossless=True, quality=100)
        print("  ", name, size[0], "x", size[1], os.path.getsize(os.path.join(ROOM, name)) // 1024, "KB")
