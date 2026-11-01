"""NOT RISING · THE POST — THE POSTER, SIZED FOR THE WALL
--------------------------------------------------------------------
The Best Storyteller poster is drawn 3456 x 4408 pixels (tools/render-poster.js)
so it stays sharp up close. On THE POST's black wall it's only ever seen at
about 160 pixels a metre (assets/post-final.js paints it at that size), so the
room doesn't need all of that: downloading and unpacking a 15-megapixel picture
just to show it 700 pixels wide was the slowest thing on the page.

This makes the copy the wall uses: 864 x 1102 (the poster's own shape), about a
quarter of the download. The popup (the poster up close, with BUY IT) still
shows the big phone copy, 1728 x 2204, fetched only when it's opened.

Run:  python3 tools/shrink-poster.py      (needs pillow)
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "assets", "img", "post")
big = Image.open(os.path.join(IMG, "poster-best-storyteller.webp"))
small = big.resize((864, 1102), Image.LANCZOS)
out = os.path.join(IMG, "poster-best-storyteller-wall.webp")
small.save(out, "WEBP", quality=86, method=6)
print("wrote", out, small.size, round(os.path.getsize(out) / 1024), "KB")
