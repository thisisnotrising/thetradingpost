"""Pine boughs, for the holidays: the garland along the balcony rail and the little clusters in the vault's corners
become pine (they were ivy). Drawn here, needle by needle, at full size:
  - a bough is a thin brown twig with pairs of needles along it, angled forward, longest in its middle
  - hundreds of boughs, three layers deep: the back ones darker (in each other's shade), the front ones catching
    the light from above, so the garland has depth
  - deep shade where boughs overlap (the more pine in front, the darker), so it has depth like a real garland
  - tiny warm lights tucked in, like the strings across the vault
  - the roses and the macrame stay IN FRONT, exactly as rendered; the old leaves behind the pine go into shadow,
    so any gap between boughs reads as depth, not as old leaves
Coordinates are on the 1024 x 1536 render; s scales them to the picture being worked on."""
import cv2, numpy as np

GARLAND = (112, 912)            # the rail's garland, x from..to
TOP, MID, LOW = 500, 548, 600   # its top edge, middle line and lower edge (the roses hang just below the middle)
CORNERS = [((40, 10), 1, 60), ((150, 0), 1, 40), ((95, 35), 1, 45), ((15, 70), 1, 35), ((960, 70), -1, 55), ((925, 120), -1, 30)]  # vault: (x, y), side, size

def needle_colour(rng, shade):
    # deep pine greens, lighter where the light reaches (shade 0 = deep inside, 1 = in the light)
    dark = np.array([16, 28, 14], np.float32); light = np.array([52, 86, 58], np.float32)
    c = dark + (light - dark) * np.clip(shade + rng.normal(0, 0.14), 0, 1.1)
    c = c * np.array([1 + rng.normal(0, 0.06), 1, 1 + rng.normal(0, 0.05)])  # some boughs bluer, some yellower
    return tuple(float(v) for v in c)

def bough(rgb, alpha, x, y, ang, length, shade, s, rng, acc=None):
    """One bough: a twig from (x, y) at angle ang (radians, 0 = pointing right, +y = down) drooping a little."""
    step = 1.15 * s
    n = max(4, int(length / step))
    droop = rng.uniform(0.002, 0.006) / s * np.sign(np.cos(ang) + 1e-6)
    px, py, a = x, y, ang
    nl = rng.uniform(6.5, 9.5) * s
    twig = (34, 52, 74)
    for i in range(n):
        t = i / n
        nx, ny = px + np.cos(a) * step, py + np.sin(a) * step
        cv2.line(rgb, (int(px * 4), int(py * 4)), (int(nx * 4), int(ny * 4)), twig, max(1, int(0.5 * s)), cv2.LINE_AA, 2)
        L = nl * (0.45 + 0.55 * np.sin(np.pi * min(1, t * 1.25 + 0.08)))
        for side in (-1, 1):
            da = side * np.radians(rng.uniform(38, 62))
            fa = a + da
            ex, ey = px + np.cos(fa) * L, py + np.sin(fa) * L
            up = -np.sin(fa) > 0                                             # needles pointing up catch more light
            c = needle_colour(rng, shade + (0.12 if up else -0.08))
            w = 1 if rng.random() < 0.6 else 2
            if up and rng.random() < 0.5:                                    # a lit tip
                c = tuple(min(255, v * 1.35 + 10) for v in c)
            cv2.line(rgb, (int(px * 4), int(py * 4)), (int(ex * 4), int(ey * 4)), c, w, cv2.LINE_AA, 2)
            cv2.line(alpha, (int(px * 4), int(py * 4)), (int(ex * 4), int(ey * 4)), 255, w, cv2.LINE_AA, 2)
            if acc is not None: cv2.line(acc, (int(px * 4), int(py * 4)), (int(ex * 4), int(ey * 4)), 1.0, w + 1, cv2.LINE_8, 2)
        a += droop * step * 8
        px, py = nx, ny
    return px, py

def _unused_cone(rgb, alpha, x, y, s, rng):
    """A small pinecone: overlapping brown scales, lit from above."""
    ang = rng.uniform(-35, 35); rx, ry = 4.2 * s, 6.8 * s
    for j in range(7):
        for k in range(-2, 3):
            cx = x + k * rx * 0.42 * np.cos(np.radians(ang)) - (j - 3) * ry * 0.27 * np.sin(np.radians(ang))
            cy = y + (j - 3) * ry * 0.27 * np.cos(np.radians(ang)) + k * rx * 0.42 * np.sin(np.radians(ang))
            if ((k * 0.42) ** 2 / 1.0 + ((j - 3) * 0.27) ** 2 / 1.0) > 1.05: continue
            lit = 0.55 + 0.45 * (1 - j / 6)
            col = (int(30 * lit), int(52 * lit), int(88 * lit))
            cv2.ellipse(rgb, (int(cx * 4), int(cy * 4)), (int(1.9 * s * 4), int(1.4 * s * 4)), ang, 0, 360, col, -1, cv2.LINE_AA, 2)
            cv2.ellipse(rgb, (int(cx * 4), int(cy * 4 + 0.5 * s * 4)), (int(1.9 * s * 4), int(0.6 * s * 4)), ang, 0, 180, (18, 28, 46), max(1, int(s * 0.4)), cv2.LINE_AA, 2)
            cv2.ellipse(alpha, (int(cx * 4), int(cy * 4)), (int(1.9 * s * 4), int(1.4 * s * 4)), ang, 0, 360, 255, -1, cv2.LINE_AA, 2)

def keep_mask(base, s):
    """The roses and the macrame (in front of the pine): red/pink petals, cream petals and cream threads."""
    lab = cv2.cvtColor(base, cv2.COLOR_BGR2LAB).astype(np.float32)
    L, a, b = lab[..., 0], lab[..., 1] - 128, lab[..., 2] - 128
    chroma = np.hypot(a, b)
    rose = (a > 14) & (L > 35)                                              # red and pink petals
    cream = (L > 140) & (chroma < 30)                                       # cream roses, macrame
    m = (rose | cream).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((int(2 * s) | 1,) * 2, np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((int(3 * s) | 1,) * 2, np.uint8))
    n, lab_, st, _ = cv2.connectedComponentsWithStats(m)
    big = np.zeros_like(m)
    keep = np.where(st[1:, cv2.CC_STAT_AREA] > 60 * s * s)[0] + 1
    big[np.isin(lab_, keep)] = 1
    zone = np.zeros(L.shape, np.float32)
    zone[int(552 * s):int(680 * s), int(GARLAND[0] * s):int(GARLAND[1] * s)] = 1
    zone = cv2.GaussianBlur(zone, (0, 0), 4 * s)
    return cv2.GaussianBlur(big.astype(np.float32), (0, 0), 0.9) * zone

def pine(base, s, seed=11):
    rng = np.random.default_rng(seed)
    H, W = base.shape[:2]
    # drawn on a canvas 4x finer in position (cv2's shift=2), at the picture's own size
    rgb = np.zeros((H, W, 3), np.uint8); alpha = np.zeros((H, W), np.uint8)
    depth = np.zeros((H, W), np.float32)                                     # how much pine lies IN FRONT of each spot
    x0, x1 = GARLAND
    layers = [(0.1, 0.95), (0.4, 0.8), (0.75, 0.55)]                       # (light, how many) back to front
    for li, (shade, dens) in enumerate(layers):
        acc = np.zeros((H, W), np.float32)
        n = int((x1 - x0) / 2.1 * dens)
        for _ in range(n):
            x = rng.uniform(x0 + 6, x1 - 6)
            y = rng.normal(MID - 10, 13) - (6 if shade > 0.6 else 0)
            y = float(np.clip(y, TOP + 8, LOW - 18))
            ang = rng.choice([0, np.pi]) + rng.normal(0, 0.55)
            if rng.random() < 0.25: ang = -np.pi / 2 + rng.normal(0, 0.6)    # some reach up over the rail
            if rng.random() < 0.12: ang = np.pi / 2 + rng.normal(0, 0.5)     # and some hang down
            length = rng.uniform(16, 34) * s
            light = shade + (MID - y) / 140                                  # higher up is nearer the bar's light
            bough(rgb, alpha, x * s, y * s, ang, length, light, s, rng, acc)
        # everything already drawn sits behind this layer: it gets this layer's shade
        if li < len(layers) - 1:
            depth += cv2.GaussianBlur(acc, (0, 0), 3 * s)
    for ex, side in ((x0 + 10, -1), (x1 - 10, 1)):                        # the ends turn down at the balcony's corners
        for _ in range(26):
            bough(rgb, alpha, (ex + rng.normal(0, 8)) * s, rng.uniform(MID - 10, LOW) * s,
                  np.pi / 2 + side * rng.uniform(0.1, 0.8), rng.uniform(16, 30) * s, rng.uniform(0.2, 0.6), s, rng)
    for (cx, cy), side, size in CORNERS:                                    # the vault's corners
        for _ in range(int(size * 0.9)):
            ang = np.pi / 2 + side * rng.uniform(-0.4, 1.1)
            bough(rgb, alpha, (cx + rng.normal(0, size * 0.35)) * s, (cy + rng.uniform(0, size * 0.6)) * s,
                  ang, rng.uniform(14, 28) * s, rng.uniform(0.1, 0.6), s, rng)
    A = alpha.astype(np.float32) / 255
    A = np.maximum(A, cv2.GaussianBlur(A, (0, 0), 0.6) * 0.9)
    # depth: pine drawn early (behind) is darkened by how much pine was laid in front of it
    occl = np.clip(1 - 0.16 * depth, 0.38, 1)[..., None]
    pine_rgb = rgb.astype(np.float32) * occl
    # behind the pine: the old leaves and ivy go into deep shadow (only where the pine is)
    cover = cv2.GaussianBlur(cv2.dilate((A > 0.05).astype(np.uint8), np.ones((int(5 * s) | 1,) * 2, np.uint8)).astype(np.float32), (0, 0), 3 * s)
    shadowed = base.astype(np.float32) * (1 - 0.7 * cover[..., None])
    out = shadowed * (1 - A[..., None]) + pine_rgb * A[..., None]
    # tiny warm lights in the garland, like the strings across the vault
    glow = np.zeros((H, W), np.float32); core = np.zeros((H, W), np.float32)
    for _ in range(int((x1 - x0) / 11)):
        lx, ly = rng.uniform(x0 + 15, x1 - 15) * s, rng.normal(MID - 8, 11) * s
        cv2.circle(core, (int(lx), int(ly)), max(1, int(1.2 * s)), 1, -1, cv2.LINE_AA)
    glow = cv2.GaussianBlur(core, (0, 0), 3 * s) * 12 + cv2.GaussianBlur(core, (0, 0), 0.7 * s) * 2.4
    warm = np.array([150, 205, 255], np.float32)
    out = out + np.clip(glow, 0, 1.4)[..., None] * warm * 0.75
    K = keep_mask(base, s)[..., None]
    out = out * (1 - K) + base.astype(np.float32) * K
    return np.clip(out, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    import sys
    im = cv2.imread(sys.argv[1]); s = im.shape[1] / 1024
    cv2.imwrite(sys.argv[2], pine(im, s))
