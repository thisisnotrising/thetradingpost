# To Be Human · Season 3 — the magazine build kit

This folder rebuilds the 32-page Season 3 magazine (the PDF and the Newsstand flipbook pages) from
Amanda Jane Lee's manuscript. Run the steps in order from this folder. Each one reads the previous one's file.

| Step | Command | Reads | Writes | What it does |
|---|---|---|---|---|
| 1 | `python3 copyedit.py` | `source/paras.json` | `paras_edited.json`, `copyedits.json` | Light copyedits (the list is at the top of the script) plus curly quotes and italics for titles |
| 2 | `python3 prep.py` | `paras_edited.json` | `build/content.json` | Splits the text into chapters and words, adds soft hyphens, and marks where the section breaks, photos and pull quotes go (chapter settings are in the `CH` list) |
| 3 | `python3 grade.py` | `source/photos/` | `build/img/*.jpg` | Re-tones every photo to the cover photo's black and white: its blacks, its cool midtones and its paper white |
| 4 | `node build/build.js --pdf --png` | `build/build.html` + the files above | `build/out/` | Lays the magazine out page by page, then saves the PDF and one picture per page |

Steps 1 to 3 need `pip install pyphen` and step 4 needs Playwright (`npm install playwright`).

## Making the Newsstand pictures

Each page picture in `build/out/png/` is 1400 px wide. To make the flipbook files:

- **Inside pages:** save printed pages 2–31 as `assets/img/tbh-s3/p01.webp`–`p30.webp`. The file number is the page number minus 1.
- **Back cover:** save page 32 as `assets/img/memoir04-back.webp`, 1000 px wide.
- **Front cover:** stays `memoir04-cover.webp`.

## Where to change things

- **The words** are in `source/paras.json`, one paragraph per entry. `–` is a section break and `{"h": …}` starts a new chapter.
- **Pull quotes, chapter photos and closing quotes** are in the `CH` list in `prep.py`.
- **The look** (colours, fonts, column widths and page templates) is in `build/build.html`.
- **The contents page and the finale page** are also in `build/build.html`, under "CONTENTS" and "BACK OF THE BOOK".

If page positions move, update the clickable areas listed under `"tbh-s3"` → `links` in `assets/data.js`. Their new positions are written to `build/report.json`.
