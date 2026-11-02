/* ============================================================
   BAKE THE STOREFRONT
   Paints 777 Daydream St. once, here, and saves the paint as pictures, so a visitor's
   phone only has to show pictures instead of painting every brick and leaf itself.

   What it makes, in assets/img/storefront/ (for each season listed in BAKED in data.js):
     <season>-phone-<layer>.webp   the phone plan (screens under 640px wide)
     <season>-desk-<layer>.webp    the bigger-screen plan
       layers: building, ivy, door-l, door-r, window-1, window-2
     <season>-phone-bw.webp / <season>-desk-bw.webp
       the small black-and-white storefront shown behind the "Teleporting . . ." sign

   How: it opens the storefront in a hidden Chrome with ?live (so the engine paints live, the old way),
   waits until the painting is done, then copies each painted canvas out as a picture.
   Run it again whenever the building, the ivy colours or a season changes:
       node tools/bake-storefront.js
   (needs Node and Playwright with its Chromium, and the internet for the Google Fonts.
    Offline? Put the fonts' .woff2 files and a fonts.css that names them in a folder and run
       NRSF_FONTS_DIR=that/folder node tools/bake-storefront.js )
   ============================================================ */
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "assets/img/storefront");
// The width each plan is painted at (in CSS pixels), always at 2x sharpness.
//   phone: 430 = the widest phones, so every phone gets a picture at least as sharp as its screen
//   desk: 1200 = the desktop plan's own width; 2400 pixels wide pictures
const PLANS = { phone: 430, desk: 1200 };
const QUALITY = { building: .9, ivy: .8, "door-l": .88, "door-r": .88, "window-1": .82, "window-2": .82 };   // 0-1: higher = sharper but heavier
const BW = { phone: 430, desk: 900, quality: .5 };          // the black-and-white picture: small and soft on purpose

// a tiny web server for the repo folder, so the page loads exactly as it does online
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}/`;
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const save = (name, dataUrl) => {
    const buf = Buffer.from(dataUrl.split(",")[1], "base64");
    fs.writeFileSync(path.join(OUT, name), buf);
    console.log(`  ${name}  ${(buf.length / 1024).toFixed(0)} KB`);
  };

  // which seasons to bake: the BAKED list in data.js
  const probe = await browser.newPage();
  await probe.goto(base + "index.html?live");
  const seasons = await probe.evaluate(() => window.NRSF.BAKED || []);
  await probe.close();

  for (const season of seasons) {
    for (const [plan, width] of Object.entries(PLANS)) {
      console.log(`${season} · ${plan} (${width}px wide)`);
      // 1. the colour layers, painted live at 2x
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
      const page = await ctx.newPage();
      const FD = process.env.NRSF_FONTS_DIR;                         // offline fonts (see the note at the top)
      if (FD) {
        await page.route(/fonts\.googleapis\.com/, r => r.fulfill({ contentType: "text/css",
          body: fs.readFileSync(path.join(FD, "fonts.css"), "utf8").replace(/url\("([^"]+)"\)/g, 'url("https://fonts.gstatic.com/__local/$1")') }));
        await page.route(/fonts\.gstatic\.com\/__local\//, r => r.fulfill({ contentType: "font/woff2", body: fs.readFileSync(path.join(FD, r.request().url().split("/").pop())) }));
      }
      await page.addInitScript(s => { window.NRSF_PAINT_LIVE = true; window.NRSF_SEASON = s; }, season);
      await page.goto(base + "index.html?live", { waitUntil: "load" });
      await page.waitForFunction(() => !document.getElementById("nrsf-teleport"), null, { timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      const layers = await page.evaluate(Q => {
        const $ = id => document.getElementById(id);
        const L = {
          building: $("nrsf-paint"), ivy: $("nrsf-ivy"),
          "door-l": $("nrsf-door-l").querySelector("canvas"), "door-r": $("nrsf-door-r").querySelector("canvas"),
          "window-1": $("nrsf-win-posters").querySelector(".nrsf-interior"), "window-2": $("nrsf-win-news").querySelector(".nrsf-interior")
        };
        return Object.entries(L).map(([k, c]) => [k, c.toDataURL("image/webp", Q[k])]);
      }, QUALITY);
      layers.forEach(([k, url]) => save(`${season}-${plan}-${k}.webp`, url));

      // 2. the black-and-white picture: the whole street (signs and all, no falling leaves), at 1x, in grey
      await page.setViewportSize({ width: BW[plan], height: 900 });
      await page.waitForTimeout(600);                                   // the engine repaints for the new width
      await page.addStyleTag({ content: "#nrsf-fall{display:none!important} .nrsf-scene{filter:grayscale(1) contrast(1.05)}" });
      const shot = await page.locator("#nrsf-scene").screenshot({ type: "png" });
      const bw = await page.evaluate(async ({ png, q }) => {
        const i = new Image(); i.src = "data:image/png;base64," + png; await i.decode();
        const w = Math.round(i.width / 2), h = Math.round(i.height / 2);   // back down to 1x
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(i, 0, 0, w, h);
        return c.toDataURL("image/webp", q);
      }, { png: shot.toString("base64"), q: BW.quality });
      save(`${season}-${plan}-bw.webp`, bw);
      await ctx.close();
    }
  }
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
