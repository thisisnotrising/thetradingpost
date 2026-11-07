# Issue 19 (Dan Korus): every picture the flipbook needs, made from the article's photos and the new cover.
# Same recipe as Issue 1: the name page photo stays in colour, every other photo is black and white.
# usage: python3 tools/issue19-images.py PHOTOS_DIR COVER_FILE assets/img
#   PHOTOS_DIR holds the feature's six photos, in article order, saved as
#   p1-sunset.png, p2-camp.png, p3-couple.png, p4-workshop.png, p5-headshot.png, p6-dog.png
#   COVER_FILE is the Canva cover export. The crop boxes below are (left, top, right, bottom) in each photo's pixels.
# (The engine greys every inside photo anyway, with one CSS line; the black and white here adds a little contrast.)
import sys, os
from PIL import Image, ImageOps, ImageEnhance

photos, cover_file, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(os.path.join(out, "thumbs"), exist_ok=True)

def bw(im, contrast=1.12):
    """Black and white with a little extra contrast, like Issue 1's photos."""
    g = ImageOps.grayscale(im)
    g = ImageOps.autocontrast(g, cutoff=0.5)
    return ImageEnhance.Contrast(g).enhance(contrast).convert("RGB")

def save(im, name, q=80, width=None):
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    path = os.path.join(out, name)
    im.save(path, "WEBP", quality=q, method=6)
    print(f"{name:32s} {im.size[0]}x{im.size[1]}  {os.path.getsize(path)//1024} KB")

P = lambda f: Image.open(os.path.join(photos, f)).convert("RGB")
sunset, camp, couple, workshop, headshot, dog = (P(f) for f in
    ["p1-sunset.png", "p2-camp.png", "p3-couple.png", "p4-workshop.png", "p5-headshot.png", "p6-dog.png"])

# COVER: the new cover, same size as every other cover (1000 wide), plus the small copy for the rack
cover = Image.open(cover_file).convert("RGB")
cover = cover.resize((1000, round(cover.height * 1000 / cover.width)), Image.LANCZOS)
save(cover, "issue19-cover.webp", q=82)
save(cover, "thumbs/issue19-cover.webp", q=80, width=360)

# NAME PAGE (345 x 743 slot, tall): the sunset run, in colour, cropped tall around the runner
save(sunset.crop((292, 0, 767, 1023)), "issue19-name.webp", q=80)

# OPENER PORTRAIT (316 x 416 slot): the headshot
save(bw(headshot.crop((52, 0, 769, 944))), "issue19-portrait.webp", q=80)

# CONTENTS PAGE thumbnails, cut to their slots' shapes
save(bw(dog.crop((50, 330, 710, 990))), "issue19-toc-dog.webp", q=78, width=360)           # 173 x 170 slot
save(bw(sunset.crop((300, 220, 900, 720))), "issue19-toc-run.webp", q=78, width=380)       # 187 x 156 slot
save(bw(workshop.crop((600, 180, 1200, 535))), "issue19-toc-laugh.webp", q=78, width=380)  # 188 x 111 slot

# PHOTO PAGES
# Q1, the camp photo: saved under 700 px wide on purpose, so the engine frames it whole on a black page
# (photos 700 px and wider bleed edge to edge and would lose the kids at each end).
save(bw(camp, 1.05), "issue19-camp.webp", q=80, width=699)
# Q2, Dan and his wife: a full-bleed page (816 x 840 slot), cropped to that shape from the top
save(bw(couple.crop((0, 30, 840, 895))), "issue19-couple.webp", q=80)
# Q4, the workshop: the "stack" page (Dan's stacked name + the whole photo, 500 wide)
save(bw(workshop), "issue19-workshop.webp", q=80, width=1000)
# Q6, Dan and the pup: full-bleed page, cropped to the slot's shape around face and dog
save(bw(dog.crop((0, 230, 768, 1021))), "issue19-dog.webp", q=80)
