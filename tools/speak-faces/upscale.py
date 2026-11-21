"""Run: python3 upscale.py <in> <out> [path/to/EDSR_x4.pb]  (the model: github.com/Saafke/EDSR_Tensorflow, models folder)
Enlarge a picture 4x with the EDSR model, in overlapping tiles (so memory stays small), then blend the seams."""
import sys, cv2, numpy as np
src, dst = sys.argv[1], sys.argv[2]
T, O, S = 160, 16, 4
sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(sys.argv[3] if len(sys.argv) > 3 else 'models/EDSR_x4.pb'); sr.setModel('edsr', S)
im = cv2.imread(src); H, W = im.shape[:2]
acc = np.zeros((H*S, W*S, 3), np.float32); wsum = np.zeros((H*S, W*S, 1), np.float32)
ys = list(range(0, max(H-T, 0)+1, T-2*O)); xs = list(range(0, max(W-T, 0)+1, T-2*O))
if ys[-1] + T < H: ys.append(H-T)
if xs[-1] + T < W: xs.append(W-T)
n = 0
for y in ys:
    for x in xs:
        tile = im[y:y+T, x:x+T]; up = sr.upsample(tile).astype(np.float32)
        h, w = up.shape[:2]
        wy = np.minimum(np.arange(h)+1, h-np.arange(h)).astype(np.float32); wx = np.minimum(np.arange(w)+1, w-np.arange(w)).astype(np.float32)
        wgt = np.minimum(np.minimum(wy, O*S)[:, None], np.minimum(wx, O*S)[None, :])[..., None]
        acc[y*S:y*S+h, x*S:x*S+w] += up*wgt; wsum[y*S:y*S+h, x*S:x*S+w] += wgt
        n += 1; print(n, len(ys)*len(xs), flush=True)
cv2.imwrite(dst, np.clip(acc/np.maximum(wsum, 1e-6), 0, 255).astype(np.uint8))
print('done', dst)
