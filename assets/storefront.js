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
      sign: { x: 800, y: 110, w: 100 }, marquee: { x: 276, y: 334, w: 648, h: 148 },
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
      floorSign: { x: 210, y: 922, w: 82 },     // A-frame on the pavement in front of the pier between the red door and the poster window
      awning: { x0: 34, x1: 1166, wall: 624, front: 650, spread: .02, lamps: [251, 600, 949] },
      ivy: { side: 84, canopy: 64, droop: 170, keepClear: [{ x: 452, y: 56, w: 296, h: 262 }, { x: 272, y: 330, w: 656, h: 156 }, { x: 790, y: 100, w: 220, h: 220 }, { x: 84, y: 600, w: 1032, h: 520 }] }
    };
  })();
  const PHONE = (() => {
    // Phone plan, left to right (400 units = the width of the screen):
    // red door 0-90 | pier | poster window | post | newsstand window | pier | black door 310-400.
    // Both doors sit fully on screen at the edges, and the SPEAKEASY sign sits on the red door's transom, as on desktop.
    const doors = [
      { side: "l", opening: { x: 0, y: 536, w: 90, h: 352 }, transom: { x: 6, y: 544, w: 78, h: 72 }, bar: { y: 616, h: 10 }, leaf: { x: 10, y: 630, w: 70, h: 254 } },
      { side: "r", opening: { x: 310, y: 536, w: 90, h: 352 }, transom: { x: 316, y: 544, w: 78, h: 72 }, bar: { y: 616, h: 10 }, leaf: { x: 320, y: 630, w: 70, h: 254 } }
    ];
    return {
      ref: 400, h: 1060, ground: 888, shopTop: 530, phone: true,   // h 992: a deeper pavement so the floor sign stands clear of the doors and windows
      upperWin: { x: 75, y: 104, w: 150, h: 176 }, lintel: { x: 67, y: 86, w: 166, h: 18 }, wsill: { x: 66, y: 280, w: 168, h: 12 },
      sign: { x: 236, y: 120, w: 75 }, marquee: { x: 10, y: 306, w: 380, h: 118 },
      cornice: { x: -4, y: 436, w: 408, h: 22 }, fascia: { x: 6, y: 458, w: 388, h: 72 },
      corbels: [{ x: -8, y: 448, w: 20, h: 100 }, { x: 388, y: 448, w: 20, h: 100 }],
      piers: [{ x: 90, w: 8 }, { x: 302, w: 8 }],
      doors,
      front: { x: 98, y: 536, w: 204, h: 352, rail: 8, posts: [98, 196, 294], postW: 8,
        transomBand: { x: 106, y: 544, w: 188, h: 72 }, bar: { y: 616, h: 10 },
        glass: [{ x: 106, y: 626, w: 90, h: 200 }, { x: 204, y: 626, w: 90, h: 200 }],
        sill: { x: 94, y: 826, w: 212, h: 12 }, riser: { x: 102, y: 838, w: 196, h: 50 } },
      steps: [{ x: -4, y: 888, w: 100, h: 14 }, { x: 304, y: 888, w: 100, h: 14 }],
      neon: doors[0].transom, num: doors[1].transom,
      pumpkins: { x: 344, y: 889, w: 48 },
      floorSign: { x: 47, y: 890, w: 92 },      // poster-sized on the pavement, below the red door and the window, so it covers nothing you tap
      awning: { x0: 6, x1: 394, wall: 530, front: 546, spread: .02, lamps: [94, 306] },
      ivy: { side: 34, canopy: 46, droop: 90, keepClear: [{ x: 62, y: 80, w: 176, h: 214 }, { x: 8, y: 302, w: 384, h: 126 }, { x: 230, y: 112, w: 162, h: 166 }, { x: 0, y: 520, w: 400, h: 460 }] }
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
       redbrick-red.webp her red-brick photo (it tiles seamlessly both ways), recoloured deeper and redder to
                   match her second brick photo. Used for the street-level wall and the piers, sized so one
                   course of brick matches the painted courses upstairs.
       cobbles.webp her cobblestone photo, made to tile left to right with no seam. Small stones at the
                   top, big ones at the bottom, so it already has the street's perspective built in.
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
    // Two rows on the letter board: the big headline, then a smaller line under it (if there is one)
    $("nrsf-marquee").innerHTML = `<span class="row">${tiles(SIGNS.marquee)}</span>` + (SIGNS.marqueeSub ? `<span class="row sub">${tiles(SIGNS.marqueeSub)}</span>` : "");
    // The A-frame floor sign: a white frame and legs, two dark clips holding a black poster. On the poster, in
    // tall white letters (Oswald): INSPIRED BY / RAMH / LIBRARY, a tiny hairline ornament, and the
    // Robots Ate My Homework logo (img/ramh-logo.webp) along the bottom, on a little white card (the logo is drawn on white,
    // with black outlines and a wavy black line, so it needs white behind it to show on the black poster).
    // Drawn on a 100 x 172 grid; the poster is 70 wide (x 15-85) and 112 tall (y 13-125), so everything is
    // centred on x = 50. The three lines are all stretched to the same width (textLength 54), so they make a neat block.
    // The logo picture is 900 x 161 pixels, so its height is its width divided by 5.59.
    // The poster is written once (FLOOR_POSTER) and used twice: on the sign, and blown up when you click the sign.
    let FLOOR_POSTER = "";
    {
      const [l1, l2, l3] = SIGNS.floorSign || [], fs = $("nrsf-floorsign");
      const LW = 58, LH = LW * 161 / 900, LX = 50 - LW / 2, LY = 100;  // the logo's width, height, left edge and top edge
      const line = (y, size, text, adjust) => `<text x="50" y="${y}" font-size="${size}" textLength="54" lengthAdjust="${adjust}">${esc((text || "").toUpperCase())}</text>`;
      FLOOR_POSTER = `<rect x="15" y="13" width="70" height="112" rx="1" fill="#0a0a0a"/>
        <rect x="18.5" y="16.5" width="63" height="105" fill="none" stroke="rgba(244,241,234,.4)" stroke-width=".4"/>
        <g fill="#f4f1ea" text-anchor="middle" font-family="Oswald, 'Arial Narrow', sans-serif" font-weight="600">
          ${line(37, 8, l1, "spacing")}
          ${line(67, 28, l2, "spacingAndGlyphs")}
          ${line(81, 11, l3, "spacing")}
        </g>
        <g stroke="rgba(244,241,234,.6)" stroke-width=".35"><path d="M40 90 H47.5 M52.5 90 H60"/></g>
        <circle cx="50" cy="90" r=".8" fill="#f4f1ea"/>
        <rect x="${LX - 1}" y="${LY - 2}" width="${LW + 2}" height="${(LH + 4).toFixed(2)}" rx="1.6" fill="#fff"/>
        <image href="${img("ramh-logo.webp")}" x="${LX}" y="${LY}" width="${LW}" height="${LH.toFixed(2)}"/>`;
      fs.href = LINKS.ramh;
      fs.setAttribute("aria-label", `${SIGNS.floorSign.join(" ")}: see the sign up close`);
      fs.innerHTML = `<svg viewBox="0 0 100 172" aria-hidden="true">
        <ellipse cx="50" cy="168" rx="50" ry="4" fill="rgba(0,0,0,.45)"/>
        <path d="M15 6 L23 165 M85 6 L77 165" stroke="#8f8f8b" stroke-width="3" stroke-linecap="round"/>
        <g stroke="#f2f1ec" stroke-linecap="round"><path d="M9 5 L3 166 M91 5 L97 166" stroke-width="5"/><path d="M7 5 H93" stroke-width="6"/><path d="M5 138 H95" stroke-width="4"/></g>
        <path d="M11 9 L5.6 166" stroke="#c9c8c2" stroke-width="1.4"/>
        ${FLOOR_POSTER}
        <g fill="#2b2b2b"><rect x="25" y="7" width="7" height="12" rx="1"/><rect x="68" y="7" width="7" height="12" rx="1"/></g>
      </svg>`;
      // Clicking the sign doesn't leave the shop: it opens the poster up close first, with a button to the library
      // (a Cmd/Ctrl/Shift-click still goes straight there, as links usually do)
      fs.addEventListener("click", e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        openLb({ label: `${SIGNS.floorSign.join(" ")}, Robots Ate My Homework`, kind: "is-floorsign",
          art: `<svg viewBox="15 13 70 112" role="img" aria-label="${esc(SIGNS.floorSign.join(" "))}">${FLOOR_POSTER}</svg>`,
          button: "Visit the library", href: LINKS.ramh, from: fs });
      });
    }
    $("nrsf-marquee").setAttribute("aria-label", [SIGNS.marquee, SIGNS.marqueeSub].filter(Boolean).join(", "));

    let G, u, W, H, dpr;
    const place = (el, r) => { el.style.left = r.x * u + "px"; el.style.top = r.y * u + "px"; el.style.width = r.w * u + "px"; if (r.h != null) el.style.height = r.h * u + "px"; };
    const pos = (x, y, w, h) => `left:${x * u}px;top:${y * u}px;width:${w * u}px;${h != null ? `height:${h * u}px;` : ""}`;

    /* ============================================================
       C. THE BUILDING
       ============================================================ */
    /* The whitewashed upper wall, made the way the metal sign's hammered finish is made: first a "height map"
       is drawn in grey (bricks raised, joints sunk, the paint lumpy), then every pixel is lit according to which
       way its little slope faces the light (from the top left). That is what makes the paint look thick, the
       edges soft, and the joints recessed, like Kathi's white-brick photo.
       soldier = true lays one row of bricks standing on end (the course over the window). */
    function whitewash(ctx, x0, y0, x1, y1, soldier = false) {
      // work in device pixels, but cap the work on very big screens (it is then drawn slightly enlarged)
      const full = u * dpr, area = (x1 - x0) * (y1 - y0) * full * full, k = full * Math.min(1, Math.sqrt(2.6e6 / area));
      const X = Math.round(x0 * k), Y = Math.round(y0 * k), Wd = Math.round(x1 * k) - X, Hd = Math.round(y1 * k) - Y;
      if (Wd < 3 || Hd < 3) return;
      const hc = document.createElement("canvas"); hc.width = Wd; hc.height = Hd;
      let h = hc.getContext("2d");
      // 1. The height map. Dark = low (the joints), light = high (brick faces under thick paint)
      h.fillStyle = "#6a6a6a"; h.fillRect(0, 0, Wd, Hd);                                                     // joints mostly filled with paint, so not very deep
      h.setTransform(k, 0, 0, k, -X, -Y);
      const j = G.phone ? 2 : 2.4;
      const n = soldier ? Math.max(1, Math.round((x1 - x0) / (G.phone ? 10 : 13))) : 0;
      const bw = soldier ? (x1 - x0) / n - j : (G.phone ? 27 : 35), bh = soldier ? y1 - y0 - j : (G.phone ? 9 : 11.5), row = bh + j;
      const r0 = soldier ? 0 : Math.floor(y0 / row) - 1, r1 = soldier ? 0 : Math.ceil(y1 / row);
      for (let r = r0; r <= r1; r++) {
        const y = soldier ? y0 + j / 2 : r * row + j / 2, off = soldier ? x0 + j / 2 : (r % 2 ? .5 : 0) * (bw + j);
        for (let c = soldier ? 0 : Math.floor((x0 - off) / (bw + j)) - 1; ; c++) {
          const x = c * (bw + j) + off; if (x > x1 || (soldier && c >= n)) break;
          const a = hash(r * 1.7 + 5, c * .9 + (soldier ? 40 : 0)), b = hash(c * 2.3, r * .4 + 1);
          const v = (175 + a * 55) | 0;                                                                        // some bricks stand a little prouder
          h.fillStyle = `rgb(${v},${v},${v})`;
          rr(h, x + (a - .5) * .9, y + (b - .5) * .6, bw + (b - .5) * 1.8, bh + (a - .5) * .9, 1.4); h.fill();
          if (!soldier) {                                                                                      // paint bridging the joints here and there
            const q = hash(c * 4.1, r * 2.9), t = (v - 25) | 0;
            h.fillStyle = `rgb(${t},${t},${t})`;
            if (q > .3) { h.beginPath(); h.ellipse(x + bw * a, y + bh + j / 2, 3 + q * 9, j * .9, 0, 0, 7); h.fill(); }
            if (q > .62) { h.beginPath(); h.ellipse(x + bw + j / 2, y + bh * b, j * .9, 2 + q * 5, 0, 0, 7); h.fill(); }
          }
        }
      }
      // paint rounds every edge: blur the whole map once (blurring each brick separately would be very slow)
      const hb = document.createElement("canvas"); hb.width = Wd; hb.height = Hd;
      h = hb.getContext("2d", { willReadFrequently: true });
      h.filter = `blur(${(.7 * k).toFixed(2)}px)`; h.drawImage(hc, 0, 0); h.filter = "none";
      // lumpy paint: the grain tile blown up at three sizes, so the bumps come in big and small
      [[5, .5], [13, .4], [1.8, .12]].forEach(([s, al]) => {
        const p = h.createPattern(noise(), "repeat"); p.setTransform(new DOMMatrix().translate(-X * .37, -Y * .53).scale(s * k / 2));
        h.globalAlpha = al; h.globalCompositeOperation = "overlay"; h.fillStyle = p; h.fillRect(0, 0, Wd, Hd);
      });
      // 2. Light every pixel. The slope comes from the neighbours' heights; a pixel tilted toward the light is
      //    brighter, one tilted away is darker, and the low joints also sit in their own shadow.
      const H = h.getImageData(0, 0, Wd, Hd).data, out = ctx.createImageData(Wd, Hd), o = out.data;
      const S = 2.3, Lx = -.42, Ly = -.58, Lz = .7;                                                              // light from the top left, a little in front
      for (let py = 0; py < Hd; py++) {
        const up = py > 0 ? -Wd : 0, dn = py < Hd - 1 ? Wd : 0;
        for (let px = 0; px < Wd; px++) {
          const i = py * Wd + px, hv = H[i * 4] / 255;
          const dx = ((H[(i + (px < Wd - 1 ? 1 : 0)) * 4] - H[(i - (px > 0 ? 1 : 0)) * 4]) / 255) * S;
          const dy = ((H[(i + dn) * 4] - H[(i + up) * 4]) / 255) * S;
          const len = Math.sqrt(dx * dx + dy * dy + 1);
          let lit = (-dx * Lx - dy * Ly + Lz) / len / Lz;                                                         // 1 on a flat face
          lit = lit < 0 ? 0 : lit > 1.25 ? 1.25 : lit;
          const ao = hv < .36 ? .8 : hv > .66 ? 1 : .8 + (hv - .36) / .3 * .2;                                    // joints sit in a little shadow
          const f = (.3 + .7 * lit) * ao, q = i * 4;
          o[q] = 248 * f; o[q + 1] = 246 * f; o[q + 2] = 240 * f; o[q + 3] = 255;
        }
      }
      if (k === full) ctx.putImageData(out, X, Y);
      else {                                                                                                 // big screen: paint it small, then enlarge
        h.putImageData(out, 0, 0);
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(hb, x0 * full, y0 * full, (x1 - x0) * full, (y1 - y0) * full); ctx.restore();
      }
      if (soldier) return;
      // 3. Big soft patches of thicker and thinner paint, and grime gathering under the eaves
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
      const R = rng(11);
      for (let i = 0; i < (G.phone ? 10 : 22); i++) {
        const cx = x0 + R() * (x1 - x0), cy = y0 + R() * (y1 - y0), rad = 40 + R() * 120, dark = R() < .55;
        const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, rad);
        g.addColorStop(0, dark ? "rgba(120,108,96,.07)" : "rgba(255,255,252,.08)"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      }
      ctx.fillStyle = vgrad(ctx, y0, y0 + 90, [[0, "rgba(70,62,56,.22)"], [1, "rgba(70,62,56,0)"]]); ctx.fillRect(x0, y0, x1 - x0, 90);
      ctx.restore();
    }

    /* The black window and door trims, made the same way as the brick (and the metal sign's hammered finish):
       a grey "height map" first, then every pixel lit by which way it faces the light. Each member of the trim
       (a rail, a post, a glazing bar, a sill) is a raised block whose edges get rounded off, with the fine
       "orange peel" bumps of thick gloss paint on top. Black paint barely shows its colour, so the shape is
       carried by the soft highlights where an edge or a bump turns toward the light.
       members: [x, y, w, h, height] in building units; height 1 = proud, smaller = set further back. */
    function trimRelief(ctx, members, albedo = [17, 17, 18]) {
      if (!members.length) return;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      members.forEach(([x, y, w, h]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + h); });
      const k = u * dpr, X = Math.floor(x0 * k), Y = Math.floor(y0 * k), Wd = Math.ceil(x1 * k) - X, Hd = Math.ceil(y1 * k) - Y;
      if (Wd < 2 || Hd < 2) return;
      const mk = () => { const c = document.createElement("canvas"); c.width = Wd; c.height = Hd; return c; };
      const hc = mk(), mc = mk(), h = hc.getContext("2d"), m = mc.getContext("2d");
      h.fillStyle = "#000"; h.fillRect(0, 0, Wd, Hd);
      [h, m].forEach(c => c.setTransform(k, 0, 0, k, -X, -Y));
      m.fillStyle = "#fff";
      members.forEach(([x, y, w, ht, v = 1]) => {
        const g = (220 * v) | 0; h.fillStyle = `rgb(${g},${g},${g})`; h.fillRect(x, y, w, ht);
        m.fillRect(x, y, w, ht);
      });
      // round every edge (paint and timber are never sharp), then add the orange-peel bumps
      const hb = mk(), b = hb.getContext("2d", { willReadFrequently: true });
      b.filter = `blur(${(.9 * k).toFixed(2)}px)`; b.drawImage(hc, 0, 0); b.filter = "none";
      [[.9, .07], [4, .09]].forEach(([s, al]) => {
        const p = b.createPattern(noise(), "repeat"); p.setTransform(new DOMMatrix().translate(-X * .41, -Y * .29).scale(s * k / 2));
        b.globalAlpha = al; b.globalCompositeOperation = "overlay"; b.fillStyle = p; b.fillRect(0, 0, Wd, Hd);
      });
      const H = b.getImageData(0, 0, Wd, Hd).data, M = m.getImageData(0, 0, Wd, Hd).data;
      const out = b.createImageData(Wd, Hd), o = out.data;
      const S = 3.2, Lx = -.42, Ly = -.58, Lz = .7;                                                        // light from the top left, as on the brick
      for (let py = 0; py < Hd; py++) {
        const up = py > 0 ? -Wd : 0, dn = py < Hd - 1 ? Wd : 0;
        for (let px = 0; px < Wd; px++) {
          const i = py * Wd + px, q = i * 4;
          if (!M[q + 3]) continue;
          const dx = ((H[(i + (px < Wd - 1 ? 1 : 0)) * 4] - H[(i - (px > 0 ? 1 : 0)) * 4]) / 255) * S;
          const dy = ((H[(i + dn) * 4] - H[(i + up) * 4]) / 255) * S;
          const len = Math.sqrt(dx * dx + dy * dy + 1);
          const lit = Math.max(0, (-dx * Lx - dy * Ly + Lz) / len / Lz);
          const spec = Math.pow(Math.max(0, lit - .92) * 3.4, 2) * 85;                                        // gloss highlight where a curve faces the light
          const f = .35 + .65 * Math.min(lit, 1.4);
          o[q] = albedo[0] * f + spec; o[q + 1] = albedo[1] * f + spec; o[q + 2] = albedo[2] * f + spec * 1.05; o[q + 3] = M[q + 3];
        }
      }
      b.putImageData(out, 0, 0);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(hb, X, Y); ctx.restore();
    }

    /* The bare brick at street level: Kathi's red-brick photo, repeated. One course in the photo is about
       58 pixels tall, so it is scaled to match the height of one painted course upstairs. The piers ("lift")
       are shifted half a brick so their bricks don't line up with the wall behind, and catch more light. */
    function photoWall(ctx, x0, y0, x1, y1, lift = 0) {
      const course = G.phone ? 11 : 13.9, k = course / 58;
      const p = ctx.createPattern(TEX.redbrick, "repeat");
      p.setTransform(new DOMMatrix().translate(lift ? 17 : 0, G.shopTop + (lift ? course / 2 : 0)).scale(k));
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
      ctx.fillStyle = p; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      // the photo is sunlit; settle it into dusk: just a little darker
      ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = lift ? "rgb(222,212,210)" : "rgb(200,190,190)"; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      ctx.restore();
    }

    function bricks(ctx, x0, y0, x1, y1, lift = 0, painted = false) {
      if (painted) return whitewash(ctx, x0, y0, x1, y1);
      if (TEX.redbrick) return photoWall(ctx, x0, y0, x1, y1, lift);
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

      // 2. The upstairs window, built from the same black joinery as the shop windows below: a frame with a
      //    bevelled edge, a heavy top rail, glazing bars shaded like the shop's posts, and the same deep black sill.
      //    It sits in a recess in the brick, under a row of whitewashed bricks standing on end.
      const w = G.upperWin, li = G.lintel, ws = G.wsill;
      const rv = G.phone ? 5 : 8;                                                                          // depth of the recess
      ctx.fillStyle = "#c2bdb3"; ctx.fillRect(w.x - rv, w.y - 4, w.w + rv * 2, w.h + 4);                   // the brick reveal, painted
      ctx.fillStyle = hgrad(ctx, w.x - rv, w.x, [[0, "rgba(255,255,250,.35)"], [1, "rgba(120,110,100,.25)"]]); ctx.fillRect(w.x - rv, w.y - 4, rv, w.h + 4);          // left reveal in the light
      ctx.fillStyle = hgrad(ctx, w.x + w.w, w.x + w.w + rv, [[0, "rgba(30,24,20,.55)"], [1, "rgba(30,24,20,.25)"]]); ctx.fillRect(w.x + w.w, w.y - 4, rv, w.h + 4); // right reveal in shadow
      whitewash(ctx, li.x, li.y, li.x + li.w, li.y + li.h, true);                                           // soldier course: bricks on end
      ledgeShadow(ctx, w.x - rv, li.y + li.h, w.w + rv * 2, 12, .5);
      const fr = G.phone ? 7 : 12, rail = G.phone ? 9 : 15, bar = G.phone ? 3 : 4.5, cols = G.phone ? 3 : 4, rows = G.phone ? 4 : 5;
      const gx = w.x + fr, gy0 = w.y + rail, gw = w.w - fr * 2, gh = w.h - rail - fr;
      // the room behind the glass: dusk sky reflected at the top, warm lamplight deeper in
      ctx.fillStyle = vgrad(ctx, gy0, gy0 + gh, [[0, "#3a4258"], [.28, "#2a2427"], [1, "#150d09"]]); ctx.fillRect(gx, gy0, gw, gh);
      ctx.save(); ctx.beginPath(); ctx.rect(gx, gy0, gw, gh); ctx.clip();
      ctx.globalCompositeOperation = "screen";
      const lamp = ctx.createRadialGradient(gx + gw * .62, gy0 + gh * .72, 1, gx + gw * .62, gy0 + gh * .72, gw * .7);   // a lamp left on upstairs
      lamp.addColorStop(0, "rgba(255,196,120,.85)"); lamp.addColorStop(.4, "rgba(255,160,80,.3)"); lamp.addColorStop(1, "rgba(255,140,60,0)");
      ctx.fillStyle = lamp; ctx.fillRect(gx, gy0, gw, gh);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = hgrad(ctx, gx, gx + gw * .24, [[0, "rgba(236,226,210,.16)"], [.7, "rgba(236,226,210,.10)"], [1, "rgba(236,226,210,0)"]]); ctx.fillRect(gx, gy0, gw * .24, gh);   // a sheer curtain pulled aside
      grain(ctx, gx, gy0, gw, gh, .1, .4);
      // reflections on the glass: the sky across the top panes, and a soft diagonal sheen
      ctx.fillStyle = vgrad(ctx, gy0, gy0 + gh * .45, [[0, "rgba(150,170,205,.22)"], [1, "rgba(150,170,205,0)"]]); ctx.fillRect(gx, gy0, gw, gh * .45);
      ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.moveTo(gx, gy0 + gh * .5); ctx.lineTo(gx + gw * .45, gy0); ctx.lineTo(gx + gw * .6, gy0); ctx.lineTo(gx, gy0 + gh * .72); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.04)"; ctx.beginPath(); ctx.moveTo(gx + gw * .35, gy0 + gh); ctx.lineTo(gx + gw, gy0 + gh * .3); ctx.lineTo(gx + gw, gy0 + gh * .38); ctx.lineTo(gx + gw * .45, gy0 + gh); ctx.fill();
      ctx.restore();
      const pw = (gw - bar * (cols - 1)) / cols, ph = (gh - bar * (rows - 1)) / rows;
      // the frame: same black paint, bevel and top rail as the shopfront
      ctx.fillStyle = "#0b0b0c";
      ctx.fillRect(w.x, w.y, w.w, rail); ctx.fillRect(w.x, w.y + w.h - fr, w.w, fr); ctx.fillRect(w.x, w.y, fr, w.h); ctx.fillRect(w.x + w.w - fr, w.y, fr, w.h);
      ctx.fillStyle = vgrad(ctx, w.y, w.y + rail, [[0, "#2a2a2c"], [.25, "#141415"], [1, "#060606"]]); ctx.fillRect(w.x, w.y, w.w, rail);
      [w.x, w.x + w.w - fr].forEach(px => { ctx.fillStyle = hgrad(ctx, px, px + fr, [[0, "#070707"], [.3, "#2e2e30"], [.5, "#19191a"], [1, "#040404"]]); ctx.fillRect(px, w.y + rail, fr, w.h - rail - fr); });
      // shadows the frame throws onto the glass, then the glazing bars, each shaded like a little post
      ctx.fillStyle = vgrad(ctx, gy0, gy0 + 6, [[0, "rgba(0,0,0,.55)"], [1, "rgba(0,0,0,0)"]]); ctx.fillRect(gx, gy0, gw, 6);
      ctx.fillStyle = hgrad(ctx, gx, gx + 5, [[0, "rgba(0,0,0,.45)"], [1, "rgba(0,0,0,0)"]]); ctx.fillRect(gx, gy0, 5, gh);
      for (let k = 1; k < cols; k++) {
        const x = gx + k * (pw + bar) - bar;
        ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(x + bar, gy0, 1.6, gh);                                           // its shadow on the pane
        ctx.fillStyle = hgrad(ctx, x, x + bar, [[0, "#070707"], [.3, "#2e2e30"], [.5, "#19191a"], [1, "#040404"]]); ctx.fillRect(x, gy0, bar, gh);
      }
      for (let k = 1; k < rows; k++) {
        const y = gy0 + k * (ph + bar) - bar;
        ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.fillRect(gx, y + bar, gw, 1.6);
        ctx.fillStyle = vgrad(ctx, y, y + bar, [[0, "#2a2a2c"], [.3, "#141415"], [1, "#050505"]]); ctx.fillRect(gx, y, gw, bar);
      }
      ctx.fillStyle = "#050505"; ctx.fillRect(gx - 1.5, gy0 - 1.5, gw + 3, 1.5); ctx.fillRect(gx - 1.5, gy0 + gh, gw + 3, 1.5);   // the rebate the glass sits in
      bevel(ctx, w.x, w.y, w.w, w.h, 1.4, "rgba(255,255,255,.14)", "rgba(0,0,0,.7)");
      bevel(ctx, gx, gy0, gw, gh, 1, "rgba(0,0,0,.6)", "rgba(255,255,255,.1)");
      grain(ctx, w.x, w.y, w.w, w.h, .12);
      // the sill: the shopfront's deep black sill, catching a line of light along its front edge
      ctx.fillStyle = vgrad(ctx, ws.y, ws.y + ws.h, [[0, "#3a3a3c"], [.3, "#1d1d1e"], [.32, "#0d0d0d"], [1, "#050505"]]); ctx.fillRect(ws.x, ws.y, ws.w, ws.h);
      ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.fillRect(ws.x, ws.y, ws.w, .9);
      {                                                                                                   // the window's trims, lit like the brick
        const tm = [[w.x, w.y, w.w, rail], [w.x, w.y + w.h - fr, w.w, fr], [w.x, w.y, fr, w.h], [w.x + w.w - fr, w.y, fr, w.h], [ws.x, ws.y, ws.w, ws.h]];
        for (let k = 1; k < cols; k++) tm.push([gx + k * (pw + bar) - bar, gy0, bar, gh, .75]);           // glazing bars sit a little further back
        for (let k = 1; k < rows; k++) tm.push([gx, gy0 + k * (ph + bar) - bar, gw, bar, .75]);
        trimRelief(ctx, tm);
      }
      ledgeShadow(ctx, ws.x + 4, ws.y + ws.h, ws.w - 8, 22, .5);
      ctx.fillStyle = vgrad(ctx, ws.y + ws.h, ws.y + ws.h + 90, [[0, "rgba(70,70,74,.16)"], [1, "rgba(70,70,74,0)"]]); ctx.fillRect(ws.x + 20, ws.y + ws.h, ws.w - 40, 90);  // rain stains

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
      grainWood(ctx, fa.x, fa.y, fa.w, fa.h, .3, .3); grain(ctx, fa.x, fa.y, fa.w, fa.h, .15, .35);              // the fascia is painted timber too
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
        grainWood(ctx, o.x, o.y, o.w, d.bar.y + d.bar.h - o.y, .3, .22);                                           // painted timber surround
        const side = t.x - o.x;                                                                                     // the architrave round the door, lit like the brick
        trimRelief(ctx, [[o.x, o.y, side, o.h], [o.x + o.w - side, o.y, side, o.h], [o.x, o.y, o.w, t.y - o.y], [o.x + side, d.bar.y, o.w - side * 2, d.bar.h, .9]]);
      });

      // 7. The shopfront joinery: rails, posts, the deep sill and the panelled stallriser
      const f = G.front;
      const timber = (x, y, w, h) => { grainWood(ctx, x, y, w, h, .35, .22); grain(ctx, x, y, w, h, .18, .35); };   // painted wood: grain under the black paint
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
      timber(f.x, f.y, f.w, f.sill.y - f.y); timber(ri.x, ri.y, ri.w, ri.h);
      const pad = G.phone ? 7 : 12;
      f.glass.forEach(gl => panel(ctx, gl.x + pad, ri.y + pad + 4, gl.w - pad * 2, ri.h - pad * 2 - 4, [26, 26, 28], G.phone ? 4 : 7));
      {                                                                                                   // the shopfront's trims, lit like the brick
        const tm = [[f.x, f.y, f.w, f.rail], [s.x, s.y, s.w, s.h]];
        f.posts.forEach(px => tm.push([px, f.y + f.rail, f.postW, s.y - f.y - f.rail, .9]));
        if (f.transomBand) tm.push([f.x, f.bar.y, f.w, f.bar.h, .9]);
        trimRelief(ctx, tm);
      }

      // 8. The pavement, the steps and the base of the building
      // Cobblestones, like the café photo: dark, damp granite setts laid in staggered rows,
      // smaller toward the wall and larger toward you, with moss and grit in the joints
      ctx.fillStyle = "#121212"; ctx.fillRect(-10, gy, ref + 20, G.h - gy);
      if (TEX.cobbles) {
        // Kathi's cobblestone photo, repeated along the street. It is sized so the bottom of the photo
        // (the big stones) sits at the bottom of the scene, and the smaller stones run back to the wall.
        const T = TEX.cobbles, depth = G.h - gy, k = G.phone ? depth / T.height : .34, th = T.height * k;
        const p = ctx.createPattern(T, "repeat-x");
        p.setTransform(new DOMMatrix().translate(-10, G.h - th).scale(k));
        ctx.save(); ctx.beginPath(); ctx.rect(-10, gy, ref + 20, depth); ctx.clip();
        ctx.fillStyle = p; ctx.fillRect(-10, G.h - th, ref + 20, th);
        // dusk: darker and cooler than the daylight photo, and wet-looking toward the wall
        ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = "rgb(150,158,176)"; ctx.fillRect(-10, gy, ref + 20, depth);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = vgrad(ctx, gy, G.h, [[0, "rgba(10,12,20,.45)"], [.5, "rgba(10,12,20,.12)"], [1, "rgba(10,12,20,.25)"]]); ctx.fillRect(-10, gy, ref + 20, depth);
        ctx.restore();
      } else {
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
      }
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
      // Split the words into two lines of about equal length: "NOT RISING" -> "NOT" / "RISING"
      const parts = (words || "").trim().split(/\s+/);
      const mid = Math.ceil(parts.length / 2);
      const top = parts.slice(0, mid).join(" "), bottom = parts.slice(mid).join(" ");
      // A laser-cut steel sign (her "Nightingale's Retweet" reference): a shaped plate with a hammered pewter
      // finish; the letters and a thin line around the edge are cut right through, so the wall shows through them.
      // The shape: square ends with scooped corners, a raised arch on top and a dropped arch underneath.
      const plate = "M24 342 A18 18 0 0 0 42 324 L200 324 Q320 270 440 324 L598 324 A18 18 0 0 0 616 342 L616 594 A18 18 0 0 0 598 612 L440 612 Q320 660 200 612 L42 612 A18 18 0 0 0 24 594 Z";
      const inner = "M40 356 A16 16 0 0 0 56 340 L202 340 Q320 288 438 340 L584 340 A16 16 0 0 0 600 356 L600 580 A16 16 0 0 0 584 596 L438 596 Q320 642 202 596 L56 596 A16 16 0 0 0 40 580 Z";
      // two chains from the iron arm down to the plate, ten links each, the last one hooked through a hole drilled in the plate
      const chainX = [168, 472], links = chainX.map(x => [159, 177, 195, 213, 231, 249, 267, 285, 303, 321].map((y, i) => `<ellipse cx="${x}" cy="${y}" rx="${i % 2 ? 5 : 8}" ry="${i % 2 ? 8 : 5}" fill="none" stroke="#242019" stroke-width="3"/>`).join("")).join("");
      const letters = `font-family="Cinzel, 'Trajan Pro', Georgia, serif" font-weight="700" text-anchor="middle" fill="#000"`;
      return `<img class="nrsf-hs-bracket" src="${img("sign-bracket.webp")}" alt="">` +
        `<svg class="nrsf-hs-board" viewBox="0 0 640 666" aria-hidden="true"><defs>` +
        // the metal: lit from the top left, darker toward the bottom
        `<linearGradient id="nrsf-hs-steel" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#5f5a55"/><stop offset=".5" stop-color="#433f3b"/><stop offset="1" stop-color="#2a2725"/></linearGradient>` +
        // hammered finish: a bumpy surface lit from one side, multiplied onto the metal, plus a fine speckle
        `<filter id="nrsf-hs-hammer" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency=".07" numOctaves="2" seed="4" result="bump"/>` +
        `<feDiffuseLighting in="bump" surfaceScale="2.2" lighting-color="#fff" result="lit"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>` +
        `<feComposite in="SourceGraphic" in2="lit" operator="arithmetic" k1="1.15" k2="0" k3="0" k4="0" result="hammered"/>` +
        `<feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="1" seed="9" result="grain"/><feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.1" result="specks"/>` +
        `<feComposite in="specks" in2="hammered" operator="atop" result="speckled"/><feComposite in="speckled" in2="SourceGraphic" operator="in"/></filter>` +
        // the cutting pattern: white = metal stays, black = cut away
        `<mask id="nrsf-hs-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="666"><path d="${plate}" fill="#fff"/>` +
        `<path d="${inner}" fill="none" stroke="#000" stroke-width="4.5"/>` +
        `<circle cx="168" cy="334" r="6" fill="#000"/><circle cx="472" cy="334" r="6" fill="#000"/>` +
        `<text x="320" y="446" font-size="112" letter-spacing="10" ${letters}>${esc(top.toUpperCase())}</text>` +
        `<text x="320" y="560" font-size="96" letter-spacing="6" textLength="${bottom.length > 6 ? 500 : bottom.length * 82}" lengthAdjust="spacingAndGlyphs" ${letters}>${esc(bottom.toUpperCase())}</text></mask></defs>` +
        `<g mask="url(#nrsf-hs-cut)"><path d="${plate}" fill="url(#nrsf-hs-steel)" filter="url(#nrsf-hs-hammer)"/>` +
        `<path d="${plate}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="3"/></g>` +   // a bright rim where the cut edge catches the light
        links +                     // chains drawn last, so the bottom link sits in its hole in front of the plate
        `</svg>`;
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
    const LEAFPTS = [];                                   // the outline points, kept so the halves can be cut from them
    const LEAVES = [0, 1, 2].map(v => {
      const deep = [.58, .5, .66][v], spread = [.62, .7, .55][v];
      const pts = [[0, 0], [-.42, -.06], [-spread, -.5], [-.22, -deep], [-.08, -.86], [0, -1], [.08, -.86], [.22, -deep], [spread, -.5], [.42, -.06], [0, 0]];
      const p = new Path2D(), outline = [[0, 0]];
      p.moveTo(0, 0);
      for (let i = 1; i < pts.length; i++) {               // each edge as a curve, with tiny serrations
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = 4;
        for (let k = 1; k <= n; k++) {
          const t = k / n, x = lerp(x0, x1, t), y = lerp(y0, y1, t), nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
          const bulge = Math.sin(t * Math.PI) * .07, tooth = k % 2 ? .018 : -.012;
          p.lineTo(x + nx / l * (bulge + tooth), y + ny / l * (bulge + tooth)); outline.push([x + nx / l * (bulge + tooth), y + ny / l * (bulge + tooth)]);
        }
      }
      p.closePath(); LEAFPTS.push(outline);
      return p;
    });
    // Each leaf cut down its middle vein: [left half, right half]. Squashing every point onto the vein from
    // one side leaves exactly the other half. Used to shade the half that is folded away from the light.
    const HALVES = LEAFPTS.map(o => [Math.min, Math.max].map(f => { const h = new Path2D(); o.forEach(([x, y], k) => k ? h.lineTo(f(x, 0), y) : h.moveTo(f(x, 0), y)); h.closePath(); return h; }));
    const VEINS = new Path2D("M0 0 L0 -0.95 M0 -0.18 L-0.55 -0.48 M0 -0.18 L0.55 -0.48 M0 -0.5 L-0.2 -0.66 M0 -0.5 L0.2 -0.66");

    /* One Boston ivy leaf in autumn, after Kathi's red-ivy photo: deep crimson with a waxy gloss, lit like the
       brick. The leaf is folded slightly along its middle vein, so the half turned away from the light (top left)
       is darker and goes plum-purple; the edges deepen to wine; the veins are raised and catch the light; a red
       stalk joins it to the vine. Kept to a few quick fills, because there are thousands. */
    function drawLeaf(ctx, x, y, s, rot, col, shade, variant, n = 0) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
      const path = LEAVES[variant];
      ctx.lineCap = "round"; ctx.lineWidth = .05; ctx.strokeStyle = rgb(col, shade * .55);                  // the red stalk
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(.02, .26); ctx.stroke();
      const g = ctx.createLinearGradient(0, 0, .2, -1);
      g.addColorStop(0, rgb(col, shade * .58)); g.addColorStop(.55, rgb(col, shade)); g.addColorStop(1, rgb(col, shade * 1.12));
      ctx.fillStyle = g; ctx.fill(path);
      const away = Math.sin(rot + .8) > 0 ? 0 : 1;                                                         // which half faces away from the light
      ctx.fillStyle = `rgba(46,2,30,${.22 + hash(n, 2) * .14})`; ctx.fill(HALVES[variant][away]);          // shadow side goes plum
      ctx.fillStyle = `rgba(255,190,200,${.08 * shade})`; ctx.fill(HALVES[variant][1 - away]);
      const rim = ctx.createRadialGradient(0, -.45, .3, 0, -.45, .74);                                     // edges deepen to wine
      rim.addColorStop(0, "rgba(60,0,20,0)"); rim.addColorStop(1, `rgba(60,0,22,${.2 + hash(n, 4) * .22})`);
      ctx.fillStyle = rim; ctx.fill(path);
      const sx = .17 * (away ? -1 : 1), gl = ctx.createRadialGradient(sx, -.56, .01, sx, -.56, .26);       // waxy gloss on the lit half
      gl.addColorStop(0, `rgba(255,236,240,${.32 * shade})`); gl.addColorStop(1, "rgba(255,236,240,0)");
      ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(sx, -.56, .16, .26, (away ? -.4 : .4), 0, 7); ctx.fill();
      ctx.lineWidth = .03; ctx.strokeStyle = `rgba(40,0,14,${.3 * shade})`; ctx.translate(.012, .012); ctx.stroke(VEINS); ctx.translate(-.012, -.012);   // raised veins:
      ctx.lineWidth = .02; ctx.strokeStyle = `rgba(255,190,200,${.3 * shade})`; ctx.stroke(VEINS);                                              // dark side, light side
      ctx.lineWidth = .028; ctx.strokeStyle = `rgba(36,0,12,${.5 * shade})`; ctx.stroke(path);              // the serrated edge
      ctx.restore();
    }

    /* Single ivy leaves drawn once as little pictures: used for the leaves lying on the cobbles and the ones
       falling past. Every ivy colour, each in a darker and a lighter version, in all three leaf shapes. */
    let IVYSP = null;
    function ivySprites() {
      if (IVYSP) return IVYSP;
      const pal = S.leaves.map(hex); IVYSP = [];
      pal.forEach((col, i) => [.75, 1].forEach((sh, j) => {
        const c = document.createElement("canvas"); c.width = c.height = 96;
        const x = c.getContext("2d"); x.translate(48, 72);
        drawLeaf(x, 0, 0, 62, (j ? .3 : -.9), col, sh, (i + j) % 3, i * 2 + j);
        IVYSP.push(c);
      }));
      return IVYSP;
    }

    function growIvy() {
      const R = rng(2026), ref = G.ref, I = G.ivy, gy = G.ground, k = G.phone ? .55 : 1, band = I.side;
      const vines = [], leaves = [];
      const clear = (x, y) => I.keepClear.some(c => x > c.x + 4 && x < c.x + c.w - 4 && y > c.y + 4 && y < c.y + c.h - 4);
      // where ivy may grow: the top band, and a band down each side that narrows toward the street
      const allowed = (x, y) => {
        if (y < I.canopy * 1.5) return true;
        if (G.phone && y > G.cornice.y) return false;                    // phones: no ivy below the cornice, so both doors show
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
        for (let y = G.phone ? G.cornice.y : gy + 6; y > -10; y -= 5 * k) trunk.push([x0 + side * (Math.sin(y * .021) * band * .16 + Math.sin(y * .057 + edge) * band * .07), y]);
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
      // 4. Ivy on the ground. Fallen leaves gather the way real ones do: heaped in drifts against the shopfront,
      //    piled in the corners under the two trunks, blown into little heaps, and scattered thinner toward the kerb.
      //    Then live runners creep out of the corners and over the stones.
      //    t = how far down the pavement a leaf lies: 0 by the wall (far away, so smaller), 1 at the bottom edge (close, so bigger).
      const depth = G.h - gy, P = G.phone, F = G.floorSign, feet = F.y + F.w * 1.66;   // feet = where the A-frame stands
      const behindSign = (x, y) => x > F.x - 4 && x < F.x + F.w + 4 && y > F.y && y < feet - 3;  // hidden behind the sign, so skip it
      const fallen = (x, y, big = 1, flat = .5 + R() * .25) => {
        y = Math.max(gy + 2, Math.min(G.h - 3, y));
        if (behindSign(x, y)) return;
        const t = (y - gy) / depth;
        leaves.push({ x, y, s: (7 + t * 7 + R() * 6) * k * big * (P ? 1.7 : 1.15), rot: R() * 7, depth: .55 + R() * .45, ground: true, flat });
      };
      for (let i = 0; i < (P ? 50 : 90); i++) fallen(R() * ref, gy + 2 + R() * R() * depth * .3);                // drifts along the wall
      [[0, 1], [ref, -1]].forEach(([edge, side]) => {                                                      // piles in the two corners
        for (let i = 0; i < (P ? 22 : 38); i++) fallen(edge + side * Math.pow(R(), 1.6) * band * 1.8, gy + 2 + Math.pow(R(), 1.4) * depth * .6, 1.1);
      });
      for (let h = 0; h < (P ? 4 : 6); h++) {                                                              // little heaps the wind left
        const hx = 30 + R() * (ref - 60), hy = gy + depth * (.3 + R() * .6), n = 6 + R() * 6;
        for (let i = 0; i < n; i++) fallen(hx + (R() - .5) * 26 * k * 1.6, hy + (R() - .5) * 9 * k * 1.6);
      }
      for (let i = 0; i < (P ? 10 : 9); i++) fallen(F.x + R() * F.w, feet + R() * 10 * k);                // a few at the A-frame's feet
      for (let i = 0; i < (P ? 55 : 80); i++) fallen(R() * ref, gy + 4 + R() * (depth - 6));               // scattered everywhere
      // Live runners creeping over the stones, from each bottom corner (on phones, in from the screen's edges)
      [[0, 1], [ref, -1]].forEach(([edge, side], n) => {
        for (let b = 0; b < 2; b++) {
          let x = edge + side * (P ? -6 : band * .22), y = P ? G.h - depth * (b ? .12 : .3) : gy + 6 + b * depth * .25;
          let dir = side > 0 ? .12 + b * .1 : Math.PI - .12 - b * .1;
          const len = (P ? 90 : 210) * (b ? .6 : 1) * (.8 + R() * .4), pts = [[x, y]];
          for (let t = 0; t < len; t += 4 * k) {
            dir += (R() - .5) * .45;
            const ny = y + Math.sin(dir) * 4 * k;
            if (ny < gy + 3 || ny > G.h - 3) dir = -dir;                                                     // bounce back onto the pavement
            x += Math.cos(dir) * 4 * k; y = Math.max(gy + 3, Math.min(G.h - 3, y + Math.sin(dir) * 4 * k));
            if (behindSign(x, y)) break;
            pts.push([x, y]);
            if (R() < .8) fallen(x + (R() - .5) * 10 * k, y + (R() - .5) * 6 * k, 1.15 * (1 - t / len * .4), .62 + R() * .25);
          }
          vines.push(pts);
        }
      });
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
        ctx.strokeStyle = i < 2 ? "#3c1a18" : "#6a1a20"; ctx.lineWidth = (i < 2 ? 3.2 : 1.3) * (G.phone ? .7 : 1);   // woody trunks, red runners
        ctx.beginPath(); pts.forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      });
      // Two small white pumpkins on the step, in front of the door (switched on in storefront-data.js)
      if (S.pumpkins) {
        const p = G.pumpkins;
        pumpkin(ctx, p.x + p.w * .34, p.y, p.w * .62, -4); pumpkin(ctx, p.x + p.w * .78, p.y, p.w * .42, 7);
        ctx.fillStyle = "rgba(14,20,40,.12)"; ctx.fillRect(p.x - 10, p.y - p.w * .7, p.w + 20, p.w * .75);
      }
      // The leaves, back to front: deeper ones darker, ones near the shop warmer
      // (the ground leaves come last, far ones first, so nearer leaves lie on top of farther ones)
      leaves.sort((a, b) => (a.ground ? 2 + a.y / 1e4 : a.depth) - (b.ground ? 2 + b.y / 1e4 : b.depth)).forEach((l, i) => {
        let col = pal[(hash(i, 5) * pal.length) | 0];
        const nearShop = Math.max(0, Math.min(1, (l.y - G.shopTop + 80) / 260));
        col = mix(col, [255, 120, 90], nearShop * .1);
        const shade = (.5 + l.depth * .55) * (l.y < 120 ? .85 : 1) * (l.ground ? .7 : 1);
        if (l.ground) {                                     // a fallen ivy leaf, lying flat on the cobbles (squashed by perspective)
          const IV = ivySprites(), z = l.s * 1.5;
          ctx.save(); ctx.translate(l.x, l.y);
          ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(1, 2, z * .3, z * .3 * l.flat, 0, 0, 7); ctx.fill();   // its soft shadow on the stones
          ctx.scale(1, l.flat); ctx.rotate(l.rot); ctx.globalAlpha = .8 + hash(i, 9) * .18;
          ctx.drawImage(IV[(hash(i, 5) * IV.length) | 0], -z / 2, -z / 2, z, z); ctx.restore();
        } else drawLeaf(ctx, l.x, l.y, l.s, l.rot, col, shade, i % 3, i);   // Boston ivy on the walls
      });
      // Dusk settles over the ivy too
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = vgrad(ctx, 0, G.h, [[0, "rgba(10,14,30,.22)"], [.5, "rgba(10,14,30,.06)"], [1, "rgba(10,14,30,.16)"]]); ctx.fillRect(0, 0, G.ref, G.h);
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

    // A ring of vanity globes round the inside of a window (used by both shop windows).
    // P.ring = how far in from the glass edge the bulbs sit, P.gap = spacing between bulbs, P.r = bulb radius.
    function bulbRing(gl, P) {
      const pts = [], e = P.ring, nx = Math.max(2, Math.round((gl.w - 2 * e) / P.gap)), ny = Math.max(2, Math.round((gl.h - 2 * e) / P.gap));
      for (let k = 0; k <= nx; k++) { const x = e + (gl.w - 2 * e) * k / nx; pts.push([x, e], [x, gl.h - e]); }      // top and bottom rows
      for (let k = 1; k < ny; k++) { const y = e + (gl.h - 2 * e) * k / ny; pts.push([e, y], [gl.w - e, y]); }      // left and right columns
      return `<svg class="nrsf-rackbulbs" style="${pos(0, 0, gl.w, gl.h)}" viewBox="0 0 ${gl.w} ${gl.h}">${DEFS}${pts.map(([x, y]) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="${P.r * 3}" fill="url(#nrsf-halo)"/><circle r="${P.r}" fill="url(#nrsf-globe)"/><ellipse cx="${-P.r * .32}" cy="${-P.r * .38}" rx="${P.r * .32}" ry="${P.r * .2}" fill="#fff" opacity=".7"/></g>`).join("")}</svg>`;
    }

    // The poster window: the Poetic Drift poster hung straight and centred in the glass,
    // framed by a ring of bulbs, in front of the bookshop's shelves, with the street reflected in the glass
    function buildPosters(gl) {
      const host = $("nrsf-posters"), best = POSTERS.find(p => p.kind === "bestseller");
      const linkAttrs = p => { const href = LINKS[p.link] || p.link, ext = /^https?:/.test(href); return `href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ` data-link="${esc(p.link)}"`}`; };
      const bestHTML = (x, y, w) => best ? `<a class="nrsf-poster" ${linkAttrs(best)} style="${pos(x, y, w)}" aria-label="${esc(best.book)} by ${esc(best.author)}: ${esc(best.rank)} NOT RISING Magazine, Best Storyteller">
          <span class="nrsf-p-best"><span class="l1"><em>${esc(best.rank)}</em> NOT RISING MAGAZINE</span><span class="l2">BEST STORYTELLER</span>
          <span class="book"><img src="${img(best.cover)}" alt=""></span><span class="by">NEW BOOK BY <b>${esc(best.author.toUpperCase())}</b></span><span class="title">${esc(best.book.toUpperCase())}</span></span></a>` : "";
      // Same bulb sizes as the newsstand window next door, so the two match
      const P = G.phone ? { ring: 7, gap: 22, r: 3.6, posterW: 64 } : { ring: 13, gap: 30, r: 6.2, posterW: 172 };
      const pw = P.posterW, ph = pw * 1102 / 864;               // the poster's height follows from its shape (864 wide : 1102 tall)
      let html = bestHTML((gl.w - pw) / 2, (gl.h - ph) / 2, pw); // centred: half the leftover space on each side
      html += bulbRing(gl, P);
      host.innerHTML = html;
      // Clicking the poster opens it up close first (with a BUY IT button), instead of going straight to the shop
      const posterEl = host.querySelector(".nrsf-poster");
      if (posterEl && best) posterEl.addEventListener("click", e => { e.preventDefault(); openPoster(best, posterEl); });
    }

    /* ---------- Up close ----------
       A dark overlay with something blown up and a button under it. Used by the poster in the window
       (with a BUY IT button) and by the A-frame floor sign (with a VISIT THE LIBRARY button).
       The poster reuses its own artwork (from.innerHTML), so the big one always matches the one in the window.
       Closes with the x, the Escape key, or a click on the dark backdrop. */
    let lb = null, lbBack = null, keyboardUser = false;
    addEventListener("keydown", () => (keyboardUser = true), true);           // remember whether the visitor is using keys or a mouse/finger,
    addEventListener("pointerdown", () => (keyboardUser = false), true);      // so focus only moves around for keyboard users
    function openPoster(best, from) {
      openLb({ label: `${best.book} by ${best.author}`, art: from.innerHTML, button: "Buy it", href: LINKS[best.link] || best.link, from });
    }
    // label = read aloud; kind = an extra class for the picture's frame (sets its shape); art = what's shown big;
    // button + href = the button under it (opens in a new tab, so the shop stays open behind); from = what to go back to
    function openLb({ label, kind = "", art, button, href, from }) {
      if (!lb) {                                                              // build the overlay the first time it's needed
        lb = document.createElement("div");
        lb.className = "nrsf-lb"; lb.hidden = true; lb.tabIndex = -1;
        lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
        root.appendChild(lb);
        lb.addEventListener("click", e => { if (e.target === lb) closePoster(); });
        addEventListener("keydown", e => { if (e.key === "Escape" && !lb.hidden) closePoster(); });
      }
      lb.setAttribute("aria-label", label);
      lb.innerHTML = `<div class="nrsf-lb-box">
          <button class="nrsf-lb-x" type="button" aria-label="Close">\u00d7</button>
          <div class="nrsf-lb-poster ${kind}">${art}</div>
          <a class="nrsf-lb-buy" href="${esc(href)}" target="_blank" rel="noopener">${esc(button)}</a>
        </div>`;
      lb.querySelector(".nrsf-lb-x").addEventListener("click", closePoster);
      lbBack = from;
      lb.hidden = false;
      lb.focus({ preventScroll: true });
    }
    function closePoster() {
      lb.hidden = true;
      if (keyboardUser && lbBack) lbBack.focus({ preventScroll: true });     // keyboard users go back to the poster
    }

    // The newsstand window: a little copy of the real newsstand. Every issue in order on
    // clear glass shelves, a number tag under each, vanity globes all the way round.
    function buildNews(gl) {
      const host = $("nrsf-covers"), NR = window.NR;
      const issues = NR ? NR.FEATURES.map((f, i) => ({ f, no: String(i + 1).padStart(2, "0") })).filter(o => o.f.cover) : [];
      const P = G.phone
        ? { ring: 7, gap: 22, r: 3.6, x0: 15, x1: 75, y0: 58, cols: 2, coverW: 26, rowH: 62, tag: 4, tagGap: 5, max: 4 }   // phones: just the first 4 issues, 2 by 2
        : { ring: 13, gap: 30, r: 6.2, x0: 30, x1: 271, y0: 70, cols: 6, coverW: 32, rowH: 67, tag: 4.4, tagGap: 7 };
      const pw = (P.x1 - P.x0) / P.cols, ch = P.coverW * 1056 / 816;
      let html = "";
      issues.forEach(({ f, no }, i) => {
        const col = i % P.cols, row = (i / P.cols) | 0;
        const cx = P.x0 + col * pw + (pw - P.coverW) / 2, cy = P.y0 + row * P.rowH;
        if (cy + ch > gl.h - P.ring * 2) return;                      // no room left in this window
        if (P.max && i >= P.max) return;                              // phones: stop after P.max issues
        html += `<span class="nrsf-stack" style="${pos(cx + 2, cy - 2, P.coverW, ch)}"></span>`;
        html += `<img class="nrsf-mag" src="${img("thumbs/" + NR.IMAGES[f.cover], NS_BASE)}" alt="" style="${pos(cx, cy, P.coverW, ch)}">`;
        html += `<span class="nrsf-tag" style="left:${cx * u}px;top:${(cy + ch + P.tagGap) * u}px;font-size:${P.tag * u}px">NO. ${no}</span>`;
        if (col === 0) html += `<span class="nrsf-glass-shelf" style="${pos(P.x0 - 6, cy + ch, P.x1 - P.x0 + 12, 4)}"></span>`;
      });
      // the ring of vanity globes round the inside of the window
      html += bulbRing(gl, P);
      // "The Newsstand" gilt sign-writing on the glass, arched above the magazines and inside the bulbs
      const w = gl.w, gold = `<defs><linearGradient id="nrsf-gilt-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c9"/><stop offset=".5" stop-color="#d9b46a"/><stop offset="1" stop-color="#9a7230"/></linearGradient></defs>`;
      html += `<svg class="nrsf-gilt" style="${pos(0, 0, w, gl.h)}" viewBox="0 0 ${w} ${gl.h}">${gold}` + (G.phone
        ? `<g font-family="Cinzel, Georgia, serif" font-weight="700" text-anchor="middle" fill="url(#nrsf-gilt-g)" stroke="#2a1b08" stroke-width=".4" paint-order="stroke"><text x="${w / 2}" y="30" font-size="9" letter-spacing="1">The</text><text x="${w / 2}" y="45" font-size="11" letter-spacing=".3">Newsstand</text></g>`
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
      place($("nrsf-floorsign"), G.floorSign);
    }

    /* The glowing OPEN sign, centred in the glass pane of the black door (unit 9).
       The pane is painted by paintDoor: it starts 13% in from each side and 5.5% down, and is 44% of the door tall. */
    function placeOpenSign(leaf) {
      const el = root.querySelector(".nrsf-opensign");
      if (!el) return;
      const gx = leaf.w * .13, gy = leaf.h * .055, gw = leaf.w - gx * 2, gh = leaf.h * .44;
      const w = gw * (G.phone ? .7 : .52), h = w * 130 / 60;              // a bit bigger on phones, where the door is narrow
      Object.assign(el.style, { left: (gx + (gw - w) / 2) * u + "px", top: (gy + (gh - h) / 2) * u + "px", width: w * u + "px", height: h * u + "px" });
    }

    /* ---------- Falling leaves (from the ivy) on a light breeze ---------- */
    const sprites = [];
    function makeSprites() {
      sprites.length = 0;
      ivySprites().forEach(c => sprites.push(c.toDataURL()));   // single red ivy leaves, like the ones on the wall
    }
    let inView = true;                                       // no leaves fall while the street is scrolled out of sight
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => (inView = e.isIntersecting)).observe(root);
    function startLeaves() {
      if (!S.falling || reduceMotion) return;
      makeSprites();
      const fallEl = $("nrsf-fall");
      // One leaf drifting down. lead (0-1) starts it part of the way down (used when the page opens, so the air
      // is already full of leaves); push (-1 or 1) is a gust of wind blowing it hard to the left or right.
      const drop = (lead = 0, push = 0) => {
        if (!G) return;
        const near = Math.random() < .15, big = G.phone ? 1.25 + Math.random() * .35 : 1.5 + Math.random() * .6;                    // now and then one passes close to you: bigger, faster, a touch out of focus
        const el = document.createElement("img"), size = (G.phone ? 16 : 22) * u * (near ? big : .55 + Math.random() * .7) * (G.phone ? 2 : 1);
        el.src = sprites[(Math.random() * sprites.length) | 0]; el.alt = ""; el.width = el.height = size;
        if (near) el.style.filter = `blur(${(.8 * u).toFixed(2)}px)`;
        fallEl.appendChild(el);
        const x0 = push ? (push > 0 ? -.2 : .4) * W + Math.random() * W * .8 : Math.random() * W;
        const drift = push ? push * (220 + Math.random() * 320) * u : (40 + Math.random() * 160) * (Math.random() < .5 ? -1 : 1);
        const spin = (180 + Math.random() * 400) * (push ? 1.6 : 1), dur = (near ? 5000 + Math.random() * 3000 : 7000 + Math.random() * 6000) * (push ? .7 : 1);
        const frames = [];
        for (let k = 0; k <= 10; k++) {
          const t = k / 10;
          frames.push({ transform: `translate(${x0 + drift * t + Math.sin(t * Math.PI * 3) * 26}px, ${-40 + (H + 80) * t}px) rotate(${spin * t}deg) rotateX(${Math.sin(t * 7) * 60}deg)`, opacity: t > .92 ? 1 - (t - .92) * 12 : 1 });
        }
        el.animate(frames, { duration: dur, delay: -lead * dur, easing: "linear" }).finished.then(() => el.remove(), () => el.remove());
      };
      const live = () => inView && !document.hidden;
      // a steady fall: a new leaf every 0.4 to 1.1 seconds (a little slower on phones)
      const loop = () => { if (live()) drop(); setTimeout(loop, (G && G.phone ? 600 : 400) + Math.random() * 700); };
      // and every 9 to 18 seconds a gust shakes loose a flurry of 5 to 9 leaves, all blown the same way
      const gust = () => {
        if (live()) { const side = Math.random() < .5 ? -1 : 1, n = 5 + Math.random() * 5; for (let i = 0; i < n; i++) setTimeout(() => drop(0, side), i * (100 + Math.random() * 220)); }
        setTimeout(gust, 9000 + Math.random() * 9000);
      };
      for (let i = 0; i < (G && G.phone ? 9 : 14); i++) drop(Math.random() * .9);
      setTimeout(loop, 600); setTimeout(gust, 5000);
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
    const texReady = Promise.all([load("bricks", "bricks.jpg"), load("wood", "wood.jpg"), load("leaves", "leaves.webp"), load("cobbles", "cobbles.webp"), load("redbrick", "redbrick-red.webp")]);
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
