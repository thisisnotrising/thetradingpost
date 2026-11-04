"""Grade S3's interior photos so their black & white matches the cover photo.
The cover photo (measured): blacks ~ rgb(11,12,14), cool blue-ish midtones (R a few points under G, B ~6 over),
highlights that melt into the cover paper rgb(250,251,246). Every interior photo is re-mapped onto that same scale."""
import numpy as np
from PIL import Image, ImageFilter
BLACK, WHITE = np.array([11, 12, 14.]), np.array([250, 251, 246.])
L_pts = [0, 24, 40, 56, 72, 88, 104, 120, 136, 152, 168, 184, 200, 216, 232, 255]
dR    = [-.9, -1.1, -1.3, -2.0, -2.7, -3.0, -3.6, -4.1, -4.2, -3.8, -3.1, -2.9, -2.1, -1.2, -1.1, -1.0]
dB    = [1.8, 2.6, 4.1, 4.9, 5.9, 6.4, 6.4, 6.3, 6.3, 6.4, 6.7, 6.0, 5.1, 4.4, 3.6, -5.0]
L = np.arange(256.)
Y = BLACK[1] + L / 255 * (WHITE[1] - BLACK[1])            # the green channel carries the brightness
LUT = np.stack([Y + np.interp(L, L_pts, dR), Y, Y + np.interp(L, L_pts, dB)], 1)
LUT[0], LUT[255] = BLACK, WHITE
LUT = np.clip(LUT.round(), 0, 255).astype(np.uint8)

def grade(src, dst, upscale_to=None):
    g = np.asarray(Image.open(src).convert('L')).astype(float)
    lo, hi = np.percentile(g, [0.2, 99.8])                 # gentle auto-levels: use the full range like the cover
    g = np.clip((g - lo) / max(hi - lo, 1), 0, 1)
    g = (1 - .35) * g + .35 * g * g * (3 - 2 * g)          # a gentle S-curve: the cover's photo is punchy (deep blacks, bright whites)
    g = g * 255
    im = Image.fromarray(g.astype(np.uint8))
    if upscale_to and im.width < upscale_to:              # the two small strips: enlarge smoothly, then a light sharpen
        im = im.resize((upscale_to, round(im.height * upscale_to / im.width)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
    out = Image.fromarray(LUT[np.asarray(im)])
    out.save(dst, quality=92)
    return out.size

if __name__ == '__main__':
    names = {1: 'thumb-mccafe', 2: 'thumb-desk', 3: 'thumb-utensils', 4: 'thumb-tree', 5: 'mccafe', 6: 'mailbox',
             7: 'desk', 8: 'utensils', 9: 'saris', 10: 'tree', 11: 'kona'}
    for k, n in names.items():
        print(n, grade(f'source/photos/i-{k:03d}.jpg', f'build/img/{n}.jpg', upscale_to=548 if k >= 5 else None))
    np.save('build/lut.npy', LUT)
    print('page black', LUT[0], 'paper', LUT[255], 'mid', LUT[128])
