"""NOT RISING · THE GALLERY — THE DARKROOM
   ------------------------------------------------------------------
   Turns Kathi's photos into the Gallery's prints: stark black and white,
   in the same two tones as the Wishing Wall (its black spray paint and
   its whitewashed brick), so the whole room reads as one.

   For each photo it:
     1. trims off any border left over from a screenshot (CROP below)
     2. drops the colour, keeping only how light or dark each spot is
     3. stretches it so the darkest bit is truly black and the lightest
        truly white (ignoring the odd stray pixel)
     4. bends the tones on an S-curve: darks darker, lights lighter,
        which is what makes it STARK
     5. paints it in the Wishing Wall's two tones: INK for black, PAPER
        for white (every grey in between is a mix of the two)
     6. saves two WebP copies: the print (for the viewer, up to 1400 px)
        and a small copy (480 px) for the wall and the hang

   HOW TO RUN IT (needs Python with Pillow and NumPy):
     python3 tools/tone-gallery.py <folder of originals> assets/img/post/gallery/life-exhibit
   The originals are named in PHOTOS below, in hanging order.
   ------------------------------------------------------------------ """
import sys, os
import numpy as np
from PIL import Image

INK   = (21, 21, 20)      # the Wishing Wall's black paint, measured from assets/img/post/room/wall.webp
PAPER = (245, 244, 239)   # its whitewashed brick
STARK = 6.0               # how hard the S-curve bends (0 = none; 6 = stark; 10 = nearly pure black and white)
CLIP  = (0.4, 99.6)       # the percent of darkest and lightest pixels allowed to go fully black / fully white
FULL, WALL = 1400, 480    # longest side, in pixels, of the print and of the small copy

# (original file, new name, crop as (left, top, right, bottom) pixels or None)
PHOTOS = [
    ("brick-cafe.jpg",     "01-brick-coffee-house", None),
    ("chalk-heart.jpg",    "02-chalk-heart",        None),
    ("string-lights.jpg",  "03-string-lights",      None),
    ("state-room.jpg",     "04-state-room",         None),
    ("guitar-case.jpg",    "05-guitar-case",        None),
    ("holding-hands.jpg",  "06-holding-hands",      (0, 0, 1284, 958)),      # a dark line along the bottom
    ("evil-eye-cuff.jpg",  "07-evil-eye",           None),                   # (Oct 31: replaced the fireplace photo)
    ("mural-alley.jpg",    "08-mural-alley",        None),
    ("stencil-cowboy.jpg", "09-stencil-cowboy",     None),
    ("towers.jpg",         "10-towers",             (0, 7, 1284, 1285)),     # a dark bar along the top
    ("steel-door.jpg",     "11-steel-door",         None),
    ("dog-sofa.jpg",       "12-dog-sofa",           None),
    ("payphone.jpg",       "13-payphone",           None),
    ("plant-window.jpg",   "14-plant-window",       (0, 2, 1020, 771)),      # a light line along the top
    ("mca-denver.jpg",     "15-mca-denver",         None),
    ("window-blinds.jpg",  "16-window-blinds",      None),
]

def tone(img):
    rgb = np.asarray(img.convert("RGB")).astype(np.float64) / 255
    gray = rgb @ [0.2126, 0.7152, 0.0722]                      # 2. how light each spot is (the eye's weighting)
    lo, hi = np.percentile(gray, CLIP)                          # 3. stretch: darkest -> 0, lightest -> 1
    x = np.clip((gray - lo) / max(hi - lo, 1e-6), 0, 1)
    if STARK > 0:                                               # 4. the S-curve (a sigmoid, rescaled so 0 stays 0 and 1 stays 1)
        s = lambda v: 1 / (1 + np.exp(-STARK * (v - 0.5)))
        x = (s(x) - s(0)) / (s(1) - s(0))
    ink, paper = np.array(INK, float), np.array(PAPER, float)   # 5. black = INK, white = PAPER
    out = ink + x[..., None] * (paper - ink)
    return Image.fromarray(np.round(out).astype(np.uint8), "RGB")

def fit(img, longest):
    w, h = img.size; k = min(1, longest / max(w, h))
    return img.resize((round(w * k), round(h * k)), Image.LANCZOS) if k < 1 else img

def main(src, dst):
    os.makedirs(os.path.join(dst, "wall"), exist_ok=True)
    for file, name, crop in PHOTOS:
        img = Image.open(os.path.join(src, file))
        if crop: img = img.crop(crop)                           # 1. trim
        print_ = tone(img)
        fit(print_, FULL).save(os.path.join(dst, name + ".webp"), quality=86, method=6)          # 6. the print
        fit(print_, WALL).save(os.path.join(dst, "wall", name + ".webp"), quality=82, method=6)  #    the small copy
        w, h = img.size
        print(f"{name}.webp  ar {w / h:.2f}")                    # the "ar" to write in data.js

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
