"""THE SPEAK, opening day (Nov 8): texture in Dan's hair (the hall and the stage).
-------------------------------------------------------------------------------------------
WHY: the render painted Dan's hair as one smooth brown cap; his real hair (the podcast frame) is short, pushed up
and back, with separate strands and lighter tips.

HOW:
  1. STRAIGHTEN Dan's head into a square, pulled back enough to hold all his hair (as in faces.py)
  2. FIND THE HAIR: the face-parsing model marks which pixels are hair (label 17); the edge is feathered
  3. STRANDS: random noise smeared along the direction the hair grows (up and out from the middle of his face),
     at two sizes: fine strands and the clumps they gather into. The sizes are set in the picture's own pixels, so
     the strands look the same size in the hall (small) and on the stage (big)
  4. Light it: darker between clumps, lighter on the tips (warm ash blond, as in the frame), plus a little extra
     crispness inside the hair only. Then put the square back.
Run:  python3 tools/speak-faces/hair_texture.py <in.png> <out.png> <x,y of Dan's face>
"""
import os, sys, cv2, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import facekit as fk

SIZE, ZOOM = 768, 0.62           # the square, and how far it pulls back from the face (less = more hair)


def straighten_z(img, kps, size, zoom):
    t = (fk.TEMPLATES['ffhq_512'] - 0.5) * zoom + 0.5
    mat = cv2.estimateAffinePartial2D(kps.astype(np.float32), t * size, method=cv2.RANSAC, ransacReprojThreshold=100)[0]
    return cv2.warpAffine(img, mat, (size, size), borderMode=cv2.BORDER_REPLICATE, flags=cv2.INTER_CUBIC), mat


def line_kernel(length, angle_deg):
    k = np.zeros((length, length), np.float32)
    c = (length - 1) / 2
    a = np.deg2rad(angle_deg)
    dx, dy = np.sin(a), -np.cos(a)                   # 0 degrees = straight up
    for t in np.linspace(-c, c, length * 3):
        x, y = int(round(c + t * dx)), int(round(c + t * dy))
        if 0 <= x < length and 0 <= y < length:
            k[y, x] = 1
    return k / k.sum()


def strands(shape, scale, rng, sigma, length, centre):
    """Noise smeared along the growth direction: radial from `centre`, mostly upward."""
    h, w = shape
    n = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), max(sigma * scale, 0.6))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ang = np.degrees(np.arctan2(xx - centre[0], centre[1] - yy))   # angle from straight up
    ang = np.clip(ang * 0.8, -70, 70)
    L = max(int(length * scale) | 1, 3)
    out = np.zeros_like(n); wsum = np.zeros_like(n)
    for a in range(-70, 71, 10):
        sm = cv2.filter2D(n, -1, line_kernel(L, a))
        wgt = np.clip(1 - np.abs(ang - a) / 10, 0, 1)
        out += sm * wgt; wsum += wgt
    out /= np.maximum(wsum, 1e-6)
    return out / (out.std() + 1e-6)


def texture(img, f, seed=7, amp=0.28):
    crop, mat = straighten_z(img, f.kps, SIZE, ZOOM)
    eye_px = np.linalg.norm(f.kps[1] - f.kps[0])                    # eye distance in the picture
    scale = (np.linalg.norm((fk.TEMPLATES['ffhq_512'][1] - fk.TEMPLATES['ffhq_512'][0])) * ZOOM * SIZE) / eye_px
    lab = fk.parse(crop)
    hair = (lab == 17).astype(np.float32)
    hair = cv2.erode(hair, np.ones((5, 5), np.uint8))
    hair = cv2.GaussianBlur(hair, (0, 0), 2.5 * scale ** 0.5).clip(0, 1)
    rng = np.random.default_rng(seed)
    centre = (SIZE * 0.5, SIZE * 0.62)
    fine = strands(hair.shape, scale, rng, 0.55, 9, centre)          # sizes in the picture's own pixels
    clump = strands(hair.shape, scale, rng, 1.8, 16, centre)
    t = 0.55 * fine + 0.45 * clump
    c = crop.astype(np.float32)
    # darker between clumps, lighter tips (toward a warm ash blond), crisper inside the hair
    lum = 1 + amp * np.clip(t, -2.2, 2.2) * 0.5
    tip = np.clip(t - 0.9, 0, None)[..., None] * 0.26
    blond = np.float32([118, 150, 178])                               # BGR
    new = c * lum[..., None]
    new = new * (1 - tip) + blond * tip
    sharp = new + 0.7 * (new - cv2.GaussianBlur(new, (0, 0), 1.2 * scale))
    return fk.paste(img, sharp.clip(0, 255), hair, mat)


def nearest(fs, pt):
    return min(fs, key=lambda f: np.hypot((f.bbox[0] + f.bbox[2]) / 2 - pt[0], (f.bbox[1] + f.bbox[3]) / 2 - pt[1]))


if __name__ == '__main__':
    src, dst, xy = sys.argv[1], sys.argv[2], [float(v) for v in sys.argv[3].split(',')]
    im = cv2.imread(src)
    f = nearest(fk.faces(im), xy)
    cv2.imwrite(dst, texture(im, f))
