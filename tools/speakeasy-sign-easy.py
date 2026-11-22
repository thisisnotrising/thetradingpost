"""
THE SPEAKEASY SIGN: EASY BACK, FADED                    python3 tools/speakeasy-sign-easy.py
(needs Python 3 with numpy and OpenCV: pip install numpy opencv-python-headless)

On the winter storefront (assets/img/storefront/winter-*-stage.webp) the hand-painted SPEAKEASY sign on the red door's
transom is part of the picture: SPEAK bright gold, EASY and its arrow worn almost black. Kathi (Nov 22, after her own
photo of a hand-painted Speakeasy sign with its arrow): EASY and the arrow stay visible, just faded; SPEAK is the clear
part.

HOW: in the patch of glass behind EASY and the arrow, the old paint is a touch lighter than the glass round it. That
difference (the picture's lightness minus the glass's own, found by a morphological opening) says where the paint is
and how much is left; there the paint is laid back on in the SPEAK paint's gold, at GAIN of full strength, so it reads
as the same paint, worn. Specks smaller than 6 pixels (baked snowflakes) and anything already bright are left alone.

It works from the pictures as they were (tools/ref/winter-*-stage-easy-dark.webp), so running it again gives the
same result. To make EASY brighter or fainter, change GAIN and run it again.
"""
import os, numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "assets", "img", "storefront")
GOLD = np.float32([92, 178, 226])        # the SPEAK paint's gold (BGR)
PICS = {   # picture: (the patch behind EASY and its arrow: x0, y0, x1, y1 in its own pixels), glass size, how strong
    "winter-desk-stage": ((246, 1066, 333, 1124), 15, .28),
    "winter-phone-stage": ((97, 1015, 160, 1063), 11, .32),   # (213 less down since the sky was cropped off, Nov 22)
}


def fade_in(img, box, k_bg, gain):
    x0, y0, x1, y1 = box
    reg = img[y0:y1, x0:x1].astype(np.float32)
    L = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2LAB)[..., 0].astype(np.float32)
    glass = cv2.morphologyEx(L, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k_bg, k_bg)))
    glass = cv2.GaussianBlur(glass, (0, 0), 3)
    paint = np.clip((L - glass - 3) / 14, 0, 1)                # how much paint is left, 0..1
    n, cc, st, _ = cv2.connectedComponentsWithStats((paint > .3).astype(np.uint8))
    keep = np.zeros(L.shape, np.uint8)
    for i in range(1, n):
        if st[i, 4] >= 6:                                      # not the baked snowflakes
            keep[cc == i] = 1
    paint *= cv2.dilate(keep, np.ones((3, 3), np.uint8)) * (L < 120)
    a = cv2.GaussianBlur(paint, (0, 0), .5)[..., None] * gain
    out = img.copy()
    out[y0:y1, x0:x1] = np.clip(reg * (1 - a) + GOLD * a, 0, 255).astype(np.uint8)
    return out


if __name__ == "__main__":
    for name, (box, k_bg, gain) in PICS.items():
        src = cv2.imread(os.path.join(HERE, "ref", f"{name}-easy-dark.webp"))
        out = fade_in(src, box, k_bg, gain)
        cv2.imwrite(os.path.join(IMG, f"{name}.webp"), out, [cv2.IMWRITE_WEBP_QUALITY, 80])
        print(f"EASY faded back in: assets/img/storefront/{name}.webp")
