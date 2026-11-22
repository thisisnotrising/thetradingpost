"""THE REST: Kathi's four notes, each lettered by hand on a square of cream paper, the size of half a dictionary page.
The words are hers, exactly as they were on the room's paper notes. The handwriting is Patrick Hand (an open-licence
font, fonts/PatrickHand-Regular.ttf, licence beside it), close to the marker hand of the original notes."""
import os, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
HAND = os.path.join(HERE, 'fonts', 'PatrickHand-Regular.ttf')
NOTES = {
    'director': "As Director of Talent & Culture, I saw why our humanity is the one thing we can't erase from the "
                "systems shaping the future. Media is one of them.",
    'thousand': "It looks like having read over a thousand human-curated works from 700+ writers in eight months.",
    'voices': "Voices that want to exchange ideas vs. voices that want to trap our attention for profit.",
    'absurdity': "Absurdity is essential.",
}
PAPER = np.array([1.0, .955, .86], np.float32)          # cream, beside the dictionary pages' white
INK = np.array([.07, .065, .06], np.float32)


def wrap(d, words, font, width):
    lines, cur = [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= width or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    return lines + [cur]


def square(key, size, seed=0, paper_rgb=PAPER, crinkle=0.0):
    """One note: a square of paper (cream, or the colour given), its words in her hand, as albedo (RGB 0..1), size x size."""
    ss = 2; W = size * ss
    words = NOTES[key].split()
    margin = int(W * .12)
    im = Image.new('L', (W, W), 0); d = ImageDraw.Draw(im)
    # the biggest letters that fit, but never bigger than 0.15 of the square (so a short note isn't a poster)
    for fs in range(int(W * .15), 8, -2):
        f = ImageFont.truetype(HAND, fs)
        lines = wrap(d, words, f, W - 2 * margin)
        lh = int(fs * 1.12)
        if lh * len(lines) <= W - 2 * margin:
            break
    y = (W - lh * len(lines)) / 2
    rng = np.random.default_rng(seed)
    for ln in lines:
        x = (W - d.textlength(ln, font=f)) / 2 + rng.normal(0, fs * .06)   # hand-set: each line a touch off centre
        d.text((x, y), ln, font=f, fill=255); y += lh
    ink = np.asarray(im.resize((size, size), Image.LANCZOS)).astype(np.float32) / 255
    # the paper: a little fibre, a little darker at its edges
    g = cv2.GaussianBlur(rng.normal(0, 1, (size, size)).astype(np.float32), (0, 0), 1.5)
    g = g / g.std() * .02
    if crinkle:                                         # the napkin's fine weave and soft creases, as much as its own
        fine, soft = crinkle
        f = cv2.GaussianBlur(rng.normal(0, 1, (size, size)).astype(np.float32), (0, 0), .8)
        c = cv2.GaussianBlur(rng.normal(0, 1, (size, size)).astype(np.float32), (0, 0), 14)
        g = f / f.std() * fine + c / c.std() * soft * .45      # (its creases are lines; soft blotches read stronger)
    yy, xx = np.mgrid[0:size, 0:size] / size
    edge = 1 - .06 * np.clip(1 - np.minimum.reduce([xx, yy, 1 - xx, 1 - yy]) / .08, 0, 1)
    paper = np.asarray(paper_rgb, np.float32)[None, None, :] * (edge * (1 + g))[..., None]
    alb = paper * (1 - ink[..., None]) + INK[None, None, :] * ink[..., None]
    alb[:2, :] *= .84; alb[:, :2] *= .84; alb[-2:, :] *= .9; alb[:, -2:] *= .9      # where it meets the pages beside it
    return np.clip(alb, 0, 1)
