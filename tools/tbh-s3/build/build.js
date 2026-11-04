// Builds TO BE HUMAN Season 3: runs build.html, saves the PDF and one picture per page.
// usage: node build.js [--pdf] [--png] [--preview]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = __dirname, args = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 900, height: 1100 }, deviceScaleFactor: 1400 / 816 })).newPage();
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await page.addInitScript(({ c, q }) => { window.CONTENT = c; window.QR = q; },
    { c: JSON.parse(fs.readFileSync(path.join(dir, 'content.json'))), q: JSON.parse(fs.readFileSync(path.join(dir, 'qr.json'))) });
  await page.goto('file://' + path.join(dir, 'build.html'));
  const report = await page.evaluate(() => window.BUILD);
  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(report, null, 1));
  console.log('pages', report.pages, 'chapters start', report.chapters, 'finale', report.finale, 'overflow', report.overflow);
  console.log(report.kinds.map((k, i) => `${i + 1}:${k.trim()}`).join('  '));
  if (args.includes('--pdf')) {
    await page.pdf({ path: path.join(dir, 'out', 'TO_BE_HUMAN_Season3_Amanda_Jane_Lee.pdf'), preferCSSPageSize: true, printBackground: true });
    console.log('pdf saved');
  }
  if (args.includes('--png') || args.includes('--preview')) {
    await page.emulateMedia({ media: 'print' });
    const els = await page.$$('section.page');
    fs.mkdirSync(path.join(dir, 'out', 'png'), { recursive: true });
    // one page at a time, alone at the top of the window, with the window painted in that page's own colour,
    // so no sliver of the page before (or of the grey background) creeps into the picture's edges
    for (let i = 0; i < els.length; i++) {
      await page.evaluate(n => {
        const all = [...document.querySelectorAll('section.page')];
        all.forEach((p, k) => { p.style.display = k === n ? '' : 'none'; });
        document.documentElement.style.background = document.body.style.background = getComputedStyle(all[n]).backgroundColor;
        window.scrollTo(0, 0);
      }, i);
      await els[i].screenshot({ path: path.join(dir, 'out', 'png', `page${String(i + 1).padStart(2, '0')}.png`) });
    }
    console.log('pngs saved', els.length);
  }
  await browser.close();
})();
