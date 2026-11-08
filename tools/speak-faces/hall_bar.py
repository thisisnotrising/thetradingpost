"""NOT RISING · THE SPEAK — THE PASSAGE, THE HALL, THE LOUNGE AND THE BAR, from Kathi's renders
-------------------------------------------------------------------------------------------
WHAT GOES IN
  originals/hall-render.png        the set designer's hall render (1024 x 1536, Nov 7): the balcony bar and marquee, spiral
                                   staircases, the twig-arch stage with the amethyst geode, figs, Dan and Kathi, the sunken pit
                                   with its audience, the red CELLAR door at the front left and the REST door on the right
  originals/stage-render.png       the set designer's stage close-up (1086 x 1448, Nov 7): the same stage, four times closer
  originals/passage-4096.webp      the passage as first published (the obsidian floor and the iron door are added to it)
  originals/bar-render.png         Kathi's bar render (1672 x 941): Kathi on a stool at the bar
  ref/                             (on your computer, not in the repo) the photos faces.py uses, including frames from the
                                   podcast video (Kathi's and Dan's faces, hands and jewelry)
  models/                          the models faces.py lists, plus models/esrgan/realesr-general-x4v3.pth and
                                   realesr-general-wdn-x4v3.pth (github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/...)
                                   and models/u2net_human_seg.onnx (the silhouettes)

THE STEPS
  THE PASSAGE  the floor deepened to midnight obsidian, a scrying mirror under the runner (obsidian.py); the door made ancient
               iron (irondoor.py)
  THE HALL   1. sharpen 4x (Real-ESRGAN realesr-general-x4v3, denoise 0.5: the same upscaler as every room), size 3200 x 4800
             2. hall7.py: marquee painted blank (slats kept); Dan's and Kathi's faces (faces.py, plus extra identity passes
                at this size); the audience in the pit as silhouettes
             3. hall8.py: the vault's and balcony's ivy autumn crimson (THE POST's red), the red door pulled to it, its
                plaque reading BANNED, and the neon over the restroom reading RESTROOM with only REST lit; plus the same
                sign with REST dark too (restroom-dark.webp), which the page flickers on top: the blink
             4. kathi_hand.py: Kathi's wrap bracelet stack at her wrist (from her podcast photos)
  THE LOUNGE the stage close-up sharpened 4x (4344 x 5792), the faces at that size (lounge.py), then cut 3:2 from the arch's
             apex to the stage lip and sized 3600 x 2400: the lounge is the hall's own stage, so walking down to it is the
             same place, closer. Then the balcony's crimson ivy over the arch (hall8.py), and Kathi's hands (kathi_hand.py):
             her thumb made solid, her wrap bracelet stack, her gold stacking rings (one with an evil eye)
  THE BAR    1. sharpen 4x, size 3600 x 2026   2. paint the marquee's words off   3. Kathi's face (faces.py: kathi_bar)
             4. the ivy crimson (hall8.py)
             5. bar_grade.py: brought into the hall's world (whitewashed brick walls, the vault's banknotes aged, a near-
                black bar front, a midnight obsidian floor, the orange pulled back, the board the hall's white); Kathi's
                beanie gets a turned-up cuff with its patch on it, as on her Nebula Cafe beanie
  Then every width the site uses: passage 1600/2400/3200/4096, hall 1600/2400/3200, stage 1800/2700/3600,
  bar 1800/2700/3600 (WebP, quality 85), and restroom-dark.webp (360 x 120, the sign only where it differs).
  fonts/ holds Oswald (SIL Open Font License, fonts/OFL-Oswald.txt), the site's typeface, for BANNED and RESTROOM.

OPENING DAY FINISH (Nov 8, run after this file, on its outputs, in this order):
  faces_nov8.py     Dan's and Kathi's faces in the hall and on the stage, redone from one podcast frame (ref/dan-pod-nov8.png,
                    ref/kathi-pod-nov8.png): transplant, two identity passes, gentle GPEN detail (cured Dan's wonky eyes/smile)
  shadow_banned.py  the red door's plaque: the original black plaque with its gold rim, taller, reading SHADOW / BANNED in white
  dan_nov8.py       Dan's face again, from his portrait (ref/dan-portrait-nov8.jpg), hall and stage (after hair_texture.py)
  bar_nov8.py       Kathi at THE BAR: face and forest-green ribbed beanie from her selfie (ref/kathi-beanie-nov8.png)
  hair_texture.py   strands in Dan's hair (hall: face near 1300,2740; stage: near 1200,1250)
  speak_grade.py    every warm room's warmth held to 8 (5-10): passage, hall, stage, bar, and Nebula Cafe; restroom-dark.webp
                    takes the hall's exact shift (0.8646) so the flicker matches
  THE CELLAR        originals/cellar-render.png sharpened 4x to 3200 x 4800, graded to warmth 20 (speak_grade.py: a level
                    deeper, so warmer than upstairs), then cellar_screen.py writes the message on the TV's screen

Run:  pip install insightface onnxruntime onnx opencv-contrib-python numpy pillow
      python3 tools/speak-faces/hall_bar.py          (about 20 minutes on a laptop, no graphics card needed)
"""
import os, sys, cv2, numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import esrgan, blank_board, hall7, hall8, lounge, obsidian, irondoor, kathi_hand, bar_grade
import facekit as fk
import faces                       # the face recipes (and the reference photos' fingerprints)

OUT = os.path.join(HERE, '..', '..', 'assets', 'img', 'speak')
ORIG = os.path.join(HERE, 'originals')
SAVE_STEPS = os.environ.get('SAVE_STEPS')   # set it to a folder to keep each step's picture

BAR_BOARD = (1150, 220, 2410, 535)


def step(name, img):
    if SAVE_STEPS:
        os.makedirs(SAVE_STEPS, exist_ok=True)
        cv2.imwrite(os.path.join(SAVE_STEPS, name + '.png'), img)
    print('  done:', name)
    return img


def sharpen4x(rgb, width, height=None):
    up = esrgan.upscale(np.ascontiguousarray(rgb), esrgan.make_model(0.5))
    h = height or round(width * rgb.shape[0] / rgb.shape[1])
    return cv2.resize(up, (width, h), interpolation=cv2.INTER_AREA)[:, :, ::-1].copy()   # (as BGR, like OpenCV)


def write_sizes(room, img, widths):
    big = Image.fromarray(img[:, :, ::-1])
    W, H = big.size
    for w in widths:
        h = round(w * H / W)
        im = big if w == W else big.resize((w, h), Image.LANCZOS)
        im.save(os.path.join(OUT, f'{room}-{w}.webp'), 'WEBP', quality=85, method=6)
        print('  wrote', f'{room}-{w}.webp')


def load(name):
    return np.asarray(Image.open(os.path.join(ORIG, name)).convert('RGB'))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    print('THE PASSAGE')
    p = cv2.imread(os.path.join(ORIG, 'passage-4096.webp'))
    p = step('passage-1-obsidian', obsidian.obsidian(p))
    p = step('passage-2-iron-door', irondoor.iron(p))
    write_sizes('passage', p, [1600, 2400, 3200, 4096])

    print('THE HALL')
    up = step('hall-1-sharpened', sharpen4x(load('hall-render.png'), 3200, 4800))
    hall = step('hall-2-faces-silhouettes', hall7.build(up))
    hall, sign_dark = hall8.build(hall)
    hall = step('hall', kathi_hand.hall_wrist(hall))
    write_sizes('hall', hall, [1600, 2400, 3200])
    # the RESTROOM sign with REST dark too: only where it differs from the hall (so no edge ever shows), as a WebP with alpha
    X0, Y0, X1, Y1 = hall8.SIGN
    diff = np.abs(hall[Y0:Y1, X0:X1].astype(np.float32) - sign_dark.astype(np.float32)).max(2)
    a = cv2.GaussianBlur(cv2.dilate((diff > 6).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 1.5)
    rgba = np.dstack([sign_dark[:, :, ::-1], (np.clip(a * 1.6, 0, 1) * 255).astype(np.uint8)])
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, 'restroom-dark.webp'), 'WEBP', quality=90, method=6)
    print('  wrote restroom-dark.webp')

    print('THE LOUNGE')
    sup = step('lounge-1-sharpened', sharpen4x(load('stage-render.png'), 4344, 5792))
    lo = step('lounge-2-faces', lounge.build(sup))
    lo = hall8.lounge_ivy(lo)
    write_sizes('stage', step('lounge', kathi_hand.build(lo)), [1800, 2700, 3600])

    print('THE BAR')
    bar = step('bar-1-sharpened', sharpen4x(load('bar-render.png'), 3600))
    bar = step('bar-2-board', blank_board.blank(bar, BAR_BOARD)[0])
    f = max(fk.faces(bar), key=lambda q: q.det_score)
    bar = step('bar-3-kathi', faces.kathi_bar(bar, f))
    print(f"  Kathi's likeness {float(np.dot(fk.embed_at(bar, f.kps), faces.ID['kathi_selfie'])):.2f}")
    bar = step('bar-4-ivy', hall8.bar_ivy(bar))
    bar = step('bar', bar_grade.build(bar))
    write_sizes('bar', bar, [1800, 2700, 3600])
