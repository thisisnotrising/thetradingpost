"""THE REST: the small sheepskin beside the barrel taken out of the render, the floor's tiles filled in where it lay.
-------------------------------------------------------------------------------------------
HOW: content-aware fill (PatchMatch, the pypatchmatch package): the hole is filled with small pieces of the floor
around it, so the black tiles, their grout lines and their reflections carry on. It may copy only from floor: never
from the sheepskins, the toilet, the barrel or the wall. The hole is the sheepskin plus the glow it threw on the
glossy tiles around it, kept clear of the toilet's foot, the barrel and the wall.
Works on the render itself (1024 x 1536), before the 4x sharpening, so the filled floor is sharpened like the rest.
Run:  pip install pypatchmatch
"""
import cv2, numpy as np

X0, Y0, X1, Y1 = 150, 1240, 1000, 1536             # the work area: the floor between the toilet and the right wall
RUG_AREA = [(282, 1316), (330, 1300), (420, 1296), (487, 1300), (487, 1412), (282, 1412)]   # where the sheepskin lies
BARREL_X = 489                                      # the barrel's left edge (above y 1425)


def ell(k):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))


def toilet(xx, yy):
    """The toilet's foot: its pedestal (to x 282), then its plinth (to x 301) from y 1382 down to 1430."""
    return ((xx < 283) & (yy < 1382)) | ((xx < 302) & (yy >= 1382) & (yy < 1430))


def wallfoot(xx):
    """Where the floor meets the walls behind the sheepskin."""
    return np.where(xx < 365, 1307 - (xx - 310) * 6 / 55, np.where(xx < 700, 1301 + (xx - 365) * 19 / 112, 1330))


def remove_rug(render):
    from patchmatch import patch_match
    crop = render[Y0:Y1, X0:X1].copy()
    L = cv2.cvtColor(crop, cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32) * 100 / 255
    yy, xx = np.mgrid[Y0:Y1, X0:X1]
    # the sheepskin: the pale fur in its area, as one solid piece
    area = np.zeros(crop.shape[:2], np.uint8)
    cv2.fillPoly(area, [(np.array(RUG_AREA) - [X0, Y0]).astype(np.int32)], 1)
    rug = ((L > 30) & (area > 0)).astype(np.uint8)
    rug = cv2.morphologyEx(rug, cv2.MORPH_CLOSE, ell(7))
    n, cc, st, _ = cv2.connectedComponentsWithStats(rug)
    rug = (cc == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    ff = rug.copy(); cv2.floodFill(ff, np.zeros((ff.shape[0] + 2, ff.shape[1] + 2), np.uint8), (0, 0), 1)
    rug = rug | (1 - ff)
    # and the warm glow it threw on the tiles around it
    near = cv2.dilate(rug, ell(51)) > 0
    glow = near & (cv2.GaussianBlur(L, (0, 0), 3) > 16) & (yy > 1300)
    hole = cv2.dilate(((rug > 0) | glow).astype(np.uint8), ell(13))
    fur = cv2.dilate((cv2.GaussianBlur(L, (0, 0), 2) > 45).astype(np.uint8), np.ones((7, 7), np.uint8))
    hole[((xx >= BARREL_X) & (yy < 1425)) | toilet(xx, yy) | (yy <= wallfoot(xx) + 1) | ((fur > 0) & (yy > 1415))] = 0
    # where it may copy from: the bare floor
    src = (fur == 0) & (hole == 0) & ~((xx >= 487) & (xx <= 700) & (yy < 1425)) & ~toilet(xx, yy) & (yy > wallfoot(xx) + 2)
    keep = ((~src) & (hole == 0)).astype(np.uint8) * 255
    out = patch_match.inpaint(crop, hole * 255, global_mask=keep, patch_size=11)
    res = render.copy()
    res[Y0:Y1, X0:X1] = out
    return res
