"""THE PASSAGE, holiday (Nov 22): the stage designer's 3:2 holiday render of the passage, for screens wider than tall,
and a 2:3 crop of it for phones.
-------------------------------------------------------------------------------------------
WHY: the passage's own picture is tall (2:3). On a desktop it has to fill the width, so only its middle third ever
showed: you arrived already at the door. Kathi wanted the desktop view "taller, but still wide": this render starts
back at the vault's mouth (garland, bow, the big lamps, the handrails coming toward you), so the walk has somewhere to go.
Then Kathi wanted phones to match (the garland and bow, and the same door), so the phone picture is cut from the same
render: 2:3, centred on the door, as tall as the render. The crop frames the door almost exactly where the old phone
picture did (centre 52.7% down, 27.3% of the height), and both pictures carry the same grade.

HOW (the same recipe as every room in THE SPEAK):
  1. sharpen 4x with Real-ESRGAN (esrgan_np.py; models in models/esrgan, not in the repo): 1536 x 1024 -> 6144 x 4096
  2. warmth graded to 8.8 with speak_grade.py, the same as the tall passage and the hall measure (Kathi's rule: 5-10)
  3. saved 4096 / 3200 / 2400 / 1600 wide as WebP (assets/img/speak/passage-wide-*.webp)
  4. the phone picture: the 2:3 crop around the door (render pixels 417 to 1100 across), 2731 / 2200 / 1600 wide
     (assets/img/speak/passage-tall-*.webp; 2731 is all the detail the crop has)
Where things are in them (the door, the lamps and candles) is in speakeasy/index.html: WIDE and TALL in the script,
and the .wide and .tall glows and door buttons in the passage.
Run:  python3 tools/speak-faces/passage_wide.py   (about 10 minutes, most of it the sharpening)
"""
import os, sys, cv2, numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import esrgan_np, speak_grade as G

SRC = os.path.join(HERE, 'originals', 'passage-wide-render.png')
OUT = os.path.join(HERE, '..', '..', 'assets', 'img', 'speak')
WARMTH = 8.8
DOOR_X = 758.5 / 1536                                       # the door's centre across the render: the phone crop centres on it

if __name__ == '__main__':
    up = sys.argv[1] if len(sys.argv) > 1 else None          # an already sharpened copy, to skip step 1
    if up:
        room = np.asarray(Image.open(up).convert('RGB'))
    else:
        print('sharpening 4x')
        room = esrgan_np.upscale(np.asarray(Image.open(SRC).convert('RGB')), esrgan_np.make_model(0.5))
    lab = cv2.cvtColor(room, cv2.COLOR_RGB2LAB).astype(np.float32)
    k = G.solve(lab, WARMTH)
    room = cv2.cvtColor(np.clip(G.apply(lab, k), 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)
    print(f'grade shift {k:.4f}  warmth now {G.warmth(cv2.cvtColor(room, cv2.COLOR_RGB2LAB).astype(np.float32)):.1f}')
    big = Image.fromarray(room)
    for width in (4096, 3200, 2400, 1600):
        im = big.resize((width, round(width * big.height / big.width)), Image.LANCZOS)
        im.save(os.path.join(OUT, f'passage-wide-{width}.webp'), 'WEBP', quality=85, method=6)
        print('  wrote', f'passage-wide-{width}.webp', im.size)
    cw = big.height * 2 / 3; x0 = round(DOOR_X * big.width - cw / 2)
    tall = big.crop((x0, 0, x0 + round(cw), big.height))
    for width in (2731, 2200, 1600):
        im = tall.resize((width, round(width * 1.5)), Image.LANCZOS) if width != tall.width else tall
        im.save(os.path.join(OUT, f'passage-tall-{width}.webp'), 'WEBP', quality=85, method=6)
        print('  wrote', f'passage-tall-{width}.webp', im.size)
