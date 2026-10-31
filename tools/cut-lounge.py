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
