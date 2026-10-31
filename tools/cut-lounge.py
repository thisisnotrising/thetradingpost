"""NOT RISING · THE POST — CUTTING THE LOUNGE OUT OF KATHI'S PHOTO
--------------------------------------------------------------------
Takes Kathi's lounge photo (tools/ref/lounge.jpg, 736 x 736) and cuts out the
lounge: the green floor sofa with its pillows and throws, the wooden coffee
table (with its bottle, dried flowers and trays), the woven pouf, the jute rug,
the rattan pendant on its cord, and the two big leafy plants. Everything else
(the white wall, the wood floor, the window, the mirror, shelves, hoop planter,
broom, stacked pots and the plant in the bottom-right corner) is made see-through.

It comes out as three pictures (the lounge, its pendant, its tall plant: see THREE
PIECES at the bottom), each stood in THE POST like a stage cut-out (post.js), so they
sit in the room's own perspective.

HOW THE CUT IS MADE (three kinds of shape, all in the photo's pixels):
  SOLID  shapes are kept whole: the sofa, table, pouf, rug, the plant pot.
  KEYED  shapes keep only what isn't wall: leaves, the pendant's weave, the
         dried flowers. A pixel counts as "wall" when it is pale and colourless
         like the wall around it; leaves are green or dark, so they stay.
  CORNER the photo's bottom-right plant is taken out, and the bit of sofa it
         hid is filled in from the sofa beside it; the window behind the
         back cushions goes, so in THE POST they lean on the black wall.
Then the edges are softened by a hair, and a soft shadow is added under the
rug and sofa so they sit ON THE POST's floor.

Run:  python3 tools/cut-lounge.py      (needs numpy, opencv-python, pillow)
"""
import os
import numpy as np
import cv2
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'ref', 'lounge.jpg')
OUT = os.path.join(HERE, '..', 'assets', 'img', 'post', 'lounge-photo.webp')
PREVIEW = os.environ.get('PREVIEW')            # optional: also save a check image here

CUT_X = 736          # the black wall: the photo's right edge (the whole sofa is kept, up to its back cushions)
UPSCALE = 1.5        # the photo is small; it is enlarged this much (Lanczos) so it stays crisp in the room

img = cv2.imread(SRC)                       # B, G, R
H, W = img.shape[:2]
rgb = img[..., ::-1].astype(np.float32)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)   # H 0-180, S 0-255, V 0-255


def poly(points):
    m = np.zeros((H, W), np.uint8)
    cv2.fillPoly(m, [np.array(points, np.int32)], 255)
    return m > 0


# ---------------------------------------------------------------- SOLID SHAPES
# The sofa, its pillows and throws, the coffee table and what's on it. Traced along the top of the pillows
# (against the wall), down the sofa's left end, and along the floor; the bottom runs into the rug, which is kept too.
# The left end follows the sofa's real outline: the base, the seat cushion's rounded corner, the wooden end post
# (the "handle") and the cream pillow's corner; the flowerpot behind the end is left out.
SOFA = poly([
    (145, 548), (159, 526), (103, 526), (100.6, 523), (100.4, 512), (100.6, 493), (102, 488.5), (105, 484.5),
    (109.5, 482), (115.6, 481), (116, 449), (116.4, 438), (115.3, 427), (118, 423), (125, 421), (145, 418), (150, 412), (160, 401),
    (175, 401), (190, 404), (198, 414), (230, 413), (240, 407), (260, 405), (290, 406), (300, 410), (318, 410),
    (336, 413), (350, 413), (362, 412), (395, 412), (405, 414), (430, 416), (445, 418), (470, 416), (480, 413),
    (505, 414), (520, 418), (548, 424), (575, 420), (590, 424), (612, 428), (640, 435), (660, 446), (680, 452),
    (700, 460), (736, 466), (736, 648), (590, 648), (560, 600), (500, 548)])
# The plant in the photo's bottom-right corner (its leaves, its pot and its tall bare stem): taken out
CORNER = poly([(704, 225), (727, 225), (727, 488), (736, 488), (736, 736), (638, 736), (638, 562), (652, 540),
               (686, 500), (702, 492)])
# The woven pouf (in front, on the rug)
POUF = poly([(40, 560), (60, 545), (85, 535), (110, 530), (140, 531), (170, 538), (195, 552), (208, 572), (212, 600),
             (205, 625), (185, 645), (150, 656), (110, 658), (75, 650), (45, 632), (28, 610), (24, 585), (30, 570)])
# The jute rug. Its left side is cut on a slant (the photo stops there): the line runs toward the room's
# vanishing point, so it reads as the rug's own edge. Its front edge is the braided fringe.
RUG = poly([(145, 545), (500, 545), (560, 600), (592, 640), (622, 680), (652, 717), (600, 721), (400, 722),
            (200, 722), (0, 721), (0, 717)])
# The left plant's terracotta pot, and the little jug beside it
POT = poly([(60, 458), (88, 455), (116, 458), (116, 470), (110, 505), (100, 513), (75, 513), (66, 505), (62, 470)])
JUG = poly([(52, 428), (62, 425), (72, 428), (74, 445), (78, 452), (76, 470), (56, 470), (52, 455)])

# ---------------------------------------------------------------- KEYED SHAPES
# Leaves are kept, the wall (and the window) behind them goes.
LEFT_PLANT = poly([(18, 232), (80, 232), (134, 232), (134, 352), (150, 352), (150, 462), (60, 462), (18, 420)])
MID_PLANT = poly([(470, 310), (560, 310), (560, 258), (600, 258), (600, 345), (692, 345), (692, 448), (645, 440), (470, 418)])
FLOWERS = poly([(314, 398), (340, 398), (340, 440), (314, 440)])
# The rattan pendant: its shade (traced) and its cord
SHADE = poly([(368, 86), (380, 87), (392, 92), (400, 100), (405, 112), (408, 130), (411, 150), (413, 165), (414, 180),
              (413, 195), (410, 208), (404, 218), (395, 226), (380, 231), (368, 232), (355, 231), (342, 226), (332, 218),
              (326, 208), (322, 195), (320, 180), (321, 165), (324, 150), (328, 130), (331, 112), (336, 100), (344, 92),
              (356, 87)])
CORD = poly([(364, 0), (372, 0), (372, 90), (364, 90)])

# How "not wall" a pixel is (0 = wall, 1 = something). The wall is pale and colourless; leaves are green,
# saturated, or dark. A plant's soft grey shadow on the wall is pale and colourless too, so it goes.
sat = hsv[..., 1] / 255.0
val = hsv[..., 2] / 255.0
hue = hsv[..., 0] * 2                                   # degrees
greenish = ((hue > 50) & (hue < 170)).astype(np.float32)
leafy = np.clip((sat - .14) / .14, 0, 1) * np.clip(.6 + greenish, 0, 1)
dark = np.clip((.62 - val) / .2, 0, 1)
not_wall = np.maximum(leafy, dark)
# the pendant's woven rattan is warm tan, not green: for it, any colour at all counts
tan = np.clip((sat - .16) / .12, 0, 1)
not_wall_shade = np.maximum(tan, dark)
# the brown shelf boards behind the left plant are not leaves: drop warm, non-green pixels there
woody = ((hue < 45) & (sat > .2)).astype(np.float32)

# The wall is a cool, bluish white; the sofa, pillows and throws are all warm (more red than blue), and the
# leaves are green (much more green than blue). Those two tests separate them cleanly, even pale pillows.
R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
warm = np.clip((R - B) / 10.0, 0, 1)
# (the photo's compression smears a little green into the pale wall right beside the leaves, so a pixel
#  must also be darker than the wall to count as leaf)
green = (np.clip((G - B - 12) / 12.0, 0, 1) * np.clip((198 - hsv[..., 2]) / 18.0, 0, 1)
         * np.clip((G - R + 4) / 6.0, 0, 1))          # (and greener than it is red: the wall's soft shadows are not)
very_dark = np.clip((95 - hsv[..., 2]) / 25.0, 0, 1)

alpha = np.zeros((H, W), np.float32)
for m in (SOFA, POUF, RUG, POT):
    alpha[m] = 1
# the top of the sofa, where pillows meet the wall (or the window, on the right): keep only what's warm
_y, _x = np.arange(H)[:, None], np.arange(W)[None, :]
top = SOFA & ((_y < 450) | ((_x > 636) & (_y < 478)))
# Along the top of the sofa the wall shows between and around the pillows. A pixel there is dropped only if it is
# wall-coloured (pale and cool) AND joined up to the wall outside the sofa: so the white stripes inside the
# black-and-white pillow, which are pale but closed in by the pattern, stay put.
wall_like = ((hsv[..., 2] > 140) & (R - B < 9)).astype(np.uint8)
n_, lab_ = cv2.connectedComponents(wall_like, connectivity=4)
outside_ids = np.unique(lab_[(wall_like > 0) & ~SOFA])
wall_conn = np.isin(lab_, outside_ids[outside_ids > 0])
alpha[top] = np.where(wall_conn, 0.0, 1.0)[top]
# the rug's front fringe: in each column, the rug ends where the pale, smooth wood floor begins
Vs = cv2.GaussianBlur(hsv[..., 2], (0, 0), 1.2)
ends = np.full(W, 716.0)
for x in range(0, 655):
    col = Vs[700:728, x]
    dark_rows = np.where(col < 180)[0]                    # the braid's shaded knots
    if len(dark_rows): ends[x] = 700 + dark_rows[-1] + 1.5
ends = np.array([np.median(ends[max(0, i - 4):i + 5]) for i in range(W)], np.float32)   # a running median smooths it
ends = np.clip(ends, 706, 717)
ends = cv2.GaussianBlur(ends.reshape(1, -1), (0, 0), 1.5).ravel()
yy0 = np.arange(H, dtype=np.float32)[:, None]
front = np.clip(ends[None, :] - yy0 + .5, 0, 1)                 # 1 above the fringe's end, 0 below, a 1px ramp
band = RUG & (yy0 > 700)
alpha[band] = np.minimum(alpha[band], front[band])
# the rug's slanted left side (where the photo stops): a slightly uneven braided edge, a touch darker
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
lx0, ly0, lx1, ly1 = 0, 717, 145, 545                          # the slant line
d = ((xx - lx0) * (ly1 - ly0) - (yy - ly0) * (lx1 - lx0)) / np.hypot(lx1 - lx0, ly1 - ly0)   # + inside (to the right)
wob = .5 * np.sin(yy * .9) + .5 * np.sin(yy * .37 + 1.3)
slant = (yy > 545) & (yy < 724) & (np.abs(d) < 8) & ~POUF
edge_a = np.clip((-d + wob + 1.5) / 2.0, 0, 1)                 # (d is negative inside: see sign test below)
if d[700, 40] < 0: edge_a = np.clip((d + wob + 1.5) / 2.0, 0, 1)
alpha[slant & RUG] = np.minimum(alpha[slant & RUG], edge_a[slant & RUG])
inside_band = slant & RUG & (np.abs(d) < 4)
rgb[inside_band] *= .94
lp = LEFT_PLANT & ~POT & ~JUG
alpha[lp] = np.maximum(alpha[lp], (np.maximum(green, very_dark) * (1 - woody))[lp])
alpha[MID_PLANT] = np.maximum(alpha[MID_PLANT], np.maximum(green, very_dark)[MID_PLANT])
alpha[FLOWERS] = np.maximum(alpha[FLOWERS], np.maximum(warm, very_dark)[FLOWERS])
alpha[SHADE] = np.maximum(alpha[SHADE], np.maximum(warm, very_dark)[SHADE])
alpha[CORD] = np.maximum(alpha[CORD], dark[CORD])

# tidy the keyed parts: drop specks, close pinholes
a8 = (alpha * 255).astype(np.uint8)
n, lab, stats, _ = cv2.connectedComponentsWithStats((a8 > 60).astype(np.uint8), 8)
keep = np.zeros(n, bool); keep[0] = False
for i in range(1, n):
    keep[i] = stats[i, cv2.CC_STAT_AREA] >= 25
alpha *= keep[lab]

# ---------------------------------------------------------------- THE CORNER PLANT GOES
# Where it stood in front of the sofa, the sofa is filled in by copying the sofa just to its left (the cushion,
# its front and the wooden base run straight across, so a sideways copy continues them); below the sofa it is floor,
# which just goes. The tall plant from the left of the photo is stood here in THE POST (post.js), so this patch
# sits behind its leaves.
hole = CORNER & SOFA & (_y < 648)
SEAT_TOP = 538                                                       # the row where the seat begins (below the pillows)
seat = hole & (_y >= SEAT_TOP)
up = hole & ~seat
# THE SEAT, ITS FRONT AND THE BASE run straight across, so each row is continued from just left of the patch:
#   its overall colour = the average of the 12 pixels just left of the patch (so there is no seam)
#   its fine texture (weave, creases, wood grain) = borrowed from further left (so it isn't flat)
smooth = cv2.GaussianBlur(rgb, (0, 0), 2.5)
detail = rgb - smooth
fill = rgb.copy()
for y in range(SEAT_TOP, 648):
    xs = np.where(seat[y])[0]
    if not len(xs): continue
    b = xs.min()
    base_col = rgb[y, max(0, b - 14):b - 2].mean(0)
    for x in xs:
        sx = x - 40 * (1 + (x - b) // 40)                            # the nearest spot to the left, outside the patch
        fill[y, x] = base_col + detail[y, sx]
rgb[seat] = fill[seat]
alpha[seat] = 1
# UP AMONG THE PILLOWS: the pink pillow gets a soft, rounded right side (PILLOW_R = how far right it reaches);
# anything right of it is let go, so there the black wall shows behind the end of the sofa. What's left of the patch
# inside the pillow (a stem crossed it in the photo) is grown over from the pillow around it.
PILLOW_R = 705
img8 = np.clip(rgb, 0, 255).astype(np.uint8)
inp = cv2.inpaint(img8, (up | ~SOFA).astype(np.uint8), 4, cv2.INPAINT_TELEA).astype(np.float32)
rgb[up] = inp[up]
alpha[up] = 1
for y in range(445, SEAT_TOP):
    xr = PILLOW_R - 8 * ((y - 496) / 48) ** 2
    xs = np.arange(int(xr) - 4, W)
    alpha[y, xs] = np.minimum(alpha[y, xs], np.clip(xr - xs, 0, 1))
    rgb[y, int(xr) - 4:int(xr)] *= np.linspace(1, .84, 4)[:, None]  # the pillow's edge turns away from the light
alpha[CORNER & ~hole] = 0

# ---------------------------------------------------------------- THE RIGHT END, FINISHED
# The photo cuts the sofa's right-hand run off at its edge. Here it gets an end, like the left end:
#   E      where the run ends (the photo's x)
#   the seat cushion's end is rounded off with shading, its bottom corner rounded
#   the wooden base gets a darker end grain
#   the wooden end post (the "handle") from the left end is copied, flipped, made a little bigger (this end is
#   nearer to you), and stood at the end, rising behind the seat
E = 726
alpha[:, E:] = 0
SEAT0, SEAT1, BASE1 = 540, 612, 646                         # seat top, cushion bottom, base bottom (rows)
shade = np.linspace(1, .72, 6)[:, None]
for y in range(SEAT0, SEAT1):                               # the cushion's end, rounded by shading
    rgb[y, E - 6:E] *= shade
r = 6                                                       # its bottom corner, rounded
for y in range(SEAT1 - r, SEAT1):
    for x in range(E - r, E):
        if (x - (E - r)) ** 2 + (y - (SEAT1 - r)) ** 2 > r * r: alpha[y, x] = 0
for y in range(SEAT1, BASE1):                               # the base's end grain
    rgb[y, E - 3:E] *= .78
# the wooden end post, from the left end of the sofa (only its wood: brown, not too pale)
px0, py0, px1, py1 = 115, 445, 128, 481
post = rgb[py0:py1, px0:px1][:, ::-1]
ph_, pw_ = post.shape[:2]
pmask = (((hsv[py0:py1, px0:px1, 0] * 2) < 45) & (hsv[py0:py1, px0:px1, 1] > 60) & (hsv[py0:py1, px0:px1, 2] < 165))[:, ::-1]
k = 1.35
post = cv2.resize(post, (round(pw_ * k), round(ph_ * k)), interpolation=cv2.INTER_CUBIC)
pmask = cv2.resize(pmask.astype(np.float32), (post.shape[1], post.shape[0]), interpolation=cv2.INTER_LINEAR)
pmask = cv2.GaussianBlur(pmask, (0, 0), .6)
ty1 = SEAT0 + 4; ty0 = ty1 - post.shape[0]; tx1 = E; tx0 = tx1 - post.shape[1]
pmask[SEAT0 - ty0:] = 0                                     # its foot is hidden behind the seat, like the left one
sl = (slice(ty0, ty1), slice(tx0, tx1))
pm = pmask[..., None]
rgb[sl] = rgb[sl] * (1 - pm) + post * pm
alpha[sl] = np.maximum(alpha[sl], pmask)
alpha[SEAT0:, :][:, E:] = 0

# soften the edges by a hair (the photo's own edges are soft)
alpha = cv2.GaussianBlur(alpha, (0, 0), .7)
alpha[:, CUT_X:] = 0
alpha[:, CUT_X - 1] *= .5                              # (the wall edge stays crisp, not feathered past it)

# ---------------------------------------------------------------- CLEAN THE EDGES
# Edge pixels still carry a little of the white wall. Replace their colour with that of the nearest solid pixels.
solid = (alpha > .95).astype(np.float32)
blur_c = cv2.GaussianBlur(rgb * solid[..., None], (0, 0), 2.2)
blur_w = cv2.GaussianBlur(solid, (0, 0), 2.2)[..., None] + 1e-6
inner = blur_c / blur_w
edge = ((alpha > 0) & (alpha < .95))[..., None]
rgb2 = np.where(edge, rgb * .35 + inner * .65, rgb)

# ---------------------------------------------------------------- A SOFT SHADOW UNDER IT
# so the rug and the sofa sit on THE POST's dark floor: a darkening just outside the rug's edges and under the sofa
base = (RUG | (SOFA & poly([(100, 520), (645, 520), (645, 650), (100, 650)])) | POUF).astype(np.float32)
sh = cv2.GaussianBlur(cv2.dilate(base, np.ones((5, 5), np.uint8)), (0, 0), 6) * .45
sh[:, CUT_X:] = 0
out_a = alpha + sh * (1 - alpha)                        # shadow shows only where the lounge isn't
out_rgb = (rgb2 * alpha[..., None]) / np.maximum(out_a, 1e-6)[..., None]   # shadow pixels are black

# ---------------------------------------------------------------- THREE PIECES
# The lounge comes out as three pictures, so each can be placed on its own in THE POST:
#   lounge-photo.webp    the sofa, table, pouf, rug and the plant behind the sofa
#   lounge-pendant.webp  the rattan pendant and the bit of cord in the photo (it hangs where post.js says)
#   lounge-plant.webp    the tall plant in its pot (post.js stands it beside the lounge, clear of the pink neon)
# BOX = which part of the photo each piece keeps: (left, top, right, bottom) in the photo's pixels.
# post.js uses these same numbers to put each piece back in the right place.
grow = lambda m: cv2.dilate(m.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
PIECES = {
    'pendant': (grow(SHADE | CORD), (316, 0, 418, 234)),
    'plant':   (grow((LEFT_PLANT & ~SOFA) | POT) & ~SOFA, (14, 228, 154, 522)),   # (the sofa's left end stays with the sofa)
}
PIECES['photo'] = (~PIECES['pendant'][0] & ~PIECES['plant'][0], (0, 255, 736, 726))
# the plant gets its own little shadow under its pot
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
pot_sh = np.clip(1 - (((xx - 88) / 36) ** 2 + ((yy - 512) / 7) ** 2), 0, 1)
pot_sh = cv2.GaussianBlur(pot_sh, (0, 0), 3) * .55

if os.environ.get('DEBUG'):   # the whole cut-out at the photo's own size, for checking (not used by the site)
    np.save(os.environ['DEBUG'], np.dstack([np.clip(rgb2, 0, 255), alpha * 255]).astype(np.uint8))
for name, (mask, (x0, y0, x1, y1)) in PIECES.items():
    a_ = alpha * mask
    shadow = sh if name == 'photo' else pot_sh if name == 'plant' else np.zeros_like(alpha)
    a_out = a_ + shadow * (1 - a_)
    c_out = (rgb2 * a_[..., None]) / np.maximum(a_out, 1e-6)[..., None]
    rgba = np.dstack([np.clip(c_out, 0, 255), np.clip(a_out * 255, 0, 255)]).astype(np.uint8)[y0:y1, x0:x1]
    im = Image.fromarray(rgba, 'RGBA')
    im = im.resize((round(im.width * UPSCALE), round(im.height * UPSCALE)), Image.LANCZOS)
    out = OUT.replace('lounge-photo', 'lounge-' + name)
    im.save(out, 'WEBP', quality=88, method=6)
    print('wrote', os.path.relpath(out), im.size, os.path.getsize(out) // 1024, 'KB', ' box in the photo:', (x0, y0, x1, y1))
    if name == 'photo': main_im = im

# ================================================================ LAYERS (Oct 31): THE LOUNGE STANDING ON THE FLOOR
# The whole lounge as one upright picture looked raised from low down: the rug filled its bottom metre, so the sofa
# stood on top of it like a poster. So it's also cut into layers, each placed in the room at its own distance:
#   lounge-rug.webp     the rug, seen from straight above, to lie flat on the floor
#   lounge-sofa.webp    the long run of the sofa (with its pillows and throws, and the plant behind it)
#   lounge-return.webp  the short run of the L, coming toward you (its bottom straightened, see below)
#   lounge-table.webp   the coffee table, with the bottle, flowers and trays on it
#   lounge-pouf.webp    the woven pouf
# THE PHOTO'S CAMERA. To put each piece at the right distance, the photo is treated as taken by a simple camera:
# FOCAL = how many pixels one metre makes, 1 m away; HORIZON = the photo row level with the camera; CAM_H = its height
# off the floor (m); CX = the column straight ahead. A spot on the floor at photo row y is then DIST(y) metres away.
FOCAL, HORIZON, CAM_H, CX = 688.0, 390.0, 0.888, 368.0
DIST = lambda yrow: FOCAL * CAM_H / (yrow - HORIZON)
LAYER_RES = 2.0                                                     # (each layer is enlarged 2x, so it stays crisp)

def save_layer(name, rgba_full, box):
    x0, y0, x1, y1 = box
    im = Image.fromarray(np.clip(rgba_full[y0:y1, x0:x1], 0, 255).astype(np.uint8), 'RGBA')
    im = im.resize((round(im.width * LAYER_RES), round(im.height * LAYER_RES)), Image.LANCZOS)
    out = OUT.replace('lounge-photo', 'lounge-' + name)
    im.save(out, 'WEBP', quality=88, method=6)
    print('wrote', os.path.relpath(out), im.size, os.path.getsize(out) // 1024, 'KB', ' box in the photo:', box)

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
base_rgb = rgb2.copy()

# THE TABLE: its top (and what stands on it) and its two front legs and a back leg
TABLE = (poly([(178, 497), (220, 497), (222, 490), (290, 490), (292, 420), (318, 395), (342, 400), (336, 486), (348, 486),
               (350, 486), (378, 486), (380, 470), (398, 470), (400, 486), (425, 486), (425, 497), (452, 497), (452, 553), (178, 553)])
         | poly([(236, 553), (256, 553), (256, 601), (236, 601)]) | poly([(383, 553), (410, 553), (410, 601), (383, 601)])
         | poly([(262, 553), (280, 553), (280, 578), (262, 578)]))
# THE SHORT RUN OF THE L: everything of the sofa right of a line along its inside edge (the line its base makes on the
# rug, from the corner at (495, 548) to the near end at (595, 645)), with the pillows heaped in the corner
def ret_edge(yrow): return 495 + np.clip(yrow - 548, 0, None) * 0.98
RET = SOFA & (xx > ret_edge(yy)) & (yy >= 410)
SOLID = alpha > 0.02

# --- the rug ---------------------------------------------------------------------------------------------------
# Seen from straight above: for every spot of the rug (X across, Z away from the camera, in metres) look up where
# the photo shows it. Where something stands on it (or the photo stops), the rug is filled in with a clean patch of
# its own weave, repeated.
RUG_X0, RUG_X1, RUG_Z0, RUG_Z1, RUG_RES = -1.55, 0.77, DIST(717), 4.0, 200
rw, rh = round((RUG_X1 - RUG_X0) * RUG_RES), round((RUG_Z1 - RUG_Z0) * RUG_RES)
gx, gz = np.meshgrid(RUG_X0 + (np.arange(rw) + .5) / RUG_RES, RUG_Z1 - (np.arange(rh) + .5) / RUG_RES)   # row 0 = the far edge
mapx = (CX + FOCAL * gx / gz).astype(np.float32); mapy = (HORIZON + FOCAL * CAM_H / gz).astype(np.float32)
# (not under the table either: the rug there is in the table's shadow, and its legs stand in it)
cover = (cv2.dilate((TABLE | SOFA | CORNER).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0) | \
        (cv2.dilate(POUF.astype(np.uint8), np.ones((41, 41), np.uint8)) > 0)          # (and the pouf's shadow)
seen = (RUG & ~cover & (yy < 714) & ~((xx >= 165) & (xx < 470) & (yy < 615))).astype(np.uint8) * 255
src = np.clip(rgb, 0, 255).astype(np.float32)
top = cv2.remap(src, mapx, mapy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
ok = cv2.remap(seen, mapx, mapy, cv2.INTER_NEAREST, borderValue=0) > 127
# a clean patch of the weave: X 0.1 .. 0.6, Z 1.95 .. 2.4 (between the table's right leg and the short run)
pc0, pc1 = round((0.15 - RUG_X0) * RUG_RES), round((0.55 - RUG_X0) * RUG_RES)
pr0, pr1 = round((RUG_Z1 - 2.2) * RUG_RES), round((RUG_Z1 - 1.93) * RUG_RES)
patch = top[pr0:pr1, pc0:pc1]
tile = np.concatenate([patch, patch[:, ::-1]], 1); tile = np.concatenate([tile, tile[::-1]], 0)   # mirrored, so it repeats seamlessly
fill = np.tile(tile, (rh // tile.shape[0] + 2, rw // tile.shape[1] + 2, 1))[:rh, :rw]
fill = fill * (top[ok].mean((0)) / np.maximum(fill.reshape(-1, 3).mean(0), 1))   # (matched to the rug's overall colour)
okf = cv2.GaussianBlur(ok.astype(np.float32), (0, 0), 2.5)[..., None]
rug = top * okf + fill * (1 - okf)
# even out the light: the photo's shadows (under the table and the pouf, by the sofa) would be wrong on the room's
# floor, so the rug's brightness is levelled (divided by a blurred copy of itself), keeping the weave
lev = cv2.GaussianBlur(rug, (0, 0), 14)
rug = rug / np.maximum(lev, 1) * top[ok].mean(0)
# the braided border: the front strip of the photo's rug (5 cm), laid round all four edges
bw = round(0.05 * RUG_RES)
fc0, fc1 = round((-0.9 - RUG_X0) * RUG_RES), round((0.7 - RUG_X0) * RUG_RES)
band = top[rh - bw:rh, fc0:fc1]
band_long = np.tile(band, (1, rw // band.shape[1] + 2, 1))[:, :rw]
band_side = np.tile(np.rot90(band, 1), (rh // band.shape[1] + 2, 1, 1))[:rh]
rug[rh - bw:] = band_long; rug[:bw] = band_long[::-1]
rug[:, :bw] = band_side[:, ::-1][:, :bw]; rug[:, rw - bw:] = band_side[:, :bw]
ra = np.ones((rh, rw), np.float32); ra[[0, -1], :] = .5; ra[:, [0, -1]] = .5
img_rug = Image.fromarray(np.dstack([np.clip(rug, 0, 255), ra * 255]).astype(np.uint8), 'RGBA')
out = OUT.replace('lounge-photo', 'lounge-rug'); img_rug.save(out, 'WEBP', quality=88, method=6)
print('wrote', os.path.relpath(out), img_rug.size, os.path.getsize(out) // 1024, 'KB', f' (rug {RUG_X1 - RUG_X0:.2f} m wide x {RUG_Z1 - RUG_Z0:.2f} m deep)')

# --- the long run of the sofa -------------------------------------------------------------------------------------
# everything of the sofa (and the plant behind it) except the short run, the table, the pouf and the rug, down to the
# bottom of its base (row 552). Behind the table and the pouf the photo shows no sofa, so it's filled in row by row
# from the sofa just to the right (its seat, front and base run straight across).
BACK = ((SOLID & ~RET & ~TABLE & ~POUF & ~RUG & ~PIECES['pendant'][0] & ~PIECES['plant'][0] & (yy < 553))
        | (MID_PLANT & SOLID & ~(RET & (yy > 425))))
hole = (TABLE | POUF) & (yy >= 455) & (yy < 553) & (xx >= 100) & (xx < 495)
hole &= ~(SOLID & ~SOFA)                                             # (only where the sofa would be)
srgb = base_rgb.copy()
sm = cv2.GaussianBlur(base_rgb, (0, 0), 2.5); det = base_rgb - sm
for yrow in range(455, 553):
    xs = np.where(hole[yrow])[0]
    if not len(xs): continue
    r0 = xs.max() + 1                                                # the first sofa pixel right of the gap
    col = base_rgb[yrow, r0 + 2:r0 + 14].mean(0)
    for x in xs:
        sx = x + 36 * (1 + (r0 - x) // 36)
        srgb[yrow, x] = col + det[yrow, min(W - 1, sx)]
back_a = np.where(BACK | hole, np.maximum(alpha, hole.astype(np.float32)), 0)
# behind the bottle and the flowers (above the seat) the pillows are grown over the gap
bott = TABLE & SOFA & (yy < 470) & (xx >= 285) & (xx < 350)
src_ok = (BACK | hole) & ~bott                                       # (grown only from the sofa itself, not the wall)
filled = cv2.inpaint(np.clip(srgb, 0, 255).astype(np.uint8), (~src_ok).astype(np.uint8), 5, cv2.INPAINT_TELEA).astype(np.float32)
# (Oct 31) a smooth fill there showed up as a blurry smudge (the bottle stands a little to one side of it once the
# table is in front), so each row of the gap is filled like a mirror instead: its left half reflects the fur throw
# just left of it, its right half the yellow pillow just right of it, and they meet with a soft 4-pixel seam
for yrow in range(H):
    xs = np.where(bott[yrow])[0]
    if not len(xs): continue
    Lx, Rx = xs.min(), xs.max(); mid = (Lx + Rx) / 2
    for x in xs:
        lsrc = Lx - 1 - (x - Lx); rsrc = Rx + 1 + (Rx - x)
        lv = srgb[yrow, lsrc] if lsrc >= 0 and src_ok[yrow, lsrc] else filled[yrow, x]
        rv = srgb[yrow, rsrc] if rsrc < W and src_ok[yrow, rsrc] else filled[yrow, x]
        t = np.clip((x - mid) / 4 + .5, 0, 1)                         # 0 = all left, 1 = all right
        filled[yrow, x] = lv * (1 - t) + rv * t
srgb[bott] = filled[bott]
back_a[bott] = 1.0
# its left end, behind the pouf's top: carried straight down from just above
for yrow in range(526, 553):
    m = (xx[yrow] >= 100) & (xx[yrow] < 160) & POUF[yrow]
    srgb[yrow, m] = srgb[525, m]; back_a[yrow, m] = (SOFA[yrow, m]).astype(np.float32)
save_layer('sofa', np.dstack([srgb, back_a * 255]), (90, 230, 700, 553))

# --- the short run of the L ---------------------------------------------------------------------------------------
# Its base runs slanting down toward you in the photo. As a flat piece standing at one distance, that slant would leave
# its far end floating, so its seat and base are stretched down until the base is level (row 645) the whole way along;
# the cushions and pillows above (rows above 500) stay as they are.
ra_ = (SOLID & RET & ~TABLE).astype(np.float32) * alpha
r_rgba = np.dstack([base_rgb, ra_ * 255]).astype(np.float32)
LEVEL = 645.0
def base_at(x): return np.clip(548 + (x - 495) * 0.98, 548, LEVEL)
mx = np.zeros((H, W), np.float32); my = np.zeros((H, W), np.float32)
for x in range(W):
    s = LEVEL - base_at(x)
    y_src = np.arange(H, dtype=np.float32)
    ramp = np.clip((y_src - 500) / (base_at(x) - 500), 0, 1)
    y_out = y_src + s * ramp
    my[:, x] = np.interp(np.arange(H), y_out, y_src); mx[:, x] = x
r_out = cv2.remap(r_rgba, mx, my, cv2.INTER_LINEAR, borderValue=0)
save_layer('return', r_out, (480, 400, 736, 650))

# --- the table and the pouf -----------------------------------------------------------------------------------------
green_ = (rgb[..., 1] > rgb[..., 0]) & (hsv[..., 1] > 20)           # (the sofa's green, showing behind the table)
t_a = (TABLE & SOLID & ~(green_ & (yy < 553) & ~((xx >= 290) & (xx < 340)))
       & ~((yy < 505) & ((xx < 222) | (xx > 425)))).astype(np.float32) * np.maximum(alpha, 0.0)   # (the sofa's shadowed base, at the table's back corners)
t_rgb = base_rgb.copy()
t_hole = (TABLE & POUF).astype(np.uint8)                             # (its left end, behind the pouf)
t_rgb = cv2.inpaint(np.clip(t_rgb, 0, 255).astype(np.uint8), t_hole, 6, cv2.INPAINT_TELEA).astype(np.float32)
t_a[t_hole > 0] = 1
save_layer('table', np.dstack([t_rgb, t_a * 255]), (170, 390, 460, 603))
p_a = (POUF & SOLID).astype(np.float32) * alpha
save_layer('pouf', np.dstack([base_rgb, p_a * 255]), (18, 524, 218, 662))
print(f'distances (m) from the photo camera: sofa base {DIST(552):.2f}, short run base {DIST(645):.2f}, table {DIST(601):.2f}, pouf {DIST(660):.2f}, rug front {DIST(717):.2f}')

if PREVIEW:   # the main piece over a checkerboard and over THE POST's dark floor colour, side by side
    im = main_im
    w, h = im.size
    chk = Image.new('RGB', (w, h), (200, 200, 200))
    t = 24
    for yy in range(0, h, t):
        for xx in range(0, w, t):
            if (xx // t + yy // t) % 2: chk.paste((150, 150, 150), (xx, yy, xx + t, yy + t))
    dark_bg = Image.new('RGB', (w, h), (22, 21, 22))
    a = chk.copy(); a.paste(im, (0, 0), im)
    b = dark_bg.copy(); b.paste(im, (0, 0), im)
    s = Image.new('RGB', (w * 2 + 10, h), 'white'); s.paste(a, (0, 0)); s.paste(b, (w + 10, 0)); s.save(PREVIEW)
