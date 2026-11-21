"""
FIND AND REMOVE THE FROZEN SNOWFLAKES      python3 tools/clean-stage.py <in.png> <out.png> [mask.png]
The reference picture has falling snow painted into it. Once the live snow falls over it, those painted
flakes would hang frozen in mid-air, so this finds them and paints them out. It only looks where they
show: on the dark doors, the fascia, the lamp post, the marquee frame and the upstairs window. It only
takes small specks that are white or bluish (the orange fairy lights and gold lettering are left alone),
and never touches the lettering listed in KEEP.
"""
import sys, numpy as np, cv2

ZONES = [  # x0, y0, x1, y1 in picture pixels (the 1295 x 1215 reference)
    (60, 545, 1185, 700),     # the black fascia band (THE POST)
    (80, 690, 240, 1118),     # the red door, its frame and the Speakeasy transom
    (1060, 690, 1200, 1125),  # the black door and the 10 transom
    (1125, 180, 1275, 1175),  # the lamp post
    (285, 345, 1015, 525),    # the marquee's dark frame
    (500, 80, 805, 310),      # the upstairs window
    (295, 1000, 1010, 1105),  # the panels under the shop windows
    (225, 690, 320, 1000),    # brick pier, left
    (990, 690, 1070, 1000),   # brick pier, right
]
KEEP = [   # lettering and pictures never touched
    (455, 555, 840, 660),     # THE POST / 777 DAYDREAM ST.
    (330, 388, 972, 480),     # the marquee board (rebuilt separately)
    (215, 985, 312, 1135),    # the A-frame sign
    (90, 700, 228, 805),      # SPEAKEASY sign and 9 3/4
    (1080, 700, 1190, 800),   # 10
    (1100, 840, 1170, 960),   # the OPEN sign
]

def find(im):
    L = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    tophat = L - cv2.morphologyEx(L, cv2.MORPH_OPEN, k)           # bright specks smaller than 9 px across
    bg = cv2.medianBlur(L.astype(np.uint8), 21).astype(np.float32)
    b, g, r = [im[..., i].astype(np.int32) for i in range(3)]
    neutral = (b >= r - 22) & (np.abs(g - b) < 36)                 # white or bluish, not orange or gold
    zone = np.zeros(L.shape, bool)
    for x0, y0, x1, y1 in ZONES: zone[y0:y1, x0:x1] = True
    for x0, y0, x1, y1 in KEEP: zone[y0:y1, x0:x1] = False
    cand = (tophat > 34) & neutral & (L > 110) & (bg < 140) & zone
    n, lab, st, _ = cv2.connectedComponentsWithStats(cand.astype(np.uint8), 8)
    mask = np.zeros(L.shape, np.uint8)
    keep = [i for i in range(1, n) if st[i, 4] <= 40 and st[i, 2] <= 8 and st[i, 3] <= 8]
    mask[np.isin(lab, keep)] = 255
    return cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))), len(keep)

if __name__ == "__main__":
    im = cv2.imread(sys.argv[1])
    mask, n = find(im)
    print("painted flakes removed:", n)
    cv2.imwrite(sys.argv[2], cv2.inpaint(im, mask, 4, cv2.INPAINT_TELEA))
    if len(sys.argv) > 3: cv2.imwrite(sys.argv[3], mask)
