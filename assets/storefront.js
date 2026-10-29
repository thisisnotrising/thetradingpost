/* ============================================================
   NOT RISING · THE TRADING POST — THE ENGINE
   Paints 777 Daydream St. and brings it to life. Reads storefront-data.js.

   How it works, in order:
     A. THE PLAN      where every part of the building goes, in "building
                      units" (a desktop plan 1200 units wide, a phone plan 400)
     B. PAINT KIT     small helpers: shading, noise, shadows, colours
     C. THE BUILDING  brick by brick onto a canvas: wall, piers, window,
                      cornice, fascia, joinery, doors' surrounds, pavement
     D. THE IVY       Boston ivy grown along vines, leaf by leaf, with shadows
     E. DOORS & GLASS the door leaves, shop interiors, window displays
     F. LIFE          letter tiles, bulbs, falling leaves, doors that open
   ============================================================ */
(function () {
  "use strict";

  /* ============================================================
     A. THE PLAN (all numbers are building units)
     ============================================================ */
  const DESK = (() => {
    const doors = [
      { side: "l", opening: { x: 80, y: 632, w: 150, h: 404 }, transom: { x: 90, y: 642, w: 130, h: 98 }, bar: { y: 740, h: 12 }, leaf: { x: 96, y: 756, w: 118, h: 276 } },
      { side: "r", opening: { x: 970, y: 632, w: 150, h: 404 }, transom: { x: 980, y: 642, w: 130, h: 98 }, bar: { y: 740, h: 12 }, leaf: { x: 986, y: 756, w: 118, h: 276 } }
    ];
    return {
      ref: 1200, h: 1120, ground: 1036, shopTop: 624,
      upperWin: { x: 470, y: 84, w: 260, h: 214 }, lintel: { x: 458, y: 62, w: 284, h: 22 }, wsill: { x: 456, y: 298, w: 288, h: 14 },
      sign: { x: 800, y: 110, w: 200 }, marquee: { x: 276, y: 334, w: 648, h: 148 },
      cornice: { x: 12, y: 496, w: 1176, h: 32 }, fascia: { x: 34, y: 528, w: 1132, h: 96 },
      corbels: [{ x: 4, y: 508, w: 44, h: 140 }, { x: 1152, y: 508, w: 44, h: 140 }],
      piers: [{ x: 22, w: 58 }, { x: 230, w: 42 }, { x: 928, w: 42 }, { x: 1120, w: 58 }],
      doors,
      front: { x: 272, y: 632, w: 656, h: 404, rail: 18, posts: [272, 591, 910], postW: 18,
        glass: [{ x: 290, y: 650, w: 301, h: 288 }, { x: 609, y: 650, w: 301, h: 288 }],
        sill: { x: 264, y: 938, w: 672, h: 16 }, riser: { x: 280, y: 954, w: 640, h: 82 } },
      steps: [{ x: 68, y: 1036, w: 174, h: 20 }, { x: 958, y: 1036, w: 174, h: 20 }],
      neon: doors[0].transom, num: doors[1].transom,
      pumpkins: { x: 1004, y: 1037, w: 116 },
      awning: { x0: 34, x1: 1166, wall: 624, front: 650, spread: .02, lamps: [251, 600, 949] },
      ivy: { side: 84, canopy: 64, droop: 170, keepClear: [{ x: 452, y: 56, w: 296, h: 262 }, { x: 272, y: 330, w: 656, h: 156 }, { x: 790, y: 100, w: 220, h: 220 }, { x: 84, y: 600, w: 1032, h: 520 }] }
    };
  })();
  const PHONE = (() => {
    const doors = [
      { side: "l", opening: { x: -70, y: 536, w: 122, h: 700 }, transom: { x: -62, y: 544, w: 106, h: 72 }, bar: { y: 616, h: 10 }, leaf: { x: -56, y: 630, w: 98, h: 602 } },
      { side: "r", opening: { x: 348, y: 536, w: 122, h: 700 }, transom: { x: 356, y: 544, w: 106, h: 72 }, bar: { y: 616, h: 10 }, leaf: { x: 358, y: 630, w: 98, h: 602 } }
    ];
    return {
      ref: 400, h: 1300, ground: 1236, shopTop: 530, phone: true,
      upperWin: { x: 75, y: 104, w: 150, h: 176 }, lintel: { x: 67, y: 86, w: 166, h: 18 }, wsill: { x: 66, y: 280, w: 168, h: 12 },
      sign: { x: 236, y: 120, w: 150 }, marquee: { x: 10, y: 306, w: 380, h: 118 },
      cornice: { x: -4, y: 436, w: 408, h: 22 }, fascia: { x: 6, y: 458, w: 388, h: 72 },
      corbels: [{ x: -8, y: 448, w: 20, h: 100 }, { x: 388, y: 448, w: 20, h: 100 }],
      piers: [{ x: 52, w: 18 }, { x: 330, w: 18 }],
      doors,
      front: { x: 70, y: 536, w: 260, h: 700, rail: 8, posts: [70, 195, 320], postW: 10,
        transomBand: { x: 80, y: 544, w: 240, h: 72 }, bar: { y: 616, h: 10 },
        glass: [{ x: 80, y: 626, w: 115, h: 548 }, { x: 205, y: 626, w: 115, h: 548 }],
        sill: { x: 62, y: 1174, w: 276, h: 12 }, riser: { x: 74, y: 1186, w: 252, h: 50 } },
      steps: [{ x: -80, y: 1236, w: 136, h: 16 }, { x: 344, y: 1236, w: 136, h: 16 }],
      neon: { x: 80, y: 544, w: 240, h: 72 }, num: { x: 356, y: 544, w: 44, h: 72 },
      pumpkins: { x: 344, y: 1237, w: 56 },
      awning: { x0: 6, x1: 394, wall: 530, front: 546, spread: .02, lamps: [61, 339] },
      ivy: { side: 34, canopy: 46, droop: 90, keepClear: [{ x: 62, y: 80, w: 176, h: 214 }, { x: 8, y: 302, w: 384, h: 126 }, { x: 230, y: 112, w: 162, h: 166 }, { x: 30, y: 520, w: 340, h: 760 }] }
    };
  })();

  /* ============================================================
     B. PAINT KIT
     ============================================================ */
  // A repeatable "random" number from two inputs: the same brick always gets the same look
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const rgb = (c, f = 1, a = 1) => `rgba(${c.map(v => Math.max(0, Math.min(255, Math.round(v * f)))).join(",")},${a})`;
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (c1, c2, t) => c1.map((v, i) => lerp(v, c2[i], t));

  function sizeCanvas(c, w, h, dpr) {          // w, h in CSS pixels
    c.width = Math.max(1, Math.round(w * dpr)); c.height = Math.max(1, Math.round(h * dpr));
    c.style.width = w + "px"; c.style.height = h + "px";
    return c.getContext("2d");
  }
  let NOISE = null;                              // a tile of grain, reused as a texture
  function noise() {
    if (NOISE) return NOISE;
    NOISE = document.createElement("canvas"); NOISE.width = NOISE.height = 128;
    const x = NOISE.getContext("2d"), d = x.createImageData(128, 128), R = rng(99);
    for (let i = 0; i < d.data.length; i += 4) { const v = R() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
    return NOISE;
  }
  function grain(ctx, x, y, w, h, alpha, scale = .5) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const p = ctx.createPattern(noise(), "repeat");
    if (p.setTransform) p.setTransform(new DOMMatrix().scale(scale));
    ctx.globalAlpha = alpha; ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = p; ctx.fillRect(x, y, w, h);
    ctx.restore();
  }
  const vgrad = (ctx, y0, y1, stops) => { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  const hgrad = (ctx, x0, x1, stops) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
  // A soft shadow cast below a ledge onto the wall
  function ledgeShadow(ctx, x, y, w, depth, a = .45) { ctx.fillStyle = vgrad(ctx, y, y + depth, [[0, `rgba(10,12,20,${a})`], [1, "rgba(10,12,20,0)"]]); ctx.fillRect(x, y, w, depth); }
  // Moulded edge: light along the top and left, dark along the bottom and right
  function bevel(ctx, x, y, w, h, t, lite = "rgba(255,255,255,.14)", dark = "rgba(0,0,0,.55)") {
    ctx.fillStyle = lite; ctx.fillRect(x, y, w, t); ctx.fillRect(x, y, t, h);
    ctx.fillStyle = dark; ctx.fillRect(x, y + h - t, w, t); ctx.fillRect(x + w - t, y, t, h);
  }
  // A raised, fielded panel (doors and stallrisers): a frame, four bevels, a flat field
  function panel(ctx, x, y, w, h, base, depth = 6) {
    const [r, g, b] = base, c = f => `rgb(${r * f | 0},${g * f | 0},${b * f | 0})`;
    ctx.fillStyle = c(.7); ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    bevel(ctx, x - 3, y - 3, w + 6, h + 6, 1.4, "rgba(0,0,0,.6)", "rgba(255,255,255,.16)");
    const d = Math.min(depth, w / 3, h / 3);
    const quad = (pts, col) => { ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
    quad([[x, y], [x + w, y], [x + w - d, y + d], [x + d, y + d]], c(1.45));
    quad([[x, y], [x + d, y + d], [x + d, y + h - d], [x, y + h]], c(1.15));
    quad([[x + w, y], [x + w, y + h], [x + w - d, y + h - d], [x + w - d, y + d]], c(.6));
    quad([[x, y + h], [x + d, y + h - d], [x + w - d, y + h - d], [x + w, y + h]], c(.45));
    ctx.fillStyle = vgrad(ctx, y + d, y + h - d, [[0, c(1.08)], [1, c(.88)]]); ctx.fillRect(x + d, y + d, w - 2 * d, h - 2 * d);
  }
  function brassDisc(ctx, x, y, r) {
    const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    g.addColorStop(0, "#fff1c4"); g.addColorStop(.4, "#c9a25a"); g.addColorStop(1, "#5d4518");
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.beginPath(); ctx.arc(x + r * .25, y + r * .35, r, 0, 7); ctx.fill();
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  function brassPlate(ctx, x, y, w, h) {
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(x + 1, y + 2, w, h);
    ctx.fillStyle = vgrad(ctx, y, y + h, [[0, "#f4dc98"], [.45, "#c39a4c"], [1, "#6f5220"]]); ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#2a1d0a"; ctx.fillRect(x + w * .1, y + h * .38, w * .8, h * .24);
    ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x, y, w, Math.max(.6, h * .08));
  }

  /* ============================================================
     The shop interior seen through the glass: bookshelves in warm lamplight
     ============================================================ */
  function paintShelves(c, w, h, scale, dpr, seed, opts = {}) {
    const ctx = sizeCanvas(c, w * scale, h * scale, dpr);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    const R = rng(seed);
    ctx.fillStyle = vgrad(ctx, 0, h, [[0, "#20150e"], [1, "#120b07"]]); ctx.fillRect(0, 0, w, h);
    const spines = ["#5b1a17", "#1f2c3d", "#2e3b26", "#6b4b1e", "#d8ccb0", "#141414", "#7a2a1c", "#3a2a3e", "#a87b3a", "#e6dfcf", "#24413e", "#8c1c1c"];
    const shelfH = opts.shelf || 34;
    for (let y = 10; y < h; y += shelfH) {
      let x = -R() * 10;
      while (x < w) {                                        // a row of book spines
        const bw = 3 + R() * 6, bh = shelfH * (.62 + R() * .3), col = hex(spines[(R() * spines.length) | 0]);
        const lean = R() < .07 ? (R() - .5) * .25 : 0;
        ctx.save(); ctx.translate(x, y + shelfH - 4); ctx.rotate(lean);
        ctx.fillStyle = hgrad(ctx, 0, bw, [[0, rgb(col, .7)], [.4, rgb(col, 1.05)], [1, rgb(col, .55)]]); ctx.fillRect(0, -bh, bw, bh);
        if (R() < .45) { ctx.fillStyle = "rgba(214,178,98,.55)"; ctx.fillRect(0, -bh * .82, bw, .7); ctx.fillRect(0, -bh * .2, bw, .7); }
        ctx.restore();
        x += bw + (R() < .1 ? 4 + R() * 8 : .3);
      }
      ctx.fillStyle = vgrad(ctx, y + shelfH - 4, y + shelfH + 2, [[0, "#6a4a2c"], [1, "#2a1a0e"]]); ctx.fillRect(0, y + shelfH - 4, w, 6);   // the shelf board
      ledgeShadow(ctx, 0, y + shelfH + 2, w, 6, .5);
    }
    // pendant lamps glowing near the top, then a falloff toward the floor
    ctx.globalCompositeOperation = "screen";
    (opts.lamps || [.3, .75]).forEach(fx => {
      const g = ctx.createRadialGradient(w * fx, h * .12, 1, w * fx, h * .12, Math.max(w, h) * .6);
      g.addColorStop(0, "rgba(255,206,130,.55)"); g.addColorStop(.35, "rgba(255,170,80,.18)"); g.addColorStop(1, "rgba(255,150,60,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = vgrad(ctx, 0, h, [[0, "rgba(0,0,0,.05)"], [.6, "rgba(0,0,0,.2)"], [1, "rgba(0,0,0,.6)"]]); ctx.fillRect(0, 0, w, h);
  }

  /* ------------------------------------------------------------
     PHOTO TEXTURES (cut from Kathi's own photos)
       bricks.jpg  124 real brick faces, each 60×20, packed 16 to a row.
                   Every brick on the building is one of these, picked at random.
       wood.jpg    floorboard grain, used on the doors, the sign and the window ledges.
       lounge.jpg  the coffee lounge seen through the poster window.
     ------------------------------------------------------------ */
  const ATLAS = { n: 124, cols: 16, w: 60, h: 20 };
  const MORTAR = "#aaa196";
  const TEX = {};
  // Draw one photographed brick into a w×h slot (flip = mirror it, for more variety)
  function photoBrick(ctx, x, y, w, h, seedA, seedB, vertical = false) {
    const A = TEX.bricks;
    if (!A) { ctx.fillStyle = "#b9735a"; ctx.fillRect(x, y, w, h); return; }
    const i = (hash(seedA, seedB) * ATLAS.n) | 0, sx = (i % ATLAS.cols) * ATLAS.w + 1, sy = ((i / ATLAS.cols) | 0) * ATLAS.h + 1;
    const flip = hash(seedB + 3, seedA) < .5;
    ctx.save(); ctx.translate(x, y);
    if (vertical) { ctx.translate(w, 0); ctx.rotate(Math.PI / 2); [w, h] = [h, w]; }
    if (flip) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(A, sx, sy, ATLAS.w - 2, ATLAS.h - 2, 0, 0, w, h);
    ctx.restore();
  }
  // The wood grain, turned upright and in greyscale so it can grain any paint colour
  let WOODG = null;
  function woodGrain() {
    if (WOODG || !TEX.wood) return WOODG;
    const w = TEX.wood, c = document.createElement("canvas"); c.width = w.height; c.height = w.width;
    const x = c.getContext("2d");
    x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(w, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = "saturation"; x.fillStyle = "#808080"; x.fillRect(0, 0, c.width, c.height);   // drain the colour
    return (WOODG = c);
  }
  function grainWood(ctx, x, y, w, h, alpha, scale) {
    const g = woodGrain(); if (!g) return;
    const p = ctx.createPattern(g, "repeat"); if (p.setTransform) p.setTransform(new DOMMatrix().translate(x, y).scale(scale));
    ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = alpha; ctx.fillStyle = p; ctx.fillRect(x, y, w, h); ctx.restore();
  }

  /* leaves.webp: 20 real maple leaves cut out of Kathi's trail photos, 64×64 each, 5 to a row.
     Each is kept in three shades (in shadow, half-lit, in the light) so the canopy has depth. */
  const LEAF = { n: 20, cols: 5, cell: 64 };
  let LEAFSETS = null;
  function leafSprites() {
    if (LEAFSETS || !TEX.leaves) return LEAFSETS;
    LEAFSETS = [.45, .25, 0].map(dark => Array.from({ length: LEAF.n }, (_, i) => {
      const c = document.createElement("canvas"); c.width = c.height = LEAF.cell;
      const x = c.getContext("2d");
      const sx = (i % LEAF.cols) * LEAF.cell, sy = ((i / LEAF.cols) | 0) * LEAF.cell, C = LEAF.cell;
      x.drawImage(TEX.leaves, sx, sy, C, C, 0, 0, C, C);
      const warm = [null, "#e0841c", "#d9a21e", null, "#c8501c"][i % 5];     // turn some leaves orange and gold, like the trail
      if (warm) {
        x.globalCompositeOperation = "color"; x.globalAlpha = .7; x.fillStyle = warm; x.fillRect(0, 0, C, C);
        x.globalAlpha = 1; x.globalCompositeOperation = "destination-in"; x.drawImage(TEX.leaves, sx, sy, C, C, 0, 0, C, C);
        x.globalCompositeOperation = "source-over";
      }
      if (dark) { x.globalCompositeOperation = "source-atop"; x.fillStyle = `rgba(20,8,10,${dark})`; x.fillRect(0, 0, LEAF.cell, LEAF.cell); }
      return c;
    }));
    return LEAFSETS;
  }

  /* A faint reflection of the street behind you (the buildings opposite and a street lamp),
     made once as a tiny SVG picture and reused by every pane of glass */
  let STREET = null;
  function streetReflection() {
    if (STREET) return STREET;
    const R = rng(4), parts = [];
    for (let x = 0; x < 400;) {
      const bw = 50 + R() * 70, top = 30 + R() * 50;
      parts.push(`<rect x="${x}" y="${top}" width="${bw}" height="${200 - top}" fill="#0a0d16"/>`);
      x += bw + 4;
    }
    parts.push(`<rect x="300" y="40" width="3" height="160" fill="#05070c"/><circle cx="301" cy="40" r="22" fill="#ffd9a0" opacity=".35"/><circle cx="301" cy="40" r="5" fill="#fff2d6"/>`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" preserveAspectRatio="none"><g opacity=".12">${parts.join("")}</g></svg>`;
    return (STREET = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
  }

  function start() {
    const root = document.getElementById("nrsf");
    if (!root || !window.NRSF) return;
    const D = window.NRSF, { LINKS, SIGNS, POSTERS } = D;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const PREVIEW = !!window.NRSF_PREVIEW;
    const INLINE = window.NRSF_INLINE || {};
    const BASE = window.NRSF_BASE || "", NS_BASE = window.NRNS_BASE || "";
    const img = (path, base = BASE) => INLINE[path] || base + path;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const $ = id => document.getElementById(id);
    const scene = $("nrsf-scene");

    /* Season, picked by today's date */
    const m = new Date().getMonth() + 1;
    const byDate = m >= 9 && m <= 11 ? "fall" : (m === 12 || m <= 2) ? "winter" : m <= 5 ? "spring" : "summer";
    let season = D.SEASON === "auto" ? byDate : D.SEASON;
    if (!D.SEASONS[season]) season = D.FALLBACK_SEASON;
    const S = D.SEASONS[season];
    root.dataset.season = season;

    /* Signs and letter tiles */
    root.querySelectorAll("[data-sign]").forEach(el => (el.textContent = SIGNS[el.dataset.sign] || ""));
    $("nrsf-sign").innerHTML = hangingSign(SIGNS.hanging);
    const tiles = word => [...word].map((ch, i) => {
      if (ch === " ") return `<span class="lt sp"> </span>`;
      const a = hash(i, 3.1), b = hash(i, 7.7);
      return `<span class="lt" aria-hidden="true" style="--rot:${((a - .5) * 3.4).toFixed(2)}deg;--dy:${((b - .5) * .06).toFixed(3)}em">${esc(ch)}</span>`;
    }).join("");
    $("nrsf-marquee").innerHTML = tiles(SIGNS.marquee);
    $("nrsf-marquee").setAttribute("aria-label", SIGNS.marquee);

    let G, u, W, H, dpr;
    const place = (el, r) => { el.style.left = r.x * u + "px"; el.style.top = r.y * u + "px"; el.style.width = r.w * u + "px"; if (r.h != null) el.style.height = r.h * u + "px"; };
    const pos = (x, y, w, h) => `left:${x * u}px;top:${y * u}px;width:${w * u}px;${h != null ? `height:${h * u}px;` : ""}`;

    /* ============================================================
       C. THE BUILDING
       ============================================================ */
    function bricks(ctx, x0, y0, x1, y1, lift = 0, painted = false) {
      const bh = G.phone ? 13 : 16, bw = G.phone ? 38 : 46, j = G.phone ? 2.4 : 3, row = bh + j;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
      ctx.fillStyle = painted ? "#cfccc4" : MORTAR; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // the mortar
      grain(ctx, x0, y0, x1 - x0, y1 - y0, .5, .35);
      for (let r = Math.floor(y0 / row) - 1; r <= Math.ceil(y1 / row); r++) {
        const y = r * row + j / 2, off = (r % 2 ? .5 : 0) * (bw + j);
        for (let k = Math.floor((x0 - off) / (bw + j)) - 1; ; k++) {
          const x = k * (bw + j) + off;
          if (x > x1) break;
          photoBrick(ctx, x, y, bw, bh, r, k);                 // a real brick from the photos
          const a = hash(r * 1.3, k * 2.1);
          ctx.fillStyle = a < .5 ? `rgba(30,12,6,${(.5 - a) * .22})` : `rgba(255,236,215,${(a - .5) * .12})`; ctx.fillRect(x, y, bw, bh);   // no two alike
          if (lift) { ctx.fillStyle = `rgba(255,240,225,${lift / 60})`; ctx.fillRect(x, y, bw, bh); }
          if (painted) {                                       // white masonry paint over the real brick: its texture still shows through
            const p = hash(r * .7, k * 1.9), L = 236 + p * 14;
            ctx.fillStyle = `rgba(${L},${L - 2},${L - 7},${.84 + p * .06})`; ctx.fillRect(x, y, bw, bh);
            if (hash(k * 3.1, r) > .985) { ctx.fillStyle = "rgba(150,80,60,.28)"; ctx.beginPath(); ctx.ellipse(x + bw * (.2 + hash(k, 2) * .6), y + bh * .5, bw * .12, bh * .22, hash(r, k) * 3, 0, 7); ctx.fill(); }   // a worn patch where the brick shows through
          }
          ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(x, y, bw, .9);              // catches the light along the top
          ctx.fillStyle = "rgba(20,8,4,.35)"; ctx.fillRect(x, y + bh, bw, 1.4);              // shadow in the mortar below it
          ctx.fillStyle = "rgba(20,8,4,.18)"; ctx.fillRect(x + bw, y, 1, bh);
        }
      }
      ctx.restore();
    }

    function paintBuilding() {
      const c = $("nrsf-paint"), ctx = sizeCanvas(c, W, H, dpr);
      ctx.setTransform(dpr * u, 0, 0, dpr * u, 0, 0);
      const ref = G.ref, gy = G.ground, sh = v => v * u * dpr;

      // 1. The wall: white-painted brick upstairs, bare red brick at street level
      bricks(ctx, 0, 0, ref, G.shopTop, 0, true);
      bricks(ctx, 0, G.shopTop, ref, gy);
      grain(ctx, 0, 0, ref, gy, .18);
      // weathering: grime down the base of the wall and streaks under the ledges
      ctx.fillStyle = vgrad(ctx, gy - 120, gy, [[0, "rgba(40,28,24,0)"], [1, "rgba(40,28,24,.3)"]]); ctx.fillRect(0, gy - 120, ref, 120);
      const R = rng(31);
      for (let i = 0; i < (G.phone ? 6 : 14); i++) {
        const x = R() * ref, y = G.cornice.y - 340 + R() * 200, len = 60 + R() * 160;
        ctx.fillStyle = vgrad(ctx, y, y + len, [[0, "rgba(60,60,66,.10)"], [1, "rgba(60,60,66,0)"]]); ctx.fillRect(x, y, 2 + R() * 4, len);
      }

      // 2. The upstairs window, like the reference photos: a black frame with a grid of
      //    small square panes, set deep in the brick under a row of bricks standing on end
      const w = G.upperWin, li = G.lintel, ws = G.wsill;
      ctx.fillStyle = "#17110d"; ctx.fillRect(w.x - 8, w.y - 4, w.w + 16, w.h + 4);                       // the reveal in the brick
      ctx.fillStyle = hgrad(ctx, w.x - 8, w.x + 4, [[0, "rgba(255,230,210,.14)"], [1, "rgba(255,255,255,0)"]]); ctx.fillRect(w.x - 8, w.y - 4, 12, w.h + 4);
      ctx.fillStyle = "#cfccc4"; ctx.fillRect(li.x, li.y, li.w, li.h);                                    // soldier course
      const nS = Math.round(li.w / (G.phone ? 10 : 13)), sw = li.w / nS;
      for (let k = 0; k < nS; k++) {
        photoBrick(ctx, li.x + k * sw + 1, li.y + 1, sw - 2, li.h - 2, 900 + k, 7, true);
        ctx.fillStyle = "rgba(242,240,234,.86)"; ctx.fillRect(li.x + k * sw + 1, li.y + 1, sw - 2, li.h - 2);   // painted white like the wall
        ctx.fillStyle = "rgba(20,8,4,.3)"; ctx.fillRect(li.x + k * sw + sw - 1, li.y + 1, 1, li.h - 2);
      }
      ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(li.x, li.y, li.w, 1);
      ledgeShadow(ctx, w.x - 8, li.y + li.h, w.w + 16, 10, .55);
      const fr = G.phone ? 6 : 9, bar = G.phone ? 2.4 : 3.2, cols = G.phone ? 3 : 4, rows = G.phone ? 4 : 5;
      const gx = w.x + fr, gy0 = w.y + fr, gw = w.w - fr * 2, gh = w.h - fr * 2;
      ctx.fillStyle = vgrad(ctx, gy0, gy0 + gh, [[0, "#3d4560"], [.3, "#2a2224"], [1, "#160e0a"]]); ctx.fillRect(gx, gy0, gw, gh);   // dusk sky reflected above, a room behind
      ctx.save(); ctx.beginPath(); ctx.rect(gx, gy0, gw, gh); ctx.clip();
      ctx.globalCompositeOperation = "screen";
      const lamp = ctx.createRadialGradient(gx + gw * .62, gy0 + gh * .72, 1, gx + gw * .62, gy0 + gh * .72, gw * .7);   // a lamp left on upstairs
      lamp.addColorStop(0, "rgba(255,196,120,.8)"); lamp.addColorStop(.4, "rgba(255,160,80,.3)"); lamp.addColorStop(1, "rgba(255,140,60,0)");
      ctx.fillStyle = lamp; ctx.fillRect(gx, gy0, gw, gh);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(240,228,210,.10)"; ctx.fillRect(gx, gy0, gw * .22, gh);                       // a sheer curtain pulled aside
      ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.beginPath(); ctx.moveTo(gx, gy0 + gh * .55); ctx.lineTo(gx + gw * .5, gy0); ctx.lineTo(gx + gw * .62, gy0); ctx.lineTo(gx, gy0 + gh * .75); ctx.fill();
      ctx.restore();
      const pw = (gw - bar * (cols - 1)) / cols, ph = (gh - bar * (rows - 1)) / rows;                      // the glazing bars
      ctx.fillStyle = "#0b0b0c";
      ctx.fillRect(w.x, w.y, w.w, fr); ctx.fillRect(w.x, w.y + w.h - fr, w.w, fr); ctx.fillRect(w.x, w.y, fr, w.h); ctx.fillRect(w.x + w.w - fr, w.y, fr, w.h);
      for (let k = 1; k < cols; k++) { const x = gx + k * (pw + bar) - bar; ctx.fillStyle = "#0b0b0c"; ctx.fillRect(x, gy0, bar, gh); ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(x, gy0, .6, gh); }
      for (let k = 1; k < rows; k++) { const y = gy0 + k * (ph + bar) - bar; ctx.fillStyle = "#0b0b0c"; ctx.fillRect(gx, y, gw, bar); ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(gx, y, gw, .6); }
      bevel(ctx, w.x, w.y, w.w, w.h, 1.4, "rgba(255,255,255,.12)", "rgba(0,0,0,.6)");
      bevel(ctx, gx, gy0, gw, gh, 1, "rgba(0,0,0,.6)", "rgba(255,255,255,.1)");
      ctx.fillStyle = vgrad(ctx, ws.y, ws.y + ws.h, [[0, "#f1f0ea"], [.35, "#d6d3ca"], [.4, "#a9a69d"], [1, "#8b887f"]]); ctx.fillRect(ws.x, ws.y, ws.w, ws.h);
      ledgeShadow(ctx, ws.x + 4, ws.y + ws.h, ws.w - 8, 22, .5);
      ctx.fillStyle = vgrad(ctx, ws.y + ws.h, ws.y + ws.h + 90, [[0, "rgba(70,70,74,.18)"], [1, "rgba(70,70,74,0)"]]); ctx.fillRect(ws.x + 20, ws.y + ws.h, ws.w - 40, 90);  // rain stains

      // 3. Shadow of the marquee on the wall
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = sh(22); ctx.shadowOffsetY = sh(12);
      ctx.fillStyle = "#111"; ctx.fillRect(G.marquee.x + 4, G.marquee.y + 4, G.marquee.w - 8, G.marquee.h - 8); ctx.restore();

      // 4. Piers: brick columns standing proud of the wall, with a capital and a stone plinth
      const pTop = G.shopTop, pBot = gy;
      G.piers.forEach(p => {
        bricks(ctx, p.x, pTop, p.x + p.w, pBot, 6);
        ctx.fillStyle = hgrad(ctx, p.x, p.x + p.w, [[0, "rgba(255,255,255,.16)"], [.15, "rgba(255,255,255,0)"], [.8, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.28)"]]); ctx.fillRect(p.x, pTop, p.w, pBot - pTop);
        ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(p.x + p.w, pTop, 1.5, pBot - pTop);
        const capH = G.phone ? 10 : 16;
        ctx.fillStyle = vgrad(ctx, pTop, pTop + capH, [[0, "#f3f2ec"], [.5, "#d9d6cd"], [1, "#a8a59c"]]); ctx.fillRect(p.x - 3, pTop, p.w + 6, capH);
        bevel(ctx, p.x - 3, pTop, p.w + 6, capH, 1, "rgba(255,255,255,.5)", "rgba(0,0,0,.3)");
        const plH = G.phone ? 16 : 26;
        ctx.fillStyle = vgrad(ctx, pBot - plH, pBot, [[0, "#cfccc3"], [1, "#8d8a82"]]); ctx.fillRect(p.x - 3, pBot - plH, p.w + 6, plH);
        bevel(ctx, p.x - 3, pBot - plH, p.w + 6, plH, 1, "rgba(255,255,255,.45)", "rgba(0,0,0,.3)");
        grain(ctx, p.x - 3, pBot - plH, p.w + 6, plH, .3);
      });

      // 5. Cornice, fascia board and the carved corbels at each end (all painted black)
      const co = G.cornice, fa = G.fascia;
      ctx.fillStyle = "#0b0b0c"; ctx.fillRect(fa.x, fa.y, fa.w, fa.h);
      ctx.fillStyle = vgrad(ctx, fa.y, fa.y + fa.h, [[0, "rgba(255,255,255,.05)"], [.5, "rgba(255,255,255,0)"], [1, "rgba(255,255,255,.03)"]]); ctx.fillRect(fa.x, fa.y, fa.w, fa.h);
      const fi = G.phone ? 5 : 8;
      bevel(ctx, fa.x + fi, fa.y + fi, fa.w - fi * 2, fa.h - fi * 2, 1.4, "rgba(0,0,0,.7)", "rgba(255,255,255,.12)");   // sunk moulding round the lettering
      bevel(ctx, fa.x, fa.y, fa.w, fa.h, 1.2, "rgba(255,255,255,.1)", "rgba(0,0,0,.8)");
      ledgeShadow(ctx, fa.x, fa.y, fa.w, 18, .7);                                                                   // the cornice shades the top of the board
      ctx.fillStyle = vgrad(ctx, co.y, co.y + co.h, [[0, "#3a3a3c"], [.12, "#1a1a1c"], [.3, "#0c0c0d"], [.45, "#2a2a2c"], [.55, "#121213"], [1, "#050505"]]); ctx.fillRect(co.x, co.y, co.w, co.h);
      ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.fillRect(co.x, co.y, co.w, 1.2);
      const dent = G.phone ? 6 : 9;                                                                                 // dentils under the cornice
      for (let x = co.x + 4; x < co.x + co.w - dent; x += dent * 1.7) {
        ctx.fillStyle = "#151516"; ctx.fillRect(x, co.y + co.h * .62, dent, co.h * .3);
        ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(x, co.y + co.h * .62, dent, .8);
        ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(x + dent - .8, co.y + co.h * .62, .8, co.h * .3);
      }
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = sh(10); ctx.shadowOffsetY = sh(5); ctx.fillStyle = "rgba(0,0,0,.01)"; ctx.fillRect(co.x, co.y, co.w, co.h); ctx.restore();
      ledgeShadow(ctx, co.x, co.y - 0, co.w, 0);
      G.corbels.forEach((k, i) => {                                                                                 // scroll brackets
        const left = i === 0, x = k.x, y = k.y, kw = k.w, kh = k.h;
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = sh(8); ctx.shadowOffsetX = sh(left ? 3 : -3); ctx.shadowOffsetY = sh(4);
        ctx.fillStyle = hgrad(ctx, x, x + kw, [[0, "#232325"], [.4, "#3a3a3d"], [1, "#0b0b0c"]]);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + kw, y); ctx.lineTo(x + kw, y + kh * .55);
        ctx.bezierCurveTo(x + kw, y + kh * .85, x + kw * .55, y + kh, x + kw * .5, y + kh);
        ctx.bezierCurveTo(x + kw * .1, y + kh, x, y + kh * .8, x, y + kh * .6); ctx.closePath(); ctx.fill(); ctx.restore();
        ctx.strokeStyle = "rgba(255,255,255,.22)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x + kw * .5, y + kh * .74, kw * .28, Math.PI * .1, Math.PI * 1.9); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + kw * .5, y + kh * .74, kw * .14, Math.PI * .2, Math.PI * 1.7); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + kw * .5, y + kh * .22, kw * .22, Math.PI * 1.1, Math.PI * 2.9); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fillRect(x, y, kw, 1.2);
      });

      // 6. Door surrounds: black architrave, the recess (reveals and soffit), transom bar, stone threshold
      G.doors.forEach(d => {
        const o = d.opening, t = d.transom, lf = d.leaf;
        ctx.fillStyle = "#0b0b0c"; ctx.fillRect(o.x, o.y, o.w, o.h);
        bevel(ctx, o.x, o.y, o.w, o.h, 1.4, "rgba(255,255,255,.14)", "rgba(0,0,0,.7)");
        bevel(ctx, o.x + 4, o.y + 4, o.w - 8, o.h - 8, 1, "rgba(0,0,0,.6)", "rgba(255,255,255,.08)");
        ctx.fillStyle = "#0e0c0b"; ctx.fillRect(t.x, t.y, t.w, t.h);                                               // (the glass itself is a live element)
        ctx.fillStyle = vgrad(ctx, d.bar.y, d.bar.y + d.bar.h, [[0, "#2c2c2e"], [.3, "#121213"], [1, "#050505"]]); ctx.fillRect(o.x + 6, d.bar.y, o.w - 12, d.bar.h);
        const rx0 = t.x, rx1 = t.x + t.w, ry = d.bar.y + d.bar.h, by = lf.y + lf.h;
        ctx.fillStyle = "#1c1b1a"; ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(lf.x, lf.y); ctx.lineTo(lf.x, by); ctx.lineTo(rx0, by + 2); ctx.fill();   // lit reveal
        ctx.fillStyle = "#060606"; ctx.beginPath(); ctx.moveTo(rx1, ry); ctx.lineTo(lf.x + lf.w, lf.y); ctx.lineTo(lf.x + lf.w, by); ctx.lineTo(rx1, by + 2); ctx.fill(); // shaded reveal
        ctx.fillStyle = "#030303"; ctx.beginPath(); ctx.moveTo(rx0, ry); ctx.lineTo(rx1, ry); ctx.lineTo(lf.x + lf.w, lf.y); ctx.lineTo(lf.x, lf.y); ctx.fill();          // soffit
        ctx.fillStyle = vgrad(ctx, by - 2, o.y + o.h, [[0, "#bcb8ae"], [1, "#77736b"]]); ctx.fillRect(o.x + 4, by - 1, o.w - 8, o.y + o.h - by + 1);
        grain(ctx, o.x + 4, by - 1, o.w - 8, o.y + o.h - by + 1, .35);
      });

      // 7. The shopfront joinery: rails, posts, the deep sill and the panelled stallriser
      const f = G.front;
      ctx.fillStyle = "#0b0b0c"; ctx.fillRect(f.x, f.y, f.w, f.h);
      bevel(ctx, f.x, f.y, f.w, f.h, 1.4, "rgba(255,255,255,.14)", "rgba(0,0,0,.7)");
      ctx.fillStyle = vgrad(ctx, f.y, f.y + f.rail, [[0, "#2a2a2c"], [.25, "#141415"], [1, "#060606"]]); ctx.fillRect(f.x, f.y, f.w, f.rail);
      if (f.transomBand) {
        ctx.fillStyle = vgrad(ctx, f.bar.y, f.bar.y + f.bar.h, [[0, "#2c2c2e"], [.3, "#121213"], [1, "#050505"]]); ctx.fillRect(f.x, f.bar.y, f.w, f.bar.h);
      }
      f.posts.forEach(px => {
        ctx.fillStyle = hgrad(ctx, px, px + f.postW, [[0, "#070707"], [.3, "#2e2e30"], [.5, "#19191a"], [1, "#040404"]]);
        ctx.fillRect(px, f.y + f.rail, f.postW, f.sill.y - f.y - f.rail);
      });
      f.glass.forEach(gl => { ctx.fillStyle = "#050505"; ctx.fillRect(gl.x - 3, gl.y - 3, gl.w + 6, gl.h + 6); });   // the rebate the glass sits in
      const s = f.sill;
      ctx.fillStyle = vgrad(ctx, s.y, s.y + s.h, [[0, "#3a3a3c"], [.3, "#1d1d1e"], [.32, "#0d0d0d"], [1, "#050505"]]); ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.fillRect(s.x, s.y, s.w, .9);
      const ri = f.riser;
      ctx.fillStyle = "#0b0b0c"; ctx.fillRect(ri.x, ri.y, ri.w, ri.h);
      ledgeShadow(ctx, ri.x, ri.y, ri.w, 14, .8);
      const pad = G.phone ? 7 : 12;
      f.glass.forEach(gl => panel(ctx, gl.x + pad, ri.y + pad + 4, gl.w - pad * 2, ri.h - pad * 2 - 4, [26, 26, 28], G.phone ? 4 : 7));

      // 8. The pavement, the steps and the base of the building
      // Cobblestones, like the café photo: dark, damp granite setts laid in staggered rows,
      // smaller toward the wall and larger toward you, with moss and grit in the joints
      ctx.fillStyle = "#121212"; ctx.fillRect(-10, gy, ref + 20, G.h - gy);
      const R2 = rng(77);
      let y = gy + 1, rowH = G.phone ? 7 : 8, row = 0;
      while (y < G.h) {
        let x = -R2() * rowH * 2 - (row % 2) * rowH * .8;
        while (x < ref + 10) {
          const sw = rowH * (1.35 + R2() * .7), t = R2(), tint = R2();
          const base = tint < .7 ? [44 + t * 52, 48 + t * 50, 54 + t * 52]                 // blue-grey granite
                     : tint < .9 ? [62 + t * 46, 56 + t * 40, 50 + t * 34]                 // brown
                     : [80 + t * 40, 82 + t * 38, 84 + t * 36];                            // a paler stone
          const gap = Math.max(.9, rowH * .13), sx = x + gap / 2 + (R2() - .5) * gap * .6, sy = y + gap / 2, w = sw - gap, h = rowH - gap;
          const g = ctx.createLinearGradient(sx, sy, sx, sy + h);
          g.addColorStop(0, rgb(base, 1.25)); g.addColorStop(.35, rgb(base, 1)); g.addColorStop(1, rgb(base, .6));
          rr(ctx, sx, sy, w, h, Math.min(w, h) * .3); ctx.fillStyle = g; ctx.fill();
          if (R2() < .3) { ctx.fillStyle = `rgba(36,48,26,${.25 + R2() * .3})`; ctx.fillRect(sx - gap * .4, sy + h * (.6 + R2() * .3), w * (.3 + R2() * .5), gap * .9); }   // moss in the joint
          ctx.fillStyle = `rgba(210,220,235,${.06 + R2() * .1})`; ctx.fillRect(sx + w * .15, sy + h * .12, w * .6, Math.max(.5, h * .1));   // damp sheen on top
          x += sw;
        }
        y += rowH; rowH *= 1.1; row++;
      }
      grain(ctx, -10, gy, ref + 20, G.h - gy, .3, .6);
      ctx.fillStyle = vgrad(ctx, gy, gy + 16, [[0, "rgba(0,0,0,.55)"], [1, "rgba(0,0,0,0)"]]); ctx.fillRect(0, gy, ref, 16);   // shadow at the foot of the wall
      G.steps.forEach(st => {
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = sh(8); ctx.shadowOffsetY = sh(5);
        ctx.fillStyle = "#9d998f"; ctx.fillRect(st.x, st.y, st.w, st.h); ctx.restore();
        ctx.fillStyle = vgrad(ctx, st.y, st.y + st.h * .4, [[0, "#d9d5cb"], [1, "#b3afa4"]]); ctx.fillRect(st.x, st.y, st.w, st.h * .4);      // worn top, paler in the middle
        ctx.fillStyle = vgrad(ctx, st.y + st.h * .4, st.y + st.h, [[0, "#8f8b81"], [1, "#6c6961"]]); ctx.fillRect(st.x, st.y + st.h * .4, st.w, st.h * .6);
        const wg = ctx.createRadialGradient(st.x + st.w / 2, st.y + 2, 1, st.x + st.w / 2, st.y + 2, st.w * .45); wg.addColorStop(0, "rgba(255,255,255,.22)"); wg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = wg; ctx.fillRect(st.x, st.y, st.w, st.h * .4);
        ctx.fillStyle = "#3c3b39"; ctx.beginPath(); ctx.moveTo(st.x + st.w, st.y); ctx.lineTo(st.x + st.w - 7, st.y); ctx.lineTo(st.x + st.w - 3, st.y + 5); ctx.lineTo(st.x + st.w, st.y + 7); ctx.fill();   // a chipped corner
        grain(ctx, st.x, st.y, st.w, st.h, .4);
      });

      // 9. Two small white pumpkins on the step

      // 10. Light: blue-hour dusk over everything, then warm light spilling out of the shop
      ctx.fillStyle = vgrad(ctx, 0, G.h, [[0, "rgba(14,20,40,.22)"], [.45, "rgba(14,20,40,.04)"], [1, "rgba(14,20,40,.16)"]]); ctx.fillRect(0, 0, ref, G.h);
      ctx.globalCompositeOperation = "screen";
      const glow = (x, y, r, col, a) => { const g = ctx.createRadialGradient(x, y, 1, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
      ctx.save(); ctx.beginPath(); ctx.rect(-10, gy, ref + 20, G.h - gy); ctx.clip();          // shop light falls on the pavement, not the black joinery
      f.glass.forEach(gl => glow(gl.x + gl.w / 2, gy + 30, gl.w * .95, "255,170,90", .3));
      G.doors.forEach(d => glow(d.leaf.x + d.leaf.w / 2, gy + 20, d.leaf.w * 1.1, d.side === "l" ? "255,60,50" : "255,180,100", .14));
      ctx.restore();
      f.glass.forEach(gl => { ctx.save(); ctx.beginPath(); ctx.rect(f.sill.x, f.sill.y, f.sill.w, 3); ctx.clip(); glow(gl.x + gl.w / 2, f.sill.y, gl.w * .6, "255,190,120", .35); ctx.restore(); });
      G.doors.forEach(d => glow(d.transom.x + d.transom.w / 2, d.transom.y + d.transom.h / 2, d.transom.w * 1.3, d.side === "l" ? "255,40,40" : "255,190,110", d.side === "l" ? .32 : .22));
      glow(G.marquee.x + G.marquee.w / 2, G.marquee.y + G.marquee.h / 2, G.marquee.w * .75, "255,226,180", .2);
      glow(w.x + w.w / 2, ws.y, w.w * .35, "255,190,120", .14);
      ctx.globalCompositeOperation = "source-over";
      const vg = ctx.createRadialGradient(ref / 2, G.h * .58, G.h * .3, ref / 2, G.h * .55, G.h * .85); vg.addColorStop(0, "rgba(8,10,18,0)"); vg.addColorStop(1, "rgba(8,10,18,.42)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, ref, G.h);
    }

    /* ============================================================
       THE HANGING SIGN: a photo of a real antique sign (Kathi's reference) with its old words
       painted out and NOT RISING laid in, raised gold. The iron bracket is fixed to the wall;
       the chains and the board swing from it.
       ============================================================ */
    function hangingSign(words) {
      return `<img class="nrsf-hs-bracket" src="${img("sign-bracket.webp")}" alt="">` +
             `<img class="nrsf-hs-board" src="${img("sign-board.webp")}" alt="${esc(words)}">`;
    }

    function pumpkin(ctx, cx, by, w, tilt) {
      const h = w * .64;
      ctx.save(); ctx.translate(cx, by); ctx.rotate(tilt * Math.PI / 180);
      ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.beginPath(); ctx.ellipse(w * .04, -1, w * .55, h * .1, 0, 0, 7); ctx.fill();
      [[-.34, .34, .82], [.34, .34, .82], [-.18, .4, .92], [.18, .4, .92], [0, .36, 1]].forEach(([ox, rw, L]) => {   // the ribs, back to front
        const g = ctx.createRadialGradient(ox * w - w * .08, -h * .62, 1, ox * w, -h * .5, w * rw * 1.1);
        g.addColorStop(0, rgb([250, 247, 238], L)); g.addColorStop(.6, rgb([226, 219, 202], L)); g.addColorStop(1, rgb([168, 158, 138], L));
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(ox * w, -h * .5, w * rw, h * .5, 0, 0, 7); ctx.fill();
      });
      ctx.strokeStyle = "#5b4a2a"; ctx.lineWidth = w * .07; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, -h * .92); ctx.quadraticCurveTo(w * .02, -h * 1.15, w * .14, -h * 1.22); ctx.stroke();
      ctx.restore();
    }

    /* ============================================================
       D. THE IVY: Boston ivy, which really does climb brick and turn crimson in fall
       ============================================================ */
    // One Boston ivy leaf: three pointed lobes with fine teeth. Drawn once, reused at any size.
    const LEAVES = [0, 1, 2].map(v => {
      const deep = [.58, .5, .66][v], spread = [.62, .7, .55][v];
      const pts = [[0, 0], [-.42, -.06], [-spread, -.5], [-.22, -deep], [-.08, -.86], [0, -1], [.08, -.86], [.22, -deep], [spread, -.5], [.42, -.06], [0, 0]];
      const p = new Path2D();
      p.moveTo(0, 0);
      for (let i = 1; i < pts.length; i++) {               // each edge as a curve, with tiny serrations
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = 4;
        for (let k = 1; k <= n; k++) {
          const t = k / n, x = lerp(x0, x1, t), y = lerp(y0, y1, t), nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
          const bulge = Math.sin(t * Math.PI) * .07, tooth = k % 2 ? .018 : -.012;
          p.lineTo(x + nx / l * (bulge + tooth), y + ny / l * (bulge + tooth));
        }
      }
      p.closePath();
      return p;
    });
    const VEINS = new Path2D("M0 0 L0 -0.95 M0 -0.18 L-0.55 -0.48 M0 -0.18 L0.55 -0.48 M0 -0.5 L-0.2 -0.66 M0 -0.5 L0.2 -0.66");

    function drawLeaf(ctx, x, y, s, rot, col, shade, variant) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      const g = ctx.createLinearGradient(0, 0, .2, -1);
      g.addColorStop(0, rgb(col, shade * .62)); g.addColorStop(.55, rgb(col, shade)); g.addColorStop(1, rgb(col, shade * 1.18));
      const path = LEAVES[variant];
      ctx.fillStyle = g; ctx.fill(path);
      ctx.lineWidth = .025; ctx.strokeStyle = `rgba(20,4,4,${.45 * shade})`; ctx.stroke(path);
      ctx.lineWidth = .022; ctx.strokeStyle = `rgba(255,214,190,${.22 * shade})`; ctx.stroke(VEINS);
      ctx.fillStyle = `rgba(255,255,255,${.07 * shade})`; ctx.beginPath(); ctx.ellipse(-.14, -.58, .1, .2, -.4, 0, 7); ctx.fill();
      ctx.restore();
    }

    function growIvy() {
      const R = rng(2026), ref = G.ref, I = G.ivy, gy = G.ground, k = G.phone ? .55 : 1, band = I.side;
      const vines = [], leaves = [];
      const clear = (x, y) => I.keepClear.some(c => x > c.x + 4 && x < c.x + c.w - 4 && y > c.y + 4 && y < c.y + c.h - 4);
      // where ivy may grow: the top band, and a band down each side that narrows toward the street
      const allowed = (x, y) => {
        if (y < I.canopy * 1.5) return true;
        const w = y < G.shopTop ? band * 1.25 : band * (G.phone ? .5 : 1) * (1 - Math.max(0, (y - G.shopTop) / (gy - G.shopTop)) * .25);   // on phones, leave the door edges showing
        return x < w || x > ref - w;
      };
      const addLeaf = (x, y, size, dense = 1) => {
        if (clear(x, y) || y > gy + 4) return;
        leaves.push({ x, y, s: size, rot: Math.PI + (R() - .5) * 2, depth: R() * dense });
      };
      const along = (pts, every, size, spread, gate = true) => {
        pts.forEach(([x, y], i) => {
          if (!i || R() > every) return;
          const lx = x + (R() - .5) * spread, ly = y + (R() - .5) * spread * .7;
          if (gate && !allowed(lx, ly)) return;
          addLeaf(lx, ly, size[0] + R() * (size[1] - size[0]));
        });
      };
      // 1. Two old trunks rising from the pavement and hugging the outer corners
      [[0, 1], [ref, -1]].forEach(([edge, side]) => {
        const trunk = [], x0 = edge + side * band * .22;
        for (let y = gy + 6; y > -10; y -= 5 * k) trunk.push([x0 + side * (Math.sin(y * .021) * band * .16 + Math.sin(y * .057 + edge) * band * .07), y]);
        vines.push(trunk);
        along(trunk, .95, [16 * k, 30 * k], band * .5);
        // side shoots wandering over the corner, heading in and slightly down like real runners
        for (let i = 3; i < trunk.length; i += 3) {
          const [bx, by] = trunk[i], len = band * (.5 + R() * .9) * (by < G.shopTop ? 1.3 : 1);
          let dir = side > 0 ? (R() - .35) * 1.4 : Math.PI - (R() - .35) * 1.4, x = bx, y = by;
          const pts = [[x, y]];
          for (let t = 0; t < len; t += 5 * k) {
            dir += (R() - .5) * .5;
            x += Math.cos(dir) * 5 * k; y += Math.sin(dir) * 5 * k;
            if (!allowed(x, y)) break;
            pts.push([x, y]);
          }
          vines.push(pts);
          along(pts, .97, [13 * k, 27 * k], 18 * k);
        }
      });
      // 2. A runner along the roofline, and shoots hanging from it, shorter over the window and signs
      const top = [];
      for (let x = -20; x < ref + 20; x += 6 * k) top.push([x, 6 + Math.sin(x * .03) * 6]);
      vines.push(top);
      along(top, .98, [14 * k, 26 * k], 26 * k, false);
      for (let x = -10; x < ref + 10; x += 13 * k) {
        const blocked = clear(x, I.canopy) || clear(x, I.canopy * 1.6);
        let len = I.canopy * (.45 + R() * .9);
        if (!blocked && R() < .22) len += R() * I.droop;                // a long strand trailing down the wall
        if (blocked) len *= .6;
        let dir = Math.PI / 2 + (R() - .5) * .4, px = x, py = 4;
        const pts = [[px, py]];
        for (let t = 0; t < len; t += 5 * k) { dir += (R() - .5) * .3; dir = Math.max(.9, Math.min(2.2, dir)); px += Math.cos(dir) * 5 * k; py += Math.sin(dir) * 5 * k; pts.push([px, py]); }
        vines.push(pts);
        along(pts, .95, [12 * k, 24 * k], 22 * k, false);
      }
      // 3. Runners creeping along the top of the cornice from each end
      [[0, 1], [ref, -1]].forEach(([x0, side]) => {
        const pts = [];
        for (let t = 0; t < (G.phone ? 60 : 160); t += 5 * k) pts.push([x0 + side * t, G.cornice.y - 3 + Math.sin(t * .08) * 3]);
        vines.push(pts);
        along(pts, .9, [10 * k, 20 * k], 12 * k, false);
      });
      // 4. Fallen leaves on the pavement and the steps
      for (let i = 0; i < (G.phone ? 14 : 34); i++) leaves.push({ x: R() * ref, y: gy + 6 + R() * (G.h - gy - 10), s: (9 + R() * 8) * k, rot: R() * 7, depth: .6 + R() * .4, ground: true });
      return { vines, leaves };
    }

    function paintIvy() {
      const c = $("nrsf-ivy"), ctx = sizeCanvas(c, W, H, dpr);
      ctx.setTransform(dpr * u, 0, 0, dpr * u, 0, 0);
      const { vines, leaves } = growIvy(), pal = S.leaves.map(hex), SP = leafSprites();
      paintAwning(ctx);                                       // the clear awning sits under the ivy
      // Shadows first: draw every leaf as a silhouette at low resolution, then lay it back blurred
      const sc = .22, shc = document.createElement("canvas");
      shc.width = Math.max(1, W * sc); shc.height = Math.max(1, H * sc);
      const sx = shc.getContext("2d"); sx.setTransform(u * sc, 0, 0, u * sc, 0, 0); sx.fillStyle = "#000";
      leaves.forEach((l, i) => { if (l.ground) return; sx.save(); sx.translate(l.x + 4, l.y + 7); sx.rotate(l.rot); sx.scale(l.s, l.s); sx.fill(LEAVES[i % 3]); sx.restore(); });
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = .42; ctx.imageSmoothingQuality = "high"; ctx.drawImage(shc, 0, 0, W * dpr, H * dpr); ctx.restore();
      // The vines themselves
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      vines.forEach((pts, i) => {
        ctx.strokeStyle = i < 2 ? "#3a2a20" : "#4a3426"; ctx.lineWidth = (i < 2 ? 3.2 : 1.3) * (G.phone ? .7 : 1);
        ctx.beginPath(); pts.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      });
      // Two small white pumpkins on the step, in front of the door (switched on in storefront-data.js)
      if (S.pumpkins) {
        const p = G.pumpkins;
        pumpkin(ctx, p.x + p.w * .34, p.y, p.w * .62, -4); pumpkin(ctx, p.x + p.w * .78, p.y, p.w * .42, 7);
        ctx.fillStyle = "rgba(14,20,40,.12)"; ctx.fillRect(p.x - 10, p.y - p.w * .7, p.w + 20, p.w * .75);
      }
      // The leaves, back to front: deeper ones darker, ones near the shop warmer
      leaves.sort((a, b) => a.depth - b.depth).forEach((l, i) => {
        let col = pal[(hash(i, 5) * pal.length) | 0];
        const nearShop = Math.max(0, Math.min(1, (l.y - G.shopTop + 80) / 260));
        col = mix(col, [255, 170, 90], nearShop * .18);
        const shade = (.5 + l.depth * .55) * (l.y < 120 ? .85 : 1) * (l.ground ? .7 : 1);
        if (l.ground && SP) {                               // a fallen maple leaf (from the photos), lying flat on the cobbles
          const z = l.s * 1.5;
          ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot); ctx.scale(1, .6);
          ctx.drawImage(SP[1][(hash(i, 5) * LEAF.n) | 0], -z / 2, -z / 2, z, z); ctx.restore();
        } else drawLeaf(ctx, l.x, l.y, l.s, l.rot, col, shade, i % 3);   // Boston ivy on the walls
      });
      // Dusk settles over the ivy too
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = vgrad(ctx, 0, G.h, [[0, "rgba(10,14,30,.35)"], [.5, "rgba(10,14,30,.08)"], [1, "rgba(10,14,30,.2)"]]); ctx.fillRect(0, 0, G.ref, G.h);
      ctx.globalCompositeOperation = "source-over";
      paintLanterns(ctx);
    }

    /* The clear corrugated awning over the shopfront (after the café photo): glass panels on thin
       black rafters, seen from below, sloping out from the wall under the fascia */
    function paintAwning(ctx) {
      const A = G.awning; if (!A) return;
      const { x0, x1, wall, front, spread } = A, n = Math.round((x1 - x0) / (G.phone ? 60 : 96));
      const fx = x => (x - (x0 + x1) / 2) * (1 + spread) + (x0 + x1) / 2;   // the front edge is a touch wider: it's closer to you
      ctx.save();
      ctx.beginPath(); ctx.moveTo(x0, wall); ctx.lineTo(x1, wall); ctx.lineTo(fx(x1), front); ctx.lineTo(fx(x0), front); ctx.closePath();
      ctx.fillStyle = vgrad(ctx, wall, front, [[0, "rgba(40,44,52,.30)"], [.4, "rgba(170,185,205,.10)"], [1, "rgba(215,225,236,.18)"]]); ctx.fill();
      ctx.clip();
      // rain marks and dust on the glass
      const R = rng(12);
      for (let i = 0; i < (G.phone ? 40 : 120); i++) { ctx.fillStyle = `rgba(235,240,245,${.05 + R() * .12})`; const x = x0 + R() * (x1 - x0), y = wall + R() * (front - wall); ctx.beginPath(); ctx.ellipse(x, y, 1 + R() * 3, .6 + R(), 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = hgrad(ctx, x0, x1, [[0, "rgba(255,255,255,0)"], [.3, "rgba(255,255,255,.10)"], [.36, "rgba(255,255,255,0)"], [.7, "rgba(255,255,255,0)"], [.74, "rgba(255,255,255,.07)"], [1, "rgba(255,255,255,0)"]]); ctx.fillRect(x0 - 40, wall, x1 - x0 + 80, front - wall);
      ctx.restore();
      // the rafters, the corrugations, and the gutter along the front
      for (let i = 0; i <= n; i++) {
        const x = x0 + (x1 - x0) * i / n;
        ctx.strokeStyle = "#0b0b0c"; ctx.lineWidth = G.phone ? 1.6 : 2.6; ctx.beginPath(); ctx.moveTo(x, wall); ctx.lineTo(fx(x), front); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(x - 1, wall); ctx.lineTo(fx(x) - 1, front); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = .8;
      for (let x = x0; x < x1; x += G.phone ? 4 : 6) { ctx.beginPath(); ctx.moveTo(x, wall); ctx.lineTo(fx(x), front); ctx.stroke(); }
      ctx.fillStyle = vgrad(ctx, front - 2, front + (G.phone ? 3 : 5), [[0, "#3a3a3c"], [.3, "#141415"], [1, "#050505"]]); ctx.fillRect(fx(x0), front - 2, fx(x1) - fx(x0), G.phone ? 5 : 7);
      ctx.fillStyle = "#0b0b0c"; ctx.fillRect(x0, wall - 2, x1 - x0, 3);
    }

    /* Warm globe lanterns hanging from the front of the awning */
    function paintLanterns(ctx) {
      const A = G.awning; if (!A) return;
      const r = G.phone ? 9 : 15;
      A.lamps.forEach(x => {
        const top = A.front + 3, cy = top + r * 1.15 + (G.phone ? 4 : 8);
        ctx.strokeStyle = "#0b0b0c"; ctx.lineWidth = G.phone ? 1.4 : 2; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, cy - r); ctx.stroke();
        ctx.fillStyle = "#151515"; ctx.fillRect(x - r * .35, cy - r - r * .3, r * .7, r * .35);       // the brass-black fitter
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        const halo = ctx.createRadialGradient(x, cy, r * .5, x, cy, r * 6);
        halo.addColorStop(0, "rgba(255,190,110,.35)"); halo.addColorStop(.35, "rgba(255,160,80,.12)"); halo.addColorStop(1, "rgba(255,140,60,0)");
        ctx.fillStyle = halo; ctx.fillRect(x - r * 6, cy - r * 6, r * 12, r * 12); ctx.restore();
        const g = ctx.createRadialGradient(x - r * .25, cy - r * .3, r * .1, x, cy, r);
        g.addColorStop(0, "#fffbea"); g.addColorStop(.5, "#ffe3a6"); g.addColorStop(.85, "#f5b862"); g.addColorStop(1, "#c98236");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, cy, r, 0, 7); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.ellipse(x - r * .35, cy - r * .4, r * .22, r * .14, -.5, 0, 7); ctx.fill();
      });
    }

    /* ============================================================
       E. DOORS & GLASS
       ============================================================ */
    function paintDoor(canvas, r, kind) {
      const ctx = sizeCanvas(canvas, r.w * u, r.h * u, dpr);
      ctx.setTransform(dpr * u, 0, 0, dpr * u, 0, 0);
      const w = r.w, h = r.h;
      const base = kind === "red" ? [96, 14, 20] : [22, 22, 24];
      ctx.fillStyle = hgrad(ctx, 0, w, [[0, rgb(base, .7)], [.3, rgb(base, 1.15)], [.55, rgb(base, 1)], [1, rgb(base, .6)]]); ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = hgrad(ctx, w * .22, w * .4, [[0, "rgba(255,255,255,0)"], [.5, "rgba(255,255,255,.06)"], [1, "rgba(255,255,255,0)"]]); ctx.fillRect(0, 0, w, h);   // lacquer sheen
      const st = w * .13, rail = h * .055;
      if (kind === "red") {
        // a mysterious red door: four deep panels, aged brass, no window, nothing given away
        const pw = (w - st * 2 - st * .8) / 2;
        [[rail, h * .4], [h * .5, h * .42]].forEach(([py, ph]) => [0, 1].forEach(i => panel(ctx, st + i * (pw + st * .8), py, pw, ph, base, G.phone ? 5 : 7)));
        grainWood(ctx, 0, 0, w, h, .6, G.phone ? .3 : .42);                      // real wood grain under the red paint
        brassPlate(ctx, w * .3, h * .455, w * .4, h * .03);
        brassDisc(ctx, w * .84, h * .48, w * .045);
        brassDisc(ctx, w * .5, h * .27, w * .03);                                   // the spy-hole
        ctx.fillStyle = "#120304"; ctx.beginPath(); ctx.arc(w * .5, h * .27, w * .012, 0, 7); ctx.fill();
      } else {
        // unit 9: glazed above so you can see the shop, a panel below, a brass kick plate
        const gx = st, gy = rail, gw = w - st * 2, gh = h * .44;
        ctx.fillStyle = "#050505"; ctx.fillRect(gx - 3, gy - 3, gw + 6, gh + 6);
        const tmp = document.createElement("canvas");
        paintShelves(tmp, gw, gh, u, dpr, 9, { shelf: G.phone ? 24 : 30, lamps: [.5] });
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = "blur(1px)"; ctx.drawImage(tmp, gx * u * dpr, gy * u * dpr, gw * u * dpr, gh * u * dpr); ctx.restore();
        ctx.fillStyle = "rgba(150,168,205,.14)"; ctx.fillRect(gx, gy, gw, gh * .4);
        ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.beginPath(); ctx.moveTo(gx, gy + gh * .8); ctx.lineTo(gx + gw * .5, gy); ctx.lineTo(gx + gw * .7, gy); ctx.lineTo(gx, gy + gh); ctx.fill();
        bevel(ctx, gx - 3, gy - 3, gw + 6, gh + 6, 1.2, "rgba(0,0,0,.6)", "rgba(255,255,255,.14)");
        panel(ctx, st, h * .6, w - st * 2, h * .3, base, G.phone ? 5 : 7);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.rect(gx - 3, gy - 3, gw + 6, gh + 6); ctx.clip("evenodd");   // grain everywhere but the glass
        grainWood(ctx, 0, 0, w, h, .35, G.phone ? .3 : .42); ctx.restore();
        brassPlate(ctx, w * .3, h * .52, w * .4, h * .03);
        brassDisc(ctx, w * .14, h * .55, w * .045);
        ctx.fillStyle = vgrad(ctx, h * .94, h, [[0, "#e9cf8a"], [.5, "#b48c42"], [1, "#6a4e1c"]]); ctx.fillRect(0, h * .94, w, h * .06);
      }
      ctx.fillStyle = vgrad(ctx, h * .8, h, [[0, "rgba(0,0,0,0)"], [1, "rgba(0,0,0,.35)"]]); ctx.fillRect(0, h * .8, w, h * .2);   // scuffs at the foot
      grain(ctx, 0, 0, w, h, .25);
      bevel(ctx, 0, 0, w, h, 1.4, "rgba(255,255,255,.12)", "rgba(0,0,0,.7)");
    }

    // The poster window: the Poetic Drift poster on an easel, in front of the bookshop's
    // shelves, with the street reflected in the glass (like the Notting Hill Bookshop)
    function buildPosters(gl) {
      const host = $("nrsf-posters"), best = POSTERS.find(p => p.kind === "bestseller");
      const linkAttrs = p => { const href = LINKS[p.link] || p.link, ext = /^https?:/.test(href); return `href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ` data-link="${esc(p.link)}"`}`; };
      const bestHTML = (x, y, w) => best ? `<a class="nrsf-poster" ${linkAttrs(best)} style="${pos(x, y, w)}transform:rotate(-1deg)" aria-label="${esc(best.book)} by ${esc(best.author)}: ${esc(best.rank)} NOT RISING Magazine, Best Storyteller">
          <span class="nrsf-p-best"><span class="l1"><em>${esc(best.rank)}</em> NOT RISING MAGAZINE</span><span class="l2">BEST STORYTELLER</span>
          <span class="book"><img src="${img(best.cover)}" alt=""></span><span class="by">NEW BOOK BY <b>${esc(best.author.toUpperCase())}</b></span><span class="title">${esc(best.book.toUpperCase())}</span></span></a>` : "";
      let html = "";
      if (!G.phone) {
        const ew = 178, ex = 14, ey = 34, legH = gl.h - ey;
        html += `<svg class="nrsf-easel" style="${pos(ex, ey - 6, ew, legH + 6)}" viewBox="0 0 ${ew} ${legH + 6}"><g stroke-linecap="round"><path d="M${ew / 2} 0 L18 ${legH}" stroke="#4a2e18" stroke-width="5"/><path d="M${ew / 2} 0 L${ew - 18} ${legH}" stroke="#4a2e18" stroke-width="5"/><path d="M${ew / 2} 0 L${ew / 2} ${legH - 4}" stroke="#2e1c0e" stroke-width="4"/><path d="M8 ${legH - 44} H${ew - 8}" stroke="#5b3a1f" stroke-width="7"/></g></svg>`;
        html += bestHTML(ex + 9, ey, ew - 18);
        html += `<span class="nrsf-bed" style="height:${12 * u}px"></span>`;
      } else {
        html += bestHTML(8, 10, gl.w - 16);
        html += `<span class="nrsf-bed" style="height:${10 * u}px"></span>`;
      }
      host.innerHTML = html;
    }

    // The newsstand window: a little copy of the real newsstand. Every issue in order on
    // clear glass shelves, a number tag under each, vanity globes all the way round.
    function buildNews(gl) {
      const host = $("nrsf-covers"), NR = window.NR;
      const issues = NR ? NR.FEATURES.map((f, i) => ({ f, no: String(i + 1).padStart(2, "0") })).filter(o => o.f.cover) : [];
      const P = G.phone
        ? { ring: 8, gap: 25, r: 4.2, x0: 18, x1: 97, y0: 58, cols: 2, coverW: 28, rowH: 53, tag: 3.4, tagGap: 5 }
        : { ring: 13, gap: 30, r: 6.2, x0: 30, x1: 271, y0: 70, cols: 6, coverW: 32, rowH: 67, tag: 4.4, tagGap: 7 };
      const pw = (P.x1 - P.x0) / P.cols, ch = P.coverW * 1056 / 816;
      let html = "";
      issues.forEach(({ f, no }, i) => {
        const col = i % P.cols, row = (i / P.cols) | 0;
        const cx = P.x0 + col * pw + (pw - P.coverW) / 2, cy = P.y0 + row * P.rowH;
        if (cy + ch > gl.h - P.ring * 2) return;                      // no room left in this window
        html += `<span class="nrsf-stack" style="${pos(cx + 2, cy - 2, P.coverW, ch)}"></span>`;
        html += `<img class="nrsf-mag" src="${img("thumbs/" + NR.IMAGES[f.cover], NS_BASE)}" alt="" style="${pos(cx, cy, P.coverW, ch)}">`;
        html += `<span class="nrsf-tag" style="left:${cx * u}px;top:${(cy + ch + P.tagGap) * u}px;font-size:${P.tag * u}px">NO. ${no}</span>`;
        if (col === 0) html += `<span class="nrsf-glass-shelf" style="${pos(P.x0 - 6, cy + ch, P.x1 - P.x0 + 12, 4)}"></span>`;
      });
      // the ring of vanity globes round the inside of the window
      const pts = [], e = P.ring, nx = Math.max(2, Math.round((gl.w - 2 * e) / P.gap)), ny = Math.max(2, Math.round((gl.h - 2 * e) / P.gap));
      for (let k = 0; k <= nx; k++) { const x = e + (gl.w - 2 * e) * k / nx; pts.push([x, e], [x, gl.h - e]); }
      for (let k = 1; k < ny; k++) { const y = e + (gl.h - 2 * e) * k / ny; pts.push([e, y], [gl.w - e, y]); }
      html += `<svg class="nrsf-rackbulbs" style="${pos(0, 0, gl.w, gl.h)}" viewBox="0 0 ${gl.w} ${gl.h}">${DEFS}${pts.map(([x, y]) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="${P.r * 3}" fill="url(#nrsf-halo)"/><circle r="${P.r}" fill="url(#nrsf-globe)"/><ellipse cx="${-P.r * .32}" cy="${-P.r * .38}" rx="${P.r * .32}" ry="${P.r * .2}" fill="#fff" opacity=".7"/></g>`).join("")}</svg>`;
      // "The Newsstand" gilt sign-writing on the glass, arched above the magazines and inside the bulbs
      const w = gl.w, gold = `<defs><linearGradient id="nrsf-gilt-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c9"/><stop offset=".5" stop-color="#d9b46a"/><stop offset="1" stop-color="#9a7230"/></linearGradient></defs>`;
      html += `<svg class="nrsf-gilt" style="${pos(0, 0, w, gl.h)}" viewBox="0 0 ${w} ${gl.h}">${gold}` + (G.phone
        ? `<g font-family="Cinzel, Georgia, serif" font-weight="700" text-anchor="middle" fill="url(#nrsf-gilt-g)" stroke="#2a1b08" stroke-width=".4" paint-order="stroke"><text x="${w / 2}" y="30" font-size="10" letter-spacing="1">The</text><text x="${w / 2}" y="47" font-size="14" letter-spacing=".5">Newsstand</text></g>`
        : `<path id="nrsf-arc" d="M44 58 Q${w / 2} 22 ${w - 44} 58" fill="none"/><text font-family="Cinzel, Georgia, serif" font-weight="700" font-size="23" letter-spacing="2.5" fill="url(#nrsf-gilt-g)" stroke="#2a1b08" stroke-width=".6" paint-order="stroke"><textPath href="#nrsf-arc" startOffset="50%" text-anchor="middle">The Newsstand</textPath></text>`) + `</svg>`;
      host.innerHTML = html;
    }

    /* ============================================================
       F. LIFE: bulbs, string lights, falling leaves, doors
       ============================================================ */
    const DEFS = `<defs>
      <radialGradient id="nrsf-globe" cx=".45" cy=".42" r=".62"><stop offset="0" stop-color="#fffef8"/><stop offset=".55" stop-color="#fff0c8"/><stop offset=".85" stop-color="#ffd98a"/><stop offset="1" stop-color="#e9b25a"/></radialGradient>
      <radialGradient id="nrsf-halo"><stop offset="0" stop-color="#ffe2a8" stop-opacity=".55"/><stop offset=".35" stop-color="#ffc874" stop-opacity=".2"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
      <radialGradient id="nrsf-glass2" cx=".5" cy=".55" r=".65"><stop offset="0" stop-color="#fff6d8"/><stop offset=".5" stop-color="#ffd690" stop-opacity=".95"/><stop offset="1" stop-color="#e8a24a" stop-opacity=".85"/></radialGradient></defs>`;
    function drawGlobes(el) {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      const r = (G.phone ? 6 : 9) * u, edge = (G.phone ? 10 : 14) * u, target = (G.phone ? 30 : 46) * u, pts = [];
      const nx = Math.max(2, Math.round((w - 2 * edge) / target)), ny = Math.max(1, Math.round((h - 2 * edge) / target));
      for (let i = 0; i <= nx; i++) { const x = edge + (w - 2 * edge) * i / nx; pts.push([x, edge], [x, h - edge]); }
      for (let j = 1; j < ny; j++) { const y = edge + (h - 2 * edge) * j / ny; pts.push([edge, y], [w - edge, y]); }
      el.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}${pts.map(([x, y]) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <circle r="${r * 3.2}" fill="url(#nrsf-halo)"/><circle r="${r}" fill="url(#nrsf-globe)"/><ellipse cx="${-r * .32}" cy="${-r * .38}" rx="${r * .32}" ry="${r * .2}" fill="#fff" opacity=".7"/></g>`).join("")}</svg>`;
    }
    /* ---------- Lay everything out and paint it ---------- */
    function build() {
      W = root.clientWidth;
      if (!W) return;
      G = W < 640 ? PHONE : DESK;
      root.classList.toggle("nrsf--phone", !!G.phone);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      u = W / G.ref; H = G.h * u;
      scene.style.height = H + "px";
      root.style.setProperty("--u", u + "px");
      root.style.setProperty("--street", streetReflection());
      root.style.setProperty("--wood", `url("${img("wood.jpg")}")`);

      place($("nrsf-sign"), G.sign);
      place($("nrsf-marquee-box"), G.marquee);
      place($("nrsf-fascia"), G.fascia);
      place($("nrsf-neon"), G.neon);
      place($("nrsf-num"), G.num);
      place($("nrsf-win-posters"), G.front.glass[0]);
      place($("nrsf-win-news"), G.front.glass[1]);
      const [dl, dr] = G.doors;
      place($("nrsf-door-l"), dl.leaf);
      place($("nrsf-door-r"), dr.leaf);

      paintBuilding();
      paintIvy();
      paintDoor($("nrsf-door-l").querySelector("canvas"), dl.leaf, "red");
      paintDoor($("nrsf-door-r").querySelector("canvas"), dr.leaf, "black");
      // the same warm bookshop behind both windows (and the glass of the black door)
      [$("nrsf-win-posters"), $("nrsf-win-news")].forEach((win, i) => {
        const gl = G.front.glass[i];
        paintShelves(win.querySelector(".nrsf-interior"), gl.w, gl.h, u, dpr, 40 + i, { shelf: G.phone ? 26 : 34, lamps: G.phone ? [.5] : [.25, .75] });
      });
      buildPosters(G.front.glass[0]);
      buildNews(G.front.glass[1]);
      wireLinks();
      drawGlobes($("nrsf-marquee-lights"));
      placeOpenSign(dr.leaf);
    }

    /* The glowing OPEN sign, centred in the glass pane of the black door (unit 9).
       The pane is painted by paintDoor: it starts 13% in from each side and 5.5% down, and is 44% of the door tall. */
    function placeOpenSign(leaf) {
      const el = root.querySelector(".nrsf-opensign");
      if (!el) return;
      const gx = leaf.w * .13, gy = leaf.h * .055, gw = leaf.w - gx * 2, gh = leaf.h * .44;
      const w = gw * .52, h = w * 130 / 60;
      Object.assign(el.style, { left: (gx + (gw - w) / 2) * u + "px", top: (gy + (gh - h) / 2) * u + "px", width: w * u + "px", height: h * u + "px" });
    }

    /* ---------- Falling leaves (from the ivy) on a light breeze ---------- */
    const sprites = [];
    function makeSprites() {
      const SP = leafSprites();
      sprites.length = 0;
      if (SP) { try { SP[2].forEach(c => sprites.push(c.toDataURL())); return; } catch { sprites.length = 0; } }   // the real maple leaves
      S.leaves.forEach((hx, i) => {                          // fallback: painted leaves in the season's colours
        const c = document.createElement("canvas"); c.width = c.height = 64;
        const x = c.getContext("2d"); x.translate(32, 56);
        drawLeaf(x, 0, 0, 50, 0, hex(hx), 1, i % 3);
        sprites.push(c.toDataURL());
      });
    }
    let inView = true;                                       // no leaves fall while the street is scrolled out of sight
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => (inView = e.isIntersecting)).observe(root);
    function startLeaves() {
      if (!S.falling || reduceMotion) return;
      makeSprites();
      const fallEl = $("nrsf-fall");
      const drop = () => {
        if (!G) return;
        const el = document.createElement("img"), size = (G.phone ? 16 : 22) * u * (.7 + Math.random() * .6) * (G.phone ? 2 : 1);
        el.src = sprites[(Math.random() * sprites.length) | 0]; el.alt = ""; el.width = el.height = size;
        fallEl.appendChild(el);
        const x0 = Math.random() * W, drift = (40 + Math.random() * 160) * (Math.random() < .5 ? -1 : 1), spin = 180 + Math.random() * 400, dur = 7000 + Math.random() * 6000;
        const frames = [];
        for (let k = 0; k <= 10; k++) {
          const t = k / 10;
          frames.push({ transform: `translate(${x0 + drift * t + Math.sin(t * Math.PI * 3) * 26}px, ${-40 + (H + 80) * t}px) rotate(${spin * t}deg) rotateX(${Math.sin(t * 7) * 60}deg)`, opacity: t > .92 ? 1 - (t - .92) * 12 : 1 });
        }
        el.animate(frames, { duration: dur, easing: "linear" }).finished.then(() => el.remove());
      };
      const loop = () => { if (inView && !document.hidden) drop(); setTimeout(loop, 1000 + Math.random() * 1800); };
      for (let i = 0; i < 3; i++) setTimeout(drop, i * 600);
      setTimeout(loop, 2000);
    }

    /* ---------- Doors and windows lead somewhere ---------- */
    const toastEl = $("nrsf-toast");
    let toastTimer;
    const toast = msg => { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 3200); };
    const NAMES = { tradingPost: "the Trading Post", speakeasy: "the Speakeasy", newsstand: "the Newsstand" };
    function wireLinks() {
      root.querySelectorAll("[data-link]").forEach(a => {
        if (a.dataset.wired) return;
        a.dataset.wired = "1";
        const key = a.dataset.link;
        a.setAttribute("href", LINKS[key] || key);
        a.addEventListener("click", e => {
          e.preventDefault();
          const door = a.classList.contains("nrsf-door") ? a : null;
          if (door) { door.classList.add("open"); root.classList.add("into-light"); }   // into-light: the veil turns white
          if (PREVIEW) {
            if (key === "speakeasy" && window.NRSF_SHOW_SPEAKEASY) { setTimeout(() => window.NRSF_SHOW_SPEAKEASY(), door ? 650 : 0); setTimeout(() => door && door.classList.remove("open"), 1400); return; }
            toast(`On the live site, this takes you into ${NAMES[key] || key} (${LINKS[key] || key}).`);
            setTimeout(() => door && door.classList.remove("open"), 1600);
            return;
          }
          if (reduceMotion) { location.href = LINKS[key] || key; return; }
          const r = a.getBoundingClientRect(), s = root.getBoundingClientRect();
          scene.style.transformOrigin = `${r.left - s.left + r.width / 2}px ${r.top - s.top + r.height / 2}px`;
          setTimeout(() => root.classList.add("leaving"), door ? 450 : 0);
          if (door) { try { sessionStorage.setItem("nr-light", "1"); } catch (e) {} }   // tells the next page to fade in from white
          setTimeout(() => (location.href = LINKS[key] || key), door ? 1450 : 850);
        });
      });
    }
    addEventListener("pageshow", () => { root.classList.remove("leaving", "into-light"); root.querySelectorAll(".open").forEach(d => d.classList.remove("open")); });

    // Load the photo textures first, then paint
    const load = (key, path) => new Promise(res => { const i = new Image(); i.onload = () => { TEX[key] = i; res(); }; i.onerror = () => res(); i.src = img(path); });
    const texReady = Promise.all([load("bricks", "bricks.jpg"), load("wood", "wood.jpg"), load("leaves", "leaves.webp")]);
    const fontsReady = document.fonts
      ? Promise.all(["700 20px Cinzel", "400 20px Sancreek", "600 20px Oswald", "400 20px \"Archivo Black\""].map(f => document.fonts.load(f).catch(() => {})))
      : Promise.resolve();
    // Paint once, when the photo textures and the fonts are in (fonts get 3 seconds at most).
    // If the fonts turn up after that, repaint once more so the lettering uses them.
    let built = false;
    fontsReady.then(() => built && build());
    Promise.all([texReady, Promise.race([fontsReady, new Promise(r => setTimeout(r, 3000))])]).then(() => { build(); built = true; startLeaves(); });
    if ("ResizeObserver" in window) {
      let t, lastW = root.clientWidth;                         // only repaint when the width really changes
      new ResizeObserver(() => { if (!built || root.clientWidth === lastW) return; lastW = root.clientWidth; clearTimeout(t); t = setTimeout(build, 150); }).observe(root);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
