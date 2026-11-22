"""NOT RISING · THE SPEAK — THE REST, newsprint edition (Nov 21, evening): the recipe for its picture
-------------------------------------------------------------------------------------------
Supersedes the dictionary-papered room (rest_room.py, rest_wallpaper.py, rest_rug.py made that one).

WHAT GOES IN
  originals/rest-newsprint-render.png   the set designer's newsprint restroom (1024 x 1536, Nov 21): walls papered
                                        in Prohibition front pages and her 3x5 Interview answers, two black doors,
                                        the barrel sink, the iron chandelier
  originals/napkin-kevin.png            Kevin Kermes's 3x5 Napkin of Kathi, exactly as he made it (1264 x 1264)

THE STEPS
  1. Sharpen 4x (esrgan_np.py: Real-ESRGAN realesr-general-x4v3, denoise 0.5, the same upscaler as every room).
  2. Kevin's napkin over the arch, in place of the render's redrawn portrait (which wasn't his drawing):
     a. the render's own lettering and hat-brim tips that would show around the napkin are lifted off the paper
        (PatchMatch, from the panel's own paper; the right side mirrors the mended left so the arch matches);
     b. Prohibition clippings either side of it, framing it (rest_paper.py): VOLSTEAD ACT IN FORCE / Nation Goes Dry
        at Midnight on the left, SECRET ROOMS FILL NIGHTLY / Patrons Knock Twice at Unmarked Doors on the right, their
        headlines just under the chandelier, their tops tucked under the arch's moulding, in the panel's light; under
        them, down to the articles below, DRY AGENTS RAID CLUB and RUM RUNNERS SLIP PAST over the render's bare paper
        and its leaf drawings, so no bare wall shows (her rule: fill any blank wall with clippings);
     c. the napkin goes in square, 208 render pixels (x 408-616, y 295-503: between the chandelier's hanging bulbs
        and the articles below), nothing in his drawing changed: greyscale like all the newsprint, his paper lifted to
        the newsprint's white, in the panel's own light, a soft shadow under it; the two hanging bulbs stay in front.
  3. Her 3x5 answers, word for word (her-words.txt), set as Prohibition newspaper articles (rest_paper.article): a
     heavy rule, a condensed headline that is a phrase from her own answer, a double rule, the body in Old Standard
     justified and hyphenated with a two-line drop cap, condensed to 74-78% like a narrow newspaper face, edges worn.
     a. Under the napkin, in place of the render's typed paragraph (lifted off first), over a stretch of newspaper page
        (rest_paper.sheet) so no bare paper shows:
          A THOUSAND HUMAN-CURATED WORKS   It looks like having read over a thousand human-curated works from 700+
                                           writers in eight months.   (over JAZZ PLAYS TILL DAWN, a short clipping)
          HEARD OVER THE ALGORITHM         I watch the Impact on Mission the most. ... I keep going.
     b. On the outer walls, each pasted over the render's poster of the same words, in the wall's perspective and the
        poster's own light (WALL_ARTICLES; the rest of each cutting is the next story's small type):
          left wall    THE ONE THING WE CAN'T ERASE   As Director of Talent & Culture, ... Media is one of them.
          right wall   HUMANS THINK DIFFERENTLY       Voices that want to exchange ideas ... should represent that.
          right wall   WE MAKE OUR OWN MEANING        It requires the willingness ... Absurdity is essential.
     The lanterns' brass finials stay in front.
  4. The left wall's headline mended: 'Amendmeat' -> 'Amendment' (the n of 'Amen', laid on as ink over its paper).
  5. Every papered wall in one uniform aged cream, the passage's paper (wallpaper_cream: one tint, the paper's light
     kept, ink black; the vault, chandelier, doors, lanterns, mirror, flowers, shelf and pothos keep their own
     colour). Then warmth held to 5-10 (speak_grade.py, target 8).
  6. The widths the site uses, as light as they can be: rest-1200/1800/2400.webp (WebP, quality 75; see export()).
     napkin-kevin.webp (the popup) is unchanged.

Run:  pip install pypatchmatch opencv-contrib-python numpy pillow scipy
      python3 tools/speak-faces/rest_newsprint.py      (from the repo's top folder; about 6 minutes, no graphics card;
      the upscaler's models go in tools/speak-faces/models/esrgan/, see esrgan_np.py; the sharpened render is kept
      in tools/speak-faces/cache/, not in the repo, so a re-run takes about a minute)
"""
import os, sys, cv2, numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ORIG, OUT = os.path.join(HERE, 'originals'), os.path.join(HERE, '..', '..', 'assets', 'img', 'speak')
S = 4
NAP = (408, 295, 616, 503)                 # where Kevin's napkin goes (render pixels): x0, y0, x1, y1
LUMA = np.array([.299, .587, .114], np.float32)


def foreground(render):
    """What hangs in front of the arch's paper (render size): the chandelier (bronze, amber bulbs, their glow, its
    iron above the lettering) and the pothos. The paper and its ink are grey; these are coloured or blazing."""
    lab = cv2.cvtColor(render, cv2.COLOR_RGB2LAB).astype(np.float32)
    fg = ((np.hypot(lab[..., 1] - 128, lab[..., 2] - 128) > 14) | (lab[..., 0] > 246)).astype(np.uint8)
    fg[:284][lab[:284, :, 0] < 70] = 1
    return cv2.dilate(fg, np.ones((5, 5), np.uint8)) > 0


def arch_inside(xx, yy):
    """inside the arch over the mirror (full-size pixels): straight sides, an elliptical top"""
    cx, hw = 509 * S, 181 * S
    top = (315 - 75 * np.sqrt(np.clip(1 - ((xx - cx) / hw) ** 2, 0, 1))) * S
    return (np.abs(xx - cx) <= hw) & (yy >= top)


def lift_portrait_strays(big, fg):
    """2a. The redrawn portrait's lettering and hat-brim tips around the napkin's place, filled from the panel's paper."""
    from patchmatch import patch_match
    ZONES = [(326, 236, 412, 362), (404, 236, 458, 297), (584, 236, 694, 358), (390, 334, 412, 406),
             (612, 334, 636, 406), (612, 404, 628, 503)]
    X0, Y0, X1, Y1 = 1290, 900, 2790, 2020
    hole = np.zeros((Y1 - Y0, X1 - X0), bool)
    for x0, y0, x1, y1 in ZONES:
        hole[y0 * S - Y0:y1 * S - Y0, x0 * S - X0:x1 * S - X0] = True
    f4 = cv2.resize(fg.astype(np.uint8), (big.shape[1], big.shape[0]), interpolation=cv2.INTER_NEAREST)[Y0:Y1, X0:X1]
    f4 = cv2.dilate(f4, np.ones((9, 9), np.uint8)) > 0
    yy, xx = np.mgrid[Y0:Y1, X0:X1]
    nap = (xx >= NAP[0] * S) & (xx < NAP[2] * S) & (yy >= NAP[1] * S) & (yy < NAP[3] * S)
    hole &= ~f4 & ~nap
    hole &= (yy >= (315 - 75 * np.sqrt(np.clip(1 - ((xx - 509 * S) / (181 * S)) ** 2, 0, 1))) * S + 6) & \
            (np.abs(xx - 509 * S) <= 181 * S - 6)
    inside = arch_inside(xx, yy) & (yy >= 1000)
    leaves = ((xx <= 404 * S) | (xx >= 618 * S)) & (yy >= 376 * S)
    Lr = big[Y0:Y1, X0:X1].astype(np.float32) @ LUMA
    clean = cv2.erode((Lr > 120).astype(np.uint8), np.ones((25, 25), np.uint8)) > 0
    src = inside & ~hole & ~f4 & ~nap & (yy >= 286 * S) & (yy <= 470 * S) & (xx >= 334 * S) & (xx <= 684 * S) & \
          (~leaves | clean)
    src = cv2.erode(src.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    glob = (~(src | hole)).astype(np.uint8) * 255
    reg = big[Y0:Y1, X0:X1].copy()
    out = patch_match.inpaint(reg, hole.astype(np.uint8) * 255, global_mask=glob, patch_size=7)
    # the right side takes the left side's mended paper, mirrored about the arch's middle, so both sides match
    right = hole & (xx >= 618 * S)
    mir = np.roll(out[:, ::-1], (2 * 509 * S) - (X0 + X1 - 1), axis=1)
    out[right] = mir[right]
    # the mended paper takes the room's light exactly (its own light, ink lifted, smoothed)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41))
    low = lambda a: cv2.GaussianBlur(cv2.morphologyEx(a.astype(np.float32) @ LUMA, cv2.MORPH_CLOSE, k), (0, 0), 30)
    out = np.clip(out.astype(np.float32) * (low(reg) / np.maximum(low(out), 1))[..., None], 0, 255)
    m = cv2.GaussianBlur(hole.astype(np.float32), (0, 0), 4)[..., None]
    big = big.copy()
    big[Y0:Y1, X0:X1] = np.clip(out * m + reg * (1 - m), 0, 255).astype(np.uint8)
    return big


def panel_light(render, fg):
    """The arch panel's paper light at full size (0..1): the render's paper with its ink lifted (a closing), smoothed
    from the paper only, coarse to fine; under the old portrait, the light of the paper round it."""
    H, W = render.shape[:2]
    lum = render.astype(np.float32) @ LUMA
    lifted = cv2.morphologyEx(lum, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    yy, xx = np.mgrid[0:H, 0:W]
    w = ((xx >= 326) & (xx <= 692) & (yy >= 250) & (yy <= 503) & ~fg & (lifted > 150)).astype(np.float32)
    w[NAP[1]:NAP[3], NAP[0]:NAP[2]] = 0                    # under the old portrait isn't paper
    est = None
    for sig in (120, 40, 14):
        num = cv2.GaussianBlur(lifted * w, (0, 0), sig); den = cv2.GaussianBlur(w, (0, 0), sig)
        val = num / np.maximum(den, 1e-9); conf = np.clip(den / .25, 0, 1)
        est = val if est is None else val * conf + est * (1 - conf)
    return cv2.resize(est, (W * S, H * S), interpolation=cv2.INTER_CUBIC) / 255


def in_front(img, fg, iron_above=284):
    """What hangs in front of the paper, traced at full size with no halo: whatever is coloured (bronze, brass,
    amber bulbs, pothos) or blazing white, plus (above the lettering) the chandelier's dark iron; only where the
    render-size trace (foreground()) says something hangs."""
    H, W = img.shape[:2]
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB).astype(np.float32)
    m = (np.hypot(lab[..., 1] - 128, lab[..., 2] - 128) > 16) | (lab[..., 0] > 246)
    m[:iron_above * S] |= lab[:iron_above * S, :, 0] < 75
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    f1 = cv2.resize(fg.astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST)
    return cv2.GaussianBlur((m & cv2.dilate(f1, np.ones((9, 9), np.uint8))).astype(np.float32), (0, 0), 1.2)[..., None]


def frame_clippings(big, render, fg):
    """2b. Two Prohibition clippings framing the napkin's place, behind the chandelier, under the arch's moulding."""
    import rest_paper as P
    light = panel_light(render, fg)
    H, W = big.shape[:2]
    Y4, X4 = np.mgrid[0:H, 0:W]
    inside = cv2.GaussianBlur(cv2.erode(arch_inside(X4, Y4).astype(np.float32), np.ones((9, 9), np.uint8)), (0, 0), 1.5)
    out = big.astype(np.float32)
    for (cx, cy, w, h, ang, head, sub, seed) in (
            (369, 312, 84, 150, -0.8, ['VOLSTEAD ACT', 'IN FORCE'], ['Nation Goes Dry', 'at Midnight'], 11),
            (649, 311, 72, 150, 0.9, ['SECRET ROOMS', 'FILL NIGHTLY'], ['Patrons Knock Twice', 'at Unmarked Doors'], 12)):
        alb = P.aged(P.clipping(w * S, h * S, head, sub, seed, head_y=(294 - (cy - h // 2)) * S), seed)   # headline at y 294
        out, _ = P.place(out, alb, cx * S, cy * S, ang, mask=inside, light=light)
    # under them, down to the cards, two more over the render's bare paper with its leaf drawings (no bare wall)
    for (cx, cy, w, h, ang, head, sub, seed) in (
            (369, 447, 86, 124, 0.6, ['DRY AGENTS', 'RAID CLUB'], ['Three Hundred Cases', 'Seized in Cellar'], 14),
            (652, 447, 80, 124, -0.5, ['RUM RUNNERS', 'SLIP PAST'], ['Harbor Patrol', 'Outwitted Again'], 15)):
        alb = P.aged(P.clipping(w * S, h * S, head, sub, seed), seed)
        out, _ = P.place(out, alb, cx * S, cy * S, ang, shadow=(4, 7, 7, .2), mask=inside, light=light)
    f = in_front(big, fg)
    return np.clip(out * (1 - f) + big * f, 0, 255).astype(np.uint8)


def index_cards(big, fg):
    """3. The paragraph under the napkin lifted off its paper, and her answer set as two Prohibition newspaper articles
    in its place."""
    import rest_paper as P
    out = big.astype(np.float32)
    H, W = big.shape[:2]
    BX0, BY0, BX1, BY1 = 346 * S, 504 * S, 664 * S, 682 * S
    reg = out[BY0:BY1, BX0:BX1].copy()
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61))
    paper = cv2.GaussianBlur(np.stack([cv2.morphologyEx(reg[..., c], cv2.MORPH_CLOSE, k) for c in range(3)], -1), (0, 0), 22)
    paper += P.fiber(paper.shape[0], paper.shape[1], np.random.default_rng(5), 1.0)[..., None] * 2.2
    tm = np.zeros(reg.shape[:2], np.float32)
    tm[(508 * S - BY0):(678 * S - BY0), (354 * S - BX0):(656 * S - BX0)] = 1   # the typed area; its torn edges stay
    tm = cv2.GaussianBlur(tm, (0, 0), 6)[..., None]
    out[BY0:BY1, BX0:BX1] = reg * (1 - tm) + paper * tm
    # the clippings take the box paper's light (its own light, smoothed; the box paper is about 0.9 white)
    cl = cv2.GaussianBlur(paper @ LUMA, (0, 0), 25) / 255 / .9
    light = np.full((H, W), float(np.median(cl)), np.float32)
    light[BY0:BY1, BX0:BX1] = cl
    light = cv2.GaussianBlur(light, (0, 0), 20)
    t1 = 'It looks like having read over a thousand human-curated works from 700+ writers in eight months.'
    t2 = ('I watch the Impact on Mission the most. I want to help humans be heard over the algorithm. I want to '
          'prove that helping others helps me prosper too. When I see that a writer I featured grew 10x more than '
          'the control group in 1 week, I keep going.')
    page = P.aged(P.sheet(1290, 736, 31), 30, .6)                   # the whole box papered first: no bare paper
    out, _ = P.place(out, page, 505 * S, 593 * S, 0.0, shadow=(0, 0, 1, 0), light=light)
    # her answer as two articles, each headlined with a phrase from it; the left one over a short clipping
    filler = P.aged(P.clipping(560, 236, ['JAZZ PLAYS TILL DAWN'], ['Cellar Clubs Defy the Dry Law'], 13), 31)
    out, _ = P.place(out, filler, 421 * S, 653 * S, -0.7, shadow=(4, 7, 7, .22), light=light)
    a1 = P.aged(P.squeeze(P.article(700, ['A THOUSAND', 'HUMAN-CURATED WORKS'], t1, 21, 44), .78), 32)
    a2 = P.aged(P.squeeze(P.article(820, ['HEARD OVER', 'THE ALGORITHM'], t2, 22, 36), .78), 33)
    out, _ = P.place(out, a1, 422 * S, 568 * S, 1.2, shadow=(5, 9, 8, .28), light=light)
    out, _ = P.place(out, a2, 581 * S, 597 * S, -1.0, shadow=(6, 10, 9, .3), light=light)
    f = in_front(big, fg, iron_above=0)                             # the lanterns' brass finials
    return np.clip(out * (1 - f) + big * f, 0, 255).astype(np.uint8)


# her 3x5 answers on the outer walls, word for word (her-words.txt), each headlined with a phrase from it; the poster
# each one covers (render pixels, TL, TR, BR, BL), the flat size it is set at, its body size
WALL_ARTICLES = [
    ("THE ONE THING|WE CAN'T ERASE", "As Director of Talent & Culture, I saw why our humanity is the one thing we can't "
     "erase from the systems shaping the future. Media is one of them.",
     [(21, 377), (154, 399), (154, 756), (21, 754)], 680, 1500, 64),
    ("HUMANS THINK|DIFFERENTLY", "Voices that want to exchange ideas vs. voices that want to trap our attention for "
     "profit. It's the former we should reward. Otherwise, Stackhunters decide who they restack, and we're all "
     "different for a reason. Humans think differently. Human curation should represent that.",
     [(871, 106), (1012, 20), (1012, 512), (871, 536)], 720, 1800, 64),
    ("WE MAKE OUR|OWN MEANING", "It requires the willingness to hold multiple conflicting ideas at once. We make our "
     "own meaning in a world that makes zero sense right now. Mostly, we have fun while doing purposeful work, even "
     "when it's painful. Absurdity is essential.",
     [(869, 748), (1012, 745), (1012, 1052), (869, 1054)], 720, 1220, 60),
]


def wall_articles(big):
    """3b. The outer walls' posters of her words (the render's own lettering) become Prohibition newspaper articles,
    each pasted over its poster in the wall's perspective and in the poster's own light."""
    import rest_paper as P
    out = big.astype(np.float32)
    H, W = big.shape[:2]
    # each poster's light: its paper with the ink lifted (a wide closing, at render size), then a smooth surface (a
    # quadratic in x and y) fitted to the brighter half of it, so neither the old letters nor the dark photo and
    # door frame beside it leave blotches; the new cutting takes that light
    small = cv2.resize(big, (W // S, H // S), interpolation=cv2.INTER_AREA).astype(np.float32) @ LUMA
    lifted = cv2.morphologyEx(small, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (35, 35)))

    def light_of(quad):
        poly = np.zeros(small.shape, np.uint8)
        cv2.fillPoly(poly, [np.int32(quad)], 1)
        poly = cv2.erode(poly, np.ones((9, 9), np.uint8))
        ys, xs = np.nonzero(poly)
        v = lifted[ys, xs]
        keep = v >= np.percentile(v, 50)
        X = lambda x, y: np.stack([np.ones_like(x), x, y, x * x, x * y, y * y], 1).astype(np.float64)
        c, *_ = np.linalg.lstsq(X(xs[keep] / 100., ys[keep] / 100.), v[keep], rcond=None)
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) / S / 100.
        return (X(xx.ravel(), yy.ravel()) @ c).reshape(H, W).astype(np.float32) / (.86 * 255)
    for i, (head, body, quad, w, h, size) in enumerate(WALL_ARTICLES):
        piece = P.aged(P.squeeze(P.article(w, head.split('|'), body, 50 + i, size, h=h), .74), 60 + i)
        out = P.warp_into(out, piece, [(x * S, y * S) for x, y in quad], light_of(quad))
    return np.clip(out, 0, 255).astype(np.uint8)


def set_napkin(big, render, fg):
    """2c. Kevin's napkin in the arch, in the panel's light, behind the two hanging bulbs."""
    x0, y0, x1, y1 = [v * S for v in NAP]; size = x1 - x0
    H, W = render.shape[:2]
    light = panel_light(render, fg)[y0:y1, x0:x1]
    nap = np.asarray(Image.open(os.path.join(ORIG, 'napkin-kevin.png')).convert('RGB')
                     .resize((size, size), Image.LANCZOS)).astype(np.float32)
    g = (nap @ LUMA) / 255
    alb = np.clip(g / np.percentile(g, 75) * .86, 0, 1)     # his paper to the newsprint's white; ink stays ink
    alb[:3, :] *= .86; alb[:, :3] *= .86; alb[-3:, :] *= .9; alb[:, -3:] *= .9
    src = big.astype(np.float32)
    out = src.copy()
    sh = np.zeros(big.shape[:2], np.float32); sh[y0 + 10:y1 + 10, x0 + 2:x1 + 2] = 1
    out *= (1 - cv2.GaussianBlur(sh, (0, 0), 9) * .22)[..., None]
    out[y0:y1, x0:x1] = np.clip(alb * light * 255, 0, 255)[..., None]
    # the bulbs in front, traced at full size with no halo
    lab4 = cv2.cvtColor(big, cv2.COLOR_RGB2LAB).astype(np.float32)
    f4 = ((np.hypot(lab4[..., 1] - 128, lab4[..., 2] - 128) > 16) | (lab4[..., 0] > 246)).astype(np.uint8)
    f4 = cv2.morphologyEx(f4, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    f1 = cv2.resize(fg.astype(np.uint8), (W * S, H * S), interpolation=cv2.INTER_NEAREST)
    f4 = cv2.GaussianBlur((f4 & cv2.dilate(f1, np.ones((9, 9), np.uint8))).astype(np.float32), (0, 0), 1.2)[..., None]
    return np.clip(out * (1 - f4) + src * f4, 0, 255).astype(np.uint8)


class Ink:
    """Mending letters at full size: lift a letter off its paper, lay another on as ink (its darkness over its paper)."""
    def __init__(self, img):
        self.img = img.astype(np.float32)

    def gray(self, a):
        return a @ LUMA

    def mask(self, box, thr=150, grow=3):
        x, y, w, h = box
        m = np.zeros(self.img.shape[:2], np.uint8)
        m[y:y + h, x:x + w] = self.gray(self.img[y:y + h, x:x + w]) < thr
        return cv2.dilate(m, np.ones((2 * grow + 1, 2 * grow + 1), np.uint8))

    def erase(self, m, r=5):
        self.img = cv2.inpaint(np.clip(self.img, 0, 255).astype(np.uint8), m, r, cv2.INPAINT_TELEA).astype(np.float32)

    def take(self, box, pad=4):
        """the letter in box (only the dark shapes whose middle lies inside the box), as a darkness ratio"""
        x, y, w, h = box[0] - pad, box[1] - pad, box[2] + 2 * pad, box[3] + 2 * pad
        g = self.gray(self.img[y:y + h, x:x + w])
        paper = np.percentile(self.gray(self.img[y - 20:y + h + 20, x - 20:x + w + 20]), 85)
        n, lab, st, cen = cv2.connectedComponentsWithStats((g < 150).astype(np.uint8))
        keep = np.zeros(g.shape, np.float32)
        for i in range(1, n):
            if pad <= cen[i][0] < pad + box[2] and pad <= cen[i][1] < pad + box[3]:
                keep[lab == i] = 1
        m = np.clip(cv2.dilate(cv2.GaussianBlur(keep, (0, 0), 1), np.ones((5, 5), np.uint8)) * 1.5, 0, 1)
        return 1 - (1 - np.clip(g / paper, 0, 1)) * m, (x, y)

    def lay(self, taken, dx, dy):
        ratio, (x, y) = taken
        h, w = ratio.shape
        M = np.float32([[1, 0, dx - np.floor(dx)], [0, 1, dy - np.floor(dy)]])
        rr = cv2.warpAffine(ratio, M, (w + 2, h + 2), flags=cv2.INTER_CUBIC, borderValue=1.0)
        X, Y = x + int(np.floor(dx)), y + int(np.floor(dy))
        self.img[Y:Y + h + 2, X:X + w + 2] *= np.clip(rr, 0, 1)[..., None]


def wallpaper_cream(room):
    """5. Every papered wall in one uniform aged cream, the passage's paper (Nov 21, after a grey try that ran the room
    cold, warmth 3.5): the paper's own colour replaced by one tint (Lab a* 5, b* 12 at full light, less in shadow, so
    it stays warm, never muddy), its lightness, so the room's light, untouched; ink stays black. Only the papered walls: the two outer walls and the
    strips between the doors and the arch, above the doors, and the arch panel and backsplash, down to the white
    brick. Left in colour: the vault and the chandelier, the doors and their brass, the lanterns, the mirror, the
    flowers and everything on the shelf, the pothos (anything leaf-green), and anything strongly coloured (the bulbs,
    the glow right at the lanterns' glass)."""
    H1, W1 = 1536, 1024
    m = np.zeros((H1, W1), np.uint8)
    for x0, y0, x1, y1 in ((0, 0, 160, 1105), (160, 0, 250, 240), (268, 240, 312, 990), (705, 240, 750, 990),
                           (765, 0, 870, 240), (868, 0, 1024, 1105)):
        m[y0:y1, x0:x1] = 1
    yy, xx = np.mgrid[0:H1, 0:W1]
    top = 315 - 75 * np.sqrt(np.clip(1 - ((xx - 509) / 181) ** 2, 0, 1))
    m[(np.abs(xx - 509) <= 200) & (yy >= top) & (yy < 990)] = 1                      # arch panel and backsplash
    keep = np.zeros((H1, W1), np.uint8)
    for x0, y0, x1, y1 in ((295, 838, 452, 1000), (440, 928, 582, 1000), (568, 826, 722, 1000)):   # flowers, tap, shelf
        keep[y0:y1, x0:x1] = 1
    lanterns = np.zeros((H1, W1), np.float32)
    for x0, y0, x1, y1 in ((310, 618, 384, 838), (633, 618, 707, 838)):               # the lanterns: only their brass
        lanterns[y0:y1, x0:x1] = 1                                                     # and glass keep their colour
    keep[(xx - 507) ** 2 + (yy - 812) ** 2 <= 131 ** 2] = 1                           # the mirror
    m &= 1 - keep
    H, W = room.shape[:2]
    m = cv2.GaussianBlur(cv2.resize(m.astype(np.float32), (W, H), interpolation=cv2.INTER_LINEAR), (0, 0), 6)
    lab = cv2.cvtColor(room, cv2.COLOR_RGB2LAB).astype(np.float32)
    a, b = lab[..., 1] - 128, lab[..., 2] - 128
    C = np.hypot(a, b)
    green = np.clip((-a - 2) / 5, 0, 1) * np.clip((C - 6) / 6, 0, 1)                 # the pothos
    strong = np.clip((C - 40) / 14, 0, 1)                                              # bulbs, the glass's glow
    lant = cv2.resize(lanterns, (W, H), interpolation=cv2.INTER_NEAREST) * np.clip((C - 9) / 6, 0, 1)
    f = m * (1 - np.maximum.reduce([green, strong, lant]))
    f = cv2.GaussianBlur(f, (0, 0), 1.5)
    L = lab[..., 0] / 255
    tint = np.clip((L - .1) / .55, 0, 1)                                               # 0 in the ink, 1 on paper
    lab[..., 1] = 128 + a * (1 - f) + 5.0 * tint * f
    lab[..., 2] = 128 + b * (1 - f) + 12.0 * tint * f
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)


def mend_lettering_full(big):
    """4. The left wall's headline, at full size: Amendmeat -> Amendment (the n of 'Amen', moved down the headline's
    slope, bottoms aligned, in place of the a)."""
    t = Ink(big)
    n = t.take((407, 907, 25, 58)); t.erase(t.mask((514, 987, 25, 55))); t.lay(n, 107, 77)
    return np.clip(t.img, 0, 255).astype(np.uint8)


def export(room):
    """6. As light as it can be: three widths, so each screen downloads only what it shows sharp (a phone ~1800, a
    laptop ~1800, a big or retina desktop 2400), at WebP quality 75 (side by side with 85, the cards' type and Kevin's
    lines read the same; a third smaller)."""
    for width in (1200, 1800, 2400):
        Image.fromarray(room).resize((width, width * 3 // 2), Image.LANCZOS).save(
            os.path.join(OUT, f'rest-{width}.webp'), 'WEBP', quality=75, method=6)
        print('  wrote', f'rest-{width}.webp', os.path.getsize(os.path.join(OUT, f'rest-{width}.webp')) // 1024, 'KB')


if __name__ == '__main__':
    import speak_grade as G, esrgan_np
    render = np.asarray(Image.open(os.path.join(ORIG, 'rest-newsprint-render.png')).convert('RGB'))
    fg = foreground(render)
    net = esrgan_np.make_model(0.5)
    # the 4x sharpening is the slow part (about 5 minutes): kept in cache/ (not in the repo) so a re-run only redoes
    # the paste-up; delete cache/ if the render changes
    cache = os.path.join(HERE, 'cache', 'rest-newsprint-x4.png')
    if os.path.exists(cache):
        room = np.asarray(Image.open(cache).convert('RGB'))
    else:
        print('THE REST (newsprint): sharpening 4x')
        room = esrgan_np.upscale(render, net)
        os.makedirs(os.path.dirname(cache), exist_ok=True); Image.fromarray(room).save(cache)
    print("Kevin's napkin over the arch, framed by clippings")
    room = lift_portrait_strays(room, fg)
    room = frame_clippings(room, render, fg)
    room = set_napkin(room, render, fg)
    print('her words, as newspaper articles')
    room = index_cards(room, fg)
    room = wall_articles(room)
    print('mending the lettering')
    room = mend_lettering_full(room)
    print('the wallpaper to one aged cream')
    room = wallpaper_cream(room)
    lab = cv2.cvtColor(room, cv2.COLOR_RGB2LAB).astype(np.float32)
    k = G.solve(lab, G.TARGET)
    room = cv2.cvtColor(np.clip(G.apply(lab, k), 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)
    print(f'grade shift {k:.4f}  warmth now {G.warmth(cv2.cvtColor(room, cv2.COLOR_RGB2LAB).astype(np.float32)):.1f}')
    Image.fromarray(room).save(os.path.join(HERE, 'cache', 'rest-newsprint-final.png'))
    export(room)

