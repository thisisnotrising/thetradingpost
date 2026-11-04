// Makes a To Be Human back cover picture in Season 2's layout.
// usage: node make-back-cover.js <background colour> <ink colour> <output.webp|.png> [width, default 1000]
//   e.g. node make-back-cover.js "#E3E2DC" "#202226" ../../assets/img/memoir03-back.png
const { chromium } = require('playwright'); const path = require('path'); const http = require('http'); const fs = require('fs');
(async () => {
  const [bg, ink, out, w = 1000] = process.argv.slice(2);
  // a tiny local web server, so the page can load its font and QR file
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': p.endsWith('.html') ? 'text/html' : p.endsWith('.svg') ? 'image/svg+xml' : 'font/woff2' }); res.end(d); });
  }).listen(0);
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: +w / 816 })).newPage();
  await page.goto(`http://127.0.0.1:${port}/back-cover/back-cover.html?bg=${encodeURIComponent(bg)}&ink=${encodeURIComponent(ink)}`);
  await page.waitForFunction(() => document.title === 'ready' && document.fonts.status === 'loaded');
  await page.evaluate(() => document.fonts.load('700 14px Montserrat'));
  await page.locator('#back').screenshot({ path: out.replace(/\.webp$/, '.png') });
  await browser.close(); server.close();
  console.log('saved', out.replace(/\.webp$/, '.png'));
})();
