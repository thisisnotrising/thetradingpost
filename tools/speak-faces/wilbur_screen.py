"""THE SPEAK, THEATER MODE: the real Wilbur on the cinema screen (Nov 23, 2026).
The stage designer painted their own Wilbur onto the curtain; Kathi sent a still from Natalie Nicholson's film, and
the screen should show Wilbur exactly as he is there. Only the screen's picture changes: the title, the lace, the
macrame, the baubles and lanterns hanging in front, and the rest of the hall are kept exactly as they are live.
  1. the still, play button taken off (unplay.py), set where the old Wilbur sat: left of the title, his nose stopping
     short of it, in a soft oval that fades into the same deep warm charcoal ground the screen already uses
     (screen.py's ground, same formula and grain, so the card around him is unchanged)
  2. the title set again on top exactly as before (title.py, project), with theater_hall.py's v2 measurements;
     the valance's fringe, the hand-traced baubles, strings and lanterns are kept in front, as theater_hall.py did.
     The fringe is only kept ABOVE where the old painted hat began (the thread finder also catches the old hat's
     stitching and daisies lower down, which must go)
  3. all of that is done on the Nov 21 picture (before the lace), and then the lace stage is laid on again exactly as
     lace_stage.py does it (curtains.py both sides, swags.py the top), so the macrame heart panel and the sheer are
     whole where the old daisies used to poke through. One change: curtains.py's 'daisies' zone (it kept the old
     film's painted daisies in front of the macrame panel) is left out; the new Wilbur's daisies are off the screen,
     and the panel hangs in front of the screen
  4. only what this changed is taken into the live picture (the lace stage is run on the Nov 21 picture twice, with
     and without the new Wilbur; wherever the two differ, the new one is used), so every other pixel stays live
Run (from tools/speak-faces), with the two hall pictures taken from the repo's history:
    git show 16b28d0:assets/img/speak/hall-theater-3200.webp > /tmp/live.webp     (Nov 22, lace: live before this)
    git show 21b2b92:assets/img/speak/hall-theater-3200.webp > /tmp/nov21.webp    (Nov 21, before the lace)
    python3 unplay.py originals/wilbur-still.png /tmp/wilbur-clean.png 992 629 60 845 690
    python3 wilbur_screen.py /tmp/live.webp /tmp/nov21.webp /tmp/wilbur-clean.png out/ [grade]
  -> out/hall-theater-wilbur-master.png and the site's three sizes, hall-theater-1600/2400/3200.webp
WARMTH: Kathi chose the still's own colours (grade 0, Nov 23): the hall measures 11.9 by speak_grade.py's warmth
(the rule is 5-10; this is her call, for Wilbur to look exactly like the film). Grade 0.7 would bring it to 9.6.
"""
import sys, os, cv2, numpy as np
import screen, title, curtains, swags
from speak_grade import apply as grade, warmth

# theater_hall.py's v2 measurements (on the 1024 x 1536 render)
V2 = dict(title_box=(520, 735, 790, 975),
          title_lines=[(560, 700, 708, 742), (522, 745, 742, 797), (512, 798, 776, 856), (528, 852, 760, 879),
                       (556, 881, 730, 916), (580, 914, 704, 953)],
          screen_rect=(226, 640, 782, 1010), valance=770, clear=(255, 712, 760),
          sides=[[(130, 600), (255, 600), (250, 700), (232, 780), (225, 870), (130, 870)],
                 [(770, 600), (900, 600), (900, 890), (800, 890), (785, 780), (778, 700)]],
          front=[('poly', [(222, 913), (229, 926), (247, 932), (250, 954), (250, 1046), (200, 1046), (200, 954), (204, 932), (216, 926)]),
                 ('poly', [(257, 954), (262, 970), (276, 973), (277, 985), (277, 1045), (238, 1045), (238, 985), (245, 973), (253, 970)]),
                 ('poly', [(277, 979), (281, 990), (288, 992), (289, 999), (289, 1043), (263, 1043), (263, 999), (266, 992), (274, 990)]),
                 ('poly', [(810, 913), (816, 927), (830, 935), (831, 954), (831, 1046), (787, 1046), (787, 954), (790, 935), (804, 927)]),
                 ('poly', [(775, 958), (779, 975), (788, 978), (789, 987), (789, 1045), (756, 1045), (756, 987), (759, 978), (771, 975)]),
                 ('poly', [(775, 1003), (797, 1003), (797, 1045), (775, 1045)]),
                 ('circle', (295, 677.5, 19)), ('poly', [(291, 648), (299, 648), (299, 661), (291, 661)]),
                 ('line', (295, 598, 295, 651, 1.4)), ('line', (295, 695, 295, 703, 2)),
                 ('circle', (726, 695, 19)), ('poly', [(722, 666), (730, 666), (730, 679), (722, 679)]),
                 ('line', (726, 612, 726, 670, 1.4)), ('line', (726, 712, 726, 727, 2.2)),
                 ('circle', (757.5, 735, 19)), ('poly', [(754, 704), (762, 704), (762, 717), (754, 717)]),
                 ('line', (757.5, 640, 757.5, 707, 1.4)), ('line', (757.5, 752, 757.5, 765, 2.2))],
          not_front=[(624, 628, 646, 714)], vignette=(396, 850, 235, 200), pic_end=1000)
title.BOX, title.LINES = V2['title_box'], V2['title_lines']
screen.RECT, screen.VALANCE, screen.CLEAR, screen.SIDES = V2['screen_rect'], V2['valance'], V2['clear'], V2['sides']
screen.FRONT, screen.NOT_FRONT, screen.VIG, screen.PIC_END = V2['front'], V2['not_front'], V2['vignette'], V2['pic_end']

# WHERE WILBUR SITS: the painted Wilbur's framing, kept (Kathi: "the framing was right"): hat at the top left, his
# face where the painted face was, the full beard and his red knit shoulder running down to the screen's foot.
# The still (the wider frame, 1984 x 1260): his nose tip is at x 1495, his near eye at y 520.
STILL_NOSE_X, STILL_EYE_Y = 1495, 520
K = 0.245           # render pixels per still pixel
NOSE_X = 497        # his nose tip on the render, just short of the title (which starts at about 530)
EYE_Y = 823         # his eye, level with the painted face's; the hat starts where the painted hat did, the beard and shoulder run past the foot
OVAL = None         # None = the painted Wilbur's own oval (screen.VIG: centre 396, 850, radii 235 x 200)
EDGE = 16           # the still's left and right edges fade out over this many render px
EDGE_TOP = 36       # its top edge (through the hat) fades more gently, like the top of a portrait vignette
TITLE_CLEAR = (497, 542)   # Wilbur fades out between these x (render px), clear of the title

live_p, nov21_p, still_p, outdir = sys.argv[1:5]
GRADE = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0   # 0 = Wilbur exactly as the still; ~0.9 = the room's white
                                                            # balance (speak_grade.py) on him, bringing the hall under 10
os.makedirs(outdir, exist_ok=True)
live = cv2.imread(live_p); nov21 = cv2.imread(nov21_p); still = cv2.imread(still_p)
if GRADE:
    still = cv2.cvtColor(np.clip(grade(cv2.cvtColor(still, cv2.COLOR_BGR2LAB).astype(np.float32), GRADE), 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
still = still.astype(np.float32)
s = live.shape[1] / 1024
x0, y0, x1, y1 = [int(v * s) for v in screen.RECT]
h, w = y1 - y0, x1 - x0
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
rx_, ry_ = xx / s + screen.RECT[0], yy / s + screen.RECT[1]          # each screen pixel in render coordinates

# 1a. the ground: screen.py's card() formula, untouched
cx, cy, rx, ry = screen.VIG[0] * s - x0, screen.VIG[1] * s - y0, screen.VIG[2] * s, screen.VIG[3] * s
g = 30 + 16 * np.exp(-(((xx - cx) / (rx * 1.6)) ** 2 + ((yy - cy) / (ry * 1.5)) ** 2))
ground = np.stack([g * 0.86, g * 0.93, g * 1.0], -1)
ground += np.random.default_rng(3).normal(0, 1.3, ground.shape)

# 1b. Wilbur: where each screen pixel falls on the still
left = NOSE_X - STILL_NOSE_X * K
top = EYE_Y - STILL_EYE_Y * K
mapx = ((rx_ - left) / K).astype(np.float32)
mapy = ((ry_ - top) / K).astype(np.float32)
small = cv2.resize(still, None, fx=K * s, fy=K * s, interpolation=cv2.INTER_AREA)       # shrink first: sharp, no shimmer
pic = cv2.remap(small, mapx * K * s, mapy * K * s, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
# his oval: the painted Wilbur's (screen.card's formula), unless OVAL gives another
ox_, oy_, orx, ory = screen.VIG if OVAL is None else OVAL
d = np.sqrt(((rx_ - ox_) / orx) ** 2 + ((ry_ - oy_) / ory) ** 2)
m = np.clip((1.12 - d) / 0.42, 0, 1); m = m * m * (3 - 2 * m)
# the still's own edges (its foot is below the screen's, where screen.PIC_END fades the picture out as before)
Ws, Hs = still.shape[1] * K, still.shape[0] * K
def ramp(v): v = np.clip(v, 0, 1); return v * v * (3 - 2 * v)
m *= ramp((rx_ - left) / EDGE) * ramp((left + Ws - rx_) / EDGE) * ramp((ry_ - top) / EDGE_TOP) * ramp((top + Hs - ry_) / EDGE)
m *= ramp((TITLE_CLEAR[1] - rx_) / (TITLE_CLEAR[1] - TITLE_CLEAR[0]))
m *= ramp(((screen.PIC_END) - ry_) / 22)
card = ground * (1 - m[..., None]) + pic * m[..., None]

# 2. on the Nov 21 picture: the new card, the title, and what hangs in front of the screen
pre = nov21.astype(np.float32).copy()
pre[y0:y1, x0:x1] = card
pre = title.project(np.clip(pre, 0, 255).astype(np.uint8), s)
fr = np.zeros(live.shape[:2], np.float32)
for kind, v in screen.FRONT:
    if kind == 'poly': cv2.fillPoly(fr, [(np.array(v, np.float32) * s).astype(np.int32)], 1, cv2.LINE_AA)
    elif kind == 'line': cv2.line(fr, (int(v[0] * s), int(v[1] * s)), (int(v[2] * s), int(v[3] * s)), 1, max(1, int(v[4] * s)) + 2, cv2.LINE_AA)
    elif kind == 'circle':
        c = np.zeros_like(fr); cv2.circle(c, (int(v[0] * s), int(v[1] * s)), int(v[2] * s) + 2, 1, -1, cv2.LINE_AA)
        fr = np.maximum(fr, c)
fr = cv2.GaussianBlur(fr, (0, 0), 1.0)
th = screen.threads(nov21, s)
Y = np.arange(live.shape[0], dtype=np.float32)[:, None] / s
X = np.arange(live.shape[1], dtype=np.float32)[None, :] / s
fringe_end = np.where(X < 380, 697, 682)          # the fringe's lowest tips; the old hat began just below them
th = th * (Y < fringe_end) + th * (X > 770)       # (the right-hand macrame has no Wilbur behind it: kept whole)
# and fringe hangs from the valance: near its tips, keep only thread that joins up with thread higher up (the old
# hat's feathery top, just under the tips, is loose scraps)
tb_ = (th > 0.3).astype(np.uint8)
n_, lab_c = cv2.connectedComponents(tb_)
high = np.unique(lab_c[(Y < 662).repeat(live.shape[1], 1) & (tb_ > 0)])
hangs = np.isin(lab_c, high[high > 0])
th = th * np.where((Y >= 662) & (X < 770) & ~hangs, 0, 1)
keep = np.clip(np.maximum(fr, th), 0, 1)
inside = np.zeros(live.shape[:2], np.float32); inside[y0:y1, x0:x1] = 1
keep = 1 - inside * (1 - keep)
pre = (nov21.astype(np.float32) * keep[..., None] + pre.astype(np.float32) * (1 - keep[..., None]))
pre = np.clip(pre, 0, 255).astype(np.uint8)

# 3. the lace stage, on the Nov 21 picture as it was (A: should match live) and with the new Wilbur (B)
def lace_stage(img, daisies):
    img = img.copy()
    curtains.rng = np.random.default_rng(7)                               # (each run draws the same grain)
    zl = dict(curtains.ZONES_L)
    if not daisies: zl.pop('daisies', None)
    keep_zl = curtains.ZONES_L; curtains.ZONES_L = zl
    curtains.side(img, False); curtains.side(img, True); swags.top(img)
    curtains.ZONES_L = keep_zl
    return img
A = lace_stage(nov21, True)
B = lace_stage(pre, False)
print('lace stage re-run vs live, outside the screen (mean difference, 0-255):',
      round(float(np.abs(A.astype(np.int16) - live.astype(np.int16))[:y0 - 300].mean()), 2))

# 4. only the changed part goes into the live picture
ch = (np.abs(A.astype(np.int16) - B.astype(np.int16)).max(2) > 2).astype(np.uint8)
ch = cv2.dilate(ch, np.ones((9, 9), np.uint8))
w_ = cv2.GaussianBlur(ch.astype(np.float32), (0, 0), 2.0)
out = np.clip(live.astype(np.float32) * (1 - w_[..., None]) + B.astype(np.float32) * w_[..., None], 0, 255).astype(np.uint8)
keep = 1 - w_
cv2.imwrite(os.path.join(outdir, 'hall-theater-wilbur-master.png'), out)
cv2.imwrite(os.path.join(outdir, 'keep-mask.png'), (keep * 255).astype(np.uint8))
for W_ in (1600, 2400, 3200):
    r = out if W_ == 3200 else cv2.resize(out, (W_, W_ * 3 // 2), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(outdir, f'hall-theater-{W_}.webp'), r, [cv2.IMWRITE_WEBP_QUALITY, 84])
# how much of the title area changed (it should be ~nothing: same title, same ground)
tb = [int(v * s) for v in title.BOX]
dd = np.abs(out.astype(np.int16) - live.astype(np.int16)).max(2)
print('title area: share of pixels changed by more than 12:', round(float((dd[tb[1]:tb[3], int(560 * s):tb[2]] > 12).mean()), 4))
print('outside the screen changed:', int((dd[:y0 - 40] > 0).sum() + (dd[y1 + 40:] > 0).sum()), 'pixels')
print('the hall\'s warmth: was', round(warmth(cv2.cvtColor(live, cv2.COLOR_BGR2LAB).astype(np.float32)), 1),
      'now', round(warmth(cv2.cvtColor(out, cv2.COLOR_BGR2LAB).astype(np.float32)), 1), '(the rule: 5-10)')
for f in sorted(os.listdir(outdir)): print(f, os.path.getsize(os.path.join(outdir, f)) // 1024, 'KB')
