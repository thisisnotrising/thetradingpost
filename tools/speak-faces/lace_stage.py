"""THE SPEAK, THEATER MODE: the lace & macrame stage (Nov 22, 2026; live at 11:11 AM).
The red velvet drapes either side of the cinema screen became cream lace, and lace was draped across the top:
  curtains.py  the sides: a sheer behind, the lace drape tied in the old rope, a macrame heart panel lining each edge
               of the screen (and what stood in front of the velvet is kept in front)
  swags.py     the top: two tiers of lace festoons under the pine garland, and lace tails down both corners
  lace.py      the lace itself (a repeating tile of flowers, leaves and vines on a net, and a scalloped edge)
All of it is drawn here from scratch; nothing is cut from the reference photo. The pine garland, the red bow, the
baubles, the macrame valance's fringe, the screen and film card, trees, poinsettias and lanterns are unchanged.
Warmth: 8.1 before and after (the rule: 5-10).
Run AFTER theater_hall.py, on its master:
    python3 lace_stage.py out/hall-theater-master.png out/
  -> out/hall-theater-lace-master.png and the site's three sizes, hall-theater-1600/2400/3200.webp (same names as
     before, so speakeasy/index.html doesn't change). To go back to the velvet, run theater_hall.py alone."""
import sys, os, cv2
import curtains, swags

src, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
img = cv2.imread(src)
curtains.side(img, False)          # the left side
curtains.side(img, True)           # the right side (the left mirrored about the screen's middle)
swags.top(img)                     # the lace across the top
cv2.imwrite(os.path.join(outdir, 'hall-theater-lace-master.png'), img)
for w in (1600, 2400, 3200):
    h = w * 3 // 2
    r = img if w == 3200 else cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(outdir, f'hall-theater-{w}.webp'), r, [cv2.IMWRITE_WEBP_QUALITY, 84])
for f in sorted(os.listdir(outdir)): print(f, os.path.getsize(os.path.join(outdir, f)) // 1024, 'KB')
