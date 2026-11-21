"""THE SPEAK's hall in THEATER MODE (Nov 21): the stage designer's render, made to sit with the other rooms.
-------------------------------------------------------------------------------------------
IN:  the render (1024 x 1536) enlarged 4x by EDSR (upscale.py)  ->  OUT: the 3200 x 4800 master, the site's three
     sizes (hall-theater-1600/2400/3200.webp) and the flickering sign (restroom-theater-dark.webp).
THE STEPS, in this order (each is its own small file, explained at its top):
  1. shrink the 4096 x 6144 enlargement to the hall's 3200 x 4800
  2. the warmth grade (speak_grade.py): renders come in around 35; every room upstairs is held to 5-10, so aim at 7
     (each picture size then measures 8-9);
     then the pink the grade leaves in creams is taken out (the curtain matches the live stage curtain)
  3. pine boughs (pine.py), only for a render that came without them (v1); v2 arrived with its own
  4. the old painted title comes off the curtain (title.py, erase)
  5. a real cinema screen (screen.py): no folds, a thin black frame, a clean title card with Wilbur in a vignette
  6. the title, sharp (title.py, project), on the screen
  7. RESTROOM with only REST lit (restroom.py), and the dead-sign copy the page flickers on top
Run:  python3 theater_hall.py render-x4.png out/ v2      (the set of measurements: see SETS)"""
import sys, os, cv2, numpy as np
from speak_grade import apply, solve, warmth
import pine, title, screen, restroom

# EACH RENDER'S MEASUREMENTS (on the 1024 x 1536 render; RESTROOM's on the 3200 x 4800 hall). A new render from the
# stage designer gets its own set: measure, add it here, run with its name.
SETS = {
  'v1': dict(pine=True),                                                     # Nov 21, first theater render (the files' own defaults)
  'v2': dict(pine=False,                                                     # Nov 21, the holiday render (pine, bows, poinsettias)
    title_box=(520, 735, 790, 975),
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
           ('poly', [(775, 1003), (797, 1003), (797, 1045), (775, 1045)]),          # the brass lanterns at the screen's feet
           ('circle', (295, 677.5, 19)), ('poly', [(291, 648), (299, 648), (299, 661), (291, 661)]),
           ('line', (295, 598, 295, 651, 1.4)), ('line', (295, 695, 295, 703, 2)),
           ('circle', (726, 695, 19)), ('poly', [(722, 666), (730, 666), (730, 679), (722, 679)]),
           ('line', (726, 612, 726, 670, 1.4)), ('line', (726, 712, 726, 727, 2.2)),
           ('circle', (757.5, 735, 19)), ('poly', [(754, 704), (762, 704), (762, 717), (754, 717)]),
           ('line', (757.5, 640, 757.5, 707, 1.4)), ('line', (757.5, 752, 757.5, 765, 2.2))],   # the gold baubles
    not_front=[(624, 628, 646, 714)],                                       # the old title's hanging ornament line
    fold_rows=(775, 1000), vignette=(396, 850, 235, 200), pic_end=1000,
    sign=(2965, 2570, 3185, 2725), letters=(2985, 2600, 3172, 2683), split=3066),
}

src, outdir = sys.argv[1], sys.argv[2]
SET = SETS[sys.argv[3] if len(sys.argv) > 3 else 'v2']
os.makedirs(outdir, exist_ok=True)
for key, mod, name in [('title_box', title, 'BOX'), ('title_lines', title, 'LINES'), ('screen_rect', screen, 'RECT'),
                       ('valance', screen, 'VALANCE'), ('clear', screen, 'CLEAR'), ('sides', screen, 'SIDES'),
                       ('front', screen, 'FRONT'), ('not_front', screen, 'NOT_FRONT'), ('fold_rows', screen, 'FOLD_ROWS'), ('vignette', screen, 'VIG'), ('pic_end', screen, 'PIC_END'),
                       ('sign', restroom, 'SIGN'), ('letters', restroom, 'LET'), ('split', restroom, 'SPLIT')]:
    if key in SET: setattr(mod, name, SET[key])
screen.OLD_TITLE = title.LINES                                                                     # (the card clears the old title's boxes)
im = cv2.resize(cv2.imread(src), (3200, 4800), interpolation=cv2.INTER_AREA)                     # 1
lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
k = solve(lab, 7.0); im = cv2.cvtColor(np.clip(apply(lab, k), 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)  # 2
print(f'grade shift {k:.4f}')
# (2, continued) the grade takes out more yellow than red (on purpose: it keeps skin and ivy alive), and this render's cast was
#     red-orange, so its creams came out pink (curtain a* 11 against the live stage curtain's 2). Near-neutral
#     colours lose that pink; anything strongly coloured (ivy, roses, the red door, Wilbur's nose) keeps its own.
lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
a, b = lab[..., 1] - 128, lab[..., 2] - 128
chroma = np.hypot(a, b)
w = np.clip(1 - (chroma - 18) / 14, 0, 1) * np.clip((lab[..., 0] - 20) / 40, 0, 1)
lab[..., 1] = 128 + a - np.clip(a - 0.35 * np.maximum(b, 0), 0, None) * 0.8 * w
im = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
s = 3200 / 1024
if SET['pine']: im = pine.pine(im, s)                                                               # 3
im = title.erase(im, s)                                                                             # 4
before = im
im, front = screen.screen(im, s)                                                                    # 5
im = title.project(im, s)                                                                           # 6
f = front[..., None]                                                                                # (what hangs in front stays in front)
im = np.clip(im * (1 - f) + before * f, 0, 255).astype(np.uint8)
im = restroom.room_off(im)                                                                          # 7
cv2.imwrite(os.path.join(outdir, 'hall-theater-master.png'), im)
dark = restroom.dark(im)
cv2.imwrite(os.path.join(outdir, 'restroom-theater-dark.webp'), dark, [cv2.IMWRITE_WEBP_QUALITY, 88])
for w in (1600, 2400, 3200):
    h = w * 3 // 2
    r = im if w == 3200 else cv2.resize(im, (w, h), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(outdir, f'hall-theater-{w}.webp'), r, [cv2.IMWRITE_WEBP_QUALITY, 84])
print('warmth now', round(warmth(cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)), 1))
for f in sorted(os.listdir(outdir)): print(f, os.path.getsize(os.path.join(outdir, f)) // 1024, 'KB')
