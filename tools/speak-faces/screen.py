"""A real cinema screen: the folded curtain under the valance becomes a smooth, flat screen in a thin black frame,
showing a clean title card: Wilbur in a soft vignette on a deep, dark ground, and the title (title.py) beside him.
  1. the folds come out: each column's share of light and shade (the fold) is measured down the whole screen and
     divided out, so the picture lies flat; the cloth's fine weave is smoothed away (edges kept)
  2. the picture is made clearer: more contrast (locally, like a projector on a good screen), a little more
     colour, and a gentle sharpening
  3. the title card: the render's beige projector glow becomes a deep warm charcoal, Wilbur fading into it in a soft
     oval (a portrait vignette), so the card reads like a film's opening frame rather than light on cloth
  4. a black masking frame round the screen, as in a cinema; the macrame valance and side panels hang in FRONT of
     the screen, so their threads are kept exactly as they were
Coordinates are on the 1024 x 1536 render; s scales them to the picture being worked on."""
import cv2, numpy as np

RECT = (205, 672, 815, 1022)       # the screen's picture area (x0, y0, x1, y1)
FRAME = 7                          # the black masking frame's width
VALANCE = 790                      # the valance's threads reach no lower than this...
CLEAR = (240, 745, 785)            # ...except in the middle (x from..to), where nothing hangs below this y
SIDES = [[(0, 600), (232, 600), (226, 700), (205, 780), (180, 850), (0, 850)],          # the macrame side panels
         [(790, 600), (1024, 600), (1024, 850), (850, 850), (820, 780), (798, 700)]]
FRONT = []                         # other things hanging or standing in front of the screen, traced as shapes:
                                   # ('poly', [(x, y), ...]) a lantern, ('circle', (x, y, r)) a bauble,
                                   # ('line', (x0, y0, x1, y1, width)) a bauble's string
NOT_FRONT = []                     # boxes where a thin bright line belongs to the old picture, not to the valance
FOLD_ROWS = (800, 1010)            # where the folds are measured (below the valance)
VIG = (392, 860, 240, 205)         # Wilbur's vignette: centre x, y and radii, on the render
OLD_TITLE = []                     # the old title's boxes (title.LINES): inside them, right of TITLE_FROM, the card is
PIC_END = 2000                     # where the projected picture ended on the render (y): Wilbur fades out above it
TITLE_FROM = 500                   # plain ground, so no trace of the old letters shows through Wilbur's soft oval

def threads(img, s):
    """The macrame in front of the screen: bright, colourless threads in the valance and the side panels."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    L, a, b = lab[..., 0], lab[..., 1] - 128, lab[..., 2] - 128
    chroma = np.hypot(a, b)
    base = cv2.GaussianBlur(cv2.erode(L, np.ones((int(9 * s) | 1, int(9 * s) | 1), np.uint8)), (0, 0), 6 * s)
    m = ((L - base) > 22) & (chroma < 24)
    zone = np.zeros(L.shape, np.float32)
    H, W = L.shape
    cv2.rectangle(zone, (0, int(600 * s)), (W, int(VALANCE * s)), 1, -1)
    # below the valance's scallops there are no threads in the middle: only the picture
    zone[int(CLEAR[1] * s):, int(CLEAR[0] * s):int(CLEAR[2] * s)] = 0
    cv2.fillPoly(zone, [(np.array(p, np.float32) * s).astype(np.int32) for p in SIDES], 1)
    t = (m & (zone > 0)).astype(np.uint8)
    t = cv2.morphologyEx(t, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    for x0, y0, x1, y1 in NOT_FRONT: t[int(y0 * s):int(y1 * s), int(x0 * s):int(x1 * s)] = 0
    # lanterns, baubles and their strings: traced by hand on the render, kept exactly as rendered
    for kind, v in FRONT:
        if kind == 'poly': cv2.fillPoly(t, [(np.array(v, np.float32) * s).astype(np.int32)], 1, cv2.LINE_AA)
        elif kind == 'line': cv2.line(t, (int(v[0] * s), int(v[1] * s)), (int(v[2] * s), int(v[3] * s)), 1, max(1, int(v[4] * s)), cv2.LINE_AA)
    t = cv2.GaussianBlur(t.astype(np.float32), (0, 0), 0.8)
    # a bauble is glass: only its lit glass and metal stay in front; the dim cloth seen through its edges and
    # round it goes, so no brown halo is left on the dark title card
    for kind, v in FRONT:
        if kind == 'circle':
            c = np.zeros(L.shape, np.float32)
            cv2.circle(c, (int(v[0] * s), int(v[1] * s)), int(v[2] * s), 1, -1, cv2.LINE_AA)
            t = np.maximum(t, c * np.clip((L - 78) / 50, 0, 1))
    return t

def fold_map(L, s, text=None):
    """How much each spot is brightened or darkened by the cloth's folds: its light against the light just beside it,
    taken as the middle value down a tall window of the same column (the folds run straight down; the picture
    doesn't), so the picture itself hardly counts. Bright title letters are left out of the count."""
    sm = cv2.GaussianBlur(L, (0, 0), sigmaX=5 * s, sigmaY=0.1)
    R = L / np.maximum(sm, 1)
    if text is not None: R = np.where(text, np.nan, R)
    H = L.shape[0]
    win, step = int(110 * s), int(18 * s)
    centres, profs = [], []
    for c in range(0, H, step):
        a0, a1 = max(0, c - win // 2), min(H, c + win // 2)
        with np.errstate(all='ignore'):
            import warnings; warnings.simplefilter('ignore')
            profs.append(np.nanmedian(R[a0:a1], axis=0)); centres.append(c)
    profs = np.array(profs); centres = np.array(centres, np.float32)
    ys = np.arange(H, dtype=np.float32)
    F = np.empty_like(L)
    for x in range(L.shape[1]):
        col = profs[:, x]; ok = ~np.isnan(col)
        F[:, x] = np.interp(ys, centres[ok], col[ok]) if ok.any() else 1
    # under the valance the threads spoil the count; the folds run straight down, so up there use the folds
    # as measured just below the valance
    top = int((FOLD_ROWS[0] - RECT[1]) * s)
    if top < H: F[:top] = F[top]
    F = cv2.GaussianBlur(F, (0, 0), sigmaX=0.5, sigmaY=6 * s)
    return F

def flatten(img, s):
    x0, y0, x1, y1 = [int(v * s) for v in RECT]
    roi = img[y0:y1, x0:x1]
    lab = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0].copy()
    bg = cv2.GaussianBlur(L, (0, 0), 12 * s)
    text = (L - bg) > 26
    text[:, :int((520 - RECT[0]) * s)] = False                                  # (only the title is left out, not the beard)
    for _ in range(2):                                                          # twice: the second pass takes what the first left
        L = L / np.clip(fold_map(L, s, text), 0.6, 1.6)
    lab[..., 0] = np.clip(L, 0, 255)
    flat = cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR)
    # the weave: an edge-keeping smoothing takes out the cloth's fine lines, not the picture's edges
    return cv2.bilateralFilter(flat, d=int(5 * s) | 1, sigmaColor=12, sigmaSpace=2.2 * s)

def clearer(roi, s):
    """Clearer, the way a good projector on a good screen looks: deeper darks and brighter lights (a gentle S-curve),
    a little more colour, and a gentle sharpening. No local contrast tricks: they'd bring the folds back."""
    lab = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0] / 255
    lo, hi = np.percentile(L, 1.5), np.percentile(L, 99.5)
    L = np.clip((L - lo) / max(hi - lo, 1e-3), 0, 1)
    L = L * L * (3 - 2 * L) * 0.55 + L * 0.45                                  # S-curve, half strength
    lab[..., 0] = L * 255
    lab[..., 1] = 128 + (lab[..., 1] - 128) * 1.2
    lab[..., 2] = 128 + (lab[..., 2] - 128) * 1.2
    out = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float32)
    blur = cv2.GaussianBlur(out, (0, 0), 1.8)
    return np.clip(out * 1.6 - blur * 0.6, 0, 255)

def card(content, s):
    """Wilbur (the flattened, clearer picture) in a soft oval on a deep, warm charcoal ground."""
    h, w = content.shape[:2]
    x0, y0 = RECT[0] * s, RECT[1] * s
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx, cy, rx, ry = VIG[0] * s - x0, VIG[1] * s - y0, VIG[2] * s, VIG[3] * s
    d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
    m = np.clip((1.12 - d) / 0.42, 0, 1); m = m * m * (3 - 2 * m)
    clear = np.zeros((h, w), np.float32)
    for a0, b0, a1, b1 in OLD_TITLE:
        a0 = max(a0 - 8, TITLE_FROM)
        cv2.rectangle(clear, (int(a0 * s - x0), int(b0 * s - y0)), (int(a1 * s - x0), int(b1 * s - y0)), 1, -1)
    m = m * (1 - cv2.GaussianBlur(clear, (0, 0), 4 * s))
    # and the picture ends a little above the screen's foot (below it the render had bare cloth): fade it out there
    m = m * np.clip(((PIC_END * s - y0) - yy) / (22 * s), 0, 1)
    # the ground: a little lighter behind Wilbur, deepest at the far right; a fine grain so it isn't flat
    g = 30 + 16 * np.exp(-(((xx - cx) / (rx * 1.6)) ** 2 + ((yy - cy) / (ry * 1.5)) ** 2))
    ground = np.stack([g * 0.86, g * 0.93, g * 1.0], -1)                      # BGR: warm charcoal
    ground += np.random.default_rng(3).normal(0, 1.3, ground.shape)
    return np.clip(ground * (1 - m[..., None]) + content * m[..., None], 0, 255)

def screen(img, s):
    th = threads(img, s)
    x0, y0, x1, y1 = [int(v * s) for v in RECT]
    new = img.astype(np.float32).copy()
    new[y0:y1, x0:x1] = card(clearer(flatten(img, s), s), s)
    # the frame
    f = int(FRAME * s)
    frame = np.zeros(img.shape[:2], np.float32)
    cv2.rectangle(frame, (x0 - f, y0 - f), (x1 + f, y1 + f), 1, -1)
    cv2.rectangle(frame, (x0, y0), (x1, y1), 0, -1)
    frame = cv2.GaussianBlur(frame, (0, 0), 0.7)
    black = np.empty_like(new); black[...] = (9, 8, 8)
    new = new * (1 - frame[..., None]) + black * frame[..., None]
    inside = np.zeros(img.shape[:2], np.float32); cv2.rectangle(inside, (x0 - f, y0 - f), (x1 + f, y1 + f), 1, -1)
    w = (inside * (1 - th))[..., None]
    out = img.astype(np.float32) * (1 - w) + new * w
    return np.clip(out, 0, 255).astype(np.uint8), th * inside

if __name__ == '__main__':
    import sys, title
    im = cv2.imread(sys.argv[1]); s = im.shape[1] / 1024
    im = title.erase(im, s)
    out, front = screen(im, s)
    out = title.project(out, s)
    f = front[..., None]
    cv2.imwrite(sys.argv[2], np.clip(out * (1 - f) + im * f, 0, 255).astype(np.uint8))
