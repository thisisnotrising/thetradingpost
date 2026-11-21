"""RESTROOM: only REST is lit (the standing sign rule); ROOM is dead neon, grey glass tubes on the dark board.
The render lit all eight letters, so on the 3200 x 4800 hall:
  1. ROOM's letters become unlit tubes (grey, a soft highlight down the middle of each stroke)
  2. the orange glow ROOM threw on the board is taken away, fading in near the T so REST's own glow stays
The page lays a small copy of the sign over it with REST dead too (restroom-theater-dark.webp) and flickers it:
that's the failing neon. dark() makes that copy from the finished picture, so it lines up exactly."""
import cv2, numpy as np

SIGN = (2985, 2585, 3185, 2690)     # the overlay's box on the 3200 x 4800 hall (x0, y0, x1, y1)
LET = (2998, 2592, 3180, 2685)      # the letters' box
SPLIT = 3078                        # between REST's T and ROOM's R

def unlit(img, x_from, x_to, fade=0):
    """Puts the neon out between x_from and x_to: the letters become grey glass and their glow leaves the board.
    Nothing is pasted: the board keeps its own grain, it's only darkened where the letters lit it."""
    out = img.astype(np.float32).copy()
    X0, Y0, X1, Y1 = SIGN
    pad = 30
    x0, y0, x1, y1 = max(X0 - pad, 0), Y0 - pad, min(X1 + pad, img.shape[1]), Y1 + pad
    roi = out[y0:y1, x0:x1]
    L = cv2.cvtColor(roi.astype(np.uint8), cv2.COLOR_BGR2LAB)[..., 0].astype(np.float32)
    xs = np.arange(x0, x1, dtype=np.float32)
    lx0, ly0, lx1, ly1 = LET
    inside = np.zeros(L.shape, np.float32)
    inside[ly0 - y0:ly1 - y0, max(lx0, x_from) - x0:min(lx1, x_to) - x0] = 1
    if fade:
        inside *= np.clip((xs - x_from) / fade, 0, 1)[None, :]
    core = np.clip((L - 112) / 80, 0, 1) * inside                            # the lit letters' white cores
    tube = cv2.GaussianBlur(cv2.dilate(core, np.ones((3, 3), np.uint8)), (0, 0), 0.8)
    glow = cv2.GaussianBlur(core, (0, 0), 9)
    glow = np.clip(glow / max(glow.max(), 1e-3) * 1.6, 0, 1)                   # where those letters lit the board
    board = roi * (1 - 0.72 * glow[..., None])                                 # the glow taken off, grain kept
    g = 64 + 44 * cv2.GaussianBlur(core, (0, 0), 1.2)                           # grey glass, a little brighter at the core
    glass = np.stack([g * 0.94, g * 0.96, g], -1)
    out[y0:y1, x0:x1] = board * (1 - tube[..., None]) + glass * tube[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)

def room_off(img):
    return unlit(img, SPLIT, LET[2], fade=10)

def dark(img):
    """The overlay: the finished picture's sign with REST dead too, cropped to SIGN."""
    d = unlit(img, LET[0], LET[2])
    x0, y0, x1, y1 = SIGN
    return d[y0:y1, x0:x1]

if __name__ == '__main__':
    import sys
    im = cv2.imread(sys.argv[1]); a = room_off(im); cv2.imwrite(sys.argv[2], a); cv2.imwrite(sys.argv[3], dark(a))
