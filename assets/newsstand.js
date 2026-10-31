/* ============================================================
   NOT RISING NEWSSTAND — THE ENGINE
   You shouldn't need to edit this file. It has three jobs:
     A. PAGE TEMPLATES  turn the data (data.js, PART 1) into pages
     B. PAGINATOR       pour each interview into columns and pages
     C. RACK + READER   draw the newsstand, open and flip magazines
   ============================================================ */
(function () {
  "use strict";

  function start() {
    const stand = document.getElementById("nrns-stand");
    if (!stand || !window.NR) return;
    const { IMAGES, TABS, MASTHEAD, EDITOR_LETTER, FEATURES, ISSUES } = window.NR;

    // The overlay moves to the end of <body>, so no theme container can trap it
    const overlay = document.getElementById("nrns-overlay");
    document.body.appendChild(overlay);

    /* ---------- Images ----------
       NRNS_BASE is the image folder, set at the top of each page
       (newsstand/index.html says "../assets/img/"). */
    const BASE = window.NRNS_BASE || "";
    const INLINE = window.NRNS_INLINE || {};
    const src = key => INLINE[key] || BASE + IMAGES[key];
    const thumb = key => INLINE[key] || BASE + "thumbs/" + IMAGES[key];   // small copy for the rack
    const fileSrc = path => INLINE[path] || BASE + path;     // a file by its path (used for book pages)
    const dims = {};
    const loadImages = keys => Promise.all(keys.filter(k => !dims[k]).map(k => new Promise(res => {
      const im = new Image();
      im.onload = () => { dims[k] = { w: im.naturalWidth, h: im.naturalHeight }; res(); };
      im.onerror = () => { dims[k] = { w: 4, h: 3 }; res(); };
      im.src = src(k);
    })));

    /* ============================================================
       A. PAGE TEMPLATES
       Each function returns the HTML for one page.
       ============================================================ */
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    // Marquee letter tiles: each letter its own tile, set a hair crooked. The wobble comes
    // from the letter's position (not true random), so it looks the same on every visit.
    const tiles = (word, seed = 0) => [...word].map((ch, i) => {
      const r = Math.sin((i + seed) * 12.9898 + 4.1) * 43758.5453, f = r - Math.floor(r);
      const g = Math.sin((i + seed) * 78.233 + 1.7) * 12345.678, h = g - Math.floor(g);
      return ch === " " ? `<span class="lt sp"> </span>` : `<span class="lt" aria-hidden="true" style="--rot:${((f - .5) * 3.2).toFixed(2)}deg;--dy:${((h - .5) * .05).toFixed(3)}em">${esc(ch)}</span>`;
    }).join("");
    const P = n => `calc(${n} * var(--p))`;                 // design pixels -> CSS
    const two = n => String(n).padStart(2, "0");
    const img = (key, cls, alt = "", style = "") => {
      const d = dims[key] || {};
      return `<img class="${cls}" src="${src(key)}" alt="${esc(alt)}"${d.w ? ` width="${d.w}" height="${d.h}"` : ""}${style ? ` style="${style}"` : ""}>`;
    };
    const page = (inner, { dark = false, hard = false } = {}) =>
      `<div class="page${dark ? " dark" : ""}"${hard ? ' data-density="hard"' : ""}><div class="sheet">${inner}</div></div>`;
    const footer = (side = "right", folio = true, extra = "") =>
      `<div class="foot ${extra}">${side === "left" ? "<span>thisisnotrising.org</span>" : ""}${folio ? '<span class="folio"></span>' : "<span></span>"}${side === "right" ? "<span>thisisnotrising.org</span>" : ""}</div>`;
    const arrow = `<svg class="arrow abs" style="right:${P(66)};top:${P(52)}" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3 L25 25 M25 9 V25 H9"/></svg>`;
    const stripPeriod = s => s.replace(/\.$/, "");
    const longDate = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const heading = (x, y, text, canva = false) => `<h2 class="spaced${canva ? " canva" : ""} abs" style="left:${P(x)};top:${P(y)}">${text}</h2>`;

    const T = {
      cover: f => page(img(f.cover, "cover-img", `NOT RISING cover: ${f.name}`), { dark: true, hard: true }),

      copyright: is => page(`
        <div class="legal abs">
          <p><b>NOT RISING | Issue ${two(is.number)}</b><br>By ${esc(EDITOR_LETTER.editor)} and ${esc(is.name)}</p>
          <p>Copyright © ${is.year} NOT RISING Magazine</p>
          <p>First edition, ${is.year}</p>
          <p>Photos by ${esc(is.photoCredit)}</p>
          <p>Content and photos remain the property of the respective featured writer.</p>
          <p><b>NOT RISING Magazine</b><br>thisisnotrising.org</p>
        </div>`, { dark: true }),

      blank: () => page(""),

      team: () => page(`
        <div class="team">
          ${heading(66, 40, "The Team", true)}${arrow}
          ${MASTHEAD.map(g => `<div class="team-group" style="left:${P(g.x)};top:${P(g.y)}"><div class="role">${esc(g.role)}</div>${g.names.map(n => `<div class="who">${esc(n)}</div>`).join("")}</div>`).join("")}
        </div>
        ${footer("left", false, "canva")}`),

      letter: () => {
        const L = EDITOR_LETTER;
        return page(`
          <div class="letter">
            ${heading(66, 40, "Editor’s<br>Letter", true)}
            ${img(L.photo, "letter-photo abs", L.editor)}
            <div class="letter-hi abs">${esc(L.greeting)}</div>
            <div class="letter-body abs">${L.paragraphs.map(p => `<p${p.loud ? ' class="loud"' : ""}>${esc(p.text).replace(/\n/g, "<br>")}</p>`).join("")}</div>
            ${img(L.signature, "letter-sig abs", `Signature: ${L.editor}`)}
            <div class="letter-role abs">${esc(L.role)}</div>
          </div>`, { dark: true });
      },

      name: is => page(`
        <h2 class="name-stack abs">${is.nameRows.map(esc).join("<br>")}</h2>
        ${img(is.namePhoto, "name-photo abs", is.name)}
        ${footer("right", false)}`),

      toc: is => {
        const q = n => is.sections.find(s => s.n === String(n));
        return page(`
          ${heading(66, 40, "In this issue")}${arrow}
          ${is.toc.map(t => t.img
            ? img(t.img, "toc-img", "", `left:${P(t.x)};top:${P(t.y)};width:${P(t.w)};height:${P(t.h)}`)
            : `<button class="toc-q" type="button" data-goto="q${t.q}" style="left:${P(t.x)};top:${P(t.y)};width:${P(t.w)}"><span class="toc-n">${two(t.q)}</span><span class="toc-t">${esc(q(t.q).q)}</span></button>`
          ).join("")}
          ${footer("right", false)}`, { dark: true });
      },

      // The cover feature opener, as designed in Canva
      opener: is => {
        const s1 = is.sections[0];
        return page(`
          ${heading(66, 40, "Cover feature")}
          ${img(is.portrait, "op-photo abs", is.name)}
          <div class="op-id abs"><strong>${esc(is.name)}</strong><em>${esc(is.publication)}</em></div>
          <div class="op-q abs"><span class="q-num">${esc(s1.n)}</span><h3 class="q-text">${esc(stripPeriod(s1.q))}</h3></div>
          <div class="op-col abs"><div class="col"></div></div>`);
      },

      // Full-page photo. Big photos bleed to the edges; small ones sit framed on a black page
      photo: (b, is) => {
        const d = dims[b[1]] || { w: 1000, h: 1000 };
        if (b[4] === "stack") {                                 // stacked name top-left, photo low and to the right
          const w = 500, h = Math.round(w * d.h / d.w), top = 960 - h;
          return page(`<h2 class="name-stack abs" style="color:var(--ink)">${is.nameRows.map(esc).join("<br>")}</h2>
            ${img(b[1], "photo", "", `left:${P(750 - w)};top:${P(top)};width:${P(w)};height:${P(h)}`)}
            ${folio(`right:${P(66)};top:${P(1000)}`, true)}`, { dark: true });
        }
        if (d.w >= 700) return page(`${img(b[1], "photo-full abs")}<div class="photo-cap abs"><small>${esc(b[2])}</small><span>${esc(b[3] || "")}</span></div>${footer("right")}`);
        const h = Math.round(684 * d.h / d.w), top = Math.round((1056 - h) / 2) - (b[2] ? 40 : 0);
        return page(`${img(b[1], "photo", "", `left:${P(66)};top:${P(top)};width:${P(684)};height:${P(h)}`)}
          ${b[2] ? `<div class="photo-cap abs" style="top:${P(top + h + 28)}"><small>${esc(b[2])}</small>${b[3] ? `<span>${esc(b[3])}</span>` : ""}</div>` : ""}
          ${folio(`right:${P(66)};top:${P(1000)}`, true)}`, { dark: true });
      },

      quote: is => page(`
        ${heading(66, 40, esc(is.name))}
        <blockquote class="pq abs" style="left:${P(66)};right:${P(66)};top:${P(300)};font-size:${P(54)};line-height:1.05;border-top-width:${P(8)};padding-top:${P(28)}">${esc(is.pullQuote)}</blockquote>
        ${footer("right")}`),

      next: f => page(`
        ${heading(66, 40, "Next issue")}${arrow}
        <h3 class="next-name abs">${esc(f.name).split(" ").join("<br>")}</h3>
        <div class="next-date abs">${esc(longDate(f.date).toUpperCase())}</div>
        ${footer("right")}`, { dark: true }),

      // Last page of a preview: when the full issue arrives, and where to read the feature now
      previewEnd: (f, is) => page(`
        ${heading(66, 40, "Preview")}${arrow}
        <h3 class="pv-big abs">Full digital<br>issue<br>release</h3>
        <div class="pv-date abs">${esc(longDate(is.preview.until).toUpperCase())}</div>
        ${f.url ? `<a class="pv-link abs" href="${esc(f.url)}" target="_blank" rel="noopener">Read the feature online →</a>` : ""}
        ${footer("right", false)}`, { dark: true }),

      back: is => page(`<div class="back-mark abs">${img("qr", "", "QR code: thisisnotrising.org")}<span>NOT RISING Magazine © ${is.year}</span></div>`, { dark: true, hard: true })
    };

    /* ------------------------------------------------------------
       A2. COLOR-BLOCK LAYOUTS for the interview
       Every question opens on one of four designed layouts:
         "band-top"     black band top-right, question left, photo right
         "band-bottom"  question across the top, black band across the bottom
         "split"        black block + bleed photo on the left, quote bar
         "statement"    half-page black block, the answer in big type
       Text boxes (.col) are filled in order by the paginator.
       Boxes marked data-below sit under the question block, whose
       height depends on how long the question is.
       ------------------------------------------------------------ */
    const box = (x, y, w, h, extra = "") => `<div class="col abs" style="left:${P(x)};top:${P(y)};width:${P(w)};height:${P(h)}" ${extra}></div>`;
    const below = (x, w, bottom, extra = "") => `<div class="col abs ${extra}" style="left:${P(x)};width:${P(w)}" data-below=".qb" data-bottom="${bottom}"></div>`;
    const qblock = (s, cls, style, fit, ns, qs) =>
      `<div class="qb abs ${cls}" style="${style};--ns:${ns};--qs:${qs}" data-fit="${fit}" data-ns="${ns}" data-qs="${qs}"><span class="q-num">${esc(s.n)}</span><h3 class="q-text">${esc(stripPeriod(s.q))}</h3></div>`;
    const folio = (style, dark = false) => `<span class="pg folio" style="${style}${dark ? ";color:var(--ink)" : ""}"></span>`;
    const kicker = (is, dark = false) => `<div class="lbl"${dark ? ' style="color:var(--ink)"' : ""}>${esc(is.name)} | ${esc(is.publication)}</div>`;

    const L = {
      "band-top": (is, s) => {
        let photo = "", colB = box(433, 360, 317, 630);
        if (s.feature) {                                        // a person or name to spotlight
          photo = `<div class="rec abs" style="left:${P(433)};top:${P(290)};width:${P(383)}"><small>${esc(s.feature.label)}</small><strong data-fitw="1">${esc(s.feature.name)}</strong></div>`;
          colB = `<div class="col abs" style="left:${P(433)};width:${P(317)}" data-below=".rec" data-bottom="990"></div>`;
        } else if (!s.photo && s.pull) {                               // no photo? a pull quote takes its place
          photo = `<blockquote class="pq abs" style="left:${P(433)};top:${P(372)};width:${P(317)}">${esc(s.pull)}</blockquote>`;
          colB = `<div class="col abs" style="left:${P(433)};width:${P(317)}" data-below=".pq" data-bottom="990"></div>`;
        }
        if (s.photo) {
          const d = dims[s.photo], h = Math.min(400, Math.round(317 * d.h / d.w));
          photo = img(s.photo, "photo", "", `left:${P(433)};top:${P(290)};width:${P(317)};height:${P(h)}`);
          const top = 290 + h + 34;
          colB = 990 - top > 70 ? box(433, top, 317, 990 - top) : "";
        }
        return page(`
          <div class="blk" style="left:${P(476)};top:0;width:${P(170)};height:${P(330)}"></div>
          ${kicker(is)}${folio(`left:${P(500)};top:${P(52)}`, true)}
          ${qblock(s, "", `left:${P(66)};top:${P(110)};width:${P(392)}`, 300, 110, 40)}
          ${photo}
          ${below(66, 317, 990)}${colB}`);
      },

      "band-bottom": (is, s) => {
        const bt = s.bandTop || 640;                            // where the black band starts (520 matches the statement pages)
        return page(`
        ${kicker(is)}${folio(`right:${P(66)};top:${P(52)}`)}
        ${qblock(s, "row", `left:${P(66)};top:${P(110)};width:${P(684)}`, 330, 120, 44)}
        ${below(66, 317, bt - 26)}${below(433, 317, bt - 26)}
        <div class="blk" style="left:0;top:${P(bt)};width:100%;height:${P(1056 - bt)}"></div>
        ${box(66, bt + 44, 317, 1010 - bt - 44, 'data-inv="1"')}
        ${s.pull
          ? `<blockquote class="pq abs" style="left:${P(433)};top:${P(bt + 44)};width:${P(317)};height:${P(1010 - bt - 44)};color:var(--ink);overflow:hidden;text-align:right" data-fitq="1">${esc(s.pull)}</blockquote>`
          : box(433, bt + 44, 317, 1010 - bt - 44, 'data-inv="1"')}`);
      },

      // A simple page made for reading: question across the top, one comfortable column
      // Callout: the black band drops down and turns into a quote bar under the question
      "callout": (is, s) => page(`
        <div class="blk" style="left:${P(476)};top:0;width:${P(170)};height:${P(300)}" data-stretchb=".qb"></div>
        ${kicker(is)}${folio(`left:${P(500)};top:${P(52)}`, true)}
        ${qblock(s, "row", `left:${P(66)};top:${P(110)};width:${P(392)}`, 300, 110, 40)}
        <div class="bar-q" style="left:${P(260)};width:${P(556)};padding-top:${P(34)};padding-bottom:${P(34)};--bs:27" data-below=".qb">${s.feature
          ? `<div class="feat"><small>${esc(s.feature.label)}</small><strong>${esc(s.feature.name)}</strong></div>`
          : `<span>${esc(s.callout)}</span>`}</div>
        ${box(66, 0, 317, 0, 'data-below=".bar-q" data-bottom="990"')}${box(433, 0, 317, 0, 'data-below=".bar-q" data-bottom="990"')}`),

      // List: question and a short lead-in on white, the list in two columns on a black band
      "list": (is, s) => page(`
        ${kicker(is)}${folio(`right:${P(66)};top:${P(52)}`)}
        ${qblock(s, "row", `left:${P(66)};top:${P(110)};width:${P(684)}`, 260, 120, 44)}
        <div class="col abs lead" style="left:${P(66)};width:${P(600)}" data-below=".qb" data-bottom="900"></div>
        <div class="blk band" style="left:0;top:${P(396)};width:100%;height:${P(660)}"></div>
        ${box(66, 446, 317, 544, 'data-inv="1"')}${box(433, 446, 317, 544, 'data-inv="1"')}`),

      // Quotes: question + lead-in on white, quoted voices as pull quotes on a black band
      "quotes": (is, s) => {
        const bt = s.bandTop || 520;
        return page(`
        ${kicker(is)}${folio(`right:${P(66)};top:${P(52)}`)}
        ${qblock(s, "row", `left:${P(66)};top:${P(110)};width:${P(684)}`, 260, 120, 44)}
        ${below(66, 684, bt - 26, "lead")}
        <div class="blk" style="left:0;top:${P(bt)};width:100%;height:${P(1056 - bt)}"></div>
        ${box(66, bt + 44, 317, 1010 - bt - 44, 'data-inv="1"')}${box(433, bt + 44, 317, 1010 - bt - 44, 'data-inv="1"')}`);
      },

      "reading": (is, s) => page(`
        ${kicker(is)}${folio(`right:${P(66)};top:${P(52)}`)}
        ${qblock(s, "row", `left:${P(66)};top:${P(110)};width:${P(684)}`, 330, 120, 44)}
        ${below(66, 317, 990)}${below(433, 317, 990)}
        ${s.pull ? `<div class="blk band-auto" hidden></div><blockquote class="pq abs band-pull" style="left:${P(66)};width:${P(684)};color:var(--ink)" hidden>${esc(s.pull)}</blockquote>` : ""}`),

      // Split: black block + bleed photo (or a blank white panel when there's no photo)
      "split": (is, s) => page(`
        <div class="blk" style="left:0;top:0;width:${P(408)};height:${P(330)}"></div>
        ${s.photo ? img(s.photo, "photo", "", `left:0;top:${P(330)};width:${P(408)};height:${P(726)}`) : ""}
        ${qblock(s, "", `left:${P(50)};top:${P(56)};width:${P(320)};color:var(--ink)`, 240, 96, 34)}
        ${box(450, 70, 300, 490)}
        <div class="bar-q" style="left:${P(290)};top:${P(600)};width:${P(526)};height:${P(170)}" data-fitbar="1"><span>${esc(s.pull || is.pullQuote)}</span></div>
        ${box(450, 800, 300, 170)}
        ${folio(`right:${P(66)};top:${P(1000)}`)}`),

      // Statement: variant 0 = black top, variant 1 = black bottom
      "statement": (is, s, v) => v === 0 ? page(`
        <div class="blk" style="left:0;top:0;width:100%;height:${P(536)}"></div>
        ${kicker(is, true)}
        <div class="qb row abs" style="left:${P(66)};bottom:${P(1056 - 492)};width:${P(684)};color:var(--ink);--ns:120;--qs:44"><span class="q-num">${esc(s.n)}</span><h3 class="q-text">${esc(stripPeriod(s.q))}</h3></div>
        <div class="stmt framed" style="left:${P(66)};top:${P(572)};width:${P(684)};height:${P(352)}"><div class="stmt-in"></div></div>
        <div class="blk" style="left:0;top:${P(960)};width:100%;height:${P(96)}"></div>
        <div class="foot" style="color:var(--ink)"><span class="folio"></span><span>thisisnotrising.org</span></div>`) : page(`
        ${kicker(is)}${folio(`right:${P(66)};top:${P(52)}`)}
        <div class="qb row abs" style="left:${P(66)};top:${P(120)};width:${P(684)};--ns:120;--qs:44"><span class="q-num">${esc(s.n)}</span><h3 class="q-text">${esc(stripPeriod(s.q))}</h3></div>
        <div class="blk" style="left:0;top:${P(520)};width:100%;height:${P(536)}"></div>
        <div class="stmt" style="left:${P(66)};top:${P(590)};width:${P(684)};height:${P(380)};color:var(--ink)"></div>`),

      // Continued pages, in rotation
      cont: [
        (is, s) => page(`
          <div class="blk" style="left:0;top:0;width:${P(380)};height:${s.contPull ? "100%" : P(240)}"></div>
          <span class="cont-n" style="left:${P(50)};top:${P(56)};color:var(--ink)">${esc(s.n)}</span>
          <span class="cont-k" style="left:${P(50)};top:${P(186)};color:var(--ink)">Continued</span>
          ${box(433, 70, 317, 920)}
          ${s.contPull
            ? `<blockquote class="pq abs" style="left:${P(50)};top:${P(300)};width:${P(290)};font-size:${P(38)};color:var(--ink)">${esc(s.contPull)}</blockquote>
               <span class="pg" style="left:${P(50)};top:${P(1002)};color:var(--ink);font-size:${P(11.5)};letter-spacing:.2em;text-transform:uppercase">thisisnotrising.org</span>`
            : box(66, 290, 314, 700)}
          ${folio(`right:${P(66)};top:${P(1000)}`)}`),
        (is, s) => page(`
          <div class="blk" style="left:0;top:0;width:${P(150)};height:100%"></div>
          <span class="rail-t" style="left:${P(64)};top:${P(70)};color:var(--ink)">${esc(is.name)} | ${esc(is.publication)}</span>
          ${folio(`left:${P(52)};top:${P(1000)}`, true)}
          ${box(200, 80, 263, 900)}${box(503, 80, 263, 900)}`),
        (is, s) => page(`
          <div class="blk" style="left:${P(666)};top:0;width:${P(150)};height:100%"></div>
          <span class="rail-t" style="left:${P(730)};top:${P(70)};color:var(--ink)">${esc(is.name)} | ${esc(is.publication)}</span>
          ${folio(`left:${P(718)};top:${P(1000)}`, true)}
          ${box(50, 80, 263, 900)}${box(353, 80, 263, 900)}`)
      ]
    };

    // TIGHT > 0 means "this section spilled a few lines onto an extra page: try again with a smaller question"
    let TIGHT = 0;

    // After a layout is in the measuring room: size the question, then hang boxes under it
    function settle(pg) {
      pg.querySelectorAll("[data-fit]").forEach(el => {
        let q = +el.dataset.qs, n = +el.dataset.ns;
        const limit = +el.dataset.fit - TIGHT * 70;
        while (el.offsetHeight > limit && q > 22) {
          q -= 2; n = Math.max(72, n - 4);
          el.style.setProperty("--qs", q); el.style.setProperty("--ns", n);
        }
      });
      pg.querySelectorAll("[data-fitbar]").forEach(el => {
        const span = el.firstElementChild; let b = 24;
        while (span.offsetHeight > el.clientHeight - 24 && b > 14) { b -= 1; el.style.setProperty("--bs", b); }
      });
      pg.querySelectorAll("[data-fitq]").forEach(el => {        // shrink a band quote until it fits
        let f = 34;
        while (el.scrollHeight > el.clientHeight + 1 && f > 18) { f -= 2; el.style.fontSize = P(f); }
      });
      pg.querySelectorAll("[data-fitw]").forEach(el => {        // shrink a spotlight name until each word fits the width
        let f = 60;
        while (el.scrollWidth > el.clientWidth + 1 && f > 28) { f -= 2; el.style.fontSize = P(f); }
      });
      pg.querySelectorAll("[data-below]").forEach(el => {     // hang a box under another element
        const ref = pg.querySelector(el.dataset.below);
        const top = ref.offsetTop + ref.offsetHeight + 34;
        el.style.top = P(top);
        if (!el.dataset.bottom) return;                         // (a bar keeps its own height)
        const h = +el.dataset.bottom - top;
        if (h < 70) { el.remove(); return; }
        el.style.height = P(h);
      });
      pg.querySelectorAll("[data-stretchb]").forEach(el => {   // a band that ends level with the bottom of the question
        const ref = pg.querySelector(el.dataset.stretchb);
        el.style.height = P(ref.offsetTop + ref.offsetHeight);
      });
      pg.querySelectorAll("[data-stretch]").forEach(el => {    // a band that grows down to meet the bar
        const ref = pg.querySelector(el.dataset.stretch);
        el.style.height = P(ref.offsetTop + 1);
      });
      pg.querySelectorAll("[data-inv]").forEach(el => el.classList.add("inv"));
    }

    // Statement pages: pour the whole answer in and shrink it until it fits
    function fillStatement(pg, s) {
      const box = pg.querySelector(".stmt"), into = box.querySelector(".stmt-in") || box;
      into.innerHTML = s.blocks.filter(b => ["p", "quote", "li"].includes(b[0])).map(b => `<p>${esc(b[1])}</p>`).join("");
      let a = box.classList.contains("framed") ? 34 : box.classList.contains("bold") ? 56 : 30;       // bold answers start big and shrink to fill the space
      box.style.setProperty("--as", a);
      while (box.scrollHeight > box.clientHeight + 1 && a > 18) { a -= 1; box.style.setProperty("--as", a); }
      return box.scrollHeight <= box.clientHeight + 1;
    }

    const words = s => s.blocks.reduce((n, b) => n + (typeof b[1] === "string" && b[0] !== "img" ? b[1].split(" ").length : 0), 0);

    /* ============================================================
       B. THE PAGINATOR
       Builds every page in an invisible "measuring room". Text is
       poured into columns one block at a time. When a column
       overflows, the paragraph is split at the last word that fits
       (found by binary search: try half, then half of that…) and
       the rest moves on. Full columns make a new page.
       ============================================================ */
    const cache = {};
    const room = document.getElementById("nrns-measure");
    /* A preview is on until its "until" date (midnight, the reader's own time).
       Add ?full to the page address to proof the whole issue before then. */
    const inPreview = is => !!(is.preview && new Date() < new Date(is.preview.until + "T00:00:00") && !/[?&]full\b/.test(location.search));

    // Every image nickname an issue uses: the shared pages plus anything named in its own data
    function imagesFor(f, is) {
      const keys = new Set(["qr", EDITOR_LETTER.photo, EDITOR_LETTER.signature, f.cover]);
      JSON.stringify(is, (k, v) => { if (typeof v === "string" && IMAGES[v]) keys.add(v); return v; });
      return [...keys].filter(k => IMAGES[k]);
    }

    async function buildIssue(f) {
      if (cache[f.issue]) return cache[f.issue];
      const is = ISSUES[f.issue];

      // A finished book: cover, black inside cover, the printed pages, black inside cover, back cover
      if (is.kind === "pages") {
        // loading="lazy": a page's picture downloads only when the book is about to show it
        const imgPage = (url, alt, opts, lazy = false) => page(`<img class="cover-img" src="${url}" alt="${esc(alt)}" decoding="async"${lazy ? ' loading="lazy"' : ""}>`, opts);
        const inside = color => `<div class="page dark"><div class="sheet" style="background:${color}"></div></div>`;   // colour on the sheet: the page-flip library rewrites the page's own style
        const front = is.insideFront === undefined ? "#000" : is.insideFront, back = is.insideBack === undefined ? "#000" : is.insideBack;
        const html = [imgPage(src(f.cover), `${is.title}: cover`, { dark: true, hard: true })];
        if (front) html.push(inside(front));
        for (let n = 1; n <= is.pageCount; n++) html.push(imgPage(fileSrc(`${is.pageDir}p${two(n)}.${is.pageExt || "jpg"}`), `${is.title}: page ${n}`, undefined, n > 2));
        if (back) html.push(inside(back));
        html.push(imgPage(src(is.back), `${is.title}: back cover`, { dark: true, hard: true }));
        if (html.length % 2) console.warn(`${is.title}: odd page count (${html.length}); add or remove an inside cover`);
        return (cache[f.issue] = { html, goto: {} });
      }

      await Promise.all([
        loadImages(imagesFor(f, is)),
        document.fonts ? document.fonts.ready : null,
        ...(document.fonts ? ["700 16px Arimo", "500 16px Arimo", "400 16px Arimo", "italic 700 16px Arimo"].map(s => document.fonts.load(s).catch(() => {})) : [])
      ]);

      room.innerHTML = "";
      const pages = [], goto = {};
      const add = html => {
        const t = document.createElement("template");
        t.innerHTML = html.trim();
        const el = t.content.firstElementChild;
        room.appendChild(el); pages.push(el);
        return el;
      };

      // Front of book. Spreads: cover | copyright, blank | team, letter | name, contents | opener
      add(T.cover(f));
      add(T.copyright(is));
      add(T.blank());
      add(T.team());
      add(T.letter());
      add(T.name(is));
      add(T.toc(is));

      let cols = [], ci = 0, current = null;
      const pending = [];                                       // full-page photos wait for a page turn
      const flushPhotos = () => pending.splice(0).forEach(b => add(T.photo(b, is)));
      const col = () => cols[ci];
      const fits = c => c.scrollHeight <= c.clientHeight + 1;
      const used = c => { const l = c.lastElementChild; return l ? l.offsetTop + l.offsetHeight : 0; };

      let section = null, contTurn = 0, balancing = false;
      const OVER = {};
      function nextCol() {
        ci++;
        if (balancing) { if (ci >= cols.length) throw OVER; return; }
        if (ci >= cols.length) {                                // page is full: make a "continued" page
          flushPhotos();
          current = add(L.cont[contTurn++ % L.cont.length](is, section));
          current.dataset.cont = "1";
          settle(current);
          cols = [...current.querySelectorAll(".col")];
          ci = 0;
        }
      }

      function placeText(text, cls) {                           // paragraphs and list items
        const words = text.split(" ");
        let startAt = 0;
        while (startAt < words.length) {
          const c = col();
          const p = document.createElement("p");
          if (cls) p.className = cls;
          if (startAt > 0) p.classList.add("cont");
          p.textContent = words.slice(startAt).join(" ");
          c.appendChild(p);
          if (fits(c)) return;
          let lo = 0, hi = words.length - startAt - 1;          // binary search for the words that fit
          while (lo < hi) {
            const mid = Math.ceil((lo + hi) / 2);
            p.textContent = words.slice(startAt, startAt + mid).join(" ");
            if (fits(c)) lo = mid; else hi = mid - 1;
          }
          if (words.length - (startAt + lo) < 5) lo = Math.max(0, lo - 5);   // no one-word widows
          const emptyCol = c.children.length === 1;
          if (lo < 8 && !emptyCol) { c.removeChild(p); nextCol(); continue; } // no stray crumbs
          if (lo === 0) { p.textContent = words.slice(startAt).join(" "); return; }
          p.textContent = words.slice(startAt, startAt + lo).join(" ");
          p.classList.add("split");
          startAt += lo;
          nextCol();
        }
      }

      function placeWhole(el) {                                 // quotes and photos never split
        const c = col();
        c.appendChild(el);
        if (fits(c) || c.children.length === 1) return;
        c.removeChild(el);
        nextCol();
        col().appendChild(el);
      }

      /* Balance the last two columns of a question, magazine style: refill them with the
         first column made shorter and shorter until both columns end at about the same line. */
      function balanceEnd() {
        const same = (a, b) => a && b && Math.abs(a.offsetTop - b.offsetTop) < 2 && Math.abs(a.clientHeight - b.clientHeight) < 2 && a.classList.contains("inv") === b.classList.contains("inv");
        const k = same(cols[ci], cols[ci + 1]) ? ci : same(cols[ci - 1], cols[ci]) ? ci - 1 : -1;
        if (k < 0) return;
        const c1 = cols[k], c2 = cols[k + 1];
        const items = [];
        [...c1.children, ...c2.children].forEach(el => {
          const last = items[items.length - 1];
          if (el.tagName === "P" && el.classList.contains("cont") && last && last.text != null) last.text += " " + el.textContent;
          else if (el.tagName === "P") items.push({ text: el.textContent, cls: el.classList.contains("li") ? "li" : el.classList.contains("fq") ? "fq" : "" });
          else items.push({ node: el });
        });
        const full = c1.clientHeight, total = used(c1) + used(c2);
        if (!items.length || total < 60) return;
        const saved = [cols, ci];
        const refill = h => {
          c1.innerHTML = ""; c2.innerHTML = ""; c1.style.height = P(h);
          cols = [c1, c2]; ci = 0;
          items.forEach(it => it.node ? placeWhole(it.node) : placeText(it.text, it.cls || undefined));
        };
        /* Try every first-column height from half to full. Keep the one where the
           left column is as long as the right or just longer (never shorter),
           with the smallest difference: two even rectangles. */
        const lh = parseFloat(getComputedStyle(c1.querySelector("p") || c1).lineHeight) || 26;
        balancing = true;
        let best = null;
        for (let h = Math.ceil(total / 2); h <= full; h += 3) {
          try {
            refill(h);
            const diff = used(c1) - used(c2);
            const score = diff >= -2 ? diff : 1e6 - diff;      // left shorter = worst
            if (!best || score < best.score) best = { h, score };
            if (diff >= -2 && diff <= lh * 0.6) break;          // within half a line: done
          } catch (e) { if (e !== OVER) throw e; }
        }
        refill(best ? best.h : full);
        balancing = false;
        [cols, ci] = saved;
      }

      function figure(key) {
        const f = document.createElement("figure");
        f.className = "fig";
        f.innerHTML = img(key, "");
        return f;
      }

      // Which layout does each question get? The data can choose (layout: "split"…);
      // otherwise short answers become statements and the rest alternate bands.
      let statementTurn = 0, bandTurn = 0;
      const pick = s => {
        if (s.layout) return s.layout;
        if (words(s) <= 45) return "statement";
        return bandTurn++ % 2 ? "band-top" : "band-bottom";
      };

      function runSection(s, i) {
        section = s; contTurn = 0;
        if (i === 0) {
          current = add(T.opener(is));
        } else {
          let layout = pick(s);
          if (layout === "statement") {
            const v = s.blackAt === "bottom" ? 1 : 0;           // every statement page uses the black-top design
            current = add(L.statement(is, s, v));
            if (fillStatement(current, s)) { goto["q" + s.n] = pages.length - 1; return; }
            current.remove(); pages.pop(); layout = "band-bottom";   // too long for a statement page
          }
          current = add(L[layout](is, s));
          if (TIGHT) current.classList.add("tight" + TIGHT);     // tighter quoted voices on a retry
          settle(current);
        }
        goto["q" + s.n] = pages.length - 1;
        cols = [...current.querySelectorAll(".col")]; ci = 0;

        s.blocks.forEach(b => {
          const [type, val] = b;
          if (type === "p") placeText(val);
          else if (type === "li") placeText(val, "li");
          else if (type === "fq") placeText(val, "fq");          // quoted voices: pull-quote style, can continue in the next column
          else if (type === "quote") { const q = document.createElement("blockquote"); q.className = "pq"; q.textContent = val; placeWhole(q); }
          else if (type === "img") placeWhole(figure(val));
          else if (type === "photoPage") pending.push(b);
          else if (type === "break") {                         // jump to the next text box
            const c = col(), band = current.querySelector(".band");
            if (c.classList.contains("lead") && band) {          // list layout: the band starts right under the lead-in
              const top = c.offsetTop + used(c) + 32;
              c.style.height = P(used(c));
              band.style.top = P(top); band.style.height = P(1056 - top);
              cols.slice(ci + 1).forEach(b => { b.style.top = P(top + 50); b.style.height = P(990 - top - 50); });
            }
            nextCol();
          }
        });
        balanceEnd();
        // Reading pages: a black band with the pull quote starts right under the text
        const qPage = pages[goto["q" + s.n]], band = qPage && qPage.querySelector(".band-auto");
        if (band) {
          const bottom = Math.max(...[...qPage.querySelectorAll(".col")].map(c => c.offsetTop + used(c)));
          const top = bottom + 56, pull = qPage.querySelector(".band-pull");
          if (top < 830) {                                      // only when the band can be at least ~230 tall
            band.hidden = false; pull.hidden = false;
            band.style.cssText = `left:0;width:100%;top:${P(top)};height:${P(1056 - top)}`;
            pull.style.top = P(top + Math.min(60, (1056 - top) * 0.2));
            let f = 44; pull.style.fontSize = P(f);
            while (pull.offsetTop + pull.offsetHeight > 990 && f > 24) { f -= 2; pull.style.fontSize = P(f); }
          }
        }
      }

      // Lay out each question. If one spills only a few lines onto an extra
      // "continued" page, undo it and try again with a smaller question heading.
      is.sections.forEach((s, i) => {
        flushPhotos();
        const start = pages.length;
        runSection(s, i);
        for (let t = 1; t <= 2; t++) {
          const last = pages[pages.length - 1];
          if (pages.length - start < 2 || !last.dataset.cont) break;
          const cs = [...last.querySelectorAll(".col")];
          const fill = cs.reduce((a, c) => a + used(c), 0) / cs.reduce((a, c) => a + c.clientHeight, 0);
          if (fill > 0.3) break;                                // a real continuation, keep it
          pages.splice(start).forEach(p => p.remove());
          pending.length = 0;
          TIGHT = t; runSection(s, i); TIGHT = 0;
        }
      });
      flushPhotos();

      // Back of book
      if (inPreview(is)) {
        // PREVIEW: keep the first pages, then the "Full issue releases" page and the back cover
        const keep = is.preview.pages;
        pages.splice(keep).forEach(p => p.remove());
        add(T.previewEnd(f, is));
        if ((pages.length + 1) % 2 !== 0) add(page("", { dark: true }));   // covers sit alone, so the count must be even
        add(T.back(is));
        for (const k in goto) if (goto[k] >= keep) goto[k] = keep;          // contents links past the cut land on the preview page
      } else {
        const nextF = FEATURES[FEATURES.indexOf(f) + 1];
        if ((pages.length + (nextF ? 1 : 0) + 1) % 2 !== 0) add(T.quote(is)); // covers sit alone, so the count must be even
        if (nextF) add(T.next(nextF));
        add(T.back(is));
      }

      pages.forEach((p, i) => { const fo = p.querySelector(".folio"); if (fo) fo.textContent = two(i + 1); });
      const built = { html: pages.map(p => p.outerHTML), goto };
      room.innerHTML = "";
      return (cache[f.issue] = built);
    }

    /* ============================================================
       C1. THE RACK
       ============================================================ */
    const tabsEl = document.getElementById("nrns-tabs");
    const pocketsEl = document.getElementById("nrns-pockets");
    const monthYear = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const { MEMOIRS = [], UPCOMING_NOTE = "Coming soon", RELEASE_MONTH = "December" } = window.NR;
    const noteEl = document.getElementById("nrns-note");

    // Tabs: every range that holds an issue, plus the next empty range (so readers
    // can see more is coming), plus MEMOIRS and COLUMNS on their own at the right.
    const hasIssues = ([a, b]) => FEATURES.some((f, i) => i + 1 >= a && i + 1 <= b);
    const tabs = [];
    TABS.forEach(r => {
      if (hasIssues(r)) tabs.push({ key: r.join("-"), label: `${two(r[0])}–${two(r[1])}`, range: r });
      else if (!tabs.some(t => t.upcoming)) tabs.push({ key: r.join("-"), label: `${two(r[0])}–${two(r[1])}`, range: r, upcoming: true });
    });
    tabs.push({ key: "memoirs", label: "Memoirs", memoirs: true });
    // COLUMNS tab: switched off for now. To bring it back, delete the two slashes at the start of the next line.
    // tabs.push({ key: "columns", label: "Columns", columns: true, upcoming: true }); // COLUMNS: dimmed like an upcoming tab until the first column arrives

    function renderTabs(activeKey) {
      tabsEl.innerHTML = "";
      tabs.forEach(t => {
        const el = document.createElement("button");
        el.type = "button"; el.setAttribute("role", "tab");
        el.className = "tab" + (t.upcoming ? " upcoming" : "") + (t.memoirs ? " memoirs" : "");
        el.setAttribute("aria-selected", String(t.key === activeKey));
        el.setAttribute("aria-label", t.label);
        el.innerHTML = `<span class="tb">${tiles(t.label.toUpperCase(), t.label.length * 3)}</span>`;   // a little letter board
        el.addEventListener("click", () => { renderTabs(t.key); renderShelf(t); });
        tabsEl.appendChild(el);
      });
    }

    // One pocket on the rack: a cover (or stand-in), or an empty slot
    function pocket(item, tagText, n) {
      const el = document.createElement("div");
      el.className = "pocket";
      if (!item) {
        // An issue slot with nothing in it yet gets a "coming soon" note; empty memoir slots stay bare
        el.innerHTML = `<div class="empty" aria-hidden="true">${tagText ? '<span class="slip">Coming soon</span>' : ""}</div>`;
      } else {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cover-btn" + (item.cover ? "" : " placeholder");   // grey stand-in only when there is no cover yet
        let soon = `${item.name}: Digital Issue\nComing ${RELEASE_MONTH} ${n}`;   // issue 2 -> "Jennifer Hong: Digital Issue / Coming December 2" (the CSS shows it in capitals)
        if (item.soon) soon = item.soon;                                    // a memoir can say its own "coming soon" line (see MEMOIRS in data.js)
        btn.setAttribute("aria-label", item.issue ? `Open ${tagText}: ${item.name}` : `${tagText}. ` + soon.replace("\n", " "));
        btn.innerHTML = item.cover
          ? `<img src="${thumb(item.cover)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${src(item.cover)}'">`
          : `<div class="ph"><div class="ph-mast">NOT RISING</div><div class="ph-date">ISSUE ${two(n)} | ${esc(monthYear(item.date).toUpperCase())}</div><div class="ph-photo"><span class="ph-name">${esc(item.name)}</span></div></div>`;
        btn.addEventListener("click", () => item.issue ? openIssue(item, btn) : toast(soon));
        const stack = document.createElement("div");
        stack.className = "stack";
        el.append(stack, btn);
      }
      el.insertAdjacentHTML("beforeend", `<span class="glass" aria-hidden="true"></span>${tagText ? `<span class="tag" aria-hidden="true">${esc(tagText)}</span>` : ""}`);
      return el;
    }

    function renderShelf(t) {
      pocketsEl.innerHTML = "";
      noteEl.hidden = true;
      if (t.memoirs) {
        const slots = Math.max(5, Math.ceil(MEMOIRS.length / 5) * 5);
        for (let i = 0; i < slots; i++) pocketsEl.appendChild(pocket(MEMOIRS[i], MEMOIRS[i] ? (MEMOIRS[i].tag || `NO. ${two(i + 1)}`) : "", i + 1));
        return;
      }
      if (t.columns) { // COLUMNS: one row of empty glass sleeves and a "Coming soon" placard
        for (let i = 0; i < 5; i++) pocketsEl.appendChild(pocket(null, "", i + 1));
        noteEl.innerHTML = `Columns<small>Coming soon</small>`;
        noteEl.hidden = false;
        return;
      }
      const [a, b] = t.range;
      for (let n = a; n <= b; n++) pocketsEl.appendChild(pocket(FEATURES[n - 1], `ISSUE ${two(n)}`, n));
      if (t.upcoming) {
        noteEl.innerHTML = `Issues ${two(a)}–${two(b)}<small>${esc(UPCOMING_NOTE)}</small>`;
        noteEl.hidden = false;
      }
    }
    renderTabs(tabs[0].key);
    renderShelf(tabs[0]);

    let toastTimer;
    let toastBack = null;                                        // the cover that opened the marquee, so focus can go back to it
    let lastInput = "mouse";                                     // was the last thing the visitor did a click/tap or a key press?
    document.addEventListener("pointerdown", () => (lastInput = "mouse"), true);
    document.addEventListener("keydown", () => (lastInput = "key"), true);
    function closeToast() {
      const t = document.getElementById("nrns-toast");
      if (t.hidden) return;
      t.hidden = true;
      if (toastBack && document.contains(toastBack)) toastBack.focus({ preventScroll: true });   // keyboard users go back to the cover they were on
      toastBack = null;
    }
    function toast(msg) {
      // Builds the marquee board. Same message already up? Leave it alone (no rebuild, no twitch).
      const t = document.getElementById("nrns-toast");
      if (!t.hidden && t.dataset.msg === msg) return;
      t.dataset.msg = msg;
      t.innerHTML = "";                                         // clear the last message
      const add = (tag, cls, text) => { const el = document.createElement(tag); if (cls) el.className = cls; if (text != null) el.textContent = text; t.appendChild(el); return el; };

      add("span", "mq-sr", msg.replace("\n", ". "));            // what screen readers hear
      const orn = add("div", "mq-orn");                          // the "oOo" ornament
      orn.setAttribute("aria-hidden", "true");
      orn.innerHTML = "o<b>O</b>o";

      let k = 0;                                                 // counts every letter on the board
      msg.split("\n").forEach(line => {                          // one row per line of text
        const row = add("div", "mq-row");
        row.setAttribute("aria-hidden", "true");
        [...line].forEach(ch => {                                // one tile per letter
          const tile = document.createElement("span");
          tile.className = "mq-tile";
          tile.textContent = ch === " " ? "\u00a0" : ch;    // \u00a0 = a space that won't collapse
          // Hand-placed look: each letter sits a hair off-level. The amounts come from the
          // letter's position (not Math.random), so the board looks the same every time it opens.
          const lift = (((k * 7) % 5) - 2) * 4 / 10;             // -0.8 to 0.8 px
          const tilt = (((k * 3) % 7) - 3) * 3 / 10;             // -0.9 to 0.9 degrees
          tile.style.transform = `translateY(${lift}px) rotate(${tilt}deg)`;
          row.appendChild(tile);
          k++;
        });
      });

      const x = add("button", "mq-x", "\u00d7");            // \u00d7 = the x-shaped times sign
      x.type = "button";
      x.setAttribute("aria-label", "Close");
      x.addEventListener("click", closeToast);

      if (t.hidden) toastBack = lastInput === "key" ? document.activeElement : null;   // opened with the keyboard? remember the cover (first open only)
      t.hidden = false;
      t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";   // replay the fade-in when the message changes
      if (toastBack) x.focus({ preventScroll: true });           // keyboard users land on the x (Enter or Esc closes); mouse clicks skip this, so no focus box on the x
    }
    // Escape key also closes the marquee
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeToast(); });

    /* ============================================================
       C2. THE READER
       Lifts the cover out of its pocket, flies it to the reading
       spot, then hands the pages to StPageFlip.
       ============================================================ */
    const reader = document.getElementById("nrns-reader");
    const sizer = document.getElementById("nrns-sizer");
    const stage = document.getElementById("nrns-stage");
    const counter = document.getElementById("nrns-counter");
    const btnPrev = document.getElementById("nrns-prev");
    const btnNext = document.getElementById("nrns-next");
    const btnClose = document.getElementById("nrns-close");
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let book = null, built = null, openBtn = null;

    function pageSize() {                                       // how big can one page be here?
      const r = stage.getBoundingClientRect();
      const W = r.width - 32, H = r.height - 16, ratio = 816 / 1056;
      const fromH = H * ratio;
      const spread = W / 2 >= 300;                              // room for two pages side by side?
      const w = Math.floor(spread ? Math.min(fromH, W / 2) : Math.min(fromH, W));
      return { w, h: Math.floor(w / ratio), spread };
    }

    function mountBook(startPage = 0) {
      if (book) { book.destroy(); book = null; }
      sizer.innerHTML = "";
      const el = document.createElement("div");
      sizer.appendChild(el);
      el.innerHTML = built.html.join("");
      const { w, h, spread } = pageSize();
      sizer.style.width = (spread ? w * 2 : w) + "px";
      book = new St.PageFlip(el, {
        width: w, height: h, size: "fixed", showCover: true, usePortrait: !spread,
        maxShadowOpacity: 0.45, flippingTime: 750, mobileScrollSupport: false, startPage
      });
      book.loadFromHTML(el.querySelectorAll(".page"));
      book.on("flip", e => updateCounter(e.data));
      updateCounter(startPage);
    }

    function updateCounter(i) {
      const n = book.getPageCount();
      counter.textContent = `${i + 1} / ${n}`;
      btnPrev.disabled = i <= 0;
      btnNext.disabled = i >= n - 1;
    }

    async function openIssue(f, btn) {
      openBtn = btn;
      const is = ISSUES[f.issue];
      document.getElementById("nrns-reader-title").textContent = is.title || `Issue ${two(is.number)} · ${is.name}`;
      const link = document.getElementById("nrns-site-link");
      link.hidden = !f.url;
      if (f.url) link.href = f.url;
      built = await buildIssue(f);

      const from = btn.getBoundingClientRect();
      reader.hidden = false;
      reader.style.opacity = "0";
      document.documentElement.style.overflow = "hidden";       // the page behind stops scrolling
      mountBook(0);
      btn.classList.add("lifted");

      const target = [...sizer.querySelectorAll(".stf__item")].find(p => p.style.display !== "none");
      const to = target ? target.getBoundingClientRect() : sizer.getBoundingClientRect();
      if (reduceMotion || !target) { reader.style.opacity = "1"; btnClose.focus(); return; }

      const flyer = document.createElement("img");
      flyer.className = "nrns-flyer";
      flyer.src = src(f.cover);
      Object.assign(flyer.style, { left: from.left + "px", top: from.top + "px", width: from.width + "px", height: from.height + "px" });
      document.body.appendChild(flyer);
      const dx = to.left - from.left, dy = to.top - from.top, s = to.width / from.width;
      reader.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 250, fill: "forwards", easing: "ease-out" });
      await flyer.animate([
        { transform: "translate(0,0) scale(1) rotate(0deg)", transformOrigin: "0 0" },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 40}px) scale(${1 + (s - 1) * 0.5}) rotate(-3deg)`, transformOrigin: "0 0", offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0deg)`, transformOrigin: "0 0" }
      ], { duration: 700, easing: "cubic-bezier(.3,.7,.2,1)", fill: "forwards" }).finished;
      reader.style.opacity = "1";
      flyer.remove();
      btnClose.focus();
    }

    function closeReader() {
      if (reader.hidden) return;
      const done = () => {
        reader.hidden = true;
        document.documentElement.style.overflow = "";
        if (book) { book.destroy(); book = null; }
        sizer.innerHTML = "";
        if (openBtn) {
          openBtn.classList.remove("lifted");
          if (!reduceMotion) openBtn.animate([{ transform: "perspective(900px) translateY(-30px)" }, { transform: "perspective(900px) rotateX(6deg)" }], { duration: 420, easing: "cubic-bezier(.3,1.4,.5,1)" });
          openBtn.focus();
        }
      };
      if (reduceMotion) return done();
      reader.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).finished.then(done);
    }

    btnClose.addEventListener("click", closeReader);
    btnPrev.addEventListener("click", () => book && book.flipPrev());
    btnNext.addEventListener("click", () => book && book.flipNext());
    document.addEventListener("keydown", e => {
      if (reader.hidden || !book) return;
      if (e.key === "Escape") closeReader();
      if (e.key === "ArrowRight") book.flipNext();
      if (e.key === "ArrowLeft") book.flipPrev();
    });
    // "In this issue" links jump to the page where that question starts
    sizer.addEventListener("click", e => {
      const go = e.target.closest("[data-goto]");
      if (go && book && built.goto[go.dataset.goto] != null) book.flip(built.goto[go.dataset.goto]);
    });
    /* Camera flashes: every few seconds, one or two soft flashes go off,
       mostly near the edges, like photographers along the red carpet.
       They pause while a magazine is open or the tab is in the background,
       and never run for people who ask their device for reduced motion. */
    // Marquee: turn the word into letter tiles
    const marquee = document.getElementById("nrns-marquee");
    if (marquee) marquee.innerHTML = tiles(marquee.textContent.trim());

    /* Vanity bulbs: big frosted globes around the rack, like a dressing-room mirror.
       Drawn by the script so they space evenly at any width, and redrawn on resize. */
    /* Draw a ring of vanity globes inside an element. sides = which edges get bulbs. */
    function drawGlobes(el, { sides = ["top", "left", "right"], big = 16, edgeBig = 28, gapBig = 92 } = {}) {
      if (!el) return;
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      const k = W < 640 ? .7 : 1;
      const r = big * k, edge = edgeBig * k, target = gapBig * k;
      const pts = [];
      const row = y => { const n = Math.max(2, Math.round((W - 2 * edge) / target)); for (let i = 0; i <= n; i++) pts.push([edge + (W - 2 * edge) * i / n, y]); };
      const col = x => { const n = Math.max(1, Math.round((H - 2 * edge) / target)); for (let j = 0; j <= n; j++) pts.push([x, edge + (H - 2 * edge) * j / n]); };
      if (sides.includes("top")) row(edge);
      if (sides.includes("bottom")) row(H - edge);
      if (sides.includes("left")) col(edge);
      if (sides.includes("right")) col(W - edge);
      const seen = new Set(), uniq = pts.filter(p => { const id = p.map(v => Math.round(v)).join(","); return !seen.has(id) && seen.add(id); });
      // One vintage Edison bulb: a soft halo, a dark socket nub peeking out the base,
      // amber glass with a glowing filament curve, and a small highlight
      const globe = ([x, y]) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle class="halo" r="${r * 3.4}" fill="url(#nrns-halo)"/>
        <ellipse cx="0" cy="${(r * .72).toFixed(1)}" rx="${(r * .34).toFixed(1)}" ry="${(r * .4).toFixed(1)}" fill="url(#nrns-nub)"/>
        <circle r="${r}" fill="url(#nrns-globe)"/>
        <circle r="${r}" fill="none" stroke="#fff3cf" stroke-opacity=".5" stroke-width="1"/>
        <path d="M ${(-r * .26).toFixed(1)} ${(-r * .22).toFixed(1)} Q 0 ${(r * .22).toFixed(1)} ${(r * .26).toFixed(1)} ${(-r * .22).toFixed(1)}" fill="none" stroke="#fff6da" stroke-width="${Math.max(1, r * .11).toFixed(2)}" stroke-linecap="round" filter="url(#nrns-fglow)"/>
        <ellipse cx="${-r * .32}" cy="${-r * .38}" rx="${r * .32}" ry="${r * .2}" fill="#fff" opacity=".55"/></g>`;
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <defs>
          <radialGradient id="nrns-globe" cx=".44" cy=".4" r=".62"><stop offset="0" stop-color="#fffdf2"/><stop offset=".3" stop-color="#ffe7a8"/><stop offset=".6" stop-color="#ffbf5e"/><stop offset=".85" stop-color="#e68a3a"/><stop offset="1" stop-color="#b0631f"/></radialGradient>
          <radialGradient id="nrns-halo"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".55"/><stop offset=".35" stop-color="#ffc874" stop-opacity=".2"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
          <radialGradient id="nrns-nub" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#6b5033"/><stop offset="1" stop-color="#2a1d10"/></radialGradient>
          <filter id="nrns-fglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation=".6"/></filter>
        </defs>
        ${uniq.map(globe).join("")}</svg>`;
    }
    const lightsEl = document.getElementById("nrns-lights");            // the rack: top and both sides
    const signLights = document.getElementById("nrns-sign-lights");     // the marquee: all four sides, smaller globes
    const drawAll = () => {
      drawGlobes(lightsEl);
      drawGlobes(signLights, { sides: ["top", "bottom", "left", "right"], big: 10, edgeBig: 18, gapBig: 56 });
    };
    drawAll();
    if ("ResizeObserver" in window) { const ro = new ResizeObserver(drawAll); [lightsEl, signLights].forEach(e => e && ro.observe(e)); }

    const flashLayer = stand.querySelector(".flashes");
    if (flashLayer) {
      // One photographer = a spot near the edge; a "shot" = 1 to 3 quick flashes from that spot
      const flash = (x, y) => {
        const f = document.createElement("span");
        f.className = "flash";
        f.style.left = x + "%"; f.style.top = y + "%";
        const sc = 0.55 + Math.random() * 0.6;
        const wash = document.createElement("span");          // the flash lights up the room a touch
        wash.className = "flash-wash";
        wash.style.setProperty("--x", x + "%"); wash.style.setProperty("--y", y + "%");
        flashLayer.append(wash, f);
        const grow = reduceMotion ? [1, 1, 1] : [sc * 0.5, sc, sc * 1.1];   // reduced motion: fade only, no zoom
        f.animate([
          { opacity: 0, transform: `scale(${grow[0]})` },
          { opacity: 1, transform: `scale(${grow[1]})`, offset: 0.1 },
          { opacity: 0, transform: `scale(${grow[2]})` }
        ], { duration: 650, easing: "ease-out" }).finished.then(() => f.remove());
        wash.animate([{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 0 }], { duration: 650, easing: "ease-out" }).finished.then(() => wash.remove());
      };
      const shot = () => {
        const left = Math.random() < 0.5;
        const x = Math.random() < 0.75 ? (left ? 2 + Math.random() * 14 : 84 + Math.random() * 14) : 15 + Math.random() * 70;
        const y = 10 + Math.random() * 82;
        const burst = reduceMotion ? 1 : 1 + Math.floor(Math.random() * 3);   // 1, 2 or 3 clicks
        for (let k = 0; k < burst; k++) setTimeout(() => flash(x + (Math.random() * 2 - 1), y + (Math.random() * 2 - 1)), k * 140);
      };
      const loop = () => {
        if (!document.hidden && reader.hidden) shot();
        setTimeout(loop, (reduceMotion ? 3500 : 1200) + Math.random() * 2400);
      };
      setTimeout(loop, 900);
    }

    let resizeTimer;
    addEventListener("resize", () => {
      if (reader.hidden || !book) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => mountBook(book.getCurrentPageIndex()), 200);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
