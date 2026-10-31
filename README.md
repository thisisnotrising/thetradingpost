# 777 Daydream St.

The NOT RISING Trading Post, Newsstand and Speakeasy, built as a small website of its own. WordPress isn't involved.

Live address once it's on GitHub: **https://thisisnotrising.github.io/thetradingpost/**

---

## What's in the folder

```
index.html              the street: the Trading Post storefront (the front door)
newsstand/index.html    the Newsstand (through the magazine window)
speakeasy/index.html    THE SPEAK, opening soon (behind door 9¾)
post/index.html         THE POST, the room inside, as a STAGE SET: the same 3D box and camera as the original
                        room, but every wall, the floor, the roof and everything standing in the room is one
                        finished photo. Four clickable spots on the walls open four popups. (Its look, bones
                        and behaviour are all in this one file.)
post/recipe.html        the live room THE POST is photographed from (post.js, post.css, post-roof.js build it).
                        Visitors never see it. To change the room: change the recipe, then re-photograph:
                          node tools/bake-stage.js   the room, piece by piece -> assets/img/post/stage/ + assets/post-stage.js
                          node tools/bake-post.js    the Nebula Cafe popup picture -> assets/img/post/room/cafe.webp
post/preview.html       points to post/index.html (it was the preview while THE POST was being rebuilt)
assets/post-stage.js    the stage set's list: every photo and where it stands, in metres (written by bake-stage.js)
tools/                  the recipes for the pictures: cut-lounge.py (the lounge, cut from Kathi's photo),
                        render-monstera.py (the pink plant, a 3D render), bake-stage.js, bake-post.js, and others

assets/data.js          ← THE ONE FILE YOU EDIT
assets/storefront.js    the storefront's engine
assets/newsstand.js     the newsstand's engine (pages, flip book, rack)
assets/storefront.css   how the storefront looks
assets/newsstand.css    how the newsstand and the magazines look
assets/vendor/          the page-flip library (hosted here, so no outside service is needed)

assets/img/             every photo, as WebP files
assets/img/thumbs/      small copies of the covers, for the rack and the shop window
assets/img/tbh-s2/      To Be Human Season 2, page by page
assets/img/tbh-holiday/ To Be Human Holiday Special, page by page
```

**How the pieces fit.** Each page is a skeleton (the `.html` file). It loads its look (`.css`), its content (`data.js`), and its engine (`.js`). The engine reads the content and builds what you see. To change *what* is on the site, you only touch `data.js` and add pictures. The engines and stylesheets stay the same.

**Why it loads fast.**
- Photos are separate WebP files. The browser downloads one only when it's needed: the rack loads small cover thumbnails, a magazine's photos load when someone opens it, and a memoir's pages load as they're turned.
- The code is split into files, so the browser keeps them after the first visit. A returning reader downloads almost nothing.
- Measured: the storefront is about 260 KB and the newsstand about 330 KB. The old single-file page was 10.9 MB.

---

## Putting it on GitHub (first time)

GitHub's upload page takes at most 100 files at a time, so the site comes in two zips:

- **Part 1** holds everything except one memoir's pages (93 files).
- **Part 2** holds the `tbh-s2` folder (48 files).

1. **Make the repo.** On github.com, signed in as `thisisnotrising`, click **New repository**. Name it `thetradingpost`, set it to **Public**, and click **Create repository**.
2. **Upload part 1.** On the new repo page, click **uploading an existing file**. Unzip part 1, open the folder, select *everything inside it*, and drag it all onto the upload box. Scroll down and click **Commit changes**.
3. **Upload part 2.** In the repo, click into `assets`, then `img`. Click **Add file → Upload files**. Unzip part 2 and drag the `tbh-s2` folder onto the box. Click **Commit changes**.
4. **Turn the website on.** Go to **Settings → Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, Branch to **main**, folder to **/ (root)**. Click **Save**.
5. **Wait a minute or two**, then open https://thisisnotrising.github.io/thetradingpost/

To link it from thisisnotrising.org, add that address to your WordPress menu as a custom link.

---

## Everyday changes

**To edit anything:** open `assets/data.js` on github.com, click the pencil icon, make the change, and click **Commit changes**. The site updates within a minute or two. (If you don't see it, refresh the page.)

### Add a new issue

1. **Cover.** Save the Canva cover as an image. Upload it to `assets/img/` (for example `issue19-cover.webp`). Upload a small copy, about 360 pixels wide with the *same file name*, to `assets/img/thumbs/`. If you skip the small copy, the full cover loads instead. It still works, just a bit slower.
2. **Name it** in `data.js` under `IMAGES`: `cover19: "issue19-cover.webp",`
3. **Add the feature** at the end of `FEATURES`:
   `{ name: "Writer Name", date: "2026-11-08", url: "https://thisisnotrising.org/...", cover: "cover19" }`

The issue appears on the rack and in the storefront window together, and the "Coming soon" note leaves that slot by itself.

**WebP or JPG?** Either works: just write the real file name in `IMAGES`. WebP files are smaller. https://squoosh.app converts and resizes for free in your browser.

### Other switches in `data.js`

| What | Where | Example |
|---|---|---|
| Issue 01 preview length and end date | `preview:` inside `"jennifer-houle"` | `preview: { pages: 11, until: "2026-12-01" },` (delete the line to show the full issue) |
| Month in the "Coming December 17" popup | `RELEASE_MONTH` | `"December"` |
| Rack tabs | `TABS` | `[[1, 20], [21, 40], [41, 60]]` |
| Where each door goes | `LINKS` (Part 2) | `""` means "opens soon" |
| Words on the building | `SIGNS` (Part 2) | `marquee: "GRAND OPENING"` |
| Posters in the window | `POSTERS` (Part 2) | |

**Check the full Issue 01 before Dec 1:** add `?full` to the newsstand address: `.../thetradingpost/newsstand/?full`

---

## Moving to your own subdomain later

If you later want `post.thisisnotrising.org`, nothing in the site changes. Every link is written relative to the page it's on.

1. In the repo, go to **Settings → Pages → Custom domain**, type the subdomain, and save.
2. Where your domain's DNS is managed, add a **CNAME** record: name `post`, value `thisisnotrising.github.io`.
3. Once GitHub shows a green check, tick **Enforce HTTPS**.

---

The page-flip library is StPageFlip by Nodlik (MIT licence). Its licence is in `assets/vendor/`.
