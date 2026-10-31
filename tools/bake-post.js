/* NOT RISING · THE POST — THE POPUP BAKER
   ------------------------------------------------------------------
   Takes the two pictures THE POST's popups show, from post/recipe.html
   (the live room that the stage set is photographed from):

     assets/img/post/room/wall.webp   the Wishing Wall, flat and straight on (only with WALL=1)
     assets/img/post/room/cafe.webp   Nebula Cafe, from standing height, straight on

   (The room itself is photographed piece by piece by tools/bake-stage.js.)
   Run it after changing a wish in data.js, or the café.

   HOW TO RUN IT (needs Node and Playwright):
     1. In the repo folder:  python3 -m http.server 8765
     2. In another window:   node tools/bake-post.js

   THE CAMERA
   The browser window is made two screens tall (the room's height), so the
   whole café arch is in view at once, and the camera is put at standing
   height, three quarters of the way down (perspective-origin 75%).
   ------------------------------------------------------------------ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SITE = process.env.SITE || 'http://localhost:8765';
const OUT = path.join(__dirname, '..', 'assets', 'img', 'post', 'room');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bake-post-'));
fs.mkdirSync(OUT, { recursive: true });

const W = 1440, H = 900;          // the screen the room is drawn for (a laptop)
const TALL = 2;                   // the room is two screens tall (post.js: PH = H x 2)
const EYE_CAFE = 75;              // the café close-up's camera: 75% down = standing on the floor, looking straight at it

// While baking, hide everything that isn't the room itself. The new page puts its own back link,
// scroll cue and the soft light and vignette on top, so those stay put on screen as you scroll.
const HIDE = eye => `.nrp-back, .nrp-down, .nrp-toast, .nrp-sun, .nrp-air { display: none !important; }
  html.from-light body::after { display: none !important; }
  .nrp-scene { perspective-origin: 50% ${eye}% !important; }`;

// (Only for baking without internet: LOCAL_FONTS = a folder of @fontsource font packages, used in place of Google Fonts.)
async function localFonts(page) {
  const dir = process.env.LOCAL_FONTS; if (!dir) return;
  const f = (pkg, file) => path.join(dir, '@fontsource', pkg, 'files', file);
  const faces = [
    ['Archivo Black', 400, f('archivo-black', 'archivo-black-latin-400-normal.woff2')],
    ['Oswald', 400, f('oswald', 'oswald-latin-400-normal.woff2')],
    ['Oswald', 600, f('oswald', 'oswald-latin-600-normal.woff2')],
    ['Arimo', 400, f('arimo', 'arimo-latin-400-normal.woff2')],
    ['Arimo', 700, f('arimo', 'arimo-latin-700-normal.woff2')],
    ['Sacramento', 400, f('sacramento', 'sacramento-latin-400-normal.woff2')]
  ];
  const css = faces.map(([fam, w], i) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(https://fonts.local/${i}.woff2) format('woff2')}`).join('\n');
  await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', body: css }));
  await page.route('https://fonts.local/**', r => r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(faces[+r.request().url().split('/').pop().split('.')[0]][2]) }));
}

// Open the recipe room inside a window two screens tall, sharp at `dpr` (2 = retina, 4 = extra sharp),
// with the camera `eye` percent down the picture
async function openRoom(browser, dpr, eye) {
  // reducedMotion: the room holds still (no swaying lamps, spinning fans or walk-in), which is what a photograph wants;
  // a moving piece also gets clipped to its own box by the browser, which showed up as hard-edged squares of lamp light
  const page = await browser.newPage({ viewport: { width: W, height: H * TALL }, deviceScaleFactor: dpr, reducedMotion: 'reduce' });
  await localFonts(page);
  // post.js measures the screen with innerHeight: tell it the real screen's height, not the tall window's
  await page.addInitScript(h => Object.defineProperty(window, 'innerHeight', { get: () => h, configurable: true }), H);
  await page.goto(SITE + '/post/recipe.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('.nrp.ready', { timeout: 20000 });
  await page.addStyleTag({ content: HIDE(eye) });
  // The bulb clusters' glow is painted wider than the cluster itself, and the browser trims it at the cluster's
  // edge (a hard vertical line of light on the café's white brick). Widen each cluster so all its glow fits inside.
  await page.evaluate(() => document.querySelectorAll('.nrp-bulbs').forEach(el => {
    const c = el.querySelector('canvas'), L = c ? -parseFloat(c.style.left) : 0; if (!(L > 0)) return;
    el.style.left = (parseFloat(el.style.left) - L) + 'px'; el.style.width = (parseFloat(el.style.width) + 2 * L) + 'px';
    el.querySelectorAll('svg, canvas').forEach(n => (n.style.left = ((parseFloat(n.style.left) || 0) + L) + 'px'));
  }));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3000);                   // let every picture and lamp finish painting
  return page;
}

// PNG in, resized WebP out, done by the browser itself (no extra tools needed).
// keep = the share of the picture's height to keep, from the top (1 = all of it)
async function toWebp(browser, png, out, width, quality, keep = 1) {
  const p = await browser.newPage();
  const data = await p.evaluate(async ({ b64, width, quality, keep }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const sh = Math.round(img.naturalHeight * keep);
    const w = width || img.naturalWidth, h = Math.round(sh * w / img.naturalWidth);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, img.naturalWidth, sh, 0, 0, w, h);
    return c.toDataURL('image/webp', quality).split(',')[1];
  }, { b64: fs.readFileSync(png).toString('base64'), width, quality, keep });
  fs.writeFileSync(out, Buffer.from(data, 'base64'));
  await p.close();
  console.log('  wrote', path.basename(out), Math.round(fs.statSync(out).size / 1024) + ' KB');
}

// A box around every piece matching `sel`, in CSS pixels
const boxOf = (page, sel) => page.evaluate(sel => {
  const rs = [...document.querySelectorAll(sel)].map(e => e.getBoundingClientRect()).filter(r => r.width > 0);
  return { x0: Math.min(...rs.map(r => r.left)), y0: Math.min(...rs.map(r => r.top)), x1: Math.max(...rs.map(r => r.right)), y1: Math.max(...rs.map(r => r.bottom)) };
}, sel);
const pct = (b, fw, fh, ox = 0, oy = 0) => {
  const r = v => +(v * 100).toFixed(1), x0 = Math.max(0, b.x0 - ox), y0 = Math.max(0, b.y0 - oy);
  return `left ${r(x0 / fw)}%  top ${r(y0 / fh)}%  width ${r((Math.min(fw, b.x1 - ox) - x0) / fw)}%  height ${r((Math.min(fh, b.y1 - oy) - y0) / fh)}%`;
};

(async () => {
  const browser = await chromium.launch();

  const page = await openRoom(browser, 2, EYE_CAFE);
  // 2 · THE CAFE CLOSE-UP: the Nebula arch from standing height, straight on, at 4x so it stays sharp blown up
  //     (the lounge photo is left out of this one: it stands well in front of the bar)
  console.log('the cafe');
  const big = await openRoom(browser, 4, EYE_CAFE);
  // (the bench by the left wall is left out too: its corner poked into the bottom of the picture)
  await big.addStyleTag({ content: '.nrp-lounge-photo, .nrp-lounge-cord, .nrp-bench3d { display: none !important; }' });
  await big.evaluate(() => { const b = document.querySelectorAll('.nrp-bulbs'); if (b[1]) b[1].style.display = 'none'; });   // (the lounge's bulbs)
  // THE FRAME (Oct 31): the picture is cut exactly to the arch wall (the black back wall the arch is cut into), so the
  // black wall and its ivy frame the café. (It used to be the arch plus a margin, which caught slivers of both side walls.)
  const a = await boxOf(big, '#nrp-back');
  const clip = { x: a.x0, y: a.y0, width: a.x1 - a.x0, height: a.y1 - a.y0 };
  console.log('   neon sign   ', pct(await boxOf(big, '.nrp-pink'), clip.width, clip.height, clip.x, clip.y));
  const cpng = path.join(TMP, 'cafe.png');
  await big.screenshot({ path: cpng, clip });
  await toWebp(browser, cpng, path.join(OUT, 'cafe.webp'), 1400, .85);
  await big.close();

  // 3 · THE WISHING WALL, flat and straight on: only when asked (WALL=1), since the wall's own popup in the room
  //     (post.js, STEP 6A) is how the current wall.webp was made
  if (!process.env.WALL) { await browser.close(); return; }
  console.log('the wishing wall');
  await page.evaluate(() => document.querySelector('.nrp-wallhot').click());
  await page.waitForSelector('.nrwv:not([hidden])');
  await page.addStyleTag({ content: '.nrwv .nrlb-close { display: none !important; }' });
  await page.waitForTimeout(800);
  const wpng = path.join(TMP, 'wall.png');
  await page.locator('.nrwv-frame').screenshot({ path: wpng });
  await toWebp(browser, wpng, path.join(OUT, 'wall.webp'), 0, .8);

  await browser.close();
})();
