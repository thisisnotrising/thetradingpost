/* NOT RISING · THE POST — THE PAINT SHOP
   ------------------------------------------------------------------
   Every object in THE POST that isn't a photograph is painted here, in
   code, with the same method the storefront uses for its whitewashed
   brick and its hammered metal sign (see whitewash() in storefront.js):

     1. Each object is drawn TWICE, on two canvases of the same size:
          the COLOUR canvas  - what colour each spot is (rattan, leaf green…)
          the HEIGHT canvas  - how far each spot stands out, in grey:
                               black = flat/low, white = high.
        A cane is drawn as a ridge (bright down its middle, dark at its
        edges), a leaf as a gentle dome with a groove down the midrib,
        a cushion as a soft mound.
     2. light() then looks at every pixel: from the heights around it,
        it works out which way that little patch of surface is tilted,
        and how much it faces the light (from the top left, like the
        storefront). Facing the light = brighter; facing away = darker;
        tucked down in a crevice = in shadow. Shiny things get a glint.

   That is what makes every cane, leaf, board and fold look solid, and
   why it all matches the storefront: same light, same recipe.

   post.js calls NRPAINT.paintAll(woodPhoto) once, and gets back a set of
   finished pictures (canvases) to place around the room.
   Sizes: "M" is how many pixels make one metre in a picture.
   ------------------------------------------------------------------ */
(function () {
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const seeded = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const LIGHT = (() => { const v = [-.42, -.58, .7], l = Math.hypot(...v); return v.map(x => x / l); })();   // from the top left, a little in front
  let WOOD = null;                                                                        // the storefront's wood-grain photo
  let IVYPHOTO = null;                                                                    // Kathi's red-ivy photo, as a pattern (see planterTile)

  /* ================================================================
     THE TWO CANVASES, AND THE LIGHTING
     ================================================================ */
  function relief(w, h) {
    const A = canvas(w, h).getContext("2d", { willReadFrequently: true });             // colour
    const H = canvas(w, h).getContext("2d", { willReadFrequently: true });             // height
    H.fillStyle = "#000"; H.fillRect(0, 0, w, h);
    return { A, H, w, h };
  }
  // amp = how tall white is, in pixels (bigger = deeper shading). amb = how bright the shady side stays.
  // cav = how dark the crevices get. spec / shine = how glossy.
  function light(R, { amp = 18, amb = .38, cav = 2.2, cavBlur = 5, spec = 0, shine = 24, grain = .06 } = {}) {
    const { w, h } = R, ad = R.A.getImageData(0, 0, w, h).data, hd = R.H.getImageData(0, 0, w, h).data;
    const bc = canvas(w, h), bx = bc.getContext("2d", { willReadFrequently: true });
    bx.filter = `blur(${cavBlur}px)`; bx.drawImage(R.H.canvas, 0, 0); const bd = bx.getImageData(0, 0, w, h).data;
    const out = R.A.createImageData(w, h), o = out.data, k = amp / 255 / 2;
    const [Lx, Ly, Lz] = LIGHT, Hx = Lx, Hy = Ly, Hz = Lz + 1, Hl = Math.hypot(Hx, Hy, Hz);   // half-way vector, for glints
    const R2 = seeded(9);
    for (let y = 0; y < h; y++) {
      const up = y > 0 ? -w * 4 : 0, dn = y < h - 1 ? w * 4 : 0;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4; if (ad[i + 3] === 0) continue;
        const dx = (hd[i + (x < w - 1 ? 4 : 0)] - hd[i - (x > 0 ? 4 : 0)]) * k, dy = (hd[i + dn] - hd[i + up]) * k;
        const nl = Math.sqrt(dx * dx + dy * dy + 1), nx = -dx / nl, ny = -dy / nl, nz = 1 / nl;
        let d = (nx * Lx + ny * Ly + nz * Lz) / Lz; d = d < 0 ? 0 : d > 1.35 ? 1.35 : d;          // 1 on a flat face
        let c = 1 - (bd[i] - hd[i]) / 255 * cav; c = c < .42 ? .42 : c > 1 ? 1 : c;            // crevices sit in shadow
        const f = (amb + (1 - amb) * d) * c * (1 + (R2() - .5) * grain);
        let s = 0; if (spec) { const nh = (nx * Hx + ny * Hy + nz * Hz) / Hl; s = nh > 0 ? Math.pow(nh, shine) * spec * 255 : 0; }
        o[i] = Math.min(255, ad[i] * f + s); o[i + 1] = Math.min(255, ad[i + 1] * f + s); o[i + 2] = Math.min(255, ad[i + 2] * f + s); o[i + 3] = ad[i + 3];
      }
    }
    const c = canvas(w, h); c.getContext("2d").putImageData(out, 0, 0); return c;
  }
  // A soft shadow under a finished picture: its own outline, blurred and pushed down-right (away from the light)
  function withShadow(src, { dx = 6, dy = 10, blur = 7, alpha = .38, pad = 24 } = {}) {
    const c = canvas(src.width + pad * 2, src.height + pad * 2), x = c.getContext("2d");
    x.filter = `blur(${blur}px) brightness(0)`; x.globalAlpha = alpha; x.drawImage(src, pad + dx, pad + dy);
    x.filter = "none"; x.globalAlpha = 1; x.drawImage(src, pad, pad); c.pad = pad; return c;
  }

  /* ================================================================
     DRAWING TOOLS (each draws on both canvases at once)
     ================================================================ */
  const rgb = (c, f = 1) => `rgb(${c.map(v => Math.max(0, Math.min(255, v * f)) | 0)})`;
  const path = (ctx, pts, close = false) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); if (close) ctx.closePath(); };
  // A smooth curve through points, as a list of points (so it can be drawn as a tube or used for placing leaves)
  function curve(pts, steps = 10) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (let s = 0; s < steps; s++) { const t = s / steps, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(k => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3))); }
    }
    out.push(pts[pts.length - 1]); return out;
  }
  // A round cane / stem / cord / steel tube: colour down its length, a round ridge on the height canvas
  function tube(R, pts, wid, col, { hi = 1, jitter = 0 } = {}) {
    const { A, H } = R;
    A.lineCap = H.lineCap = "round"; A.lineJoin = H.lineJoin = "round";
    A.strokeStyle = typeof col === "string" ? col : rgb(col); A.lineWidth = wid; path(A, pts); A.stroke();
    for (let k = 0; k < 6; k++) {                                                     // narrower and higher toward the middle: a round cross-section
      const r = 1 - k / 6, g = Math.round(255 * hi * Math.sqrt(1 - r * r) * .85 + 30 * hi);
      H.strokeStyle = `rgb(${g},${g},${g})`; H.lineWidth = Math.max(.6, wid * r); path(H, pts); H.stroke();
    }
    if (jitter && WOOD) {                                                             // a little grain along canes
      A.save(); A.globalCompositeOperation = "multiply"; A.globalAlpha = jitter; A.strokeStyle = A.createPattern(WOOD, "repeat");
      A.lineWidth = wid; path(A, pts); A.stroke(); A.restore();
    }
  }
  // A soft mound (cushion, pot, leaf body): colour fill, a dome on the height canvas
  function mound(R, drawPath, col, { peak = 210, edge = 40, cx, cy, r } = {}) {
    const { A, H } = R;
    A.fillStyle = typeof col === "string" ? col : rgb(col); drawPath(A); A.fill();
    const g = H.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgb(${peak},${peak},${peak})`); g.addColorStop(.7, `rgb(${(peak + edge) / 2 | 0},${(peak + edge) / 2 | 0},${(peak + edge) / 2 | 0})`); g.addColorStop(1, `rgb(${edge},${edge},${edge})`);
    H.fillStyle = g; drawPath(H); H.fill();
  }
  // A flat slab (board, plank, steel plate, table top): flat on top, edges rounded off
  function slab(R, x, y, w, h, col, { top = 190, bevel = 3, grain = 0 } = {}) {
    const { A, H } = R;
    A.fillStyle = typeof col === "string" ? col : rgb(col); A.fillRect(x, y, w, h);
    if (grain && WOOD) { A.save(); A.globalCompositeOperation = "multiply"; A.globalAlpha = grain; A.beginPath(); A.rect(x, y, w, h); A.clip();
      A.drawImage(WOOD, x - hash(x, y) * 200, y - hash(y, x) * 100, Math.max(w * 1.3, 400), Math.max(h * 3, 300)); A.restore(); }
    for (let k = 0; k <= bevel; k++) { const g = Math.round(top * (k + 1) / (bevel + 1)); H.fillStyle = `rgb(${g},${g},${g})`; H.fillRect(x + k, y + k, w - 2 * k, h - 2 * k); }
  }
  // A leaf, drawn along its midrib from (x, y) at angle a: length L, width W.
  // shape: "heart" (pothos), "oval" (fig, schefflera), "strap" (spider plant, dracaena), "paddle" (bird of paradise).
  function leaf(R, x, y, a, L, W, col, shape = "oval", { stripe = null, droop = 0, curl = 0 } = {}) {
    const { A, H } = R;
    const outline = ctx => {
      ctx.beginPath();
      if (shape === "heart") { ctx.moveTo(0, 0); ctx.bezierCurveTo(L * .15, -W * .75, L * .75, -W * .6, L, 0); ctx.bezierCurveTo(L * .75, W * .6, L * .15, W * .75, 0, 0); }
      else if (shape === "strap") { const d = droop * L; ctx.moveTo(0, -W / 2); ctx.quadraticCurveTo(L * .5, -W / 2 + d * .5, L, d); ctx.quadraticCurveTo(L * .5, W / 2 + d * .5, 0, W / 2); }
      else if (shape === "ivy") {      // Boston ivy: three pointed lobes (a long middle one, two side ones) and a heart-shaped base
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(L * .02, -W * .42, L * .3, -W * .42); ctx.quadraticCurveTo(L * .44, -W * .5, L * .52, -W * .62);   // base to left tip
        ctx.quadraticCurveTo(L * .56, -W * .34, L * .66, -W * .2);                                                              // left notch
        ctx.quadraticCurveTo(L * .86, -W * .2, L, 0);                                                                           // middle tip
        ctx.quadraticCurveTo(L * .86, W * .2, L * .66, W * .2);
        ctx.quadraticCurveTo(L * .56, W * .34, L * .52, W * .62);                                                               // right tip
        ctx.quadraticCurveTo(L * .44, W * .5, L * .3, W * .42); ctx.quadraticCurveTo(L * .02, W * .42, 0, 0);
      }
      else if (shape === "paddle") { ctx.moveTo(0, 0); ctx.bezierCurveTo(L * .2, -W * .6, L * .9, -W * .55, L, 0); ctx.bezierCurveTo(L * .9, W * .55, L * .2, W * .6, 0, 0); }
      else { ctx.moveTo(0, 0); ctx.bezierCurveTo(L * .25, -W * .62, L * .8, -W * .5, L, 0); ctx.bezierCurveTo(L * .8, W * .5, L * .25, W * .62, 0, 0); }
    };
    [A, H].forEach(c => { c.save(); c.translate(x, y); c.rotate(a); if (curl) c.transform(1, curl, 0, 1, 0, 0); });
    // colour: the leaf, a lighter midrib, optional cream stripe (spider plant) and side veins
    const g = A.createLinearGradient(0, -W / 2, 0, W / 2);
    g.addColorStop(0, rgb(col, 1.08)); g.addColorStop(.5, rgb(col, .95)); g.addColorStop(1, rgb(col, .82));
    A.fillStyle = g; outline(A); A.fill();
    if (stripe) { A.save(); outline(A); A.clip(); A.fillStyle = stripe; A.beginPath(); A.moveTo(0, -W * .12); A.quadraticCurveTo(L * .5, droop * L * .5 - W * .1, L, droop * L); A.quadraticCurveTo(L * .5, droop * L * .5 + W * .1, 0, W * .12); A.fill(); A.restore(); }
    A.strokeStyle = rgb(col, 1.22); A.lineWidth = Math.max(.6, W * .035); A.beginPath(); A.moveTo(0, 0); A.quadraticCurveTo(L * .5, droop * L * .5, L * .96, droop * L); A.stroke();
    if (shape === "ivy") { A.save(); A.globalAlpha = .45; A.lineWidth = Math.max(.5, W * .03); A.beginPath(); A.moveTo(L * .08, 0); A.lineTo(L * .5, -W * .5); A.moveTo(L * .08, 0); A.lineTo(L * .5, W * .5); A.stroke(); A.restore(); }
    else if (shape !== "strap" && W > 14) { A.save(); A.globalAlpha = .35; A.lineWidth = Math.max(.4, W * .015); for (let t = .2; t < .9; t += .14) { A.beginPath(); A.moveTo(L * t, 0); A.lineTo(L * (t + .12), -W * .32); A.moveTo(L * t, 0); A.lineTo(L * (t + .12), W * .32); A.stroke(); } A.restore(); }
    // Boston ivy: a patch of Kathi's red-ivy photo blended in (when it has been handed over), so each leaf has the
    // real crimson, plum and gloss of her photo, not one flat colour
    if (shape === "ivy" && IVYPHOTO) {
      const ox = Math.random() * IVYPHOTO.w, oy = Math.random() * IVYPHOTO.h * .7, k = L / 70;
      IVYPHOTO.pat.setTransform(new DOMMatrix([k, 0, 0, k, -ox * k, -oy * k]));
      A.save(); A.globalCompositeOperation = "overlay"; A.globalAlpha = .7; A.fillStyle = IVYPHOTO.pat; outline(A); A.fill(); A.restore();
    }
    // height. Ivy: one soft dome (a leaf cupped slightly), with a faint groove down the midrib.
    if (shape === "ivy") {
      const hr = H.createRadialGradient(L * .45, 0, 0, L * .45, 0, L * .62);
      hr.addColorStop(0, "rgb(205,205,205)"); hr.addColorStop(1, "rgb(70,70,70)");
      H.fillStyle = hr; outline(H); H.fill();
      H.strokeStyle = "rgb(150,150,150)"; H.lineWidth = Math.max(.6, W * .03); H.beginPath(); H.moveTo(0, 0); H.lineTo(L * .95, 0); H.stroke();
      [A, H].forEach(c => c.restore()); return;
    }
    // height: a dome across the width, highest along the middle, with a groove down the midrib
    const hg = H.createLinearGradient(0, -W / 2, 0, W / 2);
    hg.addColorStop(0, "rgb(90,90,90)"); hg.addColorStop(.35, "rgb(200,200,200)"); hg.addColorStop(.5, "rgb(186,186,186)"); hg.addColorStop(.65, "rgb(200,200,200)"); hg.addColorStop(1, "rgb(90,90,90)");
    H.fillStyle = hg; outline(H); H.fill();
    [A, H].forEach(c => c.restore());
  }

  /* ================================================================
     THE CEILING: white-painted boards, and the black steel skylight
     ================================================================ */
  function ceilingTile() {                                                            // 3 m across, 12 boards of 11 cm
    const M = 300, bh = .11 * M, rows = 12, R = relief(3 * M, rows * bh), r = seeded(3);
    for (let i = 0; i < rows; i++) {
      const L = 236 + r() * 12; slab(R, -10, i * bh + 2, R.w + 20, bh - 4, [L, L - 1, L - 5], { top: 200, bevel: 3, grain: .05 });
    }
    // brush marks in the paint, running along the boards
    R.H.save(); R.H.globalAlpha = .06; for (let k = 0; k < 500; k++) { const y = r() * R.h, x = r() * R.w; R.H.fillStyle = r() > .5 ? "#fff" : "#000"; R.H.fillRect(x, y, 40 + r() * 140, 1); } R.H.restore();
    return light(R, { amp: 14, amb: .5, cav: 1.6, grain: .03 });
  }
  function skylightTile(bayM, rowM) {                                                 // one pane in its black steel frame
    const M = 300, w = bayM * M, h = rowM * M, R = relief(w, h), bw = .07 * M, cw = .055 * M;
    const steel = [30, 30, 32];
    slab(R, 0, 0, bw / 2, h, steel, { top: 230, bevel: 4 }); slab(R, w - bw / 2, 0, bw / 2, h, steel, { top: 230, bevel: 4 });   // long bars (half on each side)
    slab(R, 0, h - cw, w, cw, steel, { top: 200, bevel: 3 });                                                                  // a cross bar
    const c = light(R, { amp: 30, amb: .45, cav: 1.2, spec: .8, shine: 30, grain: 0 });
    const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, w, h);            // a reflection across the glass
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.35, "rgba(255,255,255,.22)"); g.addColorStop(.45, "rgba(255,255,255,0)"); g.addColorStop(.7, "rgba(255,255,255,.12)"); g.addColorStop(.78, "rgba(255,255,255,0)");
    x.globalCompositeOperation = "destination-over"; x.fillStyle = g; x.fillRect(bw / 2, 0, w - bw, h - cw);
    return c;
  }

  /* ================================================================
     THE PLANTERS ALONG THE TOP OF THE WALLS, AND THE GREENERY
     ================================================================ */
  const GREENS = [[48, 92, 46], [60, 108, 52], [72, 122, 58], [42, 80, 44], [86, 134, 62], [56, 98, 60]];
  // one spider plant clump: long arching strap leaves with a cream stripe, some spilling down
  function spiderPlant(R, x, y, s, r) {
    for (let i = 0; i < 26; i++) {
      const up = i < 10, a = up ? -Math.PI / 2 + (r() - .5) * 1.9 : (r() < .5 ? Math.PI * .1 : Math.PI * .9) + (r() - .5) * .9;
      const L = (up ? .28 + r() * .25 : .45 + r() * .55) * s, W = .022 * s * (1 + r() * .4);
      leaf(R, x + (r() - .5) * .08 * s, y, a, L, W, GREENS[(r() * 3) | 0], "strap", { stripe: "rgba(232,236,200,.75)", droop: up ? .25 : .55 + r() * .3 });
    }
  }
  // a trailing pothos: a thin stem falling and wandering, heart leaves alternating along it
  function pothos(R, x, y, len, s, r, { wrapW = 0 } = {}) {
    const pts = [[x, y]]; let cx = x, cy = y;
    for (let k = 0; k < 8; k++) { cx += (r() - .5) * .12 * s; cy += len / 8; pts.push([cx, cy]); }
    const line = curve(pts, 8);
    const draw = off => {
      tube(R, line.map(([px, py]) => [px + off, py]), .012 * s, [72, 96, 50], { hi: .5 });
      line.forEach(([px, py], i) => { if (i % 4) return; const side = (i / 4) % 2 ? 1 : -1, sz = (.07 + r() * .05) * s;
        const v = r(); leaf(R, px + off, py, Math.PI / 2 + side * (.9 + r() * .5), sz * 1.2, sz, GREENS[(v * GREENS.length) | 0], "heart", { stripe: v > .7 ? "rgba(220,214,120,.35)" : null }); });
    };
    draw(0); if (wrapW) { draw(-wrapW); draw(wrapW); }
  }
  // umbrella-leaf schefflera: whorls of oval leaflets on short stalks
  function schefflera(R, x, y, s, r) {
    for (let k = 0; k < 7; k++) {
      const hx = x + (r() - .5) * .5 * s, hy = y - r() * .25 * s + .1 * s;
      tube(R, [[x, y + .1 * s], [hx, hy]], .01 * s, [70, 80, 50], { hi: .4 });
      for (let j = 0; j < 7; j++) leaf(R, hx, hy, (j / 7) * Math.PI * 2 + r() * .3, (.09 + r() * .04) * s, .035 * s, GREENS[(r() * GREENS.length) | 0], "oval");
    }
  }
  // RED BOSTON IVY, like the ivy on the storefront outside (the same crimson-to-plum colours: SEASONS.fall.leaves in data.js)
  const IVY = [[196, 26, 44], [214, 42, 58], [168, 24, 42], [204, 44, 58], [143, 36, 72], [184, 28, 58], [133, 20, 50], [214, 52, 63], [168, 40, 80]];
  const ivyCol = r => { const c = IVY[(r() * IVY.length) | 0], f = .85 + r() * .25; return c.map(v => v * f); };
  // one leaf on a short red stalk
  function ivyLeaf(R, x, y, a, s, r) {
    const L = (.085 + r() * .05) * s;
    const sx = x + Math.cos(a) * L * .25, sy = y + Math.sin(a) * L * .25;
    tube(R, [[x, y], [sx, sy]], .006 * s, [120, 30, 36], { hi: .4 });
    leaf(R, sx, sy, a, L, L * (.95 + r() * .2), ivyCol(r), "ivy", { curl: (r() - .5) * .25 });
  }
  // a mound of ivy tumbling out of the trough: leaves heaped over the lip, facing every way
  function ivyClump(R, x, y, s, r) {
    for (let i = 0; i < 46; i++) {
      const lx = x + (r() - .5) * .55 * s, ly = y + (r() - .75) * .22 * s;
      ivyLeaf(R, lx, ly, -Math.PI / 2 + (r() - .5) * 3.4, s, r);
    }
  }
  // a trailing ivy vine falling down the wall: a thin red-brown stem, leaves alternating along it, hanging down
  function ivyVine(R, x, y, len, s, r, { wrapW = 0 } = {}) {
    const pts = [[x, y]]; let cx = x, cy = y;
    for (let k = 0; k < 8; k++) { cx += (r() - .5) * .1 * s; cy += len / 8; pts.push([cx, cy]); }
    const line = curve(pts, 8), leaves = [];
    line.forEach(([px, py], i) => { if (i % 3) return; const side = (i / 3) % 2 ? 1 : -1; leaves.push([px, py, Math.PI / 2 + side * (.5 + r() * .7), r() * 1e6 | 0]); });
    const draw = off => {
      tube(R, line.map(([px, py]) => [px + off, py]), .008 * s, [110, 40, 34], { hi: .5 });
      leaves.forEach(([px, py, a, seed]) => ivyLeaf(R, px + off, py, a, s, seeded(seed + 1)));
    };
    draw(0); if (wrapW) { draw(-wrapW); draw(wrapW); }
  }
  // THE PLANTER STRIP: the black trough on its concrete ledge, plants spilling over.
  // 3.2 m across, 2.3 m tall, and it repeats along the wall with no seam (anything near an edge is drawn on the other side too).
  function planterTile(ivyPhoto) {
    if (ivyPhoto) { const c = canvas(ivyPhoto.width, ivyPhoto.height); c.getContext("2d").drawImage(ivyPhoto, 0, 0);
      IVYPHOTO = { pat: c.getContext("2d").createPattern(c, "repeat"), w: c.width, h: c.height }; }
    const M = 280, W = 3.2 * M, Ht = 2.3 * M, R = relief(W, Ht), r = seeded(21);
    // the ledge: pale concrete, pitted
    slab(R, -20, .42 * M, W + 40, .53 * M, [222, 214, 198], { top: 170, bevel: 6 });
    R.H.save(); for (let k = 0; k < 700; k++) { R.H.fillStyle = "rgba(0,0,0,.22)"; R.H.beginPath(); R.H.arc(r() * W, .45 * M + r() * .48 * M, .4 + r() * 1.1, 0, 7); R.H.fill(); } R.H.restore();
    // the trough: black powder-coated steel with a lip
    slab(R, -20, .12 * M, W + 40, .3 * M, [26, 26, 26], { top: 220, bevel: 4 });
    slab(R, -20, .1 * M, W + 40, .04 * M, [40, 40, 40], { top: 245, bevel: 2 });
    // plants: red Boston ivy heaped in the trough, and long ivy vines trailing down the wall (Oct 2026: it used to be
    // spider plants, schefflera and green pothos; their painters are still above, if ever wanted back)
    for (let i = 0; i < 13; i++) ivyVine(R, (i + r()) / 13 * W, .2 * M, (.6 + r() * 1.3) * M, M * 1.1, seeded(300 + i), { wrapW: W });
    for (let i = 0; i < 10; i++) {
      const x = (i + .3 + r() * .4) / 10 * W;
      [-W, 0, W].forEach(off => ivyClump(R, x + off, .16 * M, M * 1.1, seeded(100 + i)));
    }
    const lit = light(R, { amp: 22, amb: .36, cav: 2.4, spec: .25, shine: 18 });
    return withShadow(lit, { dx: 8, dy: 14, blur: 9, alpha: .3, pad: 0 });              // the plants cast a soft shadow on the wall behind
  }
  // A long pothos vine hanging from the skylight (3 m)
  function vine() {
    const M = 260, R = relief(.5 * M, 3 * M);
    pothos(R, .25 * M, 0, 2.9 * M, M, seeded(77));
    return withShadow(light(R, { amp: 20, amb: .38, spec: .25, shine: 18 }), { dx: 5, dy: 8, blur: 6, alpha: .25 });
  }
  // A woven basket (rattan / seagrass): rows of rope, standing in front of whatever plant is drawn in it
  function basket(R, cx, by, w, h, col = [196, 160, 104]) {
    const top = by - h, rows = Math.round(h / 9);
    for (let i = 0; i < rows; i++) { const y = top + (i + .5) * h / rows, t = i / rows, hw = w / 2 * (.86 + .14 * (1 - t));
      tube(R, [[cx - hw, y], [cx + hw, y]], h / rows * 1.05, rgb(col, .92 + hash(i, 3) * .16), { hi: .7, jitter: .25 }); }
    for (let i = 0; i < 9; i++) { const x = cx - w / 2 + (i + .5) * w / 9; tube(R, [[x, top], [x * .98 + cx * .02, by]], 2.4, rgb(col, .8), { hi: .9 }); }   // the upright stakes
    tube(R, [[cx - w / 2 - 3, top], [cx + w / 2 + 3, top]], 11, rgb(col, .85), { hi: 1, jitter: .3 });                        // the rolled rim
  }
  // Bird of paradise in a big basket: tall paddle leaves on long stalks
  function bigPlant(seed = 5) {
    const M = 240, w = 2.7 * M, h = 2.6 * M, R = relief(w, h), r = seeded(seed), bx = w / 2, by = h - 4;   // (2.7 m wide, so no leaf runs off the picture's edge)
    for (let i = 0; i < 13; i++) {
      const a = -Math.PI / 2 + (r() - .5) * 1.5, L = (.9 + r() * 1.1) * M, ex = bx + Math.cos(a) * L * .7, ey = by - .45 * M + Math.sin(a) * L * .9;
      tube(R, [[bx + (r() - .5) * .1 * M, by - .4 * M], [(bx + ex) / 2, (by + ey) / 2 - .05 * M], [ex, ey]], .025 * M, [70, 98, 54], { hi: .6 });
      leaf(R, ex, ey, a + (r() - .5) * .5, (.45 + r() * .3) * M, (.16 + r() * .06) * M, GREENS[(r() * GREENS.length) | 0], "paddle", { curl: (r() - .5) * .3 });
    }
    basket(R, bx, by, .62 * M, .5 * M);
    return light(R, { amp: 24, amb: .36, cav: 2.2, spec: .3, shine: 20 });
  }
  // Fiddle-leaf fig in a basket: a straight trunk, big glossy leaves up it
  function fig() {
    const M = 240, w = 1.1 * M, h = 2.1 * M, R = relief(w, h), r = seeded(13), bx = w / 2, by = h - 4;
    tube(R, [[bx, by - .35 * M], [bx + .02 * M, by - 1.2 * M], [bx - .01 * M, by - 1.95 * M]], .03 * M, [110, 88, 66], { hi: .7, jitter: .3 });
    for (let i = 0; i < 26; i++) { const t = .35 + r() * .62, y = by - .35 * M - t * 1.6 * M, side = r() < .5 ? -1 : 1;
      leaf(R, bx + side * .02 * M, y, (side < 0 ? Math.PI : 0) - side * (.4 + r() * .9) + (r() - .5) * .4, (.2 + r() * .1) * M, (.15 + r() * .05) * M, GREENS[(r() * 4) | 0], "oval", { curl: (r() - .5) * .3 }); }
    basket(R, bx, by, .45 * M, .38 * M, [150, 116, 72]);
    return light(R, { amp: 24, amb: .36, cav: 2.2, spec: .45, shine: 26 });
  }
  // Dracaena: a fountain of long strap leaves, close up in the bottom corners
  function dracaena() {
    const M = 240, w = 1.9 * M, h = 1.8 * M, R = relief(w, h), r = seeded(31), bx = w / 2, by = h;
    for (let i = 0; i < 34; i++) { const a = -Math.PI / 2 + (r() - .5) * 2.4, L = (.5 + r() * .9) * M;
      leaf(R, bx + (r() - .5) * .1 * M, by, a, L, (.05 + r() * .03) * M, GREENS[(r() * GREENS.length) | 0], "strap", { droop: (Math.cos(a) > 0 ? 1 : -1) * (.1 + r() * .25), stripe: "rgba(200,220,150,.25)" }); }
    return light(R, { amp: 22, amb: .36, cav: 2.2, spec: .35, shine: 20 });
  }

  /* ================================================================
     THE FURNITURE: boho rattan, after your reference
     ================================================================ */
  const RATTAN = [214, 184, 132];
  // A rattan bowl chair: a deep round bowl of looped cane on curved legs, a white cushion with a black
  // geometric print, and a black throw with a long fringe hanging over the arm.
  function bowlChair(flip = false) {
    const M = 400, w = 1.05 * M, h = 1.0 * M, R = relief(w, h), r = seeded(41), cx = w / 2;
    const S = v => v * M, seatY = h - S(.42), rimR = S(.46);
    // legs: four curved canes, the binding wrapped where they meet the bowl
    [[-.3, -.36], [.3, .36], [-.12, -.16], [.12, .16]].forEach(([a, b], k) => tube(R, [[cx + S(a), seatY + S(.02)], [cx + S((a + b) / 2 * 1.05), seatY + S(.2)], [cx + S(b), h - 4]], S(.03), RATTAN, { hi: k > 1 ? .7 : 1, jitter: .3 }));
    tube(R, [[cx - S(.3), h - S(.14)], [cx + S(.3), h - S(.14)]], S(.02), RATTAN, { hi: .8, jitter: .3 });   // a ring of cane bracing the legs
    // the bowl: a back of radiating cane loops, from the seat up and out to the rim
    for (let i = 0; i <= 22; i++) { const t = i / 22, a = Math.PI * (1.05 + t * .9), x1 = cx + Math.cos(a) * rimR, y1 = seatY - S(.08) + Math.sin(a) * rimR * .95;
      tube(R, curve([[cx + (t - .5) * S(.5), seatY], [(cx + x1) / 2 + Math.cos(a) * S(.05), (seatY + y1) / 2], [x1, y1]], 6), S(.018), rgb(RATTAN, .92 + r() * .14), { hi: .8, jitter: .3 }); }
    for (let i = 0; i < 3; i++) { const rr = rimR * (1 - i * .03), pts = []; for (let k = 0; k <= 30; k++) { const a = Math.PI * (1.02 + k / 30 * .96); pts.push([cx + Math.cos(a) * rr, seatY - S(.08) + Math.sin(a) * rr * .95 + i * S(.012)]); }
      tube(R, pts, S(.028), rgb(RATTAN, 1 - i * .05), { hi: 1, jitter: .3 }); }                                 // the thick rolled rim
    // the seat rim (front edge of the bowl)
    tube(R, curve([[cx - rimR * .98, seatY - S(.1)], [cx - S(.2), seatY + S(.03)], [cx + S(.2), seatY + S(.03)], [cx + rimR * .98, seatY - S(.1)]], 10), S(.035), RATTAN, { hi: 1, jitter: .3 });
    // the cushion and the patterned pillow
    mound(R, c => { c.beginPath(); c.ellipse(cx, seatY - S(.06), S(.36), S(.08), 0, 0, 7); }, [238, 234, 226], { cx, cy: seatY - S(.08), r: S(.36), peak: 230, edge: 60 });
    const pw = S(.42), ph = S(.3), px = cx - pw / 2 - S(.03), py = seatY - S(.08) - ph;
    const pill = c => { c.beginPath(); c.moveTo(px, py + S(.02)); c.quadraticCurveTo(px + pw / 2, py - S(.02), px + pw, py + S(.02)); c.quadraticCurveTo(px + pw + S(.03), py + ph / 2, px + pw, py + ph); c.quadraticCurveTo(px + pw / 2, py + ph + S(.02), px, py + ph); c.quadraticCurveTo(px - S(.03), py + ph / 2, px, py + S(.02)); };
    mound(R, pill, [242, 239, 232], { cx: px + pw / 2, cy: py + ph / 2, r: pw * .62, peak: 245, edge: 70 });
    R.A.save(); pill(R.A); R.A.clip(); R.A.strokeStyle = "#1b1b1b"; R.A.lineWidth = S(.008);              // the print: zigzags and bands, like the reference pillow
    [.3, .55, .8].forEach(f => { const y = py + ph * f; R.A.beginPath(); for (let x = px; x <= px + pw; x += S(.03)) R.A.lineTo(x, y + ((x - px) / S(.03) % 2 ? -S(.02) : S(.02))); R.A.stroke(); });
    R.A.fillStyle = "#1b1b1b"; R.A.fillRect(px, py + ph * .42, pw, S(.012)); R.A.fillRect(px, py + ph * .67, pw, S(.012)); R.A.restore();
    // the black fringed throw, draped over the right arm
    const tx = cx + S(.24), ty = seatY - S(.28);
    mound(R, c => { c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + S(.18), ty - S(.02), tx + S(.25), ty + S(.12)); c.lineTo(tx + S(.2), ty + S(.42)); c.lineTo(tx - S(.02), ty + S(.4)); c.closePath(); }, [28, 26, 24], { cx: tx + S(.1), cy: ty + S(.15), r: S(.28), peak: 200, edge: 50 });
    for (let k = 0; k < 26; k++) { const fx = tx - S(.02) + k / 26 * S(.22); tube(R, [[fx, ty + S(.4)], [fx + (r() - .5) * S(.02), ty + S(.4) + S(.1 + r() * .08)]], S(.006), [20, 19, 18], { hi: .6 }); }
    let c = light(R, { amp: 26, amb: .4, cav: 2.4, spec: .22, shine: 14 });
    if (flip) { const f = canvas(c.width, c.height), x = f.getContext("2d"); x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); c = f; }
    return c;
  }
  // A round rattan side table: a woven cane top on looped legs, two wooden bowls and a dried protea on it,
  // a white fringed throw over one side.
  function sideTable() {
    const M = 400, w = .62 * M, h = .7 * M, R = relief(w, h), r = seeded(55), cx = w / 2, S = v => v * M, topY = h - S(.5);
    for (let i = 0; i < 7; i++) { const x = cx - S(.2) + i * S(.4) / 6; tube(R, curve([[x, topY], [x + (i % 2 ? S(.03) : -S(.03)), topY + S(.25)], [x, h - 4]], 8), S(.016), RATTAN, { hi: .9, jitter: .3 }); }   // looped legs
    tube(R, [[cx - S(.22), topY + S(.22)], [cx + S(.22), topY + S(.22)]], S(.02), RATTAN, { hi: .8, jitter: .3 });
    tube(R, [[cx - S(.22), h - S(.04)], [cx + S(.22), h - S(.04)]], S(.022), RATTAN, { hi: .8, jitter: .3 });
    R.A.save(); R.A.beginPath(); R.A.ellipse(cx, topY, S(.25), S(.06), 0, 0, 7); R.A.clip();                    // the woven top
    for (let k = -30; k < 30; k++) { tube(R, [[cx + k * S(.012), topY - S(.07)], [cx + k * S(.012) + S(.05), topY + S(.07)]], S(.008), rgb(RATTAN, .95), { hi: .5 }); }
    R.A.restore();
    const ring = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * Math.PI * 2; ring.push([cx + Math.cos(a) * S(.25), topY + Math.sin(a) * S(.06)]); }
    tube(R, ring, S(.022), RATTAN, { hi: 1, jitter: .3 });
    [[-.07, .07], [.06, .06]].forEach(([dx, rw]) => mound(R, c => { c.beginPath(); c.ellipse(cx + S(dx), topY - S(.025), S(rw), S(.035), 0, 0, Math.PI); c.lineTo(cx + S(dx) - S(rw), topY - S(.025)); }, [150, 96, 54], { cx: cx + S(dx), cy: topY - S(.02), r: S(rw), peak: 200, edge: 80 }));   // wooden bowls
    for (let k = 0; k < 16; k++) leaf(R, cx + S(.12), topY - S(.08), -Math.PI / 2 + (k / 16 - .5) * 2.6, S(.06 + r() * .02), S(.018), [150, 110, 80], "oval");   // the dried protea
    mound(R, c => { c.beginPath(); c.moveTo(cx + S(.05), topY - S(.04)); c.quadraticCurveTo(cx + S(.25), topY - S(.06), cx + S(.28), topY + S(.05)); c.lineTo(cx + S(.27), topY + S(.3)); c.lineTo(cx + S(.12), topY + S(.28)); c.closePath(); }, [238, 236, 230], { cx: cx + S(.2), cy: topY + S(.1), r: S(.2), peak: 200, edge: 70 });
    for (let k = 0; k < 18; k++) { const fx = cx + S(.12) + k / 18 * S(.15); tube(R, [[fx, topY + S(.28)], [fx + (r() - .5) * S(.01), topY + S(.36 + r() * .05)]], S(.005), [235, 232, 224], { hi: .5 }); }
    return light(R, { amp: 24, amb: .4, cav: 2.4, spec: .2, shine: 14 });
  }
  // A seagrass ottoman: a woven cube with a white cushion on top crossed with black lines
  function ottoman() {
    const M = 400, w = .74 * M, h = .56 * M, R = relief(w, h), cx = w / 2, S = v => v * M, r = seeded(61);
    const x0 = S(.03), x1 = w - S(.03), y0 = S(.12), y1 = h - 3, rows = 14;
    for (let i = 0; i < rows; i++) { const y = y0 + (i + .5) * (y1 - y0) / rows;                             // rows of plaited seagrass
      for (let k = 0; k < 18; k++) { const xa = x0 + k * (x1 - x0) / 18; tube(R, [[xa, y + (k % 2 ? 2 : -2)], [xa + (x1 - x0) / 18, y + (k % 2 ? -2 : 2)]], (y1 - y0) / rows * 1.1, rgb([196, 172, 120], .9 + r() * .16), { hi: .7, jitter: .25 }); } }
    const cush = c => { c.beginPath(); c.moveTo(x0, y0 + S(.03)); c.quadraticCurveTo(cx, y0 - S(.02), x1, y0 + S(.03)); c.lineTo(x1, y0 - S(.09)); c.quadraticCurveTo(cx, y0 - S(.13), x0, y0 - S(.09)); c.closePath(); };
    mound(R, cush, [240, 237, 229], { cx, cy: y0 - S(.04), r: S(.38), peak: 230, edge: 80 });
    R.A.save(); cush(R.A); R.A.clip(); R.A.strokeStyle = "#1c1c1c"; R.A.lineWidth = S(.008);
    R.A.beginPath(); R.A.moveTo(x0, y0 - S(.1)); R.A.lineTo(x1, y0 + S(.03)); R.A.moveTo(x0, y0 + S(.03)); R.A.lineTo(x1, y0 - S(.1)); R.A.stroke(); R.A.restore();
    return light(R, { amp: 22, amb: .4, cav: 2.4, spec: .15, shine: 12 });
  }
  // Pendant lights: a rattan bell (open lattice, warm bulb glowing inside) and a raffia fringe shade
  function pendant(kind) {
    const M = 400, w = .62 * M, h = .7 * M, R = relief(w, h), cx = w / 2, S = v => v * M, r = seeded(kind === "raffia" ? 71 : 73);
    if (kind === "raffia") {
      mound(R, c => { c.beginPath(); c.ellipse(cx, S(.12), S(.16), S(.1), 0, Math.PI, 0); c.closePath(); }, [196, 166, 112], { cx, cy: S(.08), r: S(.18), peak: 220, edge: 80 });
      for (let k = 0; k < 90; k++) { const t = k / 90, x = cx + (t - .5) * S(.5), len = S(.35 + r() * .2);   // the raffia strands
        tube(R, curve([[cx + (t - .5) * S(.28), S(.1)], [x, S(.2)], [x + (r() - .5) * S(.03), S(.1) + len]], 4), S(.006), rgb([200, 170, 116], .85 + r() * .25), { hi: .6 }); }
    } else {
      const top = S(.05), bot = S(.45), rw = y => S(.04) + (S(.24) - S(.04)) * Math.pow((y - top) / (bot - top), .7);
      for (let k = 0; k <= 16; k++) { const t = k / 16 * 2 - 1, pts = []; for (let y = top; y <= bot; y += 6) pts.push([cx + t * rw(y), y]); tube(R, pts, S(.008), RATTAN, { hi: .7 }); }
      for (let y = top + S(.03); y < bot; y += S(.035)) tube(R, [[cx - rw(y), y], [cx + rw(y), y]], S(.007), RATTAN, { hi: .6 });
      tube(R, [[cx - rw(bot), bot], [cx + rw(bot), bot]], S(.015), RATTAN, { hi: 1 });
    }
    const c = light(R, { amp: 20, amb: .45, cav: 2, spec: .15, shine: 12 }), x = c.getContext("2d");
    const g = x.createRadialGradient(cx, kind === "raffia" ? S(.2) : S(.3), 0, cx, S(.3), S(.25));               // the warm glow of the bulb
    g.addColorStop(0, "rgba(255,240,200,.95)"); g.addColorStop(.25, "rgba(255,214,150,.5)"); g.addColorStop(1, "rgba(255,200,120,0)");
    x.globalCompositeOperation = "destination-over"; x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = "source-over"; x.strokeStyle = "#2a2622"; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, 0); x.lineTo(cx, S(.05)); x.stroke();
    return c;
  }
  /* ================================================================
     THE POUFS: jute coils and a round chunky knit
     ================================================================ */
  function pouf(R, cx, by, w, h, col = [190, 162, 112]) {                             // a jute pouf: chunky braided coils, a dome on top
    const rows = 6;
    for (let i = 0; i < rows; i++) { const y = by - h + (i + .5) * h / rows, hw = w / 2 * (.88 + .12 * Math.sin(Math.PI * (i + .5) / rows));
      for (let k = 0; k < 16; k++) { const x0 = cx - hw + k * 2 * hw / 16; tube(R, [[x0, y + (k % 2 ? 3 : -3)], [x0 + 2 * hw / 16, y + (k % 2 ? -3 : 3)]], h / rows * 1.05, rgb(col, .9 + hash(i, k) * .15), { hi: .8, jitter: .3 }); } }
    mound(R, c => { c.beginPath(); c.ellipse(cx, by - h, w * .47, h * .18, 0, 0, 7); }, rgb(col, 1.04), { cx, cy: by - h, r: w * .48, peak: 230, edge: 110 });
    for (let k = 0; k < 4; k++) { const pts = []; for (let j = 0; j <= 30; j++) { const a = j / 30 * Math.PI * 2; pts.push([cx + Math.cos(a) * w * .1 * (k + 1), by - h + Math.sin(a) * h * .04 * (k + 1)]); } tube(R, pts, h * .05, rgb(col, .92), { hi: .7 }); }
  }
  function roundPouf(R, cx, by, w, h, col = [236, 229, 214]) {                     // a round chunky-knit pouf: a soft squashed ball, rows of fat V stitches
    mound(R, c => { c.beginPath(); c.ellipse(cx, by - h * .5, w * .5, h * .5, 0, 0, 7); }, col, { cx: cx - w * .1, cy: by - h * .62, r: w * .62, peak: 235, edge: 70 });
    const rows = 7;
    for (let i = 0; i < rows; i++) { const v = (i + .5) / rows, y = by - h + v * h, hw = w * .5 * Math.sqrt(Math.max(0, 1 - Math.pow(v * 2 - 1, 2))) * .94, n = Math.max(3, Math.round(hw / (w * .045)));
      for (let k = 0; k < n; k++) { const t = (k + .5) / n * 2 - 1, x = cx + t * hw, sw = hw / n * .95, sh = h / rows * .52, sq = Math.sqrt(1 - t * t * .7);   // stitches squash toward the sides (it's round)
        [-1, 1].forEach(sd => { const ex = x + sd * sw * .45 * sq, ang = sd * .55;
          mound(R, c => { c.beginPath(); c.ellipse(ex, y, sw * .5 * sq, sh, ang, 0, 7); }, rgb(col, .97 + hash(i, k + sd) * .06), { cx: ex - sw * .1, cy: y - sh * .3, r: sh * 1.1, peak: 255, edge: 110 }); }); } }
  }
  // Two jute poufs and a round knitted pouf for the middle of the lounge (1.6 m wide)
  function poufSet() {
    const M = 300, W = 1.6 * M, Hh = .6 * M, R = relief(W, Hh), fy = Hh - 3, S = v => v * M;
    pouf(R, S(.38), fy, S(.58), S(.36)); roundPouf(R, S(.98), fy, S(.56), S(.42)); pouf(R, S(1.36), fy - S(.02), S(.4), S(.26), [176, 150, 104]);
    return light(R, { amp: 22, amb: .42, cav: 2.4, spec: .15, shine: 12 });
  }

  /* ================================================================
     THE RUG: an extra-large Beni Ourain (after Kathi's photo): deep cream wool shag, hand-knotted
     charcoal lines in a diamond lattice with a band of tight zigzags every few rows, a soft fringe at
     both ends. wm x dm metres; the top of the painting is the far end of the rug.
     ================================================================ */
  function rug(wm, dm) {
    const M = 110, W = Math.round(wm * M), Hh = Math.round(dm * M), R = relief(W, Hh), r = seeded(77), S = v => v * M, { A, H } = R;
    const fr = S(.1);                                                                    // the fringe at each end
    // the outline: hand-made, so the edges wander a little
    const edge = [], step = S(.05), j = () => (r() - .5) * S(.025);
    for (let x = 0; x <= W; x += step) edge.push([Math.min(W - 2, Math.max(2, x)), fr + j()]);
    for (let y = fr; y <= Hh - fr; y += step) edge.push([W - 2 + Math.min(0, j()), y]);
    for (let x = W; x >= 0; x -= step) edge.push([Math.min(W - 2, Math.max(2, x)), Hh - fr + j()]);
    for (let y = Hh - fr; y >= fr; y -= step) edge.push([2 + Math.max(0, j()), y]);
    const clip = c => { path(c, edge, true); c.save(); c.clip(); };
    // the cream wool and the pile height
    clip(A); A.fillStyle = rgb([236, 230, 217]); A.fillRect(0, 0, W, Hh);
    clip(H); H.fillStyle = "rgb(150,150,150)"; H.fillRect(0, 0, W, Hh);
    // the charcoal lines, knotted so they step and wobble
    const ink = (pts, wd) => { A.strokeStyle = rgb([30, 27, 26]); A.lineWidth = wd; A.lineJoin = A.lineCap = "round";
      A.beginPath(); pts.forEach(([x, y], i) => { const px = x + (r() - .5) * S(.018), py = y + (r() - .5) * S(.018); i ? A.lineTo(px, py) : A.moveTo(px, py); }); A.stroke(); };
    const cw = W / Math.max(2, Math.round(wm / 1.5)), ch = cw * 1.15, lineW = S(.085);        // big diamonds, about 0.75 m across
    A.filter = "blur(1.2px)";                                                        // wool lines are soft-edged
    let y = S(.35), row = 0;
    while (y < Hh - S(.35)) {
      if (row % 8 === 7) {                                                               // a band of two tight zigzag lines
        for (const off of [0, S(.14)]) { const pts = []; for (let x = -S(.1), k = 0; x < W + S(.2); x += S(.09), k++) pts.push([x, y + off + (k % 2 ? S(.07) : 0)]); ink(pts, lineW * .8); }
        y += S(.5); row++;
      } else {                                                                           // one row of the diamond lattice: two zigzags, out of step
        { const ph = row % 2, pts = []; for (let x = -cw / 2, k = 0; x < W + cw; x += cw / 2, k++) {
          const top = (k + ph) % 2 === 0, yy = y + (top ? 0 : ch / 2);
          const last = pts[pts.length - 1]; if (last) for (let t = 1; t <= 5; t++) pts.push([last[0] + (x - last[0]) * t / 5, last[1] + (yy - last[1]) * t / 5]); else pts.push([x, yy]); }
          ink(pts, lineW); }
        y += ch / 2;
      }
      row++;
    }
    A.filter = "none";
    // the shag: a tile of thousands of little wool tufts, laid over everything (pile height and colour)
    const T = 96, tu = canvas(T, T), tx = tu.getContext("2d"), rt = seeded(5);
    tx.fillStyle = "rgb(140,140,140)"; tx.fillRect(0, 0, T, T); tx.lineCap = "round";
    for (let i = 0; i < 1500; i++) { const x = rt() * T, yy = rt() * T, a = rt() * 6.3, l = 2 + rt() * 4, g = 105 + rt() * 110 | 0;
      tx.strokeStyle = `rgb(${g},${g},${g})`; tx.lineWidth = .8 + rt() * 1.6;
      for (const [dx, dy] of [[0, 0], [T, 0], [-T, 0], [0, T], [0, -T]]) { tx.beginPath(); tx.moveTo(x + dx, yy + dy); tx.lineTo(x + dx + Math.cos(a) * l, yy + dy + Math.sin(a) * l); tx.stroke(); } }
    H.fillStyle = H.createPattern(tu, "repeat"); H.fillRect(0, 0, W, Hh);
    A.globalCompositeOperation = "soft-light"; A.globalAlpha = .35; A.fillStyle = A.createPattern(tu, "repeat"); A.fillRect(0, 0, W, Hh);
    A.globalCompositeOperation = "source-over"; A.globalAlpha = 1;
    A.restore(); H.restore();
    // the fringe at both ends: knotted warp threads
    for (const [y0, dir] of [[fr, -1], [Hh - fr, 1]]) for (let x = S(.06); x < W - S(.04); x += S(.025)) {
      tube(R, [[x, y0], [x + (r() - .5) * S(.02), y0 + dir * (fr * (.7 + r() * .3))]], Math.max(1, S(.01)), [228, 220, 204], { hi: .6 }); }
    return light(R, { amp: 6, amb: .74, cav: 1.2, cavBlur: 3, grain: .06 });
  }

  /* ================================================================
     THE CAFÉ BAR (seen through the arch), 4 m wide, repeats along the wall
     ================================================================ */
  function barTile() {
    const M = 240, W = 4 * M, Hh = 2.4 * M, R = relief(W, Hh), r = seeded(91), S = v => v * M, floorY = Hh;
    // open shelves: oak planks on black brackets, with jars, bottles, kraft bags and little plants
    [1.45, 1.85, 2.25].forEach((hy, si) => {
      const y = floorY - S(hy);
      for (let k = 0; k < 4; k++) slab(R, k * S(1) + S(.06), y - S(.42), S(.02), S(.44), [24, 24, 24], { top: 200, bevel: 2 });   // brackets/uprights
      slab(R, -10, y, W + 20, S(.035), [176, 140, 96], { top: 210, bevel: 3, grain: .5 });
      for (let x = S(.1); x < W - S(.12); x += S(.12 + r() * .1)) {
        const kind = (r() * 5) | 0, iw = S(.07 + r() * .03);
        if (kind === 0 || kind === 1) {                                              // a glass jar with something in it
          const ih = S(.2 + r() * .08), fill = [[226, 214, 188], [120, 84, 52], [196, 150, 96], [236, 232, 222]][(r() * 4) | 0];
          mound(R, c => { c.beginPath(); c.roundRect(x, y - ih, iw, ih, S(.01)); }, [214, 226, 224], { cx: x + iw * .35, cy: y - ih / 2, r: iw, peak: 210, edge: 60 });
          R.A.fillStyle = rgb(fill); R.A.fillRect(x + 3, y - ih * .7, iw - 6, ih * .7 - 3);
          slab(R, x - 1, y - ih - S(.02), iw + 2, S(.025), [150, 120, 84], { top: 230, bevel: 2, grain: .4 });   // wooden lid
        } else if (kind === 2) {                                                    // a dark bottle
          const ih = S(.26 + r() * .06); mound(R, c => { c.beginPath(); c.roundRect(x + iw * .2, y - ih * .7, iw * .6, ih * .7, S(.01)); c.rect(x + iw * .38, y - ih, iw * .24, ih * .32); }, [40 + r() * 30, 30, 26], { cx: x + iw * .45, cy: y - ih * .5, r: iw * .6, peak: 220, edge: 60 });
        } else if (kind === 3) {                                                    // a kraft paper bag of coffee
          const ih = S(.2); mound(R, c => { c.beginPath(); c.rect(x, y - ih, iw * 1.1, ih); }, [178, 140, 96], { cx: x + iw * .5, cy: y - ih * .5, r: iw, peak: 180, edge: 90 });
        } else {                                                                    // a little potted plant
          mound(R, c => { c.beginPath(); c.moveTo(x, y - S(.1)); c.lineTo(x + iw, y - S(.1)); c.lineTo(x + iw * .85, y); c.lineTo(x + iw * .15, y); c.closePath(); }, [232, 228, 220], { cx: x + iw / 2, cy: y - S(.05), r: iw * .7, peak: 200, edge: 80 });
          for (let k = 0; k < 8; k++) leaf(R, x + iw / 2, y - S(.1), -Math.PI / 2 + (k / 8 - .5) * 2.4, S(.08 + r() * .05), S(.03), GREENS[(r() * 4) | 0], "oval");
        }
      }
    });
    // the counter: hand-trowelled concrete, an oak top, a recessed plinth with a warm strip of light
    slab(R, -10, floorY - S(1.08), W + 20, S(1.0), [176, 172, 164], { top: 160, bevel: 8 });
    R.H.save(); R.H.beginPath(); R.H.rect(0, floorY - S(1.06), W, S(.96)); R.H.clip(); R.H.filter = "blur(6px)";
    for (let k = 0; k < 160; k++) { R.H.globalAlpha = .07; R.H.fillStyle = r() > .5 ? "#fff" : "#000";
      R.H.beginPath(); R.H.ellipse(r() * W, floorY - S(.1) - r() * S(.95), S(.12 + r() * .2), S(.03 + r() * .04), (r() - .5) * .5, 0, 7); R.H.fill(); }
    R.H.filter = "none"; R.H.restore();
    slab(R, -10, floorY - S(1.13), W + 20, S(.06), [172, 132, 88], { top: 230, bevel: 3, grain: .55 });
    slab(R, -10, floorY - S(.09), W + 20, S(.09), [60, 46, 34], { top: 60, bevel: 2 });
    // on the counter: a chrome espresso machine and two grinders
    const ex = S(1.2), ey = floorY - S(1.13);
    slab(R, ex, ey - S(.42), S(.7), S(.42), [196, 198, 200], { top: 220, bevel: 6 });
    slab(R, ex + S(.04), ey - S(.46), S(.62), S(.05), [80, 82, 86], { top: 240, bevel: 2 });
    [S(.12), S(.48)].forEach(gx => { slab(R, ex + gx, ey - S(.2), S(.1), S(.08), [40, 40, 42], { top: 200, bevel: 2 }); });
    [S(2.7), S(2.95)].forEach(gx => { mound(R, c => { c.beginPath(); c.moveTo(gx, ey); c.lineTo(gx + S(.16), ey); c.lineTo(gx + S(.13), ey - S(.32)); c.lineTo(gx + S(.03), ey - S(.32)); c.closePath(); }, [190, 192, 196], { cx: gx + S(.08), cy: ey - S(.16), r: S(.2), peak: 220, edge: 80 });
      mound(R, c => { c.beginPath(); c.moveTo(gx + S(.02), ey - S(.32)); c.lineTo(gx + S(.14), ey - S(.32)); c.lineTo(gx + S(.17), ey - S(.52)); c.lineTo(gx - S(.01), ey - S(.52)); c.closePath(); }, [96, 66, 40], { cx: gx + S(.08), cy: ey - S(.42), r: S(.14), peak: 230, edge: 90 }); });
    const c = light(R, { amp: 20, amb: .42, cav: 2.2, spec: .5, shine: 26 }), x = c.getContext("2d");
    const glow = x.createLinearGradient(0, floorY - S(.12), 0, floorY);                     // the warm strip of light under the counter
    glow.addColorStop(0, "rgba(255,210,140,.9)"); glow.addColorStop(1, "rgba(255,210,140,0)"); x.fillStyle = glow; x.fillRect(0, floorY - S(.1), W, S(.06));
    return c;
  }

  /* ================================================================
     THE PLANT CORNER (was the couch corner), after Kathi's plant-corner photo: monstera, palms and
     white orchids massed in a long black planter. (The tufted daybed that stood in front was removed.)
     ================================================================ */
  // A monstera leaf: broad, heart-based, split from the edge toward the midrib, with a few holes.
  // Drawn on its own little pair of canvases (so the splits cut only this leaf), then laid onto R.
  function monstera(R, x, y, a, L, col) {
    const S = Math.ceil(L * 2.4), T = relief(S, S), o = S / 2, W = L * .92;
    leaf(T, o, o, a, L, W, col, "heart");
    [T.A, T.H].forEach(c => { c.save(); c.translate(o, o); c.rotate(a); c.globalCompositeOperation = "destination-out"; c.lineCap = "round";
      for (let t = .24; t < .9; t += .13) [-1, 1].forEach(sd => {                       // 5 deep splits a side: wedges, wide at the edge, closing to a point near the rib
        const hw = W * .62 * Math.sin(Math.PI * Math.min(.98, t * 1.02)), gap = L * (.035 + .02 * Math.sin(Math.PI * t));
        c.beginPath(); c.moveTo(L * (t + .1) - gap, sd * hw * 1.3); c.quadraticCurveTo(L * (t + .03) - gap * .4, sd * hw * .6, L * t, sd * W * .1);
        c.quadraticCurveTo(L * (t + .03) + gap * .4, sd * hw * .6, L * (t + .1) + gap, sd * hw * 1.3); c.closePath(); c.fill(); });
      for (let t = .34; t < .7; t += .17) [-1, 1].forEach(sd => { c.beginPath(); c.ellipse(L * t, sd * W * .07, L * .025, W * .028, 0, 0, 7); c.fill(); });   // the holes near the rib
      c.restore(); });
    R.A.drawImage(T.A.canvas, x - o, y - o); R.H.drawImage(T.H.canvas, x - o, y - o);
  }
  // A palm frond (kentia / areca): an arching stem with narrow leaflets down both sides, shorter toward the tip
  function frond(R, x, y, a, L, r, { leaflet = .34, width = .028 } = {}) {
    const bend = (r() - .5) * .8 + (Math.cos(a) > 0 ? .5 : -.5), pts = [];
    const room = Math.cos(a) < 0 ? x : R.w - x;                                       // keep the whole frond, leaflets and all, inside the painting
    L = Math.min(L, (room - 12) / (Math.abs(Math.cos(a)) * 1.25 + .3));
    for (let k = 0; k <= 10; k++) { const t = k / 10, aa = a + bend * t * t; pts.push([x + Math.cos(aa) * L * t, y + Math.sin(aa) * L * t + t * t * L * .25]); }
    const line = curve(pts, 4); tube(R, line, Math.max(1.5, L * .012), [96, 120, 62], { hi: .6 });
    line.forEach(([px, py], i) => { if (i < 3 || i % 2) return; const t = i / line.length, [qx, qy] = line[Math.min(line.length - 1, i + 1)], dir = Math.atan2(qy - py, qx - px);
      [-1, 1].forEach(sd => leaf(R, px, py, dir + sd * (.75 + r() * .2), L * (leaflet - t * leaflet * .76), L * width, GREENS[(r() * GREENS.length) | 0], "strap", { droop: .35 })); });
  }
  // A white phalaenopsis orchid spray: an arching stem with flowers along its upper half
  function orchid(R, x, y, h, r) {
    const pts = [[x, y], [x + (r() - .5) * .2 * h, y - h * .55], [x + (r() - .5) * .5 * h, y - h * .9], [x + (r() - .3) * .7 * h, y - h * .8]], line = curve(pts, 8);
    tube(R, line, Math.max(1.4, h * .012), [86, 96, 58], { hi: .6 });
    line.forEach(([fx, fy], i) => { if (i < line.length * .45 || i % 4) return; const s = h * (.1 + r() * .02), W = [246, 244, 240];
      const petal = (px, py, rw, rh, rot, pk) => { mound(R, c => { c.beginPath(); c.ellipse(px, py, rw, rh, rot, 0, 7); }, W, { cx: px, cy: py, r: Math.max(rw, rh), peak: pk, edge: pk - 30 });
        R.A.strokeStyle = "rgba(170,160,150,.55)"; R.A.lineWidth = 1; R.A.beginPath(); R.A.ellipse(px, py, rw, rh, rot, 0, 7); R.A.stroke(); };
      [[0, -1], [-.9, .55], [.9, .55]].forEach(([dx, dy]) => petal(fx + dx * s * .62, fy + dy * s * .62, s * .2, s * .36, Math.atan2(dy, dx) + Math.PI / 2, 150));   // three sepals
      [-1, 1].forEach(sd => petal(fx + sd * s * .52, fy - s * .05, s * .46, s * .4, sd * .25, 175));                                                               // two broad petals
      mound(R, c => { c.beginPath(); c.ellipse(fx, fy + s * .12, s * .16, s * .14, 0, 0, 7); }, [232, 196, 120], { cx: fx, cy: fy + s * .1, r: s * .18, peak: 250, edge: 120 });                                                // the lip
    });
    for (let k = 0; k < 3; k++) leaf(R, x, y, -Math.PI / 2 + (k - 1) * 1.1, h * .3, h * .1, GREENS[3], "strap", { droop: .4 });
  }
  // The daybed. Origin: (cx, floor). w = width in px, s = pixels per metre.
  function daybed(R, cx, fy, s, r) {
    const S = v => v * s, w = S(2.1), x0 = cx - w / 2, x1 = cx + w / 2, wal = [150, 108, 70], cream = [238, 232, 218], rust = [190, 92, 52];
    // splayed tapered legs and the walnut frame
    [[x0 + S(.12), -1], [x1 - S(.12), 1], [x0 + S(.3), -.4], [x1 - S(.3), .4]].forEach(([lx, sd], k) => tube(R, [[lx, fy - S(.2)], [lx + sd * S(.06), fy - 3]], S(.045), rgb(wal, k > 1 ? .75 : 1), { hi: k > 1 ? .6 : 1, jitter: .5 }));
    slab(R, x0, fy - S(.27), w, S(.08), wal, { top: 220, bevel: 4, grain: .6 });
    slab(R, x1 - S(.08), fy - S(.74), S(.08), S(.48), wal, { top: 220, bevel: 4, grain: .6 });                                   // the wooden arm end
    // the back cushion, then the seat: tufted, each tuft a soft mound with a button sunk in its corner
    const tufts = (y0, h, cols, rows) => { const cw = (x1 - S(.1) - x0) / cols, rh = h / rows;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const tx = x0 + i * cw, ty = y0 + j * rh;
        mound(R, c => { c.beginPath(); c.roundRect(tx, ty, cw + 1, rh + 1, S(.03)); }, rgb(cream, .97 + r() * .05), { cx: tx + cw / 2, cy: ty + rh / 2, r: Math.max(cw, rh) * .7, peak: 235, edge: 90 }); }
      for (let i = 1; i < cols; i++) for (let j = 1; j < rows; j++) { const bx = x0 + i * cw, by = y0 + j * rh;            // the buttons: little dimples
        R.H.fillStyle = "rgb(30,30,30)"; R.H.beginPath(); R.H.arc(bx, by, S(.018), 0, 7); R.H.fill(); R.A.fillStyle = rgb(cream, .8); R.A.beginPath(); R.A.arc(bx, by, S(.012), 0, 7); R.A.fill(); } };
    tufts(fy - S(.78), S(.26), 9, 2);
    tufts(fy - S(.52), S(.13), 9, 1);                                                                                          // the seat seen from just above
    mound(R, c => { c.beginPath(); c.roundRect(x0, fy - S(.4), w - S(.1), S(.13), S(.03)); }, rgb(cream, .94), { cx, cy: fy - S(.34), r: w * .6, peak: 210, edge: 80 });   // the seat's front edge
    // the upholstered arm cushion against the wooden end
    mound(R, c => { c.beginPath(); c.roundRect(x1 - S(.22), fy - S(.7), S(.14), S(.44), S(.04)); }, cream, { cx: x1 - S(.15), cy: fy - S(.48), r: S(.25), peak: 230, edge: 90 });
    // rust pillows: two leaning at the left end, one at the right, and a round bolster lying on the seat
    const pillow = (px, py, pw, ph, rot) => mound(R, c => { c.save(); c.translate(px, py); c.rotate(rot); c.beginPath();
      c.moveTo(-pw / 2, -ph / 2); c.quadraticCurveTo(0, -ph * .38, pw / 2, -ph / 2); c.quadraticCurveTo(pw * .4, 0, pw / 2, ph / 2); c.quadraticCurveTo(0, ph * .38, -pw / 2, ph / 2); c.quadraticCurveTo(-pw * .4, 0, -pw / 2, -ph / 2); c.restore(); },
      rgb(rust, .9 + r() * .12), { cx: px, cy: py, r: Math.max(pw, ph) * .62, peak: 240, edge: 80 });
    pillow(x0 + S(.12), fy - S(.62), S(.42), S(.44), -.32); pillow(x0 + S(.28), fy - S(.6), S(.4), S(.4), -.12);
    pillow(x1 - S(.62), fy - S(.6), S(.36), S(.34), .1);
    tube(R, [[x1 - S(.48), fy - S(.48)], [x1 - S(.2), fy - S(.48)]], S(.15), rust, { hi: 1 });                                // the bolster
    mound(R, c => { c.beginPath(); c.ellipse(x1 - S(.19), fy - S(.48), S(.03), S(.075), 0, 0, 7); }, rgb(rust, .82), { cx: x1 - S(.19), cy: fy - S(.48), r: S(.07), peak: 200, edge: 90 });
  }
  // The whole corner as one painting: 3.4 m wide, 3.4 m tall. Plants first (back to front), then the daybed.
  function couchCorner() {
    const M = 280, W = 3.4 * M, Hh = 3.4 * M, R = relief(W, Hh), r = seeded(404), fy = Hh - 4, cx = W * .46, S = v => v * M;
    // palms, fanning up behind the left end
    for (let k = 0; k < 9; k++) frond(R, cx - S(.75) + (r() - .5) * S(.3), fy - S(.6), -Math.PI / 2 + (r() - .5) * 2.2, S(1.1 + r() * .8), r);
    // monsteras: tall stalks rising behind the right end, leaves turned every way
    for (let k = 0; k < 20; k++) { const bx = cx + S(.55) + (r() - .3) * S(.9), top = fy - S(.75 + r() * 1.75), lx = bx + (r() - .5) * S(1.1);
      tube(R, curve([[bx, fy - S(.5)], [(bx + lx) / 2 + (lx - bx) * .2, (fy - S(.5) + top) / 2], [lx, top]], 6), S(.02), [92, 118, 64], { hi: .6 });
      const out = lx > bx ? 1 : -1;                                                   // the leaf falls away from the stalk, outward and a little down
      monstera(R, lx, top, (out > 0 ? 0 : Math.PI) + out * (r() * 1.1 - .2), S(.42 + r() * .22), GREENS[(r() * GREENS.length) | 0]); }
    // white orchids along the back, between the palms and the monstera
    for (let k = 0; k < 5; k++) orchid(R, cx - S(.4) + k * S(.28), fy - S(.6), S(1.0 + r() * .4), r);
    // THE PLANTER (the daybed is gone, Oct 2026): a long, low trough of black powder-coated steel, the same as the
    // wall planters, standing on the floor. Its top edge hides where all the stems start.
    const tx0 = cx - S(1.15), tx1 = cx + S(1.62), tTop = fy - S(.64);
    slab(R, tx0, tTop + S(.05), tx1 - tx0, fy - tTop - S(.05), [26, 26, 26], { top: 200, bevel: 4 });   // the body
    slab(R, tx0 - S(.03), tTop, tx1 - tx0 + S(.06), S(.06), [34, 34, 34], { top: 235, bevel: 3 });    // the lip
    // a low spill of monstera over the planter's right end, in front of the rest
    for (let k = 0; k < 3; k++) monstera(R, cx + S(1.25) + k * S(.12), fy - S(.62) - k * S(.18), -Math.PI / 2 + .9 - k * .4, S(.45), GREENS[k + 1]);
    // daybed(R, cx, fy, M, r);   // the tufted daybed: taken out with the rest of the furniture (still painted by daybed() above if wanted back)
    return light(R, { amp: 24, amb: .4, cav: 2.4, spec: .32, shine: 20 });
  }

  /* ================================================================
     PAINT EVERYTHING ONCE (post.js turns each into an image)
     ================================================================ */
  function paintAll(woodPhoto) {
    if (woodPhoto) { const g = canvas(woodPhoto.width, woodPhoto.height), x = g.getContext("2d"); x.drawImage(woodPhoto, 0, 0);   // the grain, drained of colour
      x.globalCompositeOperation = "saturation"; x.fillStyle = "#808080"; x.fillRect(0, 0, g.width, g.height); WOOD = g; }
    const t0 = performance.now();
    const out = {
      ceiling: ceilingTile(), skylight: skylightTile(1.6, 1.4), planter: planterTile(), vine: vine(),
      bigPlantA: bigPlant(5), bigPlantB: bigPlant(9), fig: fig(), dracaena: dracaena(),
      // the lounge furniture (bowlChair, sideTable, ottoman, poufSet) and the rug are no longer painted: the furniture
      // was taken out in Oct 2026. Their painters are still in this file, if they're ever wanted back.
      pendantBell: pendant("bell"), pendantRaffia: pendant("raffia"), bar: barTile(), couch: couchCorner()
    };
    out.ms = Math.round(performance.now() - t0);
    return out;
  }
  // rug() is painted later, by post.js, once it knows the lounge's size
  window.NRPAINT = { paintAll, rug, planterTile, bigPlant };   // planterTile, bigPlant: so those pictures can be re-baked on their own
})();
