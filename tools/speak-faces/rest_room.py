"""NOT RISING · THE SPEAK — THE REST, the room behind the hall's RESTROOM door: the recipe for its picture
-------------------------------------------------------------------------------------------
WHAT GOES IN
  originals/rest-render.png    the set designer's restroom render (1024 x 1536, Nov 21)
  originals/napkin-kevin.png   Kevin Kermes's 3x5 Napkin of Kathi, exactly as he made it (1264 x 1264)
  her-words.txt                her 3x5 Interview answers and her 2016 poem: the words on the dictionary pages

THE STEPS
  1. The small sheepskin beside the barrel taken out, the floor's tiles filled in where it lay (rest_rug.py).
  2. Sharpen 4x (esrgan_np.py: Real-ESRGAN realesr-general-x4v3, denoise 0.5, the same upscaler as every room).
  3. Re-paper the walls: dictionary pages in one even grid, like her own dictionary-papered restroom (her photo "The
     Rest", 2016), with Kevin's napkin and her four notes tiled all through it in squares half the size of a page,
     alternating with the dictionary like a checkerboard; one napkin centred over the mirror (rest_wallpaper.py: the
     pages by dictionary.py, in her own words; the notes by notes.py). The room's old torn notes and the redrawn
     portrait go with the old paper. Nothing in Kevin's drawing changes; on the wall it takes the room's light.
  4. The room to warmth 8, like the hall (speak_grade.py).
  5. The widths the site uses: rest-1600/2400/3200.webp (WebP, quality 85) and napkin-kevin.webp (quality 86).

Run:  pip install pypatchmatch opencv-contrib-python numpy pillow scipy
      python3 tools/speak-faces/rest_room.py        (from the repo's top folder; about 8 minutes, no graphics card)
      It writes into assets/img/speak/.
"""
import os, sys, cv2, numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


if __name__ == '__main__':
    import speak_grade as G, esrgan_np, rest_wallpaper, rest_rug
    ORIG, OUT = os.path.join(HERE, 'originals'), os.path.join(HERE, '..', '..', 'assets', 'img', 'speak')
    render = np.asarray(Image.open(os.path.join(ORIG, 'rest-render.png')).convert('RGB'))
    print('THE REST: the small sheepskin out')
    render = rest_rug.remove_rug(render)
    print('sharpening 4x')
    room = esrgan_np.upscale(render, esrgan_np.make_model(0.5))
    print('re-papering the walls')
    room, _ = rest_wallpaper.repaper(room, render)
    lab = cv2.cvtColor(room, cv2.COLOR_RGB2LAB).astype(np.float32)
    k = G.solve(lab, G.TARGET)
    room = cv2.cvtColor(np.clip(G.apply(lab, k), 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)
    w = G.warmth(cv2.cvtColor(room, cv2.COLOR_RGB2LAB).astype(np.float32))
    print(f'grade shift {k:.4f}  warmth now {w:.1f}')
    big = Image.fromarray(room).resize((3200, 4800), Image.LANCZOS)
    for width in (1600, 2400, 3200):
        im = big if width == 3200 else big.resize((width, width * 3 // 2), Image.LANCZOS)
        im.save(os.path.join(OUT, f'rest-{width}.webp'), 'WEBP', quality=85, method=6)
        print('  wrote', f'rest-{width}.webp')
    Image.open(os.path.join(ORIG, 'napkin-kevin.png')).convert('RGB').save(os.path.join(OUT, 'napkin-kevin.webp'), 'WEBP', quality=86, method=6)
    print("  wrote napkin-kevin.webp (the popup: Kevin's napkin exactly as he made it)")
