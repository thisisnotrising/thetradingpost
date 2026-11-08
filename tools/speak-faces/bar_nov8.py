"""Opening day, last pass (Nov 8, 9:50): Kathi at THE BAR, her face and beanie from her beanie selfie
(ref/kathi-beanie-nov8.png: forest-green ribbed beanie with its round red patch, headphones over it).
  1. FACE: transplant her eyes, nose and smile from the selfie, two identity passes, gentle GPEN, warm brown irises
  2. BEANIE: the face-parsing model marks the hat; its colour is matched to the selfie's beanie (Lab mean and spread,
     so the light and shading of the render are kept), the red patch is left as it is, and vertical knit ribs are
     added (the rib spacing measured against her face, so it matches the selfie's)
Run:  python3 tools/speak-faces/bar_nov8.py <in.png> <out.png>"""
import os, sys, cv2, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import faces_nov8 as F
fk = F.fk
REF = 'kathi-beanie-nov8.png'
F.REF['kathi'] = F.load_ref(REF)
F.ID['kathi'] = fk.identity([os.path.join(F.REFD, REF)])
WHERE = (2120, 700)                    # Kathi's face in the 3600 x 2026 bar
SIZE, ZOOM = 768, 0.5


def straighten_z(img, kps):
    t = (fk.TEMPLATES['ffhq_512'] - 0.5) * ZOOM + 0.5
    mat = cv2.estimateAffinePartial2D(kps.astype(np.float32), t * SIZE, method=cv2.RANSAC, ransacReprojThreshold=100)[0]
    return cv2.warpAffine(img, mat, (SIZE, SIZE), borderMode=cv2.BORDER_REPLICATE, flags=cv2.INTER_CUBIC), mat


BOX = (2000, 545, 2200, 715)            # around the beanie in the 3600 x 2026 bar (x0, y0, x1, y1)
SEEDS = [(2060, 600), (2140, 600), (2040, 650), (2160, 650)]   # points on the knit
REF_BOXES = [(195, 55, 265, 95), (345, 55, 425, 105)]   # pure knit in the selfie (604 x 436), either side of the patch


OUTLINE = [(2008, 692), (2012, 620), (2030, 584), (2075, 565), (2130, 565), (2174, 584), (2194, 625), (2198, 702),
           (2186, 724), (2160, 702), (2120, 674), (2080, 668), (2040, 676)]     # the beanie's shape, traced by hand


def knit_mask(img, box, seeds):
    """The beanie only: inside its traced outline, minus anything not knit-coloured (her skin is redder, the
    headphones and her hair far darker, the patch red), with a soft edge."""
    x0, y0, x1, y1 = box
    L = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2LAB).astype(np.float32)
    med = np.median(np.array([L[y - y0, x - x0] for x, y in seeds]), 0)
    shape = np.zeros((y1 - y0, x1 - x0), np.uint8)
    cv2.fillPoly(shape, [np.array([(x - x0, y - y0) for x, y in OUTLINE], np.int32)], 1)
    like = ((np.abs(L[..., 1] - med[1]) < 16) & (np.abs(L[..., 2] - med[2]) < 28) &
            (L[..., 0] > med[0] * 0.38) & (L[..., 1] < 145)).astype(np.uint8)
    m = (shape & like)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(np.float32)
    return m, L


def beanie(img, ref_img):
    x0, y0, x1, y1 = BOX
    m, L = knit_mask(img, BOX, SEEDS)
    RL = np.concatenate([cv2.cvtColor(ref_img[b[1]:b[3], b[0]:b[2]], cv2.COLOR_BGR2LAB).astype(np.float32).reshape(-1, 3)
                         for b in REF_BOXES])
    sel = m > 0.5
    out = L.copy()
    for c in range(3):
        s_mu, s_sd = L[..., c][sel].mean(), L[..., c][sel].std() + 1e-3
        r_mu, r_sd = RL[:, c].mean(), RL[:, c].std() + 1e-3
        out[..., c] = (L[..., c] - s_mu) * (min(r_sd / s_sd, 1.3) if c == 0 else 0.8) + r_mu
    # knit ribs, vertical, about 40 across the beanie (as in the selfie)
    xx = np.arange(x1 - x0, dtype=np.float32)[None, :] * np.ones((y1 - y0, 1), np.float32)
    rib = np.cos(2 * np.pi * xx / 4.6)
    out[..., 0] *= (1 + 0.14 * np.sign(rib) * np.abs(rib) ** 0.6)
    new = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float32)
    a = cv2.GaussianBlur(m, (0, 0), 0.9)[..., None]
    res = img.copy()
    res[y0:y1, x0:x1] = np.clip(img[y0:y1, x0:x1] * (1 - a) + new * a, 0, 255).astype(np.uint8)
    return res


if __name__ == '__main__':
    src, dst = sys.argv[1:3]
    im = cv2.imread(src)
    f = F.nearest(fk.faces(im), WHERE)
    if not os.environ.get('BEANIE_ONLY'):          # BEANIE_ONLY=1: the face is already done in <in.png>
        b = F.score(im, f, 'kathi')
        im = F.recipe(im, f, 'kathi', gpen=0.4)
        print('kathi likeness', round(b, 2), '->', round(F.score(im, f, 'kathi'), 2), flush=True)
        if os.environ.get('SAVE_FACE'):
            cv2.imwrite(os.environ['SAVE_FACE'], im)
        f = F.nearest(fk.faces(im), WHERE)
    im = beanie(im, F.REF['kathi'][0])
    cv2.imwrite(dst, im)
