"""Takes the video player's play button off the Wilbur still (it was a screenshot of the film's thumbnail).
The hole is filled the way a retoucher would, in three layers:
  1. the base colour: a smooth fill that matches the skin all round the hole's edge (a Laplace / 'soap film' fill)
  2. (the crease under his eye runs just above the button: measured, nothing hidden needs redrawing)
  3. the skin's grain: fine noise as strong as his cheek's own, and a few of his real freckles stamped in
Run: python3 unplay.py still.png still-clean.png [cx cy r srcx srcy]
     (the button's centre and radius, and the top-left of an 80 x 80 patch of plain cheek; defaults: the first still)"""
import sys, cv2, numpy as np

CX, CY, R = 1102, 695, 77            # the play button (centre and radius, plus its soft edge), on the 2204 x 1288 still
SRC_LOW = (985, 750)                 # top-left of a blush-cheek patch: how strong the skin's grain is
P = 80                               # patch size

if len(sys.argv) > 3:
    CX, CY, R, SX, SY = map(int, sys.argv[3:8]); SRC_LOW = (SX, SY)
im = cv2.imread(sys.argv[1]).astype(np.float32)
H, W = im.shape[:2]
x0, y0, x1, y1 = CX - R - 4, CY - R - 4, CX + R + 5, CY + R + 5
roi = im[y0:y1, x0:x1].copy()
h, w = roi.shape[:2]
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
d = np.hypot(xx - (CX - x0), yy - (CY - y0))
hole = d <= R

# 1. the base: start from a blurred guess, then relax every hole pixel toward the mean of its neighbours
base = roi.copy()
guess = cv2.inpaint(roi.astype(np.uint8), hole.astype(np.uint8) * 255, 25, cv2.INPAINT_TELEA).astype(np.float32)
base[hole] = cv2.GaussianBlur(guess, (0, 0), 12)[hole]
# the known edge, smoothed a little so the fill doesn't copy single noisy pixels inward
edge = cv2.GaussianBlur(roi, (0, 0), 2.0)
base[~hole] = edge[~hole]
for _ in range(4000):
    nb = (np.roll(base, 1, 0) + np.roll(base, -1, 0) + np.roll(base, 1, 1) + np.roll(base, -1, 1)) / 4
    base[hole] = nb[hole]

# 2. (the crease under his eye runs just ABOVE the button, so nothing there needs redrawing)

# 3. the grain: fine noise as strong as the cheek's own, then a few of his real freckles stamped in
rng = np.random.default_rng(11)
skin = im[SRC_LOW[1]:SRC_LOW[1] + P, SRC_LOW[0]:SRC_LOW[0] + P]
hp = skin - cv2.GaussianBlur(skin, (0, 0), 3.5)
sd = float(np.median(np.abs(hp - np.median(hp))) * 1.4826)          # the skin's grain, ignoring its freckles
noise = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 1.1)
noise *= 0.6 * sd / max(noise.std(), 1e-6)          # clay is smooth: a softer grain than the raw cheek
fill = base + noise[..., None]
# freckles: dark spots in the cheek just around the hole, each lifted with its own little surround
labf = cv2.cvtColor(np.clip(im, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
Lf, af = labf[..., 0], labf[..., 1]
dark = Lf - cv2.GaussianBlur(Lf, (0, 0), 5)
red = af - cv2.GaussianBlur(af, (0, 0), 5)
yyA, xxA = np.mgrid[0:H, 0:W].astype(np.float32)
ring = (np.abs(xxA - CX) < 170) & (np.abs(yyA - CY) < 150) & (np.hypot(xxA - CX, yyA - CY) > R + 12)
blob = ((dark < -16) & (red > 2) & ring).astype(np.uint8)
n, lab_, st, cen = cv2.connectedComponentsWithStats(blob)
spots = []
for i in range(1, n):                                    # a freckle is a small, round, red-brown dot (not a wrinkle line)
    x, y, bw, bh, area = st[i]
    if 5 <= area <= 50 and max(bw, bh) <= 1.7 * min(bw, bh) and area >= 0.5 * bw * bh and 8 < x < W - 9 and 8 < y < H - 9:
        spots.append((int(cen[i][0]), int(cen[i][1]), i))
print(len(spots), 'freckles found around the hole')
k = 6
places = [(int(dx * R / 77), int(dy * R / 77)) for dx, dy in [(-30, 30), (18, 44), (-6, 60), (42, 18), (-50, 10)]]
for i, (dx, dy) in enumerate(places):
    sx, sy, lid = spots[(i * 3) % len(spots)]
    patch = im[sy - k:sy + k + 1, sx - k:sx + k + 1]
    det = patch - cv2.GaussianBlur(patch, (0, 0), 3)
    wgt = (lab_[sy - k:sy + k + 1, sx - k:sx + k + 1] == lid).astype(np.float32)   # only that freckle's own pixels
    wgt = cv2.GaussianBlur(cv2.dilate(wgt, np.ones((3, 3))), (0, 0), 0.8)[..., None]
    py, px = CY - y0 + dy, CX - x0 + dx
    fill[py - k:py + k + 1, px - k:px + k + 1] += det * wgt

# lay the fill into the hole with a 3-pixel soft edge (the button's own edge was antialiased)
a = np.clip((R + 1.5 - d) / 3, 0, 1)[..., None]
out = im.copy()
out[y0:y1, x0:x1] = roi * (1 - a) + fill * a
cv2.imwrite(sys.argv[2], np.clip(out, 0, 255).astype(np.uint8))
