"""NOT RISING · THE POST — THE PINK NEON ("buy me a cosmo")
---------------------------------------------------------------------
Bends Nebula Cafe's pink neon sign: a real-looking LED neon tube, written
in one continuous hand (the Sacramento script), mounted on a clear acrylic
panel cut to the shape of the words, and the pink light it throws on the
white brick around it. Its pink is the pink of the big plant in the lounge
(tools/render-monstera.py): the same hue, as light.

Output (both in assets/img/post/neon/, both the same size and place):
  cosmo-tubes.webp   the tubes, their glow and the acrylic panel (see-through
                     everywhere else). Laid on the wall normally.
  cosmo-light.webp   the pink light (and the panel's faint shadow) falling on
                     the wall: white = no change. Laid on the wall with
                     "multiply", so the brick's own shading shows through the
                     pink, the way real light lands on a real wall.
Each picture covers the sign plus PAD metres of wall all round, at PPM pixels
a metre. post.js places them (look for NEON_PIC); if you change the words,
the width or PAD, copy the numbers this script prints into NEON_PIC there.

HOW IT'S BENT
  1. Write the words in Sacramento, very big, in white on black, and lean
     them SLANT degrees to the right (italic): each row of the picture slides
     right by how far it sits above the baseline.
  2. Thin every stroke down to a line one pixel wide, down its middle (the
     "skeleton"): that line is where the tube runs.
  3. The tube: every pixel's distance from that line. Closer than the tube's
     radius = tube. Across the tube, the colour runs from a near-white core
     (where an LED neon is brightest) through the pink body to a deeper pink
     at its edges, which is what makes it look round.
  4. The glow: the tube, blurred by three amounts (tight, medium, wide) and
     added up, like light spreading in the air and in a camera lens.
  5. The light on the wall: the tube blurred much wider, turned into a pink
     tint.
  6. The acrylic: the tube's outline grown by a few centimetres and smoothed
     into one panel. Its polished edge catches the skylight on top and the
     pink light everywhere, and it casts a faint shadow on the wall below.

HOW TO RUN IT:  python3 tools/bend-neon.py
(needs numpy, scipy, scikit-image and Pillow; the words come from NEON in assets/data.js)
---------------------------------------------------------------------
"""
import os, re, json
import numpy as np
from scipy import ndimage as ndi
from skimage.morphology import skeletonize, remove_small_objects
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
OUT = os.path.join(ROOT, 'assets', 'img', 'post', 'neon')
FONT = os.path.join(HERE, 'ref', 'sacramento.ttf')   # Sacramento by Astigmatic (SIL Open Font License, see sacramento-LICENSE.txt)

SIGN_W = 2.2       # the sign's width, end of the first letter to end of the last (m)
SLANT = 16         # italic: how far the letters lean to the right (degrees)
TUBE_R = .012      # the tube's radius (m): a 24 mm LED neon tube, chunky like the reference photo
PAD = .45          # wall around the sign, in each picture (m)
PPM = 1000         # pixels a metre in the pictures (the cafe close-up is photographed at 1000 px a metre)
SS = 2             # drawn twice as big inside, then shrunk, for smooth edges

# ---- THE PINK: the plant's pink (hue 343 degrees), as light ----
# plant leaves, as seen in the room: #c16a83 in the middle of the range, #d7889f where lit.
CORE = np.array([255, 242, 247]) / 255   # the tube's white-hot middle
BODY = np.array([255, 140, 176]) / 255   # the tube itself
EDGE = np.array([222, 88, 132]) / 255    # its edges, where you see through more of the pink jacket
GLOW = np.array([238, 100, 146]) / 255    # the light in the air around it
TINT = np.array([1.00, .64, .75])        # the light on the white brick (multiply): pink, same hue


def words():
    """the neon's words, from NEON.lines in assets/data.js"""
    s = open(os.path.join(ROOT, 'assets', 'data.js'), encoding='utf-8').read()
    m = re.search(r'NEON:\s*\{\s*lines:\s*(\[[^\]]*\])', s)
    return json.loads(m.group(1))[0] if m else 'buy me a cosmo'


def blur(a, sigma_px):
    return ndi.gaussian_filter(a, sigma_px, mode='constant')


def main():
    text = words()
    P = PPM * SS                                        # working pixels a metre
    # 1 · THE WORDS, very big, leaning SLANT degrees to the right (italic)
    k_sl = np.tan(np.radians(SLANT))
    def write(size):
        """the words at this font size, slanted: each row slides right by how far it is above the baseline"""
        font = ImageFont.truetype(FONT, round(size))
        x0, y0, x1, y1 = font.getbbox(text)
        m = round(.1 * (y1 - y0))
        cw, ch = x1 - x0 + 2 * m + round((y1 - y0) * k_sl), y1 - y0 + 2 * m
        im = Image.new('L', (cw, ch), 0)
        ImageDraw.Draw(im).text((m - x0, m - y0), text, font=font, fill=255)
        base = m - y0 + font.getmetrics()[0]              # the baseline's row
        # (PIL's AFFINE: each picture pixel (x, y) takes its colour from (x + k (y - base), y) of the upright words)
        im = im.transform(im.size, Image.AFFINE, (1, k_sl, -k_sl * base, 0, 1, 0), resample=Image.BICUBIC)
        return im.crop(im.getbbox())
    probe = write(1000)
    words_im = write(1000 * SIGN_W * P / probe.width)  # sized so the slanted words are exactly SIGN_W wide
    tw, th = words_im.size
    pad = round(PAD * P)
    W, H = tw + 2 * pad, th + 2 * pad
    W, H = W + (-W) % (SS * 8), H + (-H) % (SS * 8)       # (a whole number of the small glow pixels)
    im = Image.new('L', (W, H), 0)
    im.paste(words_im, (pad, pad))
    ink = np.asarray(im) > 127

    # 2 · THE SKELETON: each stroke thinned to its middle line (tiny stray bits removed)
    ink = ndi.binary_closing(ink, iterations=2)
    sk = skeletonize(ink)
    sk = remove_small_objects(sk, max_size=40, connectivity=2)

    # 3 · THE TUBE
    d = ndi.distance_transform_edt(~sk) / P             # each pixel's distance from the tube's middle line (m)
    t = d / TUBE_R                                      # 0 = middle of the tube, 1 = its edge
    cover = np.clip((1 - t) * TUBE_R * P / 1.2 + .5, 0, 1)   # 1 inside the tube, a soft 1-pixel edge
    core = np.exp(-(t / .55) ** 2)
    rim = np.clip((t - .45) / .55, 0, 1) ** 1.5
    col = BODY * (1 - rim[..., None]) + EDGE * rim[..., None]
    col = col * (1 - core[..., None] * .92) + CORE * core[..., None] * .92
    tube = cover                                         # how much tube is in each pixel

    # 4 · THE GLOW, worked out small (it's soft anyway) and enlarged
    k = SS * 8                                           # 1 small pixel = 16 working pixels
    small = tube.reshape(H // k, k, W // k, k).mean((1, 3))
    Ps = P / k                                           # small pixels a metre (125)
    def spread(sig_m):                                   # the tube's light spread over sig_m metres, 1 = beside a lone tube
        return blur(small, sig_m * Ps) / (2 * TUBE_R * Ps / (np.sqrt(2 * np.pi) * sig_m * Ps))
    halo = .55 * spread(.012) + .30 * spread(.035) + .16 * spread(.09)
    wall = .55 * spread(.04) + .30 * spread(.10) + .15 * spread(.22)
    up = lambda a: np.asarray(Image.fromarray(a.astype(np.float32), 'F').resize((W, H), Image.BICUBIC))
    halo, wall = up(halo), up(wall)
    # the very tight glow, worked out at full size (it must hug the tube)
    tight = blur(tube, .004 * P) / (2 * TUBE_R / (np.sqrt(2 * np.pi) * .004))
    glow = np.clip(.8 * tight + 1.15 * halo, 0, None)
    glow_a = 1 - np.exp(-glow * 1.5)                     # how much glow covers the wall (never quite all of it)

    # 6 · THE ACRYLIC PANEL: the outline of the tubes grown 2.5 cm and smoothed into one piece
    grow = ndi.distance_transform_edt(~sk) / P < .025
    sm = ndi.gaussian_filter(grow.astype(np.float32)[::4, ::4], .03 * P / 4)
    panel_s = sm > .32                                   # rounded off, small gaps between letters closed
    panel_s = ndi.binary_fill_holes(panel_s)
    panel = np.asarray(Image.fromarray((panel_s * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255
    panel = np.clip((panel - .5) * 3 + .5, 0, 1)
    # its edge: a thin bright line, brightest along the top (the skylight) and pink near the tubes
    gy, gx = np.gradient(ndi.gaussian_filter(panel, 1.5 * SS))
    edge = np.clip(np.hypot(gx, gy) * 2.2 * SS, 0, 1)
    top = np.clip(gy * 6 * SS, 0, 1)                     # edges facing up (the panel's top side)
    edge_a = edge * (.10 + .30 * top + .35 * np.clip(wall, 0, 1))
    edge_col = (1 - np.clip(wall, 0, 1)[..., None] * .7) * np.array([1, 1, 1]) + np.clip(wall, 0, 1)[..., None] * .7 * BODY
    face_a = panel * .035                                # the acrylic's faint sheen

    # ---- the tubes picture: panel sheen, panel edge, glow, then the tubes on top ----
    rgb = np.zeros((H, W, 3), np.float32); a = np.zeros((H, W), np.float32)
    def over(c, al):
        nonlocal rgb, a
        al = np.clip(al, 0, 1)
        rgb = c * al[..., None] + rgb * (1 - al[..., None])
        a = al + a * (1 - al)
    over(np.ones(3, np.float32), face_a)
    over(edge_col, edge_a)
    over(GLOW, glow_a)
    over(col, tube)
    # (rgb here is the colour already multiplied by its cover; turn it back into plain colour + cover)
    rgb_s = np.where(a[..., None] > 1e-4, rgb / np.maximum(a, 1e-4)[..., None], 0)

    # ---- the light picture (multiply): pink where the neon lights the wall, the panel's shadow just below it ----
    shadow = ndi.shift(panel, (.014 * P, .004 * P), order=1)          # the panel stands off the wall; the skylight is above
    shadow = blur(shadow, .008 * P) * .07 + blur(edge * top, .003 * P) * 0   # (a faint dimming under the panel)
    tint = np.clip(wall * .8, 0, 1)
    light = 1 - tint[..., None] * (1 - TINT)
    light = light * (1 - shadow[..., None])
    # fade to no change at the picture's edges, so no rectangle shows
    fy = np.clip(np.minimum(np.arange(H), H - 1 - np.arange(H)) / (pad * .5), 0, 1)
    fx = np.clip(np.minimum(np.arange(W), W - 1 - np.arange(W)) / (pad * .5), 0, 1)
    fade = np.outer(fy, fx)[..., None]
    light = 1 - (1 - light) * fade
    glow_fade = fade[..., 0]
    a = a * np.maximum(glow_fade, tube)

    # 7 · SHRINK to PPM and save
    def shrink(arr):
        img = Image.fromarray(arr.astype(np.float32), 'F')
        return np.asarray(img.resize((W // SS, H // SS), Image.BOX))
    ro = np.stack([shrink(rgb_s[..., i] * a) for i in range(3)], -1)
    ao = shrink(a)
    ro = np.where(ao[..., None] > 1e-4, ro / np.maximum(ao, 1e-4)[..., None], 0)
    to8 = lambda v: (np.clip(v, 0, 1) * 255 + .5).astype(np.uint8)
    tubes = Image.fromarray(np.dstack([to8(ro), to8(ao)]), 'RGBA')
    lt = Image.fromarray(np.dstack([to8(shrink(light[..., i])) for i in range(3)]), 'RGB')
    os.makedirs(OUT, exist_ok=True)
    tubes.save(os.path.join(OUT, 'cosmo-tubes.webp'), 'WEBP', quality=88, method=6)
    lt.save(os.path.join(OUT, 'cosmo-light.webp'), 'WEBP', quality=88, method=6)
    for f in ('cosmo-tubes.webp', 'cosmo-light.webp'):
        print('wrote', f, round(os.path.getsize(os.path.join(OUT, f)) / 1024), 'KB')
    # the numbers post.js needs (NEON_PIC): the sign's own size, and the wall round it in the pictures
    # mid: the middle of the small letters (the rows the tubes fill most), measured down from the sign's top. post.js
    # hangs the sign by this line, so a new word or font keeps the letters at the same height on the wall.
    rows = (tube > .5).sum(1); band = np.nonzero(rows > rows.max() * .4)[0]
    mid = ((band.min() + band.max()) / 2 - pad) / P
    print(f'sign "{text}": {tw / P:.3f} m wide, {th / P:.3f} m tall; pictures {W // SS} x {H // SS} px = '
          f'{W / P:.3f} x {H / P:.3f} m; the sign starts {pad / P:.3f} m in from the left and top; '
          f'the middle of the small letters is {mid:.3f} m down from its top')
    print(f'NEON_PIC: w: {tw / P:.3f}, h: {th / P:.3f}, pw: {W / P:.3f}, ph: {H / P:.3f}, left: {pad / P:.3f}, top: {pad / P:.3f}, mid: {mid:.3f}')


if __name__ == '__main__':
    main()
