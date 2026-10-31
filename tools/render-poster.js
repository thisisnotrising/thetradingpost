/* NOT RISING · THE POST — THE BIG POSTER ON THE BLACK WALL
   ------------------------------------------------------------------
   Makes the two pictures of the storefront window's #1 NOT RISING MAGAZINE / BEST STORYTELLER poster that hang
   on THE POST's black wall (WALL_POSTER in assets/data.js):
     assets/img/post/poster-best-storyteller.webp        3456 x 4408, for computers (4 x the storefront's 864 x 1102)
     assets/img/post/poster-best-storyteller-phone.webp  1728 x 2204, for phones

   HOW IT WORKS
     1. THE BOOK COVER, SHARPENED. The cover photo (assets/img/poetic-drift.jpg) is only 420 pixels wide; blown up
        4 times by ordinary stretching it would go soft. So it's enlarged by an AI upscaler first (OpenCV's EDSR
        model, which redraws fine detail like the lettering instead of smearing it). This step uses Python.
     2. THE POSTER, REDRAWN BIG. It is NOT a stretched screenshot: the poster is drawn again from scratch, by a
        browser, with the storefront's own stylesheet (assets/storefront.css), at 3456 pixels wide. Its lettering
        and rays are drawn by the browser, so they're sharp at any size, and it always matches the storefront.
        The words come from POSTERS in assets/data.js (rank, author, book), the same as the storefront.
     3. SAVED as WebP pictures, a big one and a phone one.
     4. THE IVY FRINGE: a small strip cut from the bottom of the wall's ivy picture, for the strands that drape
        over the poster's top edge (assets/img/post/ivy-wall-fringe.webp).

   HOW TO RUN IT (needs Node and Playwright, and Python with OpenCV: pip install opencv-contrib-python)
     1. Download the upscaler's model, EDSR_x4.pb, from github.com/Saafke/EDSR_Tensorflow (models folder)
     2. In the repo folder:  MODEL=/path/to/EDSR_x4.pb node tools/render-poster.js
   (It needs Google Fonts for Archivo Black and Arimo. Offline, set LOCAL_FONTS to a folder of @fontsource
    packages, as in tools/bake-stage.js.)
   ------------------------------------------------------------------ */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');

const ROOT = path.join(__dirname, '..');
const SIZES = [['poster-best-storyteller.webp', 3456], ['poster-best-storyteller-phone.webp', 1728]];   // [file, width in pixels]
const QUALITY = .88;   // WebP quality (0 to 1)

// The poster's words, from the storefront's data (assets/data.js, POSTERS)
global.window = {}; eval(fs.readFileSync(path.join(ROOT, 'assets', 'data.js'), 'utf8'));
const best = window.NRSF.POSTERS.find(p => p.kind === 'bestseller');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// 1 · THE COVER, 4 x bigger, by the AI upscaler
const coverIn = path.join(ROOT, 'assets', 'img', best.cover), coverBig = path.join(os.tmpdir(), 'poster-cover-x4.png');
if (!process.env.MODEL) { console.log('Set MODEL to the EDSR_x4.pb file (see the top of this file).'); process.exit(1); }
console.log('sharpening the cover (a few minutes)...');
execFileSync('python3', ['-c', `
import cv2, sys
sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(sys.argv[1]); sr.setModel('edsr', 4)
cv2.imwrite(sys.argv[3], sr.upsample(cv2.imread(sys.argv[2])))`, process.env.MODEL, coverIn, coverBig], { stdio: 'inherit' });

// 2 · THE POSTER, drawn by a browser with the storefront's stylesheet. The page is served from a made-up address
//     (render.local) so the browser can load the stylesheet, the cover and the fonts from this computer.
const fontCss = () => {
  const dir = process.env.LOCAL_FONTS; if (!dir) return '';
  const f = (pkg, file) => `url(/fonts/${pkg}/${file})`;
  return `@font-face{font-family:"Archivo Black";src:${f('archivo-black', 'archivo-black-latin-400-normal.woff2')}}
    @font-face{font-family:Arimo;font-weight:400;src:${f('arimo', 'arimo-latin-400-normal.woff2')}}
    @font-face{font-family:Arimo;font-weight:700;src:${f('arimo', 'arimo-latin-700-normal.woff2')}}`;
};
const page = W => `<!doctype html><html><head><meta charset="utf-8">
  ${process.env.LOCAL_FONTS ? `<style>${fontCss()}</style>` : '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Arimo:wght@400;700&display=block">'}
  <link rel="stylesheet" href="/assets/storefront.css">
  <style> html, body { margin: 0; background: transparent; } .nrsf { background: transparent; }
    .nrsf .nrsf-poster { width: ${W}px; box-shadow: none; transition: none; } </style></head>
  <body><div class="nrsf"><a class="nrsf-poster" id="p"><span class="nrsf-p-best">
    <span class="l1"><em>${esc(best.rank)}</em> NOT RISING MAGAZINE</span><span class="l2">BEST STORYTELLER</span>
    <span class="book"><img src="/cover.png" alt=""></span>
    <span class="by">NEW BOOK BY <b>${esc(best.author.toUpperCase())}</b></span><span class="title">${esc(best.book.toUpperCase())}</span>
  </span></a></div></body></html>`;

(async () => {
  const browser = await chromium.launch();
  for (const [file, W] of SIZES) {
    const H = Math.round(W * 1102 / 864);
    const p = await browser.newPage({ viewport: { width: W + 20, height: H + 20 } });
    await p.route('https://render.local/**', r => {
      const u = new URL(r.request().url()).pathname;
      if (u === '/') return r.fulfill({ contentType: 'text/html', body: page(W) });
      if (u === '/cover.png') return r.fulfill({ contentType: 'image/png', body: fs.readFileSync(coverBig) });
      if (u.startsWith('/fonts/')) return r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(path.join(process.env.LOCAL_FONTS, '@fontsource', ...u.split('/').slice(2, 3), 'files', u.split('/').pop())) });
      r.fulfill({ body: fs.readFileSync(path.join(ROOT, u)), contentType: 'text/css' });
    });
    await p.goto('https://render.local/', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    const png = await p.locator('#p').screenshot({ omitBackground: true });
    // 3 · SAVED as WebP (the browser's own canvas does the converting)
    const webp = await p.evaluate(async ({ b64, q }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0); return c.toDataURL('image/webp', q).split(',')[1];
    }, { b64: png.toString('base64'), q: QUALITY });
    const out = path.join(ROOT, 'assets', 'img', 'post', file);
    fs.writeFileSync(out, Buffer.from(webp, 'base64'));
    console.log(`  ${file}: ${W} x ${H}, ${Math.round(fs.statSync(out).size / 1024)} KB`);
    await p.close();
  }
  // 4 · THE IVY FRINGE that drapes over the poster's top edge (assets/img/post/ivy-wall-fringe.webp): the bottom of
  //     the wall's ivy picture (ivy-wall.webp, 2176 x 850 = 6.4 m x 2.5 m), from 1.2 m down to 2.5 m, at 160 pixels
  //     a metre (1024 x 208). Only that part can reach the poster, so THE POST downloads just that.
  const p = await browser.newPage();
  await p.route('https://render.local/**', r => r.fulfill({ contentType: 'image/webp', body: fs.readFileSync(path.join(ROOT, 'assets', 'img', 'post', 'ivy-wall.webp')) }));
  await p.goto('https://render.local/', { waitUntil: 'load' }).catch(() => {});
  const fringe = await p.evaluate(async () => {
    const img = new Image(); img.src = 'https://render.local/ivy.webp'; await img.decode();
    const c = document.createElement('canvas'); c.width = 1024; c.height = 208;
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 408, 2176, 442, 0, 0, 1024, 208);
    return c.toDataURL('image/webp', .82).split(',')[1];
  });
  fs.writeFileSync(path.join(ROOT, 'assets', 'img', 'post', 'ivy-wall-fringe.webp'), Buffer.from(fringe, 'base64'));
  console.log('  ivy-wall-fringe.webp: 1024 x 208');
  await browser.close();
})();
