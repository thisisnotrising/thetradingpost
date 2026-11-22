"""NOT RISING · THE SPEAK — THE CELLAR, through the hall's red door: the recipe for its picture (Nov 22: the library)
-------------------------------------------------------------------------------------------
WHAT GOES IN
  originals/tbh-s2-cover.png    TO BE HUMAN, Season 2's cover (Garrett Rees), for the stack on the coffee table
  originals/cellar-render.png   the set designer's library cellar render (1024 x 1536, Nov 22): a red-brick vault with
                                a balcony lounge under a white stag's antlers, THE LIBRARY in neon over an arched glass
                                bookcase with an amethyst geode, a bar with leather stools, floor-to-ceiling bottles and
                                a brass library ladder, a leather chesterfield, fur and cowhide rugs, and the TV on a
                                barrel at the front right
  (the Nov 8 stone cellar's render is in the repo's history, at the commit before this one)

THE STEPS
  1. Sharpen 4x (esrgan_np.py: Real-ESRGAN realesr-general-x4v3, denoise 0.5, the same upscaler as every room), then
     the room's 3200 x 4800.
  2. THE COHERENCE FILTER, the same one the hall (theater_hall.py) and THE REST were given, so the cellar sits with
     the storefront, Nebula Cafe and the rest of THE SPEAK:
       a. warmth held to 5-10 (speak_grade.py): renders arrive amber (this one measured 23); the lamplight goes to the
          warm white of the hall's bulbs, while strongly coloured things (the red brick, the berries, the amethyst,
          the leather, the ivy) keep their own colour. Aimed at 7.5 (measured on the full picture, it reads 7.2), so on
          the scorecard (each picture 800 wide, its brightest tenth) it reads 8.5: between the storefront (8.1), Nebula
          Cafe (8.2), the bar (8.5) and the hall (8.8)
       b. the pink a red-orange render leaves in its creams taken out (the fur, the knit throw, the macrame, the
          stag), as in the hall, so whites read white
     This replaces the Nov 8 exception (the stone cellar was kept warmer, at 20, for being a level deeper): Kathi,
     Nov 22, "with Coherence filter applied to match the rest of the Speakeasy, Storefront, and Cafe".
  3. The TV's words set again, spelled right and sharp, in Oswald (cellar_tv.py): the render's screen read
     THIS SUPPESSED.
  4. The books on the brass coffee table become a stack of TO BE HUMAN, Season 2 (cellar_tbh.py: nine copies built
     in 3D with the real cover on top, lit by the votive, glossy; the amethyst rests on it; the candles stay in front).
     Its cover: originals/tbh-s2-cover.png.
  5. The widths the site uses: cellar-1600/2400/3200.webp (WebP, quality 82: this render is full of
     fine detail, bottles and book spines, so 82 keeps it as light as the other rooms).

Run:  pip install opencv-python numpy pillow pypatchmatch
      python3 tools/speak-faces/cellar_room.py      (from the repo's top folder; about 10 minutes, no graphics card;
      the two Real-ESRGAN models go in tools/speak-faces/models/esrgan/, see esrgan_np.py)
      It writes into assets/img/speak/.  Pass a sharpened 4096 x 6144 PNG as the first argument to skip step 1.
"""
import os, sys, cv2, numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
TARGET = 7.5


def coherence(room_bgr, target=TARGET):
    """Step 2: the coherence filter (a: warmth to target, b: the pink out of the creams). BGR in, BGR out."""
    import speak_grade as G
    lab = cv2.cvtColor(room_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    k = G.solve(lab, target)
    im = cv2.cvtColor(np.clip(G.apply(lab, k), 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
    lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
    a, b = lab[..., 1] - 128, lab[..., 2] - 128
    chroma = np.hypot(a, b)
    w = np.clip(1 - (chroma - 18) / 14, 0, 1) * np.clip((lab[..., 0] - 20) / 40, 0, 1)   # near-neutral and lit
    lab[..., 1] = 128 + a - np.clip(a - 0.35 * np.maximum(b, 0), 0, None) * 0.8 * w
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR), k


if __name__ == '__main__':
    import speak_grade as G, cellar_tv, cellar_tbh
    ORIG, OUT = os.path.join(HERE, 'originals'), os.path.join(HERE, '..', '..', 'assets', 'img', 'speak')
    if len(sys.argv) > 1:
        big = cv2.imread(sys.argv[1])
    else:
        import esrgan_np
        print('THE CELLAR: sharpening 4x')
        render = np.asarray(Image.open(os.path.join(ORIG, 'cellar-render.png')).convert('RGB'))
        big = cv2.cvtColor(esrgan_np.upscale(render, esrgan_np.make_model(0.5)), cv2.COLOR_RGB2BGR)
    room = cv2.resize(big, (3200, 4800), interpolation=cv2.INTER_AREA)
    room, k = coherence(room)
    print(f'coherence filter: shift {k:.4f}')
    room = cellar_tv.build(room)
    print('the TV: words set again')
    room, _ = cellar_tbh.build(room)
    print('the coffee table: TO BE HUMAN, Season 2')
    for width in (1600, 2400, 3200):
        im = room if width == 3200 else cv2.resize(room, (width, width * 3 // 2), interpolation=cv2.INTER_AREA)
        lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
        Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)).save(os.path.join(OUT, f'cellar-{width}.webp'), 'WEBP', quality=82, method=6)
        print(f'  wrote cellar-{width}.webp   warmth {G.warmth(lab):.1f}')
