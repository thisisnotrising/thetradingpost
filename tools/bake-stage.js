/* NOT RISING · THE POST — THE STAGE-SET BAKER
   ------------------------------------------------------------------
   THE POST is a stage set: the same 3D box and the same camera as the
   original room, but every wall, the floor, the glass roof and every
   thing standing in the room is ONE finished picture. Nothing is painted
   while a visitor waits; the browser just holds the pictures up in 3D
   and moves the camera down as you scroll.

   This script takes those pictures. It opens post/recipe.html (the live
   room, built by post.js, post-roof.js and post.css), and for each piece:
     1. lays it flat (takes away its 3D tilt), hides everything else
     2. photographs it, with a see-through background
     3. saves it as a WebP picture in assets/img/post/stage/<set>/
   and writes assets/post-stage.js: the list of pieces, where each one
   stands (in METRES, so it fits any screen) and what's clickable.

   It does this twice: a WIDE set (computers, tablets on their side) and a
   NARROW set (phones), because the original room was built differently
   for each: a phone gets a long narrow corridor that always fits the screen.

   SHARP WHERE IT NEEDS TO BE: a wall is seen big near the door and small
   at the far end, so each long wall and roof slope is cut into three
   lengthwise pieces (BANDS), each saved only as sharp as it is ever seen.

   HOW TO RUN IT (needs Node and Playwright):
     1. In the repo folder:  python3 -m http.server 8765
     2. In another window:   node tools/bake-stage.js
   (The Wishing Wall and Nebula Cafe popups are taken by tools/bake-post.js.)
   ------------------------------------------------------------------ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITE = process.env.SITE || 'http://localhost:8765';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'img', 'post', 'stage');

// The screen each set is built for. post.js sizes the room from the screen: u (pixels per metre) = 2 x H / 7.2 on a
// wide screen, 2.2 x H / 7.2 on a phone. These make u about 300, so every piece is photographed at 300 pixels a metre.
const SETS = {
  wide:   { W: 1440, H: 1080 },
  narrow: { W: 590,  H: 1000 },
};
// BANDS: [from, to, pixels per metre], measured in metres in from the door. On a phone the first few metres of the
// side walls are always off the edges of the screen, so they're saved soft.
const BANDS = {
  wide:   [[0, 3, 280], [3, 7, 180], [7, 99, 120]],
  narrow: [[0, 3.5, 100], [3.5, 8.5, 250], [8.5, 99, 140]],
};
const FLAT_RES = 150;      // the back wall and the glass triangle above it: always far away
const FLOOR_RES = 40;      // the floor's light and shadows (the floor's own sparkle is a repeating tile)
const QUALITY = .72;       // WebP quality (0 to 1)

// (Only for baking without internet: LOCAL_FONTS = a folder of @fontsource font packages, used in place of Google Fonts.)
async function localFonts(page) {
  const dir = process.env.LOCAL_FONTS; if (!dir) return;
  const f = (pkg, file) => path.join(dir, '@fontsource', pkg, 'files', file);
  const faces = [['Archivo Black', 400, f('archivo-black', 'archivo-black-latin-400-normal.woff2')], ['Oswald', 400, f('oswald', 'oswald-latin-400-normal.woff2')],
    ['Oswald', 600, f('oswald', 'oswald-latin-600-normal.woff2')], ['Arimo', 400, f('arimo', 'arimo-latin-400-normal.woff2')],
    ['Arimo', 700, f('arimo', 'arimo-latin-700-normal.woff2')], ['Sacramento', 400, f('sacramento', 'sacramento-latin-400-normal.woff2')]];
  const css = faces.map(([fam, w], i) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(https://fonts.local/${i}.woff2) format('woff2')}`).join('\n');
  await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ contentType: 'text/css', body: css }));
  await page.route('https://fonts.local/**', r => r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(faces[+r.request().url().split('/').pop().split('.')[0]][2]) }));
}

// "123.4px" anywhere in a style -> "calc(var(--u) * 0.4113)": the same length, in metres, so it fits any screen
const toMetres = (str, u) => String(str).replace(/(-?\d*\.?\d+(?:e-?\d+)?)px/g, (m, n) => `calc(var(--u) * ${+(n / u).toFixed(4)})`);
const r4 = v => +v.toFixed(4);

(async () => {
  const browser = await chromium.launch();
  const coder = await browser.newPage();      // a spare page whose canvas crops, shrinks and saves pictures as WebP
  async function encode(png, out, crop, scale) {
    const data = await coder.evaluate(async ({ b64, crop, scale, q }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const [sx, sy, sw, sh] = crop || [0, 0, img.naturalWidth, img.naturalHeight];
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(sw * scale)); c.height = Math.max(1, Math.round(sh * scale));
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      return c.toDataURL('image/webp', q).split(',')[1];
    }, { b64: png.toString('base64'), crop, scale, q: QUALITY });
    fs.writeFileSync(out, Buffer.from(data, 'base64'));
    return Math.round(fs.statSync(out).size / 1024);
  }

  const STAGE = {};
  for (const [set, { W, H }] of Object.entries(SETS)) {
    console.log(`\n${set} (${W} x ${H})`);
    const dir = path.join(OUT, set); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
    await localFonts(page);
    // the room rebuilds itself when the window changes size; here the window is enlarged to photograph big pieces,
    // so that rebuild is switched off
    await page.addInitScript(() => { const add = window.addEventListener; window.addEventListener = function (t, ...a) { if (t !== 'resize') return add.call(this, t, ...a); }; });
    await page.goto(SITE + '/post/recipe.html', { waitUntil: 'networkidle' });
    await page.waitForSelector('.nrp.ready', { timeout: 20000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500);

    // THE ROOM'S SIZE, in metres
    const G = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById('nrp')), v = k => parseFloat(cs.getPropertyValue(k));
      const u = v('--u'); return { u, Wm: v('--Wr') / u, Dm: v('--D') / u, DNm: v('--DN') / u, HM: v('--PH') / u };
    });
    const u = G.u, bands = BANDS[set], resAt = z => (bands.find(b => z < b[1]) || bands[bands.length - 1])[2];
    console.log('  room', JSON.stringify(G));

    // WHAT'S CLICKABLE, on which wall, in metres from that wall's top-left corner
    const hot = await page.evaluate(u => {
      const box = els => { els = els.filter(Boolean); const x0 = Math.min(...els.map(e => e.offsetLeft)), y0 = Math.min(...els.map(e => e.offsetTop));
        const x1 = Math.max(...els.map(e => e.offsetLeft + e.offsetWidth)), y1 = Math.max(...els.map(e => e.offsetTop + e.offsetHeight));
        return [x0 / u, y0 / u, (x1 - x0) / u, (y1 - y0) / u].map(v => +v.toFixed(3)); };
      const q = s => [...document.querySelectorAll(s)];
      return {
        left: [{ pop: 'newsstand', label: 'Newsstand', box: box(q('.nrp-news')) }, { pop: 'wall', label: 'Wishing Wall', box: box(q('.nrp-wallhot')) }],
        back: [{ pop: 'cafe', label: 'Nebula Cafe', box: box(q('.nrp-arch')) }],
        right: [{ pop: 'gallery', label: 'Gallery', box: box([...q('#nrp-right [data-room="gallery"]'), ...q('.nrp-life')]) }],
      };
    }, u);

    // THE PIECES THAT STAY LIVE: the ceiling fan and the two benches are little 3D objects (their parts are turned in
    // 3D, and the fan turns), so they're kept as they are, written in metres. Their look comes from post.css.
    const live = await page.evaluate(() => [...document.querySelectorAll('#nrp-room > .nrp-fan, #nrp-room > .nrp-bench3d')].map(e => e.outerHTML));
    const liveCss = await page.evaluate(() => {
      const out = [];
      for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch (e) { continue; }
        for (const r of rules) { const t = r.cssText;
          if ((r.selectorText && /nrp-(fan|bench3d|b-|stand)\b/.test(r.selectorText)) || (r.name === 'nrp-spin')) out.push(t);
          if (r.media && /reduce/.test(r.media.mediaText) && /nrp-fan-spin/.test(t)) out.push('@media (prefers-reduced-motion: reduce) { .nrp-fan-spin { animation: none; } }'); } }
      return [...new Set(out)].join('\n');
    });

    // GET READY TO PHOTOGRAPH: no camera, no tilt, nothing on screen but the room, on a see-through background
    await page.addStyleTag({ content: `
      html, body, .nrp, .nrp-scene { background: transparent !important; }
      .nrp { height: auto !important; overflow: visible !important; }
      .nrp-scene { position: absolute !important; inset: auto !important; left: 0 !important; top: 0 !important; perspective: none !important; }
      .nrp-room { transform: none !important; translate: none !important; animation: none !important; left: 800px !important; top: 800px !important; }
      .nrp-back, .nrp-down, .nrp-toast, .nr-fs, .nrp-sun, .nrp-air, .nrp::after { display: none !important; }
      html.from-light body::after { display: none !important; }
      .nrp-hot::after { display: none !important; }` });
    const MARGIN = 800;    // (the room is moved 800 px in from the corner, so cords and glows that reach above it fit)
    const ids = await page.evaluate(() => [...document.querySelectorAll('#nrp-room > *')].map((e, i) => {
      e.dataset.bake = i; return { i, cls: String(e.className.baseVal ?? e.className), id: e.id, display: getComputedStyle(e).display, style: e.getAttribute('style') || '' }; }));

    async function shoot(i, { flat = true, floor = false, pad = 0 } = {}) {
      const box = await page.evaluate(({ i, flat, floor, pad }) => {
        const all = [...document.querySelectorAll('#nrp-room > *')];
        all.forEach(e => (e.style.visibility = e.dataset.bake == i ? '' : 'hidden'));
        const e = all[i];
        e.style.setProperty('transform', 'none', 'important');
        if (flat) { e.style.setProperty('left', '0px', 'important'); e.style.setProperty('top', '0px', 'important'); }   // (some walls sit off to the side: bring them into view)
        if (floor) { e.style.setProperty('background-image', 'none', 'important'); e.style.setProperty('background-color', 'transparent', 'important'); }
        const rs = [e, ...(flat ? [] : e.querySelectorAll('*'))].map(n => n.getBoundingClientRect()).filter(r => r.width > 0 || r.height > 0);
        const room = document.getElementById('nrp-room').getBoundingClientRect();
        let x0 = Math.min(...rs.map(r => r.left)) - pad, y0 = Math.min(...rs.map(r => r.top)) - pad;
        let x1 = Math.max(...rs.map(r => r.right)) + pad, y1 = Math.max(...rs.map(r => r.bottom)) + pad;
        // A standing piece is trimmed to the inside of the room, and stops a hair (1.5 cm) above the floor: a picture
        // that pokes through, or even touches, a wall or the floor confuses the browser about what's in front, and it
        // draws the wall over it.
        if (!flat) { x0 = Math.max(x0, room.left + 2); x1 = Math.min(x1, room.right - 2); y1 = Math.min(y1, room.bottom - .015 * room.height / 7.2); }
        return { x: Math.max(0, x0), y: Math.max(0, y0), w: x1 - Math.max(0, x0), h: y1 - Math.max(0, y0), rx: room.left, ry: room.top };
      }, { i, flat, floor, pad });
      await page.setViewportSize({ width: Math.ceil(box.x + box.w) + 2, height: Math.ceil(box.y + box.h) + 2 });
      await page.waitForTimeout(150);
      const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.w, height: box.h }, omitBackground: true });
      await page.evaluate(i => { const e = document.querySelector(`[data-bake="${i}"]`); ['transform', 'left', 'top'].forEach(k => e.style.removeProperty(k)); }, i);
      return { png, box };
    }

    const S = { room: { Wm: r4(G.Wm), Dm: r4(G.Dm), DNm: r4(G.DNm), HM: r4(G.HM) }, walls: {}, pieces: [], live: live.map(h => toMetres(h, u)).join('\n'), css: liveCss };
    let n = 0, kb = 0;
    for (const p of ids) {
      if (p.display === 'none' || /nrp-fan|nrp-bench3d/.test(p.cls)) continue;
      const wall = (p.cls.match(/\bnrp-(back-wall|left|right|floor-near|floor)\b/) || [])[1];
      const roof = /\bnrp-roof\b/.test(p.cls);
      if (wall === 'left' || wall === 'right' || roof) {
        // A LONG SURFACE, cut into bands by distance from the door
        const { png, box } = await shoot(p.i);
        const L = roof ? box.h / u : box.w / u, parts = [];
        for (const [z0, z1, res] of bands) {
          if (z0 >= L) continue;
          const a = z0, b = Math.min(L, z1 + .03);          // (each band overlaps the next by 3 cm, so no seam shows)
          // where that stretch is in the photo: the left wall and the roof run door -> back, the right wall back -> door
          const from = wall === 'right' ? L - b : a;
          const crop = roof ? [0, from * u, box.w, (b - a) * u] : [from * u, 0, (b - a) * u, box.h];
          const file = `${set}/${wall || 'roof'}${roof ? p.i : ''}-${z0}.webp`;
          kb += await encode(png, path.join(OUT, file), crop.map(Math.round), res / u); n++;
          parts.push(roof ? { img: file, x: 0, y: r4(from), w: r4(box.w / u), h: r4(b - a) } : { img: file, x: r4(from), y: 0, w: r4(b - a), h: r4(box.h / u) });
        }
        const entry = { bands: parts, hot: hot[wall] || [] };
        if (roof) S.pieces.push({ ...entry, kind: 'panel', cls: 'nrp-roof', style: toMetres(p.style, u) });
        else S.walls[wall] = entry;
      } else if (wall === 'back-wall') {
        const { png, box } = await shoot(p.i);
        const file = `${set}/back.webp`; kb += await encode(png, path.join(OUT, file), null, FLAT_RES / u); n++;
        S.walls.back = { bands: [{ img: file, x: 0, y: 0, w: r4(box.w / u), h: r4(box.h / u) }], hot: hot.back };
      } else if (wall === 'floor' || wall === 'floor-near') {
        // THE FLOOR: its sparkle is a small picture that repeats (post/obsidian-floor.webp); only its light and shadows are photographed
        const { png, box } = await shoot(p.i, { floor: true });
        const file = `${set}/${wall}.webp`; kb += await encode(png, path.join(OUT, file), null, FLOOR_RES / u); n++;
        S.walls[wall] = { bands: [{ img: file, x: 0, y: 0, w: r4(box.w / u), h: r4(box.h / u) }], style: toMetres(p.style, u), hot: [] };
      } else {
        // A THING STANDING IN THE ROOM (a plant, a lamp, the bulbs, the lounge, the glass gable): photographed with room
        // around it (pad) so its glow isn't cut off, then stood back in place at its own depth
        const z = -parseFloat((p.style.match(/translateZ\((-?[\d.]+)px\)/) || [0, 0])[1]) / u;
        const { png, box } = await shoot(p.i, { flat: false, pad: Math.round(.35 * u) });
        const res = Math.min(u, /nrp-gable/.test(p.cls) ? FLAT_RES : resAt(z) * 1.6);   // (things standing in the room are what you look at: a little sharper)
        const file = `${set}/piece${p.i}.webp`; kb += await encode(png, path.join(OUT, file), null, res / u); n++;
        S.pieces.push({ kind: 'piece', img: file, x: r4((box.x - box.rx) / u), y: r4((box.y - box.ry) / u), w: r4(box.w / u), h: r4(box.h / u), z: r4(z) });
      }
      process.stdout.write('.');
    }
    console.log(`\n  ${n} pictures, ${kb} KB`);
    STAGE[set] = S;
    await page.close();
  }
  await browser.close();

  // (written with one picture per line, so it's easy to read)
  const pretty = o => JSON.stringify(o, (k, v) => v, 1).replace(/\{\n\s+("img"|"pop"|"kind")[^{}]*?\n\s*\}/g, m => m.replace(/\n\s*/g, ' '))
    .replace(/\[\n\s+(-?[\d.]+),\n\s+(-?[\d.]+),\n\s+(-?[\d.]+),\n\s+(-?[\d.]+)\n\s+\]/g, '[$1, $2, $3, $4]');
  fs.writeFileSync(path.join(ROOT, 'assets', 'post-stage.js'),
`/* NOT RISING · THE POST — THE STAGE SET (written by tools/bake-stage.js: don't edit by hand, re-bake instead)
   Two sets: "wide" (computers, tablets on their side) and "narrow" (phones).
   Every size and position is in METRES; post/index.html multiplies by --u (pixels per metre) to fit the screen.
   room    the box: Wm wide, Dm deep, HM tall; the floor is laid in two slabs, the near one DNm deep
   walls   back, left, right, floor, floor-near: each one or more pictures (bands) laid on that surface, and its clickable spots (hot)
   pieces  the glass roof slopes (panels) and everything standing in the room (pieces): a picture, where it stands (x, y),
           how big (w, h) and how far back from the door (z)
   live    the ceiling fan and the benches, kept as little 3D objects, with their look (css) */
window.NRSTAGE = ${pretty(STAGE)};
`);
  console.log('\nwrote assets/post-stage.js');
})();
