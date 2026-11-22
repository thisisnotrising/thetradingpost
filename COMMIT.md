# THE SPEAK: what this commit changes

THE SPEAK: the lace & macrame stage (Nov 22, live 11:11 AM). Commit message: "THE SPEAK: lace & macrame stage: lace drapes, heart panels, two tiers of lace up top"
Upload (Add file -> Upload files, all at once, commit directly to main): the folders assets, speakeasy and tools, and COMMIT.md.
  - assets/img/speak/hall-theater-1600/2400/3200.webp (same names, so the page code is unchanged): in theater mode the
    red velvet drapes either side of the screen are now cream lace, tied back in the same rope, with a soft sheer
    hanging behind them where the dark backstage showed; a macrame panel (two knotted hearts, a diamond lattice of
    square knots, long fringe, hung on cords that run up behind the lace) lines each edge of the screen; across the
    top, under the pine garland, two tiers of scalloped lace festoons (the back tier's low points fill the gaps where
    the front ones meet) and lace tails down both corners of the arch. The garland, the red bow, the red and glass
    baubles, the macrame valance's fringe (now behind the lace), the screen and film card, trees, poinsettias and
    lanterns are exactly as they were. Warmth 8.1 before and after (within 5-10). Inspired by her lace & macrame
    reference; everything drawn from scratch, nothing cut from the photo.
  - tools/speak-faces/lace_stage.py (new; runs after theater_hall.py), with curtains.py (the sides), swags.py (the top)
    and lace.py (the lace pattern and its scalloped edge).
  - speakeasy/index.html: only the hall's description for screen readers (lace instead of red velvet) and the note
    on where the picture comes from.

STOREFRONT: the SPEAKEASY sign (Nov 22). Upload (same commit is fine): assets/img/storefront/winter-desk-stage.webp,
winter-phone-stage.webp, assets/storefront.css, index.html, tools/speakeasy-sign-easy.py, tools/ref/winter-*-stage-easy-dark.webp.
  - EASY and its arrow on the red door's transom are back, faded: the same gold paint as SPEAK, worn, still readable;
    SPEAK stays the clear, bright part (winter pictures, by tools/speakeasy-sign-easy.py; the fall sign's EASY in
    storefront.css, opacity .13 -> .34).

THE POST: the clean Newsstand (Nov 22). Commit message: "THE POST: the Newsstand, clean: even rows, ISSUE tags, clear glass"
Upload (same way, can go in the same commit): assets/img/post/room2/room-2400.webp, room-1600.webp,
room-2400-winter.webp, room-1600-winter.webp, tools/post-newsstand-front.py, tools/ref/newsstand-front.webp.
  - THE POST's room picture had the Newsstand baked in with yellow smears of glare under every row, an uneven cover
    grid and no ISSUE labels. The real Newsstand (the one post/recipe.html builds, straight on, on its white brick) is
    now laid over it on the left wall in the wall's perspective and the room's light, autumn and winter: 20 covers in
    an even 5 x 4 grid, each with its ISSUE tag, clear glass, the 01-20 / 21-40 / MEMOIRS tabs. The room's own glowing
    bulbs frame it on all four sides; the NOW SOARING sign, its awning and the bench are unchanged. The phone pictures
    don't show the stand, so they stay.
  - assets/newsstand.css and newsstand/index.html: the Newsstand popup inside THE POST shows just the tabs and the
    cover grid: no "← 777 Daydream St." / "Nebula Cafe →" signposts (top or bottom), no NOW SOARING sign or awning
    (the room behind already has them; the popup's × is the way back). The Newsstand page on its own is unchanged.
    Upload these two as well.

THE REST, newsprint edition (Nov 21, evening). Commit message: "THE REST: newsprint room, Kevin's napkin framed, her words as articles"
Upload (Add file -> Upload files, all at once, commit directly to main): the folders speakeasy, assets and tools, and README.md.
  - assets/img/speak/rest-1200/1800/2400.webp (new, lighter set; on GitHub, delete the old rest-1600.webp and
    rest-3200.webp afterwards: nothing uses them): the set designer's newsprint render (Prohibition front pages, her 3x5
    answers, black doors, barrel sink), sharpened 4x. Kevin's napkin, exactly his drawing, sits over the arch in place
    of the render's redrawn portrait, framed by four Prohibition clippings (VOLSTEAD ACT IN FORCE, DRY AGENTS RAID
    CLUB; SECRET ROOMS FILL NIGHTLY, RUM RUNNERS SLIP PAST), with no bare wall left anywhere. Her 3x5 answers are set
    as Prohibition newspaper articles, word for word, each headlined with a phrase from her own answer: THE ONE THING
    WE CAN'T ERASE (left wall), HUMANS THINK DIFFERENTLY and WE MAKE OUR OWN MEANING (right wall), A THOUSAND
    HUMAN-CURATED WORKS and HEARD OVER THE ALGORITHM (under the napkin). All the wallpaper is one aged cream, like the
    passage's pages (warmth 7.6, within 5-10). Left wall headline mended: 'Amendmeat' -> 'Amendment'. WebP quality
    75: a phone downloads ~665 KB for the room (was ~1.3 MB), a retina desktop ~950 KB (was ~2 MB).
  - speakeasy/index.html: THE SPEAK's marquees now match the Newsstand's marquee popup (square black case ringed with
    warm bulbs, white backlit letter board with grey rails, the oOo ornament, black letters): the popup cards (NOW
    SOARING, OPENING SOON) and, laid over the painted ones, the marquee over the balcony bar in the hall and the one
    over the bar up close; every marquee also shows the show's name (Wilbur C. Fibbermust), a touch larger. THE REST keeps the same candle glow and dust as every
    room in THE SPEAK; the glows sit on the new bulbs, lanterns and candles; the walls button reaches
    down to the white brick (doors included); phones show as much of the room as fills the screen (both papered
    walls in view); the room's screen-reader description rewritten for the new room, with her words as on the walls.
  - tools/speak-faces/rest_newsprint.py (the recipe), rest_paper.py (the clippings and the cards),
    originals/rest-newsprint-render.png, and fonts/ (Old Standard, plus Courier Prime for the card version kept in
    rest_paper.py, with their open licences).
  - README.md: the file map points THE REST at the new recipe.
  napkin-kevin.webp (the popup) and data.js are unchanged.

Upload these into the thetradingpost repo (branch main), keeping the folders as they are here. Files with the same name
are replaced; everything else on the site stays as it is. (This COMMIT.md is just these notes: no need to upload it.)
Checked against GitHub on Nov 5 (after today's Newsstand commits): data.js and README.md differ only by THE SPEAK's parts,
so nothing anyone else changed is overwritten.

| File | What it is |
|---|---|
| speakeasy/index.html | THE SPEAK itself (replaces "Opening soon"): the passage, the hall, the stage and the bar |
| assets/img/speak/ (14 pictures) | the four rooms, each in several widths, plus the RESTROOM sign with REST dark (restroom-dark.webp, the blink); the browser downloads only the one the screen needs. (door-1200/1800/2200.webp from an earlier bundle are no longer used: if they're on GitHub, they can be deleted.) |
| assets/data.js | adds PART 4 at the end: window.NRSPEAK (what's on the stage and what Dan says; at the bar, the Old Fashioned link and what Kathi says) |
| README.md | the file map now describes speakeasy/, assets/img/speak/ and tools/speak-faces/ |
| tools/speak-faces/ (14 scripts + fonts/ + originals/, 4 pictures) | the recipe, so the pictures can be made again: hall_bar.py makes the passage, the hall, the stage and the bar, using the pieces beside it (faces.py the faces; hall7.py and hall8.py the hall, its crimson ivy, BANNED door and RESTROOM neon; lounge.py the stage close-up; kathi_hand.py and hands.py Kathi's hands and jewelry; bar_grade.py the bar brought into the hall's world and Kathi's beanie; obsidian.py and irondoor.py the passage). fonts/ is Oswald (the site's typeface, open licence) for the lettering. originals/ holds the set designer's Nov 7 hall render and stage close-up, Kathi's bar render, and the passage as first published. The reference photos are NOT in the repo: keep them on your computer, in tools/speak-faces/ref/, if you ever run it again |

Nothing else changes. Door 9¾ on the storefront already opens speakeasy/.

How to upload (GitHub in the browser):
  1. Unzip the-speak-github.zip.
  2. On github.com/thisisnotrising/thetradingpost: Add file → Upload files.
  3. Drag in the folders speakeasy, assets and tools, and the file README.md (all at once).
  4. Commit message: "THE SPEAK opens: passage, hall, stage and bar". Commit directly to main.
  5. Pages redeploys in about 1–2 minutes: open https://nebularising.media/thetradingpost/speakeasy/
     (if the old "Opening soon" still shows, it's the browser's cache: Ctrl/Cmd+Shift+R).

THE CELLAR (Nov 8, 10 AM, added on opening day). This zip holds EVERYTHING from round 3 plus the cellar, so it is
safe to upload whether or not round 3 is already on GitHub (identical files are simply replaced).
  Commit message: "THE SPEAK: THE CELLAR opens, with the TV"
  - The red SHADOW BANNED door (and the hall's CELLAR button) now open THE CELLAR, a room of its own (#cellar): Kathi's
    stone wine cellar render with the wooden TV on an oak barrel, sharpened 4x like every room. It's a level deeper, so
    it stays warmer than the rooms upstairs: warmth 20 (the render's own was 46; upstairs is 8-9). On phones it shows
    the right of the room, so the TV is always in view. Its panel: BACK TO HALL | THE TV.
  - The TV's screen (it showed a film still) now glows with the message, white on dark glass with scanlines:
    "BILLION-DOLLAR CORPORATIONS WANT THIS SUPPRESSED. / THE ALGORITHM WILL BURY THIS." (cellar_screen.py). A soft
    light breathes over it.
  - Clicking the TV (or THE TV) opens a TV-screen popup with the same words. Its button, WATCH BEFORE IT'S BURIED,
    opens https://superhumanpodcast.substack.com/p/perla-mendoza?r=69dykm in a new tab (in speakeasy/index.html, #tv-go).
  - New: assets/img/speak/cellar-1600/2400/3200.webp, tools/speak-faces/cellar_screen.py, originals/cellar-render.png.

What's new in THIS bundle (Nov 8, opening day, round 3, the final one):
  Upload: the folders speakeasy, assets and tools, and README.md (all at once). Inside: speakeasy/index.html, all 14
  pictures in assets/img/speak/, the 3 Nebula Cafe pictures in assets/img/post/room2/, and tools/speak-faces/ (6 new
  scripts and hall_bar.py's notes).
  Commit message: "THE SPEAK opening day: faces, bar beanie, SHADOW BANNED plaque, warmth 5-10"
  - Faces: Dan and Kathi in the hall and on the stage are redone from one podcast frame (the side-by-side call). Dan's
    eyes are even and his smile is his own now; Kathi smiles as in the frame, her hand still in front. Likeness to the
    frame: hall Dan 0.74 -> 0.89, Kathi 0.75 -> 0.89; stage Dan 0.76 -> 0.88, Kathi 0.74 -> 0.89 (faces_nov8.py).
  - Dan's hair has texture: short strands pushed up and back, lighter tips (hair_texture.py). Then Dan's face again
    from his portrait (dan_nov8.py): likeness 0.59 -> 0.91.
  - THE BAR: Kathi's face from her beanie selfie (likeness 0.63 -> 0.91) and her beanie made forest green and ribbed
    like the selfie's, the red patch kept (bar_nov8.py).
  - The red door: the original black plaque with its gold rim, made taller, reads SHADOW over BANNED in white
    (shadow_banned.py). The hall's screen-reader description says so.
  - Warmth held to 5-10 in every room (the warmth of each picture's brightest tenth, Lab b*): passage 45 -> 9,
    hall 24 -> 9, stage 30 -> 9, bar 20 -> 8, Nebula Cafe 20 -> 8; the street (1) and THE POST (0) unchanged.
    Brick, paper and lamplight move toward white; the crimson ivy, the amethyst and the neon mostly keep their colour.
    restroom-dark.webp (the flicker) is graded with the hall's exact shift, so it still matches (speak_grade.py).
  - data.js and the rest of the site are unchanged.

Round 2 (Nov 8, opening day):
  - THE PASSAGE: one picture, one smooth walk. The door close-up that faded in at the end is gone (it made wide screens
    jump and took two clicks). Scroll to walk up to the door; one click on the door, or on OPEN THE DOOR, opens it. On
    wide screens the corridor keeps its proportions (the sides fade into the dark), so there's a real walk there too.
  - Navigation: the lounge is THE STAGE everywhere. The hall's panel: BAR ↑ | STAGE ↑ / CELLAR ↖ | RESTROOM ↗. From
    the bar, the way out is BACK TO HALL.
  - Faces: Kathi and Dan are made with one recipe in both the hall and on the stage, from their podcast frames, so they
    look the same in both rooms.
  - THE BAR, brought into the same world as the hall, the storefront and THE POST: whitewashed brick walls, the vault's
    banknotes aged, a near-black bar front, a midnight obsidian floor, the orange glow pulled back, the marquee board the
    hall's white. Kathi's beanie has a turned-up cuff with its patch on it, as on her Nebula Cafe beanie.

Earlier on Nov 8:
  - The ivy turns autumn crimson: under the hall's vault and over its balcony, hanging in over the stage's arch, and
    either side of the bar: THE POST's own red. The potted plants, the fig trees and the stage arch's vines stay green.
  - The red door at the front left is that same crimson, and its plaque reads BANNED.
  - The neon over the restroom door reads RESTROOM, only REST lit, and REST flickers like a failing sign (it holds
    still for visitors who ask for less motion).
  - The hall's CELLAR button arrow points up and to the left.
  - Kathi's hands: her thumb under her chin is solid now (the render drew it hollow), and she wears her own jewelry from
    the podcast: a boho wrap stack of navy seed beads, brown leather, a silver button and silver beads at the wrist,
    and thin gold stacking rings on the hand on her knee, one with an evil eye.
  - Faces: Dan's and Kathi's likeness is now learned from several photos (their portraits plus frames from the podcast
    video), which makes them look more like themselves from any angle.

Before that (Nov 7):
  - THE PASSAGE: the floor is midnight obsidian, a scrying mirror under the red runner (the tile is gone): the render's own
    floor, deepened to black glass that keeps the candles' reflections. The ancient iron door and the fixed walk stay.
  - THE HALL is the set designer's Nov 7 render: the CELLAR and REST doors are now rendered into the set itself, either
    side of the pit under brass wall lamps (the painted-on door is gone, so nothing floats), the marquee is bigger, and
    the SHADOW BANNED poster and the NOT RISING cover wall are out (they didn't fit the set). Faces: Dan 0.89, Kathi 0.91.
  - THE LOUNGE is the set designer's close-up of the same stage (3:2 now, from the arch's apex to the stage lip): four
    times the detail in the faces (Dan 0.89, Kathi 0.90, the best this size of render gives). On phones it keeps Dan and
    Kathi with their chairs; on wide screens the sides fade into the dark.
  - The bar is unchanged (Kathi 0.92).

To change what's on the stage later, edit only assets/data.js, PART 4:
  title:   "KESTRYL EDGE PODCAST"                     (under NOW PLAYING on every marquee and the card)
  episode: "E13 · The Negative Space Is The Work"     (small letters on the card)
  link:    the episode's address                      (the card's button, and Dan's bubble; dimmed if empty)
  button:  "Watch"                                    (the card's button words)
  says:    Dan's bubble, one line per change of words

At the bar, also in PART 4 (BAR):
  says:          Kathi's bubble, one line per change of words
  follow:        the address of the button under her bubble (Instagram)
  followButton:  "Follow on Instagram"                (its words)
  oldFashioned:  the Buy Me a Coffee address           (the glass on the bar, and OLD FASHIONED)

Room addresses (for sharing a room directly):
  .../speakeasy/          the passage
  .../speakeasy/#hall     the hall
  .../speakeasy/#stage    the stage
  .../speakeasy/#bar      the bar

Navigation:
  Hall panel:    BAR ↑ | STAGE ↑ / CELLAR ↖ (soon) | RESTROOM ↗ (soon)    top left: THE PASSAGE
  Stage panel:   BACK TO HALL | NOW PLAYING                          top: BACK TO HALL (left), THE BAR (right)
  Bar panel:     BACK TO HALL | OLD FASHIONED                        top: BACK TO HALL (left)
