"""Dictionary pages for THE REST's walls, like Kathi's own dictionary-papered restroom ("The Rest", Jan 18, 2016):
pages of tiny type in two columns, a bold headword starting each entry, guide words across the top.

The words on the pages are Kathi's own: the headwords run in alphabetical order through the words of her answers in
Kevin Kermes's 3x5 Interview and her 2016 poem (her-words.txt), and each definition is a stretch of those same answers.
On the wall the type is a few pixels high, so it reads as the grey of a dictionary page, as it does in her photo.
"""
import os, re, numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
def _font_dir():
    # the type for the pages: Liberation Serif, from fonts/ beside this file if it's there, else the computer's own
    for d in (os.path.join(HERE, 'fonts'), '/usr/share/fonts/truetype/liberation', '/usr/share/fonts/liberation-serif',
              '/Library/Fonts', os.path.expanduser('~/Library/Fonts')):
        if os.path.exists(os.path.join(d, 'LiberationSerif-Regular.ttf')):
            return d + '/'
    raise SystemExit('dictionary.py needs Liberation Serif (free): put LiberationSerif-Regular/Bold/Italic.ttf in fonts/')


FONTS = _font_dir()
TEXT = open(os.path.join(HERE, 'her-words.txt'), encoding='utf-8').read()
WORDS = re.findall(r"[A-Za-z0-9'+.,:;-]+", TEXT)                                  # her words, in order
VOCAB = sorted({w.strip(".,:;'").lower() for w in WORDS if len(w.strip(".,:;'")) > 2 and w.strip(".,:;'").isalpha()})
POS = ['n.', 'v.', 'adj.', 'adv.', 'n.', 'v.']


def page(seed, w, h, ss=2):
    """One page, w x h, as ink (0 paper .. 1 ink)."""
    rng = np.random.default_rng(seed)
    W, H = w * ss, h * ss
    im = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(im)
    size = 10 * ss // 2
    reg = ImageFont.truetype(FONTS + 'LiberationSerif-Regular.ttf', size)
    bold = ImageFont.truetype(FONTS + 'LiberationSerif-Bold.ttf', size)
    ital = ImageFont.truetype(FONTS + 'LiberationSerif-Italic.ttf', size)
    head = ImageFont.truetype(FONTS + 'LiberationSerif-Bold.ttf', int(size * 1.15))
    mx, top, bot = int(W * .075), int(H * .055), int(H * .955)
    gut = int(W * .05)
    colw = (W - 2 * mx - gut) // 2
    lh = int(size * 1.12)
    start = int(rng.integers(len(VOCAB)))
    k = start
    first = last = VOCAB[start]
    y0 = top + int(lh * 1.9)
    for c in range(2):
        x0 = mx + c * (colw + gut)
        y = y0
        while y < bot - lh:
            word = VOCAB[k % len(VOCAB)]; k += 1; last = word
            p = POS[int(rng.integers(len(POS)))]
            i = int(rng.integers(len(WORDS) - 30)); n = int(rng.integers(6, 26))
            meaning = ' '.join(WORDS[i:i + n]).rstrip(',;:') + '.'
            if rng.random() < .25:
                j = int(rng.integers(len(WORDS) - 20))
                meaning = '1. ' + meaning + ' 2. ' + ' '.join(WORDS[j:j + int(rng.integers(4, 14))]).rstrip(',;:') + '.'
            # the entry: headword (bold), part of speech (italic), then the meaning, wrapped with a hanging indent
            x = x0
            for text, font in [(word, bold), (' ' + p + ' ', ital)]:
                d.text((x, y), text, font=font, fill=255); x += d.textlength(text, font=font)
            for token in meaning.split():
                tw = d.textlength(token + ' ', font=reg)
                if x + tw > x0 + colw:
                    y += lh; x = x0 + size
                    if y >= bot - lh:
                        break
                d.text((x, y), token, font=reg, fill=255); x += tw
            y += lh
        if c == 0:
            d.line([(mx + colw + gut // 2, y0), (mx + colw + gut // 2, bot - lh)], fill=120, width=max(1, ss // 2))
    # guide words, page number, and the rule under them
    d.text((mx, top), first, font=head, fill=255)
    tw = d.textlength(last, font=head)
    d.text((W - mx - tw, top), last, font=head, fill=255)
    num = str(int(rng.integers(100, 1600)))
    d.text(((W - d.textlength(num, font=reg)) / 2, top + 1), num, font=reg, fill=255)
    d.line([(mx, top + int(lh * 1.45)), (W - mx, top + int(lh * 1.45))], fill=200, width=max(1, ss // 2))
    return np.asarray(im.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255
