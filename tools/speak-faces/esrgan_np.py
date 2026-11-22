"""Real-ESRGAN realesr-general-x4v3 (SRVGGNetCompact), denoise 0.5, in plain numpy (no PyTorch needed).
The same upscaler as every room in THE SPEAK: the two published models are blended 50/50 (denoise 0.5),
then run tile by tile. Input and output: RGB uint8 arrays. Used for THE REST (rest_napkin.py); about 4 minutes
for a 1024 x 1536 render on a laptop.
Models (not in the repo): models/esrgan/realesr-general-x4v3.pth and realesr-general-wdn-x4v3.pth, from
github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/
"""
import os, pickle, zipfile, numpy as np
from numpy.lib.stride_tricks import sliding_window_view


def load_pth(path):
    """Read a PyTorch .pth (a zip of a pickle plus raw tensor data) into numpy arrays, without torch."""
    z = zipfile.ZipFile(path)
    root = z.namelist()[0].split('/')[0]
    class U(pickle.Unpickler):
        def find_class(self, mod, name):
            if name == '_rebuild_tensor_v2':
                def rebuild(storage, offset, size, stride, *a):
                    return np.lib.stride_tricks.as_strided(storage[offset:], shape=tuple(size), strides=tuple(st * 4 for st in stride)).copy()
                return rebuild
            if name == 'OrderedDict':
                import collections; return collections.OrderedDict
            if name == 'FloatStorage':
                return 'float32'
            return super().find_class(mod, name)
        def persistent_load(self, pid):
            _, dtype, key, loc, numel = pid
            raw = z.read(f'{root}/data/{key}')
            return np.frombuffer(raw, dtype=np.float32)
    d = U(z.open(f'{root}/data.pkl')).load()
    return d.get('params', d)


def make_model(denoise=0.5, here=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'esrgan')):
    a = load_pth(f'{here}/realesr-general-x4v3.pth')
    b = load_pth(f'{here}/realesr-general-wdn-x4v3.pth')
    return {k: (denoise * a[k] + (1 - denoise) * b[k]).astype(np.float32) for k in a}


def conv3(x, w, b):
    """x: (C, H, W) zero-padded conv, 3x3, stride 1, pad 1. w: (O, C, 3, 3)."""
    C, H, W = x.shape
    xp = np.pad(x, ((0, 0), (1, 1), (1, 1)))
    p = sliding_window_view(xp, (3, 3), axis=(1, 2))           # (C, H, W, 3, 3)
    p = p.transpose(1, 2, 0, 3, 4).reshape(H * W, C * 9)
    out = p @ w.reshape(w.shape[0], -1).T + b
    return out.T.reshape(-1, H, W)


def prelu(x, a):
    return np.where(x >= 0, x, x * a[:, None, None])


def run(net, x):
    out = x
    i = 0
    while f'body.{i}.weight' in net:
        w = net[f'body.{i}.weight']
        if w.ndim == 4:
            out = conv3(out, w, net[f'body.{i}.bias'])
        else:
            out = prelu(out, w)
        i += 1
    # pixel shuffle x4: (48, H, W) -> (3, 4H, 4W)
    C, H, W = out.shape
    out = out.reshape(3, 4, 4, H, W).transpose(0, 3, 1, 4, 2).reshape(3, H * 4, W * 4)
    base = np.repeat(np.repeat(x, 4, axis=1), 4, axis=2)
    return out + base


def upscale(rgb, net, tile=256, pad=40):
    img = rgb.astype(np.float32).transpose(2, 0, 1) / 255
    C, H, W = img.shape
    out = np.zeros((3, H * 4, W * 4), np.float32)
    for y0 in range(0, H, tile):
        for x0 in range(0, W, tile):
            y1, x1 = min(y0 + tile, H), min(x0 + tile, W)
            ya, xa = max(0, y0 - pad), max(0, x0 - pad)
            yb, xb = min(H, y1 + pad), min(W, x1 + pad)
            o = run(net, img[:, ya:yb, xa:xb])
            out[:, y0 * 4:y1 * 4, x0 * 4:x1 * 4] = o[:, (y0 - ya) * 4:(y1 - ya) * 4, (x0 - xa) * 4:(x1 - xa) * 4]
            print('.', end='', flush=True)
    print()
    return (np.clip(out, 0, 1).transpose(1, 2, 0) * 255 + .5).astype(np.uint8)
