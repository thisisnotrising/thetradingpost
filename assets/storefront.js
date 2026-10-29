/* ============================================================
   NOT RISING · THE TRADING POST — THE ENGINE
   Reads the data file (data.js, PART 2) and brings the street to life:
     1. signs and letter tiles      5. the seasonal leaf frame
     2. bulbs and string lights      6. falling leaves
     3. posters and magazine covers  7. doors that open (and take you through)
     4. pumpkins
   ============================================================ */
(function () {
  "use strict";

  function start() {
    const root = document.getElementById("nrsf");
    if (!root || !window.NRSF) return;
    const { LINKS, SIGNS, SEASON, SEASONS, FALLBACK_SEASON, POSTERS } = window.NRSF;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const PREVIEW = !!window.NRSF_PREVIEW;            // true only in the standalone mockup
    const INLINE = window.NRSF_INLINE || {};
    const BASE = window.NRSF_BASE || "";              // the storefront's image folder
    const NS_BASE = window.NRNS_BASE || "";           // the newsstand's image folder (for covers)
    const img = (path, base = BASE) => INLINE[path] || base + path;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    // A repeatable "random" number: the same seed always gives the same answer,
    // so the leaves land in the same places on every visit.
    let seed = 7;
    const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    /* ---------- Season: picked by today's date ---------- */
    const m = new Date().getMonth() + 1;
    const byDate = m >= 9 && m <= 11 ? "fall" : (m === 12 || m <= 2) ? "winter" : m <= 5 ? "spring" : "summer";
    let season = SEASON === "auto" ? byDate : SEASON;
    if (!SEASONS[season]) season = FALLBACK_SEASON;   // not built yet: use the fallback
    const S = SEASONS[season];
    root.dataset.season = season;

    /* ---------- 1. Signs ---------- */
    root.querySelectorAll("[data-sign]").forEach(el => { if (el.dataset.sign !== "marquee") el.textContent = SIGNS[el.dataset.sign] || ""; });
    root.querySelector(".nrsf-hanging-board span").innerHTML = esc(SIGNS.hanging).replace(/ (NOT)/, "<br>$1");
    // Letter tiles for the marquee: each letter a hair crooked, like someone on a ladder put them up
    const tiles = word => [...word].map((ch, i) => {
      if (ch === " ") return `<span class="lt sp"> </span>`;
      const a = Math.sin(i * 12.9898 + 4.1) * 43758.5453, f = a - Math.floor(a);
      const b = Math.sin(i * 78.233 + 1.7) * 12345.678, h = b - Math.floor(b);
      return `<span class="lt" aria-hidden="true" style="--rot:${((f - .5) * 3.4).toFixed(2)}deg;--dy:${((h - .5) * .06).toFixed(3)}em">${esc(ch)}</span>`;
    }).join("");
    const marquee = document.getElementById("nrsf-marquee");
    marquee.innerHTML = tiles(SIGNS.marquee);
    marquee.setAttribute("aria-label", SIGNS.marquee);

    /* ---------- 2. Bulbs ---------- */
    const DEFS = `<defs>
      <radialGradient id="nrsf-globe" cx=".45" cy=".42" r=".62"><stop offset="0" stop-color="#fffef8"/><stop offset=".55" stop-color="#fff0c8"/><stop offset=".85" stop-color="#ffd98a"/><stop offset="1" stop-color="#e9b25a"/></radialGradient>
      <radialGradient id="nrsf-halo"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".55"/><stop offset=".35" stop-color="#ffc874" stop-opacity=".2"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
      <radialGradient id="nrsf-glass" cx=".5" cy=".55" r=".65"><stop offset="0" stop-color="#fff6d8"/><stop offset=".5" stop-color="#ffd690" stop-opacity=".95"/><stop offset="1" stop-color="#e8a24a" stop-opacity=".85"/></radialGradient></defs>`;

    // Globe bulbs all the way round a box (the marquee)
    function drawGlobes(el) {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      const k = root.clientWidth < 640 ? .7 : 1, r = 9 * k, edge = 14 * k, target = 46 * k;
      const pts = [];
      const nx = Math.max(2, Math.round((W - 2 * edge) / target)), ny = Math.max(1, Math.round((H - 2 * edge) / target));
      for (let i = 0; i <= nx; i++) { const x = edge + (W - 2 * edge) * i / nx; pts.push([x, edge], [x, H - edge]); }
      for (let j = 1; j < ny; j++) { const y = edge + (H - 2 * edge) * j / ny; pts.push([edge, y], [W - edge, y]); }
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}${pts.map(([x, y]) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle r="${r * 3.2}" fill="url(#nrsf-halo)"/><circle r="${r}" fill="url(#nrsf-globe)"/>
        <ellipse cx="${-r * .32}" cy="${-r * .38}" rx="${r * .32}" ry="${r * .2}" fill="#fff" opacity=".7"/></g>`).join("")}</svg>`;
    }

    // String lights under the fascia: a cord in shallow swags, an Edison bulb hanging from each dip
    function drawStrand(el) {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      const small = root.clientWidth < 640, sc = small ? .62 : 1;
      const swags = small ? 3 : 5, y0 = 4, sag = H * .32, parts = [], bulbs = [];
      const q = (t, a, c, b) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * b;
      for (let i = 0; i < swags; i++) {
        const x0 = W * i / swags, x1 = W * (i + 1) / swags, cx = (x0 + x1) / 2, cy = y0 + sag * 2;
        parts.push(`M${x0} ${y0} Q${cx} ${cy} ${x1} ${y0}`);
        const n = small ? 3 : 4;
        for (let k = 0; k < n; k++) bulbs.push([q((k + .5) / n, x0, cx, x1), q((k + .5) / n, y0, cy, y0)]);
      }
      const bulb = ([x, y], i) => {
        const a = Math.sin(i * 91.7) * 9999, f = a - Math.floor(a), drop = 4 + f * 5;
        return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc})">
          <circle cx="0" cy="${drop + 24}" r="34" fill="url(#nrsf-halo)"/>
          <path d="M0 0 V${drop}" stroke="#111" stroke-width="2"/>
          <rect x="-4.6" y="${drop}" width="9.2" height="12" rx="1.6" fill="#0d0d0d"/>
          <path d="M-4 ${drop + 12} C-7.8 ${drop + 15} -7.8 ${drop + 32} 0 ${drop + 35} C7.8 ${drop + 32} 7.8 ${drop + 15} 4 ${drop + 12} Z" fill="url(#nrsf-glass)"/>
          <path d="M-2.4 ${drop + 21} q.8 -2 1.6 0 t1.6 0 t1.6 0" stroke="#fffbe8" stroke-width="1.1" fill="none"/></g>`;
      };
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}
        <path d="${parts.join(" ")}" fill="none" stroke="#050505" stroke-width="2.6" stroke-linecap="round"/>${bulbs.map(bulb).join("")}</svg>`;
    }

    /* ---------- 3. Posters and covers ---------- */
    const linkFor = key => LINKS[key] || key;
    document.getElementById("nrsf-posters").innerHTML = POSTERS.map(p => {
      const href = linkFor(p.link), ext = /^https?:/.test(href);
      const attrs = `href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ` data-link="${esc(p.link)}"`}`;
      if (p.kind === "bestseller") return `<a class="nrsf-poster" ${attrs} aria-label="${esc(p.book)} by ${esc(p.author)}, ${esc(p.rank)} NOT RISING Magazine Best Storyteller">
          <span class="nrsf-p-best"><div class="rank">${esc(p.rank)}</div><div class="mast">NOT RISING</div><div class="sub">MAGAZINE BEST STORYTELLER</div>
          <img src="${img(p.cover)}" alt="" loading="lazy">
          <div class="by">NEW BOOK BY <b>${esc(p.author.toUpperCase())}</b></div><div class="title">${esc(p.book.toUpperCase())}</div></span></a>`;
      return `<a class="nrsf-poster" ${attrs} aria-label="Now playing at the Speakeasy: ${esc(p.act)}, ${esc(p.note)}">
          <span class="nrsf-p-now"><div class="k">NOW PLAYING</div><div class="at">The Speak</div><div class="act">${esc(p.act)}</div>
          <div class="soon">${esc(p.note)}</div><div class="addr">Door 9¾ · ${esc(SIGNS.address)}</div></span></a>`;
    }).join("");

    // Covers come from the newsstand's own data, so new issues appear in the window automatically
    const NR = window.NR;
    if (NR) {
      document.getElementById("nrsf-covers").innerHTML = NR.FEATURES.filter(f => f.cover).slice().reverse()
        .map(f => `<img src="${img("thumbs/" + NR.IMAGES[f.cover], NS_BASE)}" alt="" loading="lazy" decoding="async" data-full="${img(NR.IMAGES[f.cover], NS_BASE)}">`).join("");
      // No thumbnail yet? Fall back to the full-size cover
      document.querySelectorAll("#nrsf-covers img").forEach(im => im.addEventListener("error", () => { if (im.src !== im.dataset.full) im.src = im.dataset.full; }, { once: true }));
    }

    /* ---------- 4. Pumpkins (small white ones) ---------- */
    const pumpkin = (w, x, tilt) => {
      const h = w * .62;
      return `<svg width="${w}" height="${h + w * .2}" viewBox="0 0 100 82" style="left:${x}%;transform:rotate(${tilt}deg)">
        <path d="M50 22 C52 12 56 6 62 4" stroke="#5b4a2a" stroke-width="5" fill="none" stroke-linecap="round"/>
        <ellipse cx="22" cy="52" rx="20" ry="27" fill="#d9d3c4"/><ellipse cx="78" cy="52" rx="20" ry="27" fill="#d9d3c4"/>
        <ellipse cx="36" cy="51" rx="20" ry="29" fill="#ece7da"/><ellipse cx="64" cy="51" rx="20" ry="29" fill="#ece7da"/>
        <ellipse cx="50" cy="50" rx="17" ry="30" fill="#f7f4ec"/>
        <path d="M50 22 C46 40 46 64 50 80 M36 23 C28 40 28 64 36 79 M64 23 C72 40 72 64 64 79" stroke="#c9c1ae" stroke-width="1.6" fill="none"/>
        <ellipse cx="44" cy="36" rx="5" ry="9" fill="#fff" opacity=".7"/></svg>`;
    };

    /* ---------- 5. The leaf frame ---------- */
    // One maple leaf, drawn in a 100×100 box
    const MAPLE = "M50 2 L56 20 L66 14 L64 32 L80 24 L76 38 L96 36 L84 50 L92 56 L70 66 L72 76 L54 70 L52 98 L48 98 L46 70 L28 76 L30 66 L8 56 L16 50 L4 36 L24 38 L20 24 L36 32 L34 14 L44 20 Z";
    const VEINS = "M50 96 L50 22 M50 62 L18 40 M50 62 L82 40 M50 70 L26 66 M50 70 L74 66";
    const frameEl = document.getElementById("nrsf-frame");
    function drawFrame() {
      const W = root.clientWidth, H = root.clientHeight;
      if (!W || !H) return;
      seed = 7;
      const small = W < 640, base = small ? 15 : 24, leaves = [], stems = [];
      const pal = S.leaves;
      const leaf = (x, y, s, rot, sway) => leaves.push({ x, y, s, rot, c: pal[Math.floor(rand() * pal.length)], sway });
      // Top: a thick canopy with strands hanging down at different lengths
      const topDepth = small ? 70 : 110;
      for (let x = -20; x < W + 20; x += base * .45) {
        const depth = topDepth * (.55 + rand() * .6) + (small ? 0 : Math.sin(x / W * Math.PI) * -10);
        const n = Math.round(depth / (base * .5));
        for (let k = 0; k < n; k++) leaf(x + (rand() - .5) * base, (k / n) * depth + rand() * 8 - 10, base * (.7 + rand() * .7), rand() * 360, true);
        if (rand() < .22) {                                             // a strand that trails down
          const len = depth + 30 + rand() * (small ? 70 : 140);
          stems.push(`M${x.toFixed(0)} 0 Q${(x + (rand() - .5) * 30).toFixed(0)} ${(len / 2).toFixed(0)} ${(x + (rand() - .5) * 14).toFixed(0)} ${len.toFixed(0)}`);
          for (let y = depth; y < len; y += base * .55) leaf(x + (rand() - .5) * base * .6, y, base * (.55 + rand() * .45), rand() * 360, true);
        }
      }
      // Sides: down the left and right edges, thinning toward the street
      const side = small ? 34 : 70;
      [0, 1].forEach(right => {
        for (let y = topDepth * .6; y < H; y += base * .42) {
          const t = y / H, width = side * (1.15 - t * .7) * (.6 + rand() * .7);
          const n = Math.max(1, Math.round(width / (base * .55)));
          for (let k = 0; k < n; k++) {
            const d = (k / n) * width + rand() * 6 - 8;
            leaf(right ? W - d : d, y + (rand() - .5) * base, base * (.65 + rand() * .65), rand() * 360, false);
          }
        }
      });
      // A few fallen leaves on the pavement
      for (let i = 0; i < (small ? 7 : 16); i++) leaf(rand() * W, H - 6 - rand() * (small ? 40 : 60), base * (.55 + rand() * .4), rand() * 360, false);

      const use = l => `<g transform="translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.rot.toFixed(0)}) scale(${(l.s / 100).toFixed(3)}) translate(-50 -50)">
        <path d="${MAPLE}" fill="${l.c}"/><path d="${VEINS}" stroke="rgba(0,0,0,.28)" stroke-width="2.4" fill="none"/></g>`;
      const swayers = leaves.filter(l => l.sway), still = leaves.filter(l => !l.sway);
      // Group the hanging leaves into a few clumps that move in the breeze
      const clumps = [[], [], [], []];
      swayers.forEach(l => clumps[Math.max(0, Math.min(3, Math.floor(l.x / W * 4)))].push(l));
      frameEl.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <path d="${stems.join(" ")}" stroke="${S.stems}" stroke-width="1.6" fill="none"/>
        ${still.map(use).join("")}
        ${clumps.map((c, i) => `<g class="sway" style="animation-delay:-${i * 1.7}s">${c.map(use).join("")}</g>`).join("")}</svg>`;
    }

    /* ---------- 6. Falling leaves, on a light breeze ---------- */
    const fallEl = document.getElementById("nrsf-fall");
    if (S.falling && !reduceMotion) {
      const drop = () => {
        const W = root.clientWidth, H = root.clientHeight, size = (W < 640 ? 14 : 22) * (.7 + Math.random() * .6);
        const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        el.setAttribute("viewBox", "0 0 100 100"); el.setAttribute("width", size); el.setAttribute("height", size);
        el.innerHTML = `<path d="${MAPLE}" fill="${S.leaves[Math.floor(Math.random() * S.leaves.length)]}"/>`;
        fallEl.appendChild(el);
        const x0 = Math.random() * W, drift = 60 + Math.random() * 160, spin = 180 + Math.random() * 360, dur = 7000 + Math.random() * 6000;
        const frames = [];
        for (let k = 0; k <= 8; k++) {
          const t = k / 8;
          frames.push({ transform: `translate(${x0 + drift * t + Math.sin(t * Math.PI * 3) * 24}px, ${-30 + (H + 60) * t}px) rotate(${spin * t}deg) rotateX(${Math.sin(t * 6) * 50}deg)`, opacity: t > .9 ? 1 - (t - .9) * 10 : 1 });
        }
        el.animate(frames, { duration: dur, easing: "linear" }).finished.then(() => el.remove());
      };
      const loop = () => { if (!document.hidden) drop(); setTimeout(loop, 900 + Math.random() * 1600); };
      for (let i = 0; i < 3; i++) setTimeout(drop, i * 700);
      setTimeout(loop, 2200);
    }

    /* ---------- 7. Doors and windows ---------- */
    const toastEl = document.getElementById("nrsf-toast");
    let toastTimer;
    const toast = msg => { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 3200); };
    const NAMES = { tradingPost: "the Trading Post", speakeasy: "the Speakeasy", newsstand: "the Newsstand" };
    root.querySelectorAll("[data-link]").forEach(a => {
      const key = a.dataset.link;
      a.setAttribute("href", linkFor(key));
      a.addEventListener("click", e => {
        e.preventDefault();
        const door = a.classList.contains("nrsf-door") ? a : null;
        if (door) door.classList.add("open");
        if (!LINKS[key]) {                                  // that room isn't open yet
          toast(`${NAMES[key] ? NAMES[key][0].toUpperCase() + NAMES[key].slice(1) : "This door"} opens soon.`);
          setTimeout(() => door && door.classList.remove("open"), 1600);
          return;
        }
        if (PREVIEW) {                                      // mockup: show where it goes, then close the door
          if (key === "speakeasy" && window.NRSF_SHOW_SPEAKEASY) { setTimeout(() => window.NRSF_SHOW_SPEAKEASY(), door ? 650 : 0); setTimeout(() => door && door.classList.remove("open"), 1400); return; }
          toast(`On the live site, this takes you into ${NAMES[key] || key} (${linkFor(key)}).`);
          setTimeout(() => door && door.classList.remove("open"), 1600);
          return;
        }
        if (reduceMotion) { location.href = linkFor(key); return; }
        // Step through: zoom toward the door, fade to black, then go
        const r = a.getBoundingClientRect(), s = root.getBoundingClientRect();
        root.querySelector(".nrsf-scene").style.transformOrigin = `${r.left - s.left + r.width / 2}px ${r.top - s.top + r.height / 2}px`;
        setTimeout(() => root.classList.add("leaving"), door ? 450 : 0);
        setTimeout(() => (location.href = linkFor(key)), door ? 1300 : 850);
      });
    });
    // Coming back with the browser's back button: undo the walk-through
    addEventListener("pageshow", () => { root.classList.remove("leaving"); root.querySelectorAll(".open").forEach(d => d.classList.remove("open")); });

    /* ---------- Draw, and redraw when the size changes ---------- */
    const drawAll = () => {
      drawGlobes(document.getElementById("nrsf-marquee-lights"));
      drawStrand(document.getElementById("nrsf-strand"));
      if (S.pumpkins) {
        const pk = document.getElementById("nrsf-pumpkins"), w = pk.clientWidth;
        pk.innerHTML = pumpkin(w * .62, 0, -4) + pumpkin(w * .42, 54, 6);
      }
      drawFrame();
    };
    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    ready.then(drawAll);
    drawAll();
    if ("ResizeObserver" in window) {
      let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(drawAll, 120); }).observe(root);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
