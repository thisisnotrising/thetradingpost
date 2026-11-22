"""THE REST: the paper pieces rest_newsprint.py pastes up, drawn at full size as albedo (how much light they give back,
0..1): the Prohibition clippings that frame Kevin's napkin, and her words set as two newspaper clippings under it
(news_column; index_card is the typed 3x5 card version, kept in case).
Faces (fonts/, open licence): Old Standard (the clippings' headlines, decks and small type, a 19th-century news face;
the headlines squeezed to 70% for a condensed front-page look; her words) and Courier Prime (the typed cards)."""
import os, textwrap, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts')
F = lambda name, size: ImageFont.truetype(os.path.join(FONTS, name), size)
WORDS = ('the of and to in city club agents night federal raid doors liquor report council police street said '
         'owner patrons hall music law dry wet saloon cellar bottles found late hour new order mayor judge court '
         'week board crowd jazz band ladies gentlemen password knock door basement stairs whisper evening seized '
         'cases gin rye bourbon wine barrel truck harbor dock warehouse district ward precinct sergeant chief').split()


def fiber(h, w, rng, amt=.035):
    n = rng.normal(0, 1, (h, w)).astype(np.float32)
    n = cv2.GaussianBlur(n, (0, 0), .8) * amt + cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 9) * amt * 2.5
    return n


def condensed_line(text, font, squeeze, fill=0):
    """one line of type, squeezed sideways (a condensed headline face from a regular one)"""
    l, t, r, b = font.getbbox(text)
    im = Image.new('L', (r - l + 4, b - t + 4), 255)
    ImageDraw.Draw(im).text((2 - l, 2 - t), text, font=font, fill=fill)
    return im.resize((max(1, int(im.width * squeeze)), im.height), Image.LANCZOS)


def fit_lines(lines, fontname, width, squeeze, start=120):
    size = start
    while size > 8:
        f = F(fontname, size)
        if max(condensed_line(t, f, squeeze).width for t in lines) <= width:
            return f
        size -= 2
    return F(fontname, 8)


def columns(d, rng, x0, y0, y1, tw, bf, gap=12):
    """two columns of small type from y0 to y1, a hairline between them"""
    cw = (tw - gap) // 2; lh = int(bf.size * 1.18)
    for c in range(2):
        xc = x0 + c * (cw + gap); yy = y0
        while yy + lh < y1:
            line, x = [], 0
            while True:
                wd = WORDS[rng.integers(len(WORDS))]
                ww = bf.getlength(wd + ' ')
                if x + ww > cw: break
                line.append(wd); x += ww
            d.text((xc, yy), ' '.join(line), font=bf, fill=70)
            yy += lh
    d.line([(x0 + cw + gap // 2, y0), (x0 + cw + gap // 2, y1)], fill=110, width=1)


def clipping(w, h, head, sub, seed, head_y=None):
    """a newspaper clipping, w x h: (the end of a story above, if head_y says where the headline starts), a rule, a
    condensed headline, an italic deck, a double rule, two columns of small type. Greyscale albedo; the paper a little
    grey, as newsprint is."""
    rng = np.random.default_rng(seed)
    im = Image.new('L', (w, h), 255); d = ImageDraw.Draw(im)
    m = int(w * .055); tw = w - 2 * m; y = m
    bf = F('OldStandard-Regular.ttf', max(9, int(w / 26)))
    if head_y:
        columns(d, rng, m, y, head_y - 14, tw, bf)
        y = head_y - 8
    d.rectangle([m, y, w - m, y + 3], fill=30); y += 12
    hf = fit_lines(head, 'OldStandard-Bold.ttf', tw, .7)
    for t in head:
        ln = condensed_line(t, hf, .7); im.paste(ln, ((w - ln.width) // 2, y), None); y += int(ln.height * .92)
    y += 6
    sf = fit_lines(sub, 'OldStandard-Italic.ttf', tw, .92, start=int(hf.size * .5))
    for t in sub:
        ln = condensed_line(t, sf, .92); im.paste(ln, ((w - ln.width) // 2, y), None); y += int(ln.height * .95)
    y += 8
    d.rectangle([m, y, w - m, y + 2], fill=40); d.rectangle([m, y + 6, w - m, y + 7], fill=40); y += 16
    columns(d, rng, m, y, h - m, tw, bf)
    a = np.asarray(im).astype(np.float32) / 255
    paper = .84 + fiber(h, w, rng, .02)
    alb = paper * (0.07 + 0.93 * a)
    alb[:3] *= .8; alb[-3:] *= .8; alb[:, :3] *= .8; alb[:, -3:] *= .8
    return np.clip(alb, 0, 1)


def index_card(w, h, text, seed, fsize, text_w=None, lines_from=0):
    """a 3x5 index card, w x h (5:3): white card, a red rule near the top, pale blue rules under it, her words typed
    on the blue rules in Courier Prime. RGB albedo."""
    rng = np.random.default_rng(seed)
    red_y = int(h * .2); lh = int(fsize * 1.24)
    img = np.ones((h, w, 3), np.float32) * np.array([.93, .925, .91], np.float32)
    img += fiber(h, w, rng, .012)[..., None]
    for y in range(red_y + lh, h - 4, lh):
        img[y:y + 2] = img[y:y + 2] * np.array([.70, .80, .95], np.float32)
    img[red_y:red_y + 3] = img[red_y:red_y + 3] * np.array([.95, .45, .45], np.float32)
    # the words, typed: a typewriter's ink is a little uneven
    font = F('CourierPrime-Regular.ttf', fsize)
    mx = int(w * .07); avail = (text_w or (w - 2 * mx))
    cpl = int(avail / font.getlength('n'))
    lines = textwrap.wrap(text, cpl, break_on_hyphens=False)
    ink = Image.new('L', (w, h), 0); d = ImageDraw.Draw(ink)
    for i, ln in enumerate(lines):
        base = red_y + lh * (i + 1 + lines_from) - 6
        x = mx
        for ch in ln:
            dy = rng.normal(0, .6)
            d.text((x, base + dy), ch, font=font, fill=int(np.clip(rng.normal(225, 18), 170, 255)), anchor='ls')
            x += font.getlength(ch)
    a = np.asarray(ink).astype(np.float32) / 255
    img = img * (1 - a[..., None] * .88)
    img[:2] *= .88; img[-2:] *= .85; img[:, :2] *= .88; img[:, -2:] *= .85
    return np.clip(img, 0, 1), len(lines), cpl


def place(dst, alb, cx, cy, angle, shadow=(6, 10, 9, .26), mask=None, light=None):
    """lay a piece of paper (albedo) onto the room (float RGB, full size) centred at (cx, cy), turned by angle degrees,
    with a soft shadow; light is the wall's light (H x W, 0..1) the paper takes; mask limits where it may lie."""
    alpha = None
    if isinstance(alb, tuple):
        alb, alpha = alb
    h, w = alb.shape[:2]
    rgb = alb if alb.ndim == 3 else np.repeat(alb[..., None], 3, -1)
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    M[0, 2] += cx - w / 2; M[1, 2] += cy - h / 2
    H, W = dst.shape[:2]
    a = cv2.warpAffine(np.ones((h, w), np.float32) if alpha is None else alpha.astype(np.float32), M, (W, H),
                       flags=cv2.INTER_LINEAR)
    p = cv2.warpAffine(rgb, M, (W, H), flags=cv2.INTER_CUBIC)
    if mask is not None:
        a = a * mask
    dx, dy, blur, k = shadow
    sh = cv2.GaussianBlur(np.roll(np.roll(a, dy, 0), dx, 1), (0, 0), blur) * k
    out = dst * (1 - sh)[..., None]
    lit = p * light[..., None] * 255
    return out * (1 - a[..., None]) + lit * a[..., None], a


SUBHEADS = ['DRY LAW TESTED', 'CLUB RAIDED', 'NEW ORDINANCE', 'HARBOR WATCH', 'JAZZ AT NIGHT', 'COURT NOTES',
            'CITY HALL', 'LATE EDITION', 'CELLAR FOUND', 'AGENTS NAMED']


def sheet(w, h, seed, cols=4):
    """a torn-off stretch of a newspaper page, w x h, to paper over bare wall: columns of small type with hairlines
    between them and a bold subhead now and then. Greyscale albedo."""
    rng = np.random.default_rng(seed)
    im = Image.new('L', (w, h), 255); d = ImageDraw.Draw(im)
    m = 14; gap = 12
    bf = F('OldStandard-Regular.ttf', 21); hf = F('OldStandard-Bold.ttf', 25)
    cw = (w - 2 * m - gap * (cols - 1)) / cols; lh = int(bf.size * 1.18)
    for c in range(cols):
        x0 = m + c * (cw + gap); y = m
        while y + lh < h - m:
            if rng.random() < .07 and y > m + lh:
                t = SUBHEADS[rng.integers(len(SUBHEADS))]
                d.text((x0 + (cw - hf.getlength(t)) / 2, y + 4), t, font=hf, fill=25)
                y += int(hf.size * 1.5)
                continue
            line, x = [], 0
            while True:
                wd = WORDS[rng.integers(len(WORDS))]
                if x + bf.getlength(wd + ' ') > cw: break
                line.append(wd); x += bf.getlength(wd + ' ')
            d.text((x0, y), ' '.join(line), font=bf, fill=70)
            y += lh
        if c:
            d.line([(x0 - gap / 2, m), (x0 - gap / 2, h - m)], fill=120, width=1)
    a = np.asarray(im).astype(np.float32) / 255
    alb = (.84 + fiber(h, w, rng, .02)) * (0.08 + 0.92 * a)
    alb[:3] *= .85; alb[-3:] *= .85; alb[:, :3] *= .85; alb[:, -3:] *= .85
    return np.clip(alb, 0, 1)


def news_column(w, text, seed, fsize, align='justify'):
    """her words set as a newspaper clipping, w wide and as tall as the words need: newsprint, a heavy rule above and a
    hairline below, the text in Old Standard justified like a news column (the last line flush left), or centred like a
    pull quote (align='center'). Greyscale albedo."""
    rng = np.random.default_rng(seed)
    font = F('OldStandard-Regular.ttf', fsize)
    m = int(w * .07); tw = w - 2 * m
    # pieces: words, and a hyphenated word may break after its hyphen as newspapers do ('human-' / 'curated')
    pieces = []
    for wd in text.split():
        parts = wd.split('-')
        for k, p in enumerate(parts):
            pieces.append((p + '-' if k < len(parts) - 1 else p, k < len(parts) - 1))   # (text, joins the next)
    def width(ln):
        return sum(font.getlength(t) for t, _ in ln) + font.getlength(' ') * sum(not j for t, j in ln[:-1])
    lines, cur = [], []
    for pc in pieces:
        if cur and width(cur + [pc]) > tw:
            lines.append(cur); cur = [pc]
        else:
            cur.append(pc)
    lines.append(cur)
    lh = int(fsize * 1.3)
    h = m + 4 + 16 + lh * len(lines) + 14 + m
    im = Image.new('L', (w, h), 255); d = ImageDraw.Draw(im)
    d.rectangle([m, m, w - m, m + 4], fill=35)
    y = m + 4 + 16
    for i, ln in enumerate(lines):
        gaps = sum(not j for t, j in ln[:-1])
        ink = sum(font.getlength(t) for t, _ in ln)
        sp = font.getlength(' ') if align != 'justify' or i == len(lines) - 1 or gaps == 0 else (tw - ink) / gaps
        x = m if align == 'justify' else m + (tw - ink - sp * gaps) / 2
        for t, j in ln:
            d.text((x, y), t, font=font, fill=20)
            x += font.getlength(t) + (0 if j else sp)
        y += lh
    d.rectangle([m, y + 8, w - m, y + 9], fill=70)
    a = np.asarray(im).astype(np.float32) / 255
    alb = (.85 + fiber(h, w, rng, .02)) * (0.08 + 0.92 * a)
    alb[:3] *= .82; alb[-3:] *= .82; alb[:, :3] *= .82; alb[:, -3:] *= .82
    return np.clip(alb, 0, 1), len(lines)


def justify(d, words, font, x0, y, widths, lh, fill=22, last_flush=True):
    """set words justified, line after line from y; widths(i) gives line i's measure and its left offset as
    (measure, offset). A word that doesn't fit is hyphenated (dictionary breaks, words of 6+ letters) when that keeps
    the line from opening up. Returns the y under the last line and the number of lines."""
    import pyphen
    hy = pyphen.Pyphen(lang='en_US')
    sp = font.getlength(' ')
    words = list(words); i = 0
    while words:
        meas, off = widths(i)
        line = []
        while words:
            wd = words[0]
            need = font.getlength(' '.join(line + [wd]))
            if need <= meas or not line:
                line.append(words.pop(0)); continue
            # try to hyphenate the word that doesn't fit
            room = meas - font.getlength(' '.join(line)) - sp
            core = wd.strip('.,;:!?\'"')
            best = None
            if len(core) >= 6 and room > font.getlength('xxx-'):
                for a, b in hy.iterate(wd):
                    if font.getlength(a + '-') <= room and len(a) >= 3 and len(b) >= 3:
                        best = (a + '-', b); break
            if best:
                line.append(best[0]); words[0] = best[1]
            break
        last = not words
        ink = sum(font.getlength(x) for x in line)
        gap = sp if (last and last_flush) or len(line) == 1 else (meas - ink) / (len(line) - 1)
        x = x0 + off
        for wd in line:
            d.text((x, y), wd, font=font, fill=fill); x += font.getlength(wd) + gap
        y += lh; i += 1
    return y, i


def count_lines(words, font, widths):
    im = Image.new('L', (8, 8)); d = ImageDraw.Draw(im)
    return justify(d, words, font, 0, 0, widths, 1)[1]


def article(w, head, body, seed, size, h=None, deck=None):
    """her words set as a Prohibition-era newspaper article, w wide: a heavy rule, a condensed headline (a phrase from
    her own answer), an optional italic deck, a thin double rule, then the body in Old Standard at the given size,
    justified and hyphenated, opening on a two-line drop cap, and a closing rule. If h is given and there's room left,
    the rest of the cutting is the next story's small type (no bare paper); otherwise the cutting ends under the rule.
    Greyscale albedo."""
    rng = np.random.default_rng(seed)
    m = int(w * .07); tw = w - 2 * m
    H = h or 4000
    im = Image.new('L', (w, H), 255); d = ImageDraw.Draw(im)
    y = m
    d.rectangle([m, y, w - m, y + 5], fill=30); y += 18
    hf = fit_lines(head, 'OldStandard-Bold.ttf', tw, .72, start=int(size * 2.6))
    for t in head:
        ln = condensed_line(t, hf, .72); im.paste(ln, ((w - ln.width) // 2, y)); y += int(ln.height * .93)
    if deck:
        y += 4
        df = fit_lines(deck, 'OldStandard-Italic.ttf', tw, .95, start=int(size * 1.15))
        for t in deck:
            ln = condensed_line(t, df, .95); im.paste(ln, ((w - ln.width) // 2, y)); y += int(ln.height * .95)
    y += 10
    d.rectangle([m, y, w - m, y + 2], fill=40); d.rectangle([m, y + 7, w - m, y + 8], fill=40); y += 24
    words = body.split()
    first, rest = words[0][0], ([words[0][1:]] if len(words[0]) > 1 else []) + words[1:]
    bf = F('OldStandard-Regular.ttf', size); lh = int(size * 1.3)
    cf = F('OldStandard-Bold.ttf', int(lh * 1.95))
    cap_w = cf.getlength(first) + size * .35
    widths = lambda i: (tw - cap_w, cap_w) if i < 2 else (tw, 0)
    l, t, r, b = cf.getbbox(first)
    d.text((m - l, y + int(size * .12) - t), first, font=cf, fill=15)
    y, _ = justify(d, rest, bf, m, y, widths, lh)
    y += 12
    d.rectangle([m, y, w - m, y + 2], fill=60); y += 2
    if h is None:
        h = y + m
        im = im.crop((0, 0, w, h))
    elif h - m - y > size * 2:
        columns(d, rng, m, y + 14, h - m, tw, F('OldStandard-Regular.ttf', max(9, int(size * .42))))
    a = np.asarray(im).astype(np.float32) / 255
    alb = (.85 + fiber(h, w, rng, .02)) * (0.08 + 0.92 * a)
    return np.clip(alb, 0, 1)


def squeeze(alb, frac):
    """set wide, then condensed to frac of its width: a narrow newspaper face"""
    h, w = alb.shape[:2]
    return cv2.resize(alb, (int(round(w * frac)), h), interpolation=cv2.INTER_AREA)


def warp_into(dst, piece, quad, light, shadow=.22):
    """paste a flat cutting (albedo, alpha) onto a wall in perspective: its corners go to quad (TL, TR, BR, BL, full-size
    pixels), it takes the wall's light (H x W, 0..1), with a soft shadow just under it"""
    alb, alpha = piece
    h, w = alb.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad))
    H, W = dst.shape[:2]
    a = cv2.warpPerspective(alpha.astype(np.float32), M, (W, H), flags=cv2.INTER_LINEAR)
    p = cv2.warpPerspective(alb.astype(np.float32), M, (W, H), flags=cv2.INTER_CUBIC)
    if p.ndim == 2:
        p = p[..., None]
    sh = cv2.GaussianBlur(np.roll(np.roll(a, 8, 0), 4, 1), (0, 0), 8) * shadow
    out = dst * (1 - sh)[..., None]
    return out * (1 - a[..., None]) + p * light[..., None] * 255 * a[..., None]


def aged(alb, seed, wear=1.0):
    """a cutting that has been on a speakeasy wall a while: its edges a little ragged (alpha) and browned (darker)
    where the paper has been handled. Returns (albedo, alpha)."""
    rng = np.random.default_rng(seed)
    h, w = alb.shape[:2]
    inside = np.zeros((h, w), np.uint8); inside[1:-1, 1:-1] = 1
    dist = cv2.distanceTransform(inside, cv2.DIST_L2, 3)
    n1 = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 3)
    n2 = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 14)
    n1 /= n1.std() + 1e-6; n2 /= n2.std() + 1e-6
    rag = 3 + 2.2 * n1 + 2.5 * n2
    alpha = np.clip((dist - rag * wear) / 1.5, 0, 1)
    burn = np.exp(-dist / np.clip(12 + 5 * n2, 5, None)) * .2 * wear          # browned at the edges only
    out = alb * (1 - burn if alb.ndim == 2 else (1 - burn)[..., None])
    return np.clip(out, 0, 1), alpha
