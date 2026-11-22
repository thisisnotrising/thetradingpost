"""LACE: an original cream lace, drawn from scratch (not taken from any photo).
A lace is three things, so it's drawn as three layers of 'thread density' (0 = open hole, 1 = solid thread):
  1. the net (tulle): fine mesh everywhere, too fine to see at the hall's size, so it reads as a soft haze
  2. the motifs: flowers, leaves and scrolling vines, densely worked, with eyelet holes inside the petals
  3. the cordonnet: a slightly raised outline round each motif, which catches the light
It's drawn 4x big then shrunk, so the edges come out soft like real thread. The tile repeats seamlessly."""
import cv2, numpy as np

def tile(w=96, h=128, ss=4, seed=3):
    W, H = w * ss, h * ss
    dens = np.zeros((H, W), np.float32)       # motif density
    rim = np.zeros((H, W), np.float32)        # the raised outline
    holes = np.zeros((H, W), np.float32)      # eyelets cut back out
    def at(x, y): return int(x * ss), int(y * ss)
    def flower(cx, cy, r, n=6, rot=0.0):
        for k in range(n):
            a = rot + 2 * np.pi * k / n
            px, py = cx + np.cos(a) * r * 0.62, cy + np.sin(a) * r * 0.62
            ax = (int(r * 0.48 * ss), int(r * 0.26 * ss))
            for layer, val, th in ((dens, 1, -1), (rim, 1, max(1, ss))):
                cv2.ellipse(layer, at(px, py), ax, np.degrees(a), 0, 360, val, th, cv2.LINE_AA)
            cv2.ellipse(holes, at(cx + np.cos(a) * r * 0.66, cy + np.sin(a) * r * 0.66),
                        (int(r * 0.22 * ss), int(r * 0.08 * ss)), np.degrees(a), 0, 360, 1, -1, cv2.LINE_AA)
        cv2.circle(dens, at(cx, cy), int(r * 0.30 * ss), 1, -1, cv2.LINE_AA)
        cv2.circle(rim, at(cx, cy), int(r * 0.30 * ss), 1, max(1, ss), cv2.LINE_AA)
        cv2.circle(holes, at(cx, cy), int(r * 0.12 * ss), 1, -1, cv2.LINE_AA)
    def leaf(cx, cy, l, ang):
        a = np.radians(ang)
        c = (cx + np.cos(a) * l * 0.5, cy + np.sin(a) * l * 0.5)
        cv2.ellipse(dens, at(*c), (int(l * 0.5 * ss), int(l * 0.2 * ss)), ang, 0, 360, 1, -1, cv2.LINE_AA)
        cv2.ellipse(rim, at(*c), (int(l * 0.5 * ss), int(l * 0.2 * ss)), ang, 0, 360, 1, max(1, ss), cv2.LINE_AA)
        p0 = (cx + np.cos(a) * l * 0.12, cy + np.sin(a) * l * 0.12); p1 = (cx + np.cos(a) * l * 0.88, cy + np.sin(a) * l * 0.88)
        cv2.line(holes, at(*p0), at(*p1), 1, max(1, ss), cv2.LINE_AA)       # the leaf's open vein
    def vine(pts, width=1.6):
        p = np.array(pts, np.float32)
        t = np.linspace(0, 1, 60)
        # a smooth curve through the points (Catmull-Rom style by spline of segments)
        from numpy import interp
        d = np.r_[0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))]; d /= d[-1]
        xs = interp(t, d, p[:, 0]); ys = interp(t, d, p[:, 1])
        xs = cv2.GaussianBlur(xs[None], (1, 9), 3)[0]; ys = cv2.GaussianBlur(ys[None], (1, 9), 3)[0]
        q = np.stack([xs, ys], 1) * ss
        cv2.polylines(dens, [q.astype(np.int32)], False, 1, int(width * ss), cv2.LINE_AA)
        cv2.polylines(rim, [q.astype(np.int32)], False, 1, max(1, ss), cv2.LINE_AA)
    # the motif, placed on a half-drop repeat (drawn at each of its repeat positions so it wraps seamlessly)
    for ox, oy in [(0, 0), (w, 0), (-w, 0), (0, h), (0, -h), (w, h), (-w, -h), (w, -h), (-w, h),
                   (w / 2, h / 2), (-w / 2, h / 2), (w / 2, -h / 2), (-w / 2, -h / 2)]:
        cx, cy = w / 2 + ox, h * 0.30 + oy
        if not (-w < cx < 2 * w and -h < cy < 2 * h): continue
        flower(cx, cy, 15, 6, 0.3)
        flower(cx - 22, cy + 34, 7, 5, 0.9); flower(cx + 23, cy + 37, 7, 5, 0.2)
        leaf(cx + 9, cy + 13, 18, 60); leaf(cx - 9, cy + 13, 18, 120)
        leaf(cx + 15, cy - 9, 14, -25); leaf(cx - 15, cy - 9, 14, 205)
        vine([(cx, cy + 15), (cx - 6, cy + 26), (cx - 22, cy + 34)])
        vine([(cx, cy + 15), (cx + 7, cy + 27), (cx + 23, cy + 37)])
        vine([(cx - 22, cy + 41), (cx - 30, cy + 56), (cx - 47, cy + 62)], 1.2)
        vine([(cx + 23, cy + 44), (cx + 31, cy + 58), (cx + 48, cy + 63)], 1.2)
    # the net: a fine hexagonal mesh (diagonal threads both ways plus a light horizontal)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) / ss
    p = 4.0
    net = np.maximum.reduce([np.abs(np.sin(np.pi * (xx + yy * 0.577) / p)), np.abs(np.sin(np.pi * (xx - yy * 0.577) / p))])
    net = (net > 0.86).astype(np.float32)
    def shrink(a): return cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA)
    dens, rim, holes, net = shrink(dens), shrink(rim), shrink(holes), shrink(net)
    solid = np.clip(dens - holes * 0.9, 0, 1)
    thread = np.clip(np.maximum(solid * 0.92, net * 0.55), 0, 1)                    # how much thread covers each spot
    # light on the thread: motifs a touch brighter than the net, the raised outline brightest
    tone = 0.80 * net * (1 - solid) + solid * (0.88 + 0.12 * rim)
    tone = np.where(thread > 0, tone / np.maximum(thread, 1e-3), 0.85)
    return thread.astype(np.float32), np.clip(tone, 0, 1.2).astype(np.float32)

def scallop_edge(h=128, depth=26, ss=4):
    """The lace's finished edge: a band of scallops (half-moons) with tiny picots and an eyelet row, as a strip
    'depth' wide that repeats down the curtain's edge. Returns (thread, tone) like tile(), x = 0 at the outer edge."""
    W, H = depth * ss, h * ss
    d = np.zeros((H, W), np.float32); hole = np.zeros((H, W), np.float32); rim = np.zeros((H, W), np.float32)
    n = 4; step = h / n
    for k in range(-1, n + 1):
        cy = (k + 0.5) * step
        cv2.ellipse(d, (int(depth * 0.55 * ss), int(cy * ss)), (int(depth * 0.48 * ss), int(step * 0.52 * ss)), 0, 0, 360, 1, -1, cv2.LINE_AA)
        cv2.ellipse(rim, (int(depth * 0.55 * ss), int(cy * ss)), (int(depth * 0.48 * ss), int(step * 0.52 * ss)), 0, 90, 270, 1, ss, cv2.LINE_AA)
        cv2.circle(hole, (int(depth * 0.55 * ss), int(cy * ss)), int(step * 0.17 * ss), 1, -1, cv2.LINE_AA)
        for j in range(5):                                     # picots round the scallop's rim
            a = np.radians(120 + j * 30)
            cv2.circle(d, (int((depth * 0.55 + np.cos(a) * depth * 0.52) * ss), int((cy + np.sin(a) * step * 0.56) * ss)), int(1.0 * ss), 1, -1, cv2.LINE_AA)
    d[:, int(depth * 0.55 * ss):] = 1                          # the solid band joining it to the lace
    for k in range(int(h / 9) + 1):                            # a row of eyelets along the band
        cv2.circle(hole, (int(depth * 0.80 * ss), int((k * 9 + 4.5) * ss)), int(1.6 * ss), 1, -1, cv2.LINE_AA)
    d = cv2.resize(d, (depth, h), interpolation=cv2.INTER_AREA); hole = cv2.resize(hole, (depth, h), interpolation=cv2.INTER_AREA)
    rim = cv2.resize(rim, (depth, h), interpolation=cv2.INTER_AREA)
    thread = np.clip(d - hole * 0.95, 0, 1)
    tone = 0.9 + 0.12 * rim
    return thread.astype(np.float32), tone.astype(np.float32)

if __name__ == '__main__':
    t, tone = tile()
    big = np.tile(t * tone, (3, 4))
    cv2.imwrite('lace_tile.png', cv2.resize((big * 230).astype(np.uint8), None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST))
    e, et = scallop_edge()
    cv2.imwrite('lace_edge.png', cv2.resize((np.tile(e * et, (2, 1)) * 230).astype(np.uint8), None, fx=4, fy=4, interpolation=cv2.INTER_NEAREST))
