/* NOT RISING · THE POST — THE GLASS ROOF
   ------------------------------------------------------------------
   post.js asks this file for two paintings, each a <canvas>:

     NRROOF.slope(...)  one side of the pitched glass roof, seen from inside, looking up
     NRROOF.gable(...)   the glass triangle at the far end, above the café wall

   HOW A ROOF SLOPE IS PAINTED, back to front (the way you'd see it lying on your back on the floor):
     1. THE SKY: the sky from Kathi's Ogden Valley photo (assets/img/post/sky.webp), warmed for a
        November late morning. The slope the sun is on (the left) is brighter, with the sun's bloom near the door end.
     2. THE LEAVES lying on the glass: red and wine-coloured Boston ivy and maple leaves, lit from
        behind by the sun, so they glow (their colour is Kathi's red-ivy photo). They pile up against the bar at the low edge of each pane
        (they slide down the glass until something stops them) and drift in along the gutter.
     3. THE GLASS: a pane cut from Kathi's glass-roof photo (assets/img/post/roof-glass.webp), laid over
        every pane, a little milky, so the sky and the leaves show through softly.
     4. THE WARM, DAMP AIR: a faint mist and a few beads of condensation along the low edge of each pane.
     5. THE STEEL: heavy black rafters running up the slope, thinner glazing bars, a track spotlight
        here and there, every edge catching a line of sun.

   UNITS: everything is planned in METRES, like the rest of the room, then multiplied by
   "s" (pixels per metre) to paint.
   ------------------------------------------------------------------ */
(function () {
  const seeded = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;   // same seed, same picture, every visit
  const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
  const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  /* ---------------- THE LEAF SHAPES ----------------
     Boston ivy (three lobes, the same leaf as the ivy on the storefront) and a maple (five lobes).
     Each is drawn 1 unit long, stalk at (0,0), tip at (0,-1). */
  const IVY = new Path2D("M0 0 L-.42 -.06 Q-.62 -.2 -.62 -.5 Q-.42 -.5 -.22 -.58 Q-.2 -.75 -.08 -.86 L0 -1 L.08 -.86 Q.2 -.75 .22 -.58 Q.42 -.5 .62 -.5 Q.62 -.2 .42 -.06 Z");
  const MAPLE = (() => {                                     // the outline, point by point, going round from the stalk
    const pts = [[0, -.1], [-.12, -.14], [-.42, -.04], [-.34, -.24], [-.62, -.36], [-.5, -.44], [-.58, -.66], [-.36, -.6], [-.3, -.74],
      [-.16, -.6], [-.12, -.84], [0, -1], [.12, -.84], [.16, -.6], [.3, -.74], [.36, -.6], [.58, -.66], [.5, -.44], [.62, -.36],
      [.34, -.24], [.42, -.04], [.12, -.14]];
    const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); p.closePath(); return p;
  })();
  const VEINS = new Path2D("M0 0 L0 -.95 M0 -.2 L-.5 -.45 M0 -.2 L.5 -.45 M0 -.45 L-.22 -.66 M0 -.45 L.22 -.66");

  /* ONE LEAF LYING ON THE GLASS, SEEN FROM BELOW WITH THE SUN BEHIND IT.
     Sunlight comes through the leaf, so it glows: hot orange-red in the middle, deepening to wine at
     the edges, with the veins showing dark. It is painted with "multiply", like a stained-glass
     window: where two leaves overlap, the red goes deeper, just as it would. */
  function leaf(c, x, y, size, rot, col, shape, r, ivy) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(size, size);
    const glow = mix(col, [255, 120, 60], .3), deep = mix(col, [30, 0, 10], .55);
    c.globalCompositeOperation = "multiply";
    if (ivy) {
      // THE REAL IVY: a random patch of Kathi's red-ivy photo (assets/img/post/ivy-colour.webp), cut to this leaf's shape,
      // so every leaf carries the photo's own crimson, plum and wine, and its gloss
      c.save(); c.clip(shape);
      const pw = ivy.width * .3, ph = pw, sx = r() * (ivy.width - pw), sy = r() * (ivy.height * .72 - ph);
      c.drawImage(ivy, sx, sy, pw, ph, -.65, -1.05, 1.3, 1.3);
      c.restore();
      c.globalCompositeOperation = "screen";                                          // the sun coming through it from behind
      const g = c.createRadialGradient(0, -.48, .02, 0, -.48, .55);
      g.addColorStop(0, rgba(glow, .45)); g.addColorStop(1, rgba(glow, 0));
      c.fillStyle = g; c.fill(shape);
      c.globalCompositeOperation = "multiply";
    } else {
      const g = c.createRadialGradient(0, -.48, .05, 0, -.48, .7);
      g.addColorStop(0, rgba(glow, 1)); g.addColorStop(.55, rgba(col, 1)); g.addColorStop(1, rgba(deep, 1));
      c.fillStyle = g; c.fill(shape);
    }
    c.lineWidth = .035; c.strokeStyle = rgba(deep, .55); c.stroke(VEINS);                 // veins, in silhouette
    c.lineWidth = .05; c.beginPath(); c.moveTo(0, 0); c.lineTo(.03 + r() * .05, .28); c.stroke();   // the stalk
    c.globalCompositeOperation = "source-over";
    c.lineWidth = .02; c.strokeStyle = rgba(mix(col, [255, 210, 160], .5), .35); c.stroke(shape);    // a thin bright rim where light wraps the edge
    c.restore();
  }

  /* ---------------- A ROOF SLOPE ----------------
     L = the slope's length, eave to ridge (m); D = its depth, door to back wall (m); s = pixels per metre.
     right = true for the right-hand slope (painted mirrored, so its eave is on the right).
     sunny = true for the slope the sun is shining on. */
  function slope({ L, D, s, right = false, sunny = false, sky, glass, ivy, palette, seed = 1, sun = [.55, .78] }) {
    const W = L * s, H = D * s, c = canvas(W, H), x = c.getContext("2d"), r = seeded(seed);
    // From here on, paint as if the eave is on the left (x = 0) and the ridge on the right (x = L).
    // The right slope is simply flipped at the end.
    const P = v => v * s;

    // THE LAYOUT OF THE STEEL (shared by the leaves, the glass and the steel itself)
    const rows = Math.max(2, Math.round((L - .3) / 1.15)), pw = (L - .3) / rows;          // panes up the slope, each ~1.15 m
    const bays = Math.max(3, Math.round(D / 2.25)), bw = D / bays;                        // rafters across the depth, ~2.25 m apart
    const eave = .22, ridge = .08;                                                       // the edge beam at the wall, the ridge beam at the top
    const barX = k => eave + k * pw;                                                     // glazing bar k, up the slope (k = 0 is the eave)

    /* 1. THE SKY, from the valley photo, laid along the roof and warmed */
    if (sky) {
      x.save(); x.translate(W / 2, H / 2); x.rotate(Math.PI / 2);                          // the photo's long side runs along the depth
      const sh = sky.height * .3 / .55;                                                  // only the top of the photo: clear sky and cloud (sky.webp is the top 55% of the valley photo)
      x.drawImage(sky, 0, 0, sky.width, sh, -H / 2, -W / 2, H, W); x.restore();
    } else { x.fillStyle = "#b9cfe2"; x.fillRect(0, 0, W, H); }
    x.save(); x.globalCompositeOperation = "multiply";                                   // deepen the sky's blue, so it reads as sky through clear glass
    x.fillStyle = sunny ? "rgb(214,226,240)" : "rgb(176,202,232)"; x.fillRect(0, 0, W, H); x.restore();
    x.fillStyle = sunny ? "rgba(255,204,130,.24)" : "rgba(255,226,190,.06)"; x.fillRect(0, 0, W, H);   // the warmth of the afternoon
    if (sunny) {                                                                          // the sun itself is somewhere above the far end: a bloom
      const b = x.createRadialGradient(W * sun[0], H * sun[1], 0, W * sun[0], H * sun[1], Math.max(W, H) * .55);
      b.addColorStop(0, "rgba(255,250,232,.95)"); b.addColorStop(.2, "rgba(255,232,180,.55)"); b.addColorStop(.6, "rgba(255,214,150,.15)"); b.addColorStop(1, "rgba(255,214,150,0)");
      x.fillStyle = b; x.fillRect(0, 0, W, H);
    }

    /* 3. THE GLASS (painted before the leaves): Kathi's pane, laid over each pane, a little milky */
    for (let k = 0; k < rows; k++) for (let b = 0; b < bays * 2; b++) {
      const px = P(barX(k)), py = P(b * bw / 2), pW = P(pw), pH = P(bw / 2);
      x.globalAlpha = (sunny ? .26 : .32) + r() * .12;
      if (glass) {
        x.save(); x.translate(px + pW / 2, py + pH / 2);
        x.scale(r() < .5 ? 1 : -1, r() < .5 ? 1 : -1);                                    // flipped every which way, so no two panes match
        x.drawImage(glass, -pW / 2, -pH / 2, pW, pH); x.restore();
      } else { x.fillStyle = "#e4ecef"; x.fillRect(px, py, pW, pH); }
      x.globalAlpha = 1;
      /* 4. THE WARM DAMP AIR: mist gathering at the pane's low edge, and beads of condensation */
      const m = x.createLinearGradient(px, 0, px + pW * .35, 0);
      m.addColorStop(0, "rgba(255,250,242,.3)"); m.addColorStop(1, "rgba(255,250,242,0)");
      x.fillStyle = m; x.fillRect(px, py, pW * .35, pH);
      for (let i = 0, n = 6 + (r() * 14 | 0); i < n; i++) {
        const dx = px + Math.pow(r(), 2) * pW * .3 + 3, dy = py + r() * pH, dr = Math.max(.7, P(.004 + r() * .006));
        x.fillStyle = "rgba(60,70,80,.18)"; x.beginPath(); x.arc(dx, dy, dr, 0, 7); x.fill();
        x.fillStyle = "rgba(255,255,255,.55)"; x.beginPath(); x.arc(dx - dr * .3, dy - dr * .3, dr * .45, 0, 7); x.fill();
      }
      // a faint streak or two where rain has run down the glass
      x.strokeStyle = "rgba(120,110,95,.06)"; x.lineWidth = Math.max(1, P(.01));
      for (let i = 0; i < 2; i++) { const sy = py + r() * pH; x.beginPath(); x.moveTo(px + pW, sy); x.lineTo(px, sy + (r() - .5) * P(.1)); x.stroke(); }
    }

    /* 2. THE LEAVES (painted after the glass, so their reds stay rich; a thin veil after softens them a touch) */
    const pal = palette.map(hexRgb);                                                    // the ivy's colours (the same as the vines indoors)
    const lay = (lx, ly, big) => {
      const col = pal[(r() * pal.length) | 0], maple = r() < .3;
      leaf(x, P(lx), P(ly), P((maple ? .2 : .16) * (big ? 1.1 : 1) * (.75 + r() * .5)), r() * Math.PI * 2, col, maple ? MAPLE : IVY, r, maple ? null : ivy);
    };
    for (let k = 0; k < rows; k++) {                                                     // each row of panes
      const lo = barX(k), hi = barX(k + 1);
      for (let b = 0; b < bays * 2; b++) {                                               // each pane in that row (two per bay)
        const y0 = b * bw / 2, y1 = y0 + bw / 2, fill = r();
        // a pile against the bar at the low edge: how big varies pane to pane, some have none
        const pile = fill < .25 ? 0 : Math.round(2 + fill * fill * 13 * (k === 0 ? 1.6 : 1));
        for (let i = 0; i < pile; i++) {
          const depth = Math.pow(r(), 2.2) * pw * .45;                                    // most of them right against the bar
          lay(lo + .04 + depth, y0 + .05 + r() * (y1 - y0 - .1), true);
        }
        const loose = Math.round(r() * 3);                                                 // and a few stuck where they landed
        for (let i = 0; i < loose; i++) lay(lo + .1 + r() * (pw - .2), y0 + .05 + r() * (y1 - y0 - .1), false);
      }
    }
    for (let i = 0, n = Math.round(D * 9); i < n; i++) lay(eave + Math.pow(r(), 3) * .25, r() * D, true);   // the drift along the gutter

    x.fillStyle = "rgba(250,246,238,.1)"; x.fillRect(0, 0, W, H);                            // the veil: the leaves are on the far side of the glass
    /* 5. THE STEEL */
    const steel = "#141414", lit = sunny ? "rgba(255,226,180,.55)" : "rgba(255,236,210,.28)";
    const bar = (x0, y0, w, h, edge) => {                                                // a black bar, with a line of light on one edge and a soft shadow on the glass
      x.fillStyle = "rgba(0,0,0,.18)"; x.fillRect(x0 - P(.025), y0 - P(.025), w + P(.05), h + P(.05));
      x.fillStyle = steel; x.fillRect(x0, y0, w, h);
      x.fillStyle = lit; if (edge === "x") x.fillRect(x0 + w - Math.max(1, P(.012)), y0, Math.max(1, P(.012)), h); else x.fillRect(x0, y0, w, Math.max(1, P(.012)));
    };
    for (let k = 1; k < rows; k++) bar(P(barX(k) - .03), 0, P(.06), H, "x");            // glazing bars, along the depth
    for (let b = 1; b < bays * 2; b += 2) bar(0, P(b * bw / 2 - .02), W, P(.04), "y");   // thin bars halfway between the rafters
    for (let b = 0; b <= bays; b++) {                                                    // the rafters: deep steel beams running up the slope
      const y = P(b * bw), w = P(.3);
      x.fillStyle = "rgba(0,0,0,.25)"; x.fillRect(0, y - w / 2 - P(.05), W, w + P(.1));
      x.fillStyle = "#101010"; x.fillRect(0, y - w / 2, W, w);
      x.fillStyle = "#262626"; x.fillRect(0, y - w / 2, W, w * .38);                        // the beam's side, turned toward you
      x.fillStyle = lit; x.fillRect(0, y - w / 2, W, Math.max(1, P(.015)));
      for (let k = 1; k < rows; k++) {                                                   // bolted plates where the bars meet the rafter
        x.fillStyle = "#1b1b1b"; x.fillRect(P(barX(k) - .07), y - w / 2 - P(.03), P(.14), w + P(.06));
        x.fillStyle = "rgba(255,230,190,.35)"; [-.04, .04].forEach(o => { x.beginPath(); x.arc(P(barX(k) + o), y, Math.max(1, P(.012)), 0, 7); x.fill(); });
      }
      if (b % 2 === 1) {                                                                 // a track spotlight hanging off every other rafter
        const sx = P(eave + pw * (.6 + r() * (rows - 1.2)));
        x.fillStyle = "#0b0b0b"; x.fillRect(sx - P(.008), y + w * .45, P(.016), P(.05)); x.beginPath(); x.ellipse(sx, y + w * .45 + P(.08), P(.035), P(.055), 0, 0, 7); x.fill();
        x.fillStyle = "rgba(255,240,210,.55)"; x.beginPath(); x.ellipse(sx, y + w * .45 + P(.12), P(.022), P(.009), 0, 0, 7); x.fill();
      }
    }
    // the edge beam over the wall, and the ridge beam at the top
    x.fillStyle = "#0f0f0f"; x.fillRect(0, 0, P(eave), H); x.fillStyle = lit; x.fillRect(P(eave) - Math.max(1, P(.015)), 0, Math.max(1, P(.015)), H);
    x.fillStyle = "#0f0f0f"; x.fillRect(W - P(ridge), 0, P(ridge), H);
    // the glass is brightest in the middle of the roof and a touch darker toward the walls and the door
    const v = x.createLinearGradient(0, 0, W, 0); v.addColorStop(0, "rgba(30,20,10,.18)"); v.addColorStop(.35, "rgba(30,20,10,0)"); x.fillStyle = v; x.fillRect(0, 0, W, H);
    const d = x.createLinearGradient(0, 0, 0, H); d.addColorStop(0, "rgba(30,20,10,.16)"); d.addColorStop(.3, "rgba(30,20,10,0)"); x.fillStyle = d; x.fillRect(0, 0, W, H);

    if (!right) return c;
    const m = canvas(W, H), mx = m.getContext("2d"); mx.translate(W, 0); mx.scale(-1, 1); mx.drawImage(c, 0, 0); return m;   // mirror for the right slope
  }

  /* ---------------- THE GLASS GABLE ----------------
     The triangle of glass at the far end, above the café wall: the valley and the mountains beyond it,
     in steel mullions, with a few leaves caught at the bottom. W = width (m), rise = height at the peak (m). */
  function gable({ W, rise, s, view, ivy, palette, seed = 7 }) {
    const c = canvas(W * s, rise * s), x = c.getContext("2d"), r = seeded(seed), P = v => v * s, Wp = c.width, Hp = c.height;
    if (view) {                                                                           // the mountains and the tops of the hills, from the valley photo
      const vy = view.height * .22 / .55, vh = view.height * .32 / .55, k = Math.max(Wp / view.width, Hp / vh);
      x.drawImage(view, 0, vy, view.width, vh, (Wp - view.width * k) / 2, Hp - vh * k, view.width * k, vh * k);
    } else { x.fillStyle = "#c4d6e4"; x.fillRect(0, 0, Wp, Hp); }
    x.fillStyle = "rgba(255,214,150,.2)"; x.fillRect(0, 0, Wp, Hp);                        // afternoon warmth
    x.fillStyle = "rgba(240,244,246,.22)"; x.fillRect(0, 0, Wp, Hp);                       // the glass
    const pal = palette.map(hexRgb);
    for (let i = 0; i < W * 12; i++) leaf(x, r() * Wp, Hp - P(.12) - Math.pow(r(), 2) * P(.25), P(.09 + r() * .05), r() * 7, pal[(r() * pal.length) | 0], r() < .3 ? MAPLE : IVY, r, ivy);
    x.fillStyle = "#121212";
    const n = Math.max(3, Math.round(W / 1.1));
    for (let i = 1; i < n; i++) x.fillRect(Wp * i / n - P(.03), 0, P(.06), Hp);             // upright mullions
    x.fillRect(0, Hp * .45, Wp, P(.05));                                                   // one cross bar
    x.fillRect(0, Hp - P(.14), Wp, P(.14));                                                // the tie beam along the top of the café wall
    x.fillStyle = "rgba(255,226,180,.4)"; x.fillRect(0, Hp - P(.14), Wp, Math.max(1, P(.012)));
    return c;
  }

  window.NRROOF = { slope, gable };
})();
