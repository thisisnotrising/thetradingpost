"""THE SPEAK, opening day (Nov 8): the rooms' warmth held to 5-10.
-------------------------------------------------------------------------------------------
WHY: measured side by side, the warmth of each picture's brightest tenth (Lab b*: 0 is neutral white, higher is
more amber) ran 20-45 in THE SPEAK and Nebula Cafe, against about 0 on the street and in THE POST. Kathi set the
ceiling at 5-10 for every room.

HOW: a white balance that works on the light parts. Each pixel's colour (a* red-green, b* blue-yellow) is pulled
toward neutral by an amount that grows with its lightness (shadows barely move, highlights move the most), and
strongly coloured things (the crimson ivy, the amethyst, the neon) move much less than near-whites (brick, paper,
lamplight), so they keep their own colour. The amount is found by trial (halving the gap each time) until the
brightest tenth measures TARGET. Lightness is never touched.
Run:  python3 tools/speak-faces/speak_grade.py <in> <out> [target, default 8] [shift]   (prints the shift it used;
      pass that shift to grade a matching piece, such as restroom-dark.webp, exactly the same way)
"""
import sys, cv2, numpy as np

TARGET = 8.0


def apply(lab, k):
    L = lab[..., 0] * 100 / 255
    a = lab[..., 1] - 128; b = lab[..., 2] - 128
    w = np.clip((L - 12) / 60, 0, 1) ** 1.2                    # 0 in the shadows, 1 in the light
    chroma = np.hypot(a, b)
    protect = np.clip(1 - (chroma - 35) / 45, 0.25, 1)          # strongly coloured things move less
    f = np.minimum(k * w * protect, 1.0)
    out = lab.copy()
    out[..., 2] = b * (1 - f) + 128
    out[..., 1] = a * (1 - 0.6 * f) + 128
    return out


def warmth(lab):
    L = lab[..., 0]
    hi = L > np.percentile(L, 90)
    return float((lab[..., 2][hi] - 128).mean())


def solve(lab, target):
    small = cv2.resize(lab, (lab.shape[1] // 4, lab.shape[0] // 4), interpolation=cv2.INTER_AREA)
    lo, hi = 0.0, 3.0
    if warmth(small) <= target:
        return 0.0
    for _ in range(18):
        mid = (lo + hi) / 2
        if warmth(apply(small, mid)) > target: lo = mid
        else: hi = mid
    return hi


def grade_file(src, dst, target=TARGET, k=None):
    im = cv2.imread(src, cv2.IMREAD_UNCHANGED)
    alpha = im[..., 3:] if im.shape[2] == 4 else None
    lab = cv2.cvtColor(im[..., :3], cv2.COLOR_BGR2LAB).astype(np.float32)
    if k is None:
        k = solve(lab, target)
    out = cv2.cvtColor(np.clip(apply(lab, k), 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
    if alpha is not None:
        out = np.dstack([out, alpha])
    cv2.imwrite(dst, out)
    return k, warmth(cv2.cvtColor(out[..., :3], cv2.COLOR_BGR2LAB).astype(np.float32))


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    target = float(sys.argv[3]) if len(sys.argv) > 3 else TARGET
    k = float(sys.argv[4]) if len(sys.argv) > 4 else None
    k, w = grade_file(src, dst, target, k)
    print(f'shift {k:.4f}  warmth now {w:.1f}')
