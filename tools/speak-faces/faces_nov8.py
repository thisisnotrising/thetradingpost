"""THE SPEAK, opening day (Nov 8, 10 AM): Dan's and Kathi's faces redone from ONE podcast frame.
-------------------------------------------------------------------------------------------
WHY: Dan's face on the stage close-up looked wonky (eyes mismatched, smile pulled to one side). Kathi asked for
both faces, in both rooms (the hall and the stage), to follow the same reference: the side-by-side podcast frame
(Dan on the left, Kathi on the right), saved as ref/dan-pod-nov8.png and ref/kathi-pod-nov8.png.

WHAT IT DOES (on the finished pictures, so the ivy, the BANNED door and the hands stay exactly as they are):
  1. TRANSPLANT  the frame's real eyes, nose and mouth onto the face, colour-matched to the room's light
  2. IDENTITY    two identity passes (inswapper) with the fingerprint read from that same frame
  3. DETAIL      GPEN at a gentle strength: it evens out the eyes and the smile (this is what cures "wonky")
  4. (Kathi)     her warm brown irises, as before
Her hand under her chin stays in front (the occlusion mask), as in faces.py.

Run:  python3 tools/speak-faces/faces_nov8.py <hall-master.png> <stage-master.png> <out-folder>
"""
import os, sys, cv2, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import facekit as fk

REFD = os.path.join(HERE, 'ref')


def load_ref(name):
    im = cv2.imread(os.path.join(REFD, name))
    return im, max(fk.faces(im), key=lambda q: q.bbox[2] - q.bbox[0])


REF = {'dan': load_ref('dan-pod-nov8.png'), 'kathi': load_ref('kathi-pod-nov8.png')}
ID = {'dan': fk.identity([os.path.join(REFD, 'dan-pod-nov8.png')]),
      'kathi': fk.identity([os.path.join(REFD, 'kathi-pod-nov8.png')])}


def swap_at(img, f, ident, size):
    crop, mat = fk.straighten(img, f.kps, 'arcface_128', size)
    new = fk.swap_boost(crop, ident, 'inswapper_128.onnx', 128, size)
    return fk.paste(img, new, fk.box_mask(size, 0.3) * fk.occlusion_mask(crop), mat)


def restore(img, f, blend):
    crop, mat = fk.straighten(img, f.kps, 'ffhq_512', 512)
    return fk.paste(img, fk.restore(crop, 'gpen_bfr_512.onnx'), fk.box_mask(512, 0.3) * fk.occlusion_mask(crop) * blend, mat)


def eyes(img, f):
    t = fk.TEMPLATES['ffhq_512'] * 512
    mat = cv2.estimateAffinePartial2D(f.kps.astype(np.float32), t, method=cv2.RANSAC, ransacReprojThreshold=100)[0]
    crop = cv2.warpAffine(img, mat, (512, 512), borderMode=cv2.BORDER_REPLICATE, flags=cv2.INTER_CUBIC)
    new = fk.warm_eyes(crop.astype(np.float32))
    d = (np.abs(crop.astype(np.float32) - new.astype(np.float32)).max(2) > 1.0).astype(np.float32)
    m = cv2.GaussianBlur(cv2.dilate(d, np.ones((5, 5), np.uint8)), (0, 0), 4).clip(0, 1)
    return fk.paste(img, new, m, mat)


def recipe(im, f, who, transplant=True, gpen=0.45):
    size = 512 if who == 'dan' else 256
    if transplant:
        im = fk.transplant(im, f, *REF[who])
    for _ in range(2):
        im = swap_at(im, f, ID[who], size)
    im = restore(im, f, gpen)
    return eyes(im, f) if who == 'kathi' else im


def nearest(fs, pt):
    return min(fs, key=lambda f: np.hypot((f.bbox[0] + f.bbox[2]) / 2 - pt[0], (f.bbox[1] + f.bbox[3]) / 2 - pt[1]))


def score(img, f, who):
    g = fk.app().get(img)
    q = nearest(g, ((f.bbox[0] + f.bbox[2]) / 2, (f.bbox[1] + f.bbox[3]) / 2))
    return float(np.dot(q.normed_embedding, ID[who]))


# the faces, by where they sit in each master (pixels)
WHERE = {'hall': {'dan': (1300, 2740), 'kathi': (2080, 2740)},
         'stage': {'dan': (1200, 1250), 'kathi': (2450, 1300)}}

if __name__ == '__main__':
    hall_p, stage_p, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    variant = os.environ.get('VARIANT', 'full')
    for room, p in (('hall', hall_p), ('stage', stage_p)):
        im = cv2.imread(p)
        fs = fk.faces(im)
        for who in ('dan', 'kathi'):
            f = nearest(fs, WHERE[room][who])
            before = score(im, f, who)
            im = recipe(im, f, who, transplant=(variant == 'full' or who == 'dan'))
            print(room, who, f'likeness {before:.2f} -> {score(im, f, who):.2f}', flush=True)
        cv2.imwrite(os.path.join(out, f'{room}.png'), im)
