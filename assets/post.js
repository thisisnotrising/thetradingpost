/* NOT RISING · THE POST — THE ENGINE
   ------------------------------------------------------------------
   Draws the room you enter through the right-hand door at 777 Daydream St.

   HOW THE ROOM WORKS (the big idea)
   The room is a real 3D box. post/index.html has five flat panels:
   back wall, left wall, right wall, floor and ceiling. post.css tilts
   each one into place (the left wall swings 90° to face right, the
   floor tips back to lie flat, and so on). The browser then draws the
   box in perspective, the way a camera would, so things further away
   look smaller automatically.

   Everything else (the sofa, the café's pendant lights, the plants)
   is a flat picture standing upright inside the box, like a cut-out
   on a stage, pushed back to its own depth. They are cut out of
   Kathi's reference photos (assets/img/post). The brick and wood are painted from the
   same photo textures the storefront uses (bricks.jpg, wood.jpg).

   UNITS
   This file measures in METRES, like a floor plan. One metre on
   screen = "u" pixels, where u is the screen height ÷ 7.2 (the room is
   two storeys, 7.2 m tall). So a 1.6 m sofa is 1.6 × u pixels wide.
   Positions across the room are fractions: x 0 = left wall, 1 = right.
   Depth is a fraction too: z 0 = the door you came in, 1 = the windows.

   WHAT TO EDIT WHERE
   - Words, wishes, photos, directory links: assets/data.js, PART 3.
   - Where things stand in the room: the LAYOUT numbers in STEP 5.
   - Colours and type: assets/post.css.
   ------------------------------------------------------------------ */
(function () {
  const DATA = window.NRPOST, NR = window.NR;
  if (!DATA) return;
  const IMG = window.NRNS_BASE || "../assets/img/";
  const $ = id => document.getElementById(id);
  const root = $("nrp"), room = $("nrp-room");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- small helpers ---- */
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };   // a steady "random" number for a spot
  function seeded(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }           // same seed, same sequence, every visit
  function make(tag, cls, parent, html) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (html != null) el.innerHTML = html;
    if (parent) parent.appendChild(el);
    return el;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

  /* ================================================================
     STEP 1 · PAINT THE TEXTURES (same recipe as the storefront)
     Each one is painted once onto a small canvas, then used as a
     repeating wallpaper. The brick photo is an atlas of 124 real
     bricks, 16 to a row, each 60×20.
     ================================================================ */
  const TEX = {};
  const ATLAS = { n: 124, cols: 16, w: 60, h: 20 };
  function photoBrick(ctx, x, y, w, h, a, b) {
    const i = (hash(a, b) * ATLAS.n) | 0, sx = (i % ATLAS.cols) * ATLAS.w + 1, sy = ((i / ATLAS.cols) | 0) * ATLAS.h + 1;
    ctx.save(); ctx.translate(x, y);
    if (hash(b + 3, a) < .5) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(TEX.bricks, sx, sy, ATLAS.w - 2, ATLAS.h - 2, 0, 0, w, h);
    ctx.restore();
  }
  let NOISE;
  function noise() {
    if (NOISE) return NOISE;
    NOISE = document.createElement("canvas"); NOISE.width = NOISE.height = 128;
    const x = NOISE.getContext("2d"), d = x.createImageData(128, 128), R = seeded(99);
    for (let i = 0; i < d.data.length; i += 4) { const v = R() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); return NOISE;
  }
  function grain(ctx, w, h, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = "overlay";
    ctx.fillStyle = ctx.createPattern(noise(), "repeat"); ctx.fillRect(0, 0, w, h); ctx.restore();
  }
  /* PAINTED BRICK, made the way the storefront's whitewashed upper wall and its hammered metal sign are
     made (whitewash() in storefront.js): first a "height map" in grey (bricks raised, joints sunk, the
     paint lumpy), then every pixel is lit by which way its little slope faces the light (top left).
     That gives thick paint, soft edges and recessed joints. kind: "white" or "black" paint.
     The tile wraps around at its edges (the bricks, the blur and the lighting all wrap), so it repeats
     across a whole wall with no seam. 10 bricks across, 20 courses down. */
  function paintedBrick(kind) {
    const bw = 70, bh = 23, j = 5, pitch = bw + j, row = bh + j, cols = 10, rows = 20, W = cols * pitch, H = rows * row;
    const seed = kind === "black" ? 60 : 0;
    // 1. the height map, drawn three times across and down so the blur wraps cleanly; we keep the middle copy
    const big = document.createElement("canvas"); big.width = W * 3; big.height = H * 3;
    const h = big.getContext("2d");
    h.fillStyle = "#6a6a6a"; h.fillRect(0, 0, W * 3, H * 3);                                  // joints, mostly filled with paint
    for (let r = 0; r < rows * 3; r++) {
      const y = r * row + j / 2, off = (r % 2 ? .5 : 0) * pitch, rr = r % rows;
      for (let c = -1; c <= cols * 3; c++) {
        const x = c * pitch + off, cc = ((c % cols) + cols) % cols;
        const a = hash(rr * 1.7 + 5 + seed, cc * .9), b = hash(cc * 2.3 + seed, rr * .4 + 1);
        const v = (175 + a * 55) | 0;                                                          // some bricks stand a little prouder
        h.fillStyle = `rgb(${v},${v},${v})`;
        h.beginPath(); h.roundRect(x + (a - .5) * 1.8, y + (b - .5) * 1.2, bw + (b - .5) * 3.6, bh + (a - .5) * 1.8, 3); h.fill();
        const q = hash(cc * 4.1 + seed, rr * 2.9), t = (v - 25) | 0;                            // paint bridging the joints here and there
        h.fillStyle = `rgb(${t},${t},${t})`;
        if (q > .3) { h.beginPath(); h.ellipse(x + bw * a, y + bh + j / 2, 6 + q * 18, j * .9, 0, 0, 7); h.fill(); }
        if (q > .62) { h.beginPath(); h.ellipse(x + bw + j / 2, y + bh * b, j * .9, 4 + q * 10, 0, 0, 7); h.fill(); }
      }
    }
    const hm = document.createElement("canvas"); hm.width = W; hm.height = H;
    const g = hm.getContext("2d", { willReadFrequently: true });
    g.filter = "blur(1.6px)"; g.drawImage(big, -W, -H); g.filter = "none";                   // paint rounds every edge
    [[10, .28], [26, .26], [3.6, .07]].forEach(([sc, al]) => {                                 // lumpy paint, big and small bumps
      const pt = g.createPattern(noise(), "repeat"); pt.setTransform(new DOMMatrix().scale(sc / 2));
      g.globalAlpha = al; g.globalCompositeOperation = "overlay"; g.fillStyle = pt; g.fillRect(0, 0, W, H);
    });
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    // 2. light every pixel (neighbours wrap around the tile's edges)
    const Hd = g.getImageData(0, 0, W, H).data, out = g.createImageData(W, H), o = out.data;
    const S = 2.3, Lx = -.42, Ly = -.58, Lz = .7, base = kind === "black" ? [46, 45, 44] : [248, 246, 240];
    const at = (x, y) => Hd[(((y + H) % H) * W + ((x + W) % W)) * 4] / 255;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const hv = at(x, y), dx = (at(x + 1, y) - at(x - 1, y)) * S, dy = (at(x, y + 1) - at(x, y - 1)) * S;
      let lit = (-dx * Lx - dy * Ly + Lz) / Math.sqrt(dx * dx + dy * dy + 1) / Lz;
      lit = lit < 0 ? 0 : lit > 1.25 ? 1.25 : lit;
      const ao = hv < .36 ? .8 : hv > .66 ? 1 : .8 + (hv - .36) / .3 * .2;                     // joints sit in a little shadow
      const f = (.3 + .7 * lit) * ao, shine = kind === "black" ? Math.max(0, lit - 1) * 90 : 0;  // black paint has a faint sheen
      const q = (y * W + x) * 4; o[q] = base[0] * f + shine; o[q + 1] = base[1] * f + shine; o[q + 2] = base[2] * f + shine; o[q + 3] = 255;
    }
    g.putImageData(out, 0, 0);
    grain(g, W, H, .14);
    return { url: hm.toDataURL("image/jpeg", .88), wm: cols * .23, hm: rows * .086 };
  }

  /* THE PAINTED TEXTURES, BAKED. The white and black brick, the wall planters, the bird of paradise, the two
     pendant shades and the café bar used to be painted fresh on every visit (about a second of work for the
     visitor's phone). They are painted once now and saved as pictures in assets/img/post/baked.
     (post-paint.js and paintedBrick() above are the recipes, kept so they can be re-baked if ever changed.)
     wm / hm = the picture's real size in metres; pw / ph = its size in pixels. */
  const TILE = {};
  // THE IVY'S COLOURS, from Kathi's ivy photo (Oct 2026): crimson, red, rose, pink, coral, orange, gold, butter, olive and
  // a little green. The same colours, in the same proportions, as tools/grow-ivy.py uses for the ivy on the walls, so the
  // leaves on the roof match the vines indoors. A colour listed more often turns up more often.
  const IVY_PALETTE = ["#801a2e", "#ba2430", "#ba2430", "#ba2430", "#ba2430", "#d43834", "#d43834", "#d43834", "#ce4660", "#ce4660", "#ce4660",
    "#e2748a", "#e2748a", "#e26444", "#e26444", "#d68032", "#d68032", "#deaa40", "#deaa40", "#eacc6e", "#96963e", "#487046"];
  function paintTextures() {
    const B = IMG + "post/baked/", t = (f, wm, hm, pw, ph) => ({ url: B + f, wm, hm, pw, ph, pad: 0 });
    TILE.white = t("brick-white.webp", 2.3, 1.72); TILE.black = t("brick-black.webp", 2.3, 1.72);
    // THE IVY along the top of both long walls: grown and rendered leaf by leaf by tools/grow-ivy.py, in the colours of
    // Kathi's ivy photo (6.4 m wide, 2.5 m tall, repeating along the wall with no seam). It is still called "planter"
    // here because it took the place of the old planters (Oct 2026).
    TILE.planter = { url: IMG + "post/ivy-wall.webp", wm: 6.4, hm: 2.5, pw: 2176, ph: 850, pad: 0 };
    TILE.bigA = t("bigA.webp", 2.7, 2.6, 648, 624);   // (repainted 1 m wider, Oct 31: its outer leaves used to be cut off)
    TILE.bell = t("bell.webp", .62, .7, 248, 280); TILE.raffia = t("raffia.webp", .62, .7, 248, 280);
    TILE.bar = t("bar.webp", 4, 2.4, 960, 576);
    // Kathi's photo of her walnut bench. (The lounge is built in 3D: see lounge3d().)
    // THE FLOOR (Oct 2026): the same glittering black obsidian as the café counter (tools/polish-obsidian.py floor),
    // a 2 m square repeating in every direction. (It replaced the pale stone floor, stone.webp, which is gone.)
    TILE.floor = { url: IMG + "post/obsidian-floor.webp", wm: 2, hm: 2 };
    TILE.bench = { url: IMG + "post/bench.webp", pw: 903, ph: 220 };
    // THE LOUNGE (Oct 31, 2026): Kathi's own lounge photo, cut into three pieces by tools/cut-lounge.py
    TILE.lounge = { url: IMG + "post/lounge-photo.webp" };
    TILE.loungePendant = { url: IMG + "post/lounge-pendant.webp" };
    TILE.loungePlant = { url: IMG + "post/lounge-plant.webp" };                         // (not used since Oct 31: the monstera took its place)
    // THE PINK MONSTERA: a 3D render (tools/render-monstera.py). pw x ph pixels, m metres per pixel, pot = its pot's middle (px from the left)
    TILE.monstera = { url: IMG + "post/pink-monstera.webp", pw: 933, ph: 965, m: .002, pot: 451, reach: .744 };   // reach = how far its leaves reach right of the pot (m)
  }

  /* ================================================================
     STEP 2 · MEASURE THE SCREEN AND SIZE THE ROOM
     ================================================================ */
  let u, W, H, PH, Wr, Wm, Dm, D, narrow, roofH = () => 0;   // roofH(x): how far the glass roof rises above the wall top at x (set in build)
  const HM = 7.2;                                   // room height in metres (two storeys)
  function measure() {
    W = innerWidth; H = innerHeight;
    narrow = W / H < 0.9;                           // phones and tall windows
    root.classList.toggle("nrp-narrow", narrow);    // (post.css keeps phones lighter: fewer things moving all the time)
    // TWO STOREYS. The room is drawn two screens tall (PH), and the page scrolls: you land looking at
    // the ceiling, the beams and the ivy on the upper storey, and scroll down to the shop floor.
    PH = H * (narrow ? 2.2 : 2);
    u = PH / HM;                                    // pixels per metre
    Wr = narrow ? Math.max(W, u * 4.2) : Math.max(W, u * 6.4);   // room width: a corridor on phones, airy on desktop
    Wm = Wr / u;                                    // room width in metres
    Dm = narrow ? 17 : 13.5;                        // room depth in metres
    D = Dm * u;
    const P = narrow ? Math.max(W * 1.9, H * 0.95) : W * 0.9;   // camera distance: how strong the perspective is
    const s = root.style;
    s.setProperty("--DN", (DN * u) + "px");
    s.setProperty("--W", W + "px"); s.setProperty("--H", H + "px"); s.setProperty("--PH", PH + "px");
    s.setProperty("--Wr", Wr + "px"); s.setProperty("--D", D + "px");
    s.setProperty("--u", u + "px"); s.setProperty("--P", P + "px");
    s.setProperty("--eyex", "50%");
    s.setProperty("--walk", (-1.6 * u) + "px");    // how far back the walk-in starts
  }

  /* ================================================================
     STEP 3 · PLACEMENT HELPERS (metres in, pixels out)
     ================================================================ */
  // Something standing on the floor, facing you. x = centre across (0–1), z = depth (0–1), w/h in metres, lift = metres off the floor.
  function stand(el, { x, z, w, h, lift = 0, dz = 0 }) {
    Object.assign(el.style, { left: (x * Wr - (w * u) / 2) + "px", top: (PH - (h + lift) * u) + "px", width: (w * u) + "px", height: (h * u) + "px", transform: `translateZ(${-z * D + dz}px)` });
    el.classList.add("nrp-stand"); return el;
  }
  // On a wall: x = metres along the wall, y = metres up from the floor.
  function onWall(el, { x, y, w, h }) {
    Object.assign(el.style, { left: (x * u) + "px", top: ((HM - y - h) * u) + "px", width: (w * u) + "px", height: (h * u) + "px" });
    el.classList.add("nrp-onwall"); return el;
  }
  // Lying on the floor: x = metres from the left wall, z = depth fraction, w/d in metres.
  // The floor is laid in two slabs: the NEAR slab (the first DN metres inside the door) and the FAR
  // slab (the rest, up to the glass). Browsers sometimes skip painting the part of one huge tilted
  // surface closest to the viewer; two smaller slabs always paint. Anything placed on the floor goes
  // on whichever slab sits under it.
  const DN = 4.5;
  function onFloor(el, { x, z, w, d }) {
    const zm = z * Dm, near = zm < DN && el.parentNode && el.parentNode.id === "nrp-floor";
    if (near) $("nrp-floor-near").appendChild(el);
    const top = near ? (DN - zm) * u - (d * u) / 2 : (1 - z) * D - (d * u) / 2;
    Object.assign(el.style, { left: (x * u) + "px", top: top + "px", width: (w * u) + "px", height: (d * u) + "px" });
    el.classList.add("nrp-onfloor"); return el;
  }
  // On the ceiling: same idea, seen from below.
  function onCeiling(el, { x, z, w, d }) {
    Object.assign(el.style, { left: (x * u) + "px", top: (z * D - (d * u) / 2) + "px", width: (w * u) + "px", height: (d * u) + "px" });
    return el;
  }
  // A soft shadow on the floor under something that stands at (x, z), w metres wide
  function shadow(floor, { x, z, w, d = 1.2, a = .45 }) {
    const s = onFloor(make("div", "nrp-shadow", floor), { x: x * Wm - w / 2, z, w, d });
    s.style.opacity = a; return s;
  }

  /* A BENCH IN 3D, after Kathi's walnut-bench photo. x, z = where its middle stands; len = its length (m);
     rot = how far it is turned (0 = facing you, 90 = running along the room).
     It is built like a real bench, out of flat pieces held in 3D (the way the room itself is built):
       the seat:  a slab 0.38 m deep and 5 cm thick. Its top is the walnut grain from the top of the seat in her
                  photo; its long edges are the seat's front edge from the photo; its two ends are plain walnut.
       the legs:  four tapered walnut legs, splayed outward like hers, each two crossed strips so it looks round
                  from every side.
     Its shadow is laid on the floor under it. */
  const BENCH = { D: .38, H: .45, T: .05, LEG: .05, SPLAY: 7 };
  function bench3d(x, z, len, rot) {
    const { D: bd, H: bh, T: bt, LEG: lw, SPLAY } = BENCH, src = TILE.bench.url, P = v => (v * u) + "px";
    const el = make("div", "nrp-bench3d nrp-built", room);
    Object.assign(el.style, { left: (x * Wr - len * u / 2) + "px", top: (PH - bh * u) + "px", width: P(len), height: P(bh),
      transform: `translateZ(${-z * D}px) rotateY(${rot}deg)` });
    // which rows of the 903 x 220 photo to show: the seat's top (rows 4-38) and its front edge (rows 38-66)
    // (only columns C0-C1 of the photo are used: its two ends sit in deep shadow in the photo and looked scorched)
    const C0 = 110, C1 = 790, wpx = len * u;
    const strip = (r0, r1, hpx) => `background-image:url(${src});background-size:${(903 / (C1 - C0) * 100).toFixed(1)}% ${(220 / (r1 - r0) * 100).toFixed(1)}%;background-position:${(-C0 / (C1 - C0) * wpx).toFixed(1)}px ${(-r0 / (r1 - r0) * hpx).toFixed(1)}px`;
    let h = `<i class="nrp-b-top" style="left:0;top:${P(-bd / 2)};width:${P(len)};height:${P(bd)};${strip(4, 38, bd * u)}"></i>`;
    [1, -1].forEach(sd => h += `<i class="nrp-b-edge" style="left:0;top:0;width:${P(len)};height:${P(bt)};transform:translateZ(${P(sd * bd / 2)})${sd < 0 ? " rotateY(180deg)" : ""};${strip(38, 66, bt * u)}"></i>`);
    [0, len].forEach(ex => h += `<i class="nrp-b-end" style="left:${P(ex - bd / 2)};top:0;width:${P(bd)};height:${P(bt)};transform:rotateY(90deg)"></i>`);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([sx, sz]) => {
      const lx = len / 2 + sx * (len / 2 - .2), lz = sz * (bd / 2 - .08);
      [0, 90].forEach(ry => h += `<i class="nrp-b-leg" style="left:${P(lx - lw / 2)};top:${P(bt)};width:${P(lw)};height:${P(bh - bt)};transform:translateZ(${P(lz)}) rotateZ(${-sx * SPLAY}deg) rotateY(${ry}deg)"></i>`);
    });
    el.innerHTML = h;
    const along = Math.abs(rot) === 90, sw = along ? bd + .3 : len * .95, sdp = along ? len * .95 : bd + .3;
    shadow($("nrp-floor"), { x, z: z - .002, w: sw, d: sdp, a: .55 });
    return el;
  }
  /* ================================================================
     THE LOUNGE IN 3D: Kathi's low rattan L-sofa, built from boxes
     ----------------------------------------------------------------
     The old lounge was one flat photo cut-out, sliced off at its edges.
     Now it is built for real, the same way as the benches and the room:
     every cushion is a little box made of flat faces held in 3D, so it
     sits in the room's own perspective and pushes right up against the
     Gallery wall. The pictures on the faces (soft linen, rattan weave,
     velvet pillows, a knit throw, the tufted pouf) are painted once by
     tools/bake-lounge.py and saved in assets/img/post/lounge/.

     THREE BUILDING BLOCKS
       group(parent, X, Y, Z, turn)  an invisible holder. Everything inside
            it is measured from its corner, so a whole run of sofa can be
            placed (and turned) in one go.
       box(g, x, y, z, w, h, d, faces)  a box inside a group, in metres:
            x = from the group's left, y = up from its floor, z = how far
            BACK (away from you). w wide, h tall, d deep. "faces" says
            which sides to draw and what picture each one wears.
       sofaRun(g, len, opts)  one straight stretch of sofa: rattan base,
            seat cushions, back cushions and pillows, facing "front".
     The L is two runs: one across the room (its back to the café), and
     one turned to face left, its back against the Gallery wall.
     ================================================================ */
  const LZ = IMG + "post/lounge/";
  const SOFA = { SD: .95, BH: .2, CT: .17, BT: .22, BKH: .52, MOD: .9, TILT: 11 };   // seat depth, base height, cushion thickness, back cushion thickness/height, cushion width, lean (°)
  function group(parent, X, Y, Z, turn = "") {     // X, Y, Z in metres inside the parent (Z = away from you)
    const g = make("div", "nrp-3d", parent);
    Object.assign(g.style, { left: (X * u) + "px", top: (-Y * u) + "px", transform: `translateZ(${-Z * u}px) ${turn}` });
    return g;
  }
  function box(g, x, y, z, w, h, d, faces) {
    const P = v => (v * u).toFixed(2) + "px";
    const face = (cls, css) => { const f = make("i", "nrp-f " + cls, g); f.style.cssText = css; return f; };
    const out = {};
    if (faces.front) out.front = face(faces.front, `left:${P(x)};top:${P(-(y + h))};width:${P(w)};height:${P(h)};transform:translateZ(${P(-z)})`);
    if (faces.top) out.top = face(faces.top, `left:${P(x)};top:${P(-(y + h))};width:${P(w)};height:${P(d)};transform-origin:50% 0;transform:translateZ(${P(-(z + d))}) rotateX(90deg)`);
    [["left", x], ["right", x + w]].forEach(([k, ex]) => {
      if (faces[k]) out[k] = face(faces[k], `left:${P(ex)};top:${P(-(y + h))};width:${P(d)};height:${P(h)};transform-origin:0 50%;transform:translateZ(${P(-(z + d))}) rotateY(-90deg)`);
    });
    return out;
  }
  // a flat picture standing in a group (a pillow, the throw's fall): x = its middle, leaning back by "lean" degrees, turned by "turn"
  function card(g, src, x, y, z, w, h, lean = 0, turn = 0, roll = 0, cls = "") {
    const c = make("i", "nrp-f nrp-card " + cls, g), P = v => (v * u).toFixed(2) + "px";
    c.style.cssText = `left:${P(x - w / 2)};top:${P(-(y + h))};width:${P(w)};height:${P(h)};background-image:url(${src});transform-origin:50% 100%;` +
      `transform:translateZ(${P(-z)}) rotateY(${turn}deg) rotateX(${lean}deg) rotateZ(${roll}deg)`;
    return c;
  }
  // THE BOHEMIAN PILLOWS (painted by tools/bake-lounge.py): each one's real width and height in metres
  // (Oct 2026: the leather-and-mudcloth set after Kathi's pillow photos, with two spotted faux-fur pillows)
  const BOHO = { leather: [.6, .6], mudwhite: [.6, .6], mudblack: [.58, .58], split: [.62, .62], centre: [.6, .6], arrow: [.6, .6], fur1: [.62, .62], fur2: [.58, .58] };
  const BOHO_PAD = 1.28;
  function sofaRun(g, len, { openL = true, openR = true, pillows = [], backFrom = 0 } = {}) {
    const { SD, BH, CT, BT, BKH, MOD, TILT } = SOFA, ins = .035, rat = "nrp-rattan";
    // 1. THE RATTAN BASE: a low woven platform, set in a little under the cushions
    box(g, ins, 0, ins, len - 2 * ins, BH, SD - 2 * ins, { front: rat, top: "nrp-basetop", left: openL && rat + " nrp-dim", right: openR && rat + " nrp-dim" });
    // 2. THE SEAT CUSHIONS: as many as fit, all the same width, a hair apart
    const n = Math.max(1, Math.round(len / MOD)), cw = len / n;
    for (let i = 0; i < n; i++) {
      box(g, i * cw + .006, BH, 0, cw - .012, CT, SD, { front: "nrp-seatfront", top: "nrp-seattop",
        left: i === 0 && openL && "nrp-seatfront nrp-dim", right: i === n - 1 && openR && "nrp-seatfront nrp-dim" });
    }
    // 3. THE BACK CUSHIONS, leaning back against the rear edge (each in its own little group, tipped back)
    const bLen = len - backFrom, bn = Math.max(1, Math.round(bLen / MOD)), bw = bLen / bn;
    for (let i = 0; i < bn; i++) {
      const bg = group(g, backFrom + i * bw, BH + CT - .02, SD - .02, `rotateX(${TILT}deg)`);
      box(bg, .01, 0, -BT, bw - .02, BKH, BT, { front: "nrp-backcush", top: "nrp-seatfront nrp-backtop",
        left: i === 0 && openL && "nrp-backcush nrp-dim", right: i === bn - 1 && openR && "nrp-backcush nrp-dim" });
    }
    // 4. THE PILLOWS, bunched in two layers: big ones propped against the back cushions, smaller ones tucked in front.
    //    Each is [where along the run (m), which pillow (see BOHO), turn (°), roll (°), how far in front (m)].
    //    The pictures have a margin round the pillow for the tassels and pom-poms (BOHO_PAD), so the card is
    //    that much bigger than the pillow, and it is lowered by the bottom margin so the pillow sits on the seat.
    pillows.forEach(([px, key, turn = 0, roll = 0, fwd = 0]) => {
      const [pw, ph] = BOHO[key], cw = pw * BOHO_PAD, ch = ph * BOHO_PAD;
      card(g, LZ + "boho-" + key + ".webp", px, BH + CT - .05 - ph * (BOHO_PAD - 1) / 2, SD - BT - .12 - ph * .25 - fwd, cw, ch, fwd ? 9 : 16, turn, roll, "nrp-pillow");
    });
  }
  // THE THROW, tossed over the end seat of a run (the end at "len"): one piece lying across the seat, one hanging down
  // over the end. The fall is a standing picture turned a quarter (90°) so it hangs flat against that end.
  function throwOver(g, len) {
    const seatY = SOFA.BH + SOFA.CT;
    box(g, len - .74, seatY + .004, 0, .75, 0, SOFA.SD - .02, { top: "nrp-throwtop" });
    card(g, LZ + "throw-fall.webp", len + .012, seatY - .3, .42, .62, .34, 0, 90, 0, "nrp-throwfall");
  }
  function lounge3d(floor) {
    const { SD } = SOFA;
    // HOW BIG, AND WHERE. LL = the run across the room (it includes the corner seat), LR = the run along the wall.
    // On phones and tall screens the room is a long narrow corridor: GALLERY runs most of the way down the right wall
    // and the pink neon fills the bar, so there the lounge is a straight sofa (no L), standing a little out from the
    // wall and further forward, so neither the neon nor the lettering is hidden.
    const LL = narrow ? 1.5 : 2.75, LR = narrow ? 0 : 1.5, Xr = Wm - (narrow ? .35 : .03);   // (narrow: kept short, so the hallway beside it stays open)
    // How deep it stands: about halfway back, but never so far forward that it would hide the word GALLERY.
    // (GALLERY slides toward the door to meet the screen's edge, so where it ends up depends on the screen;
    //  it has already been placed, so read where it is. Along that wall x 0 = the window end, so its far
    //  end is Dm - x metres from the door.)
    const gal = $("nrp-gallery-word"), galFar = gal ? Dm - parseFloat(gal.style.left) / u : 0;
    const Zb = narrow ? Dm * .42 : Math.max(Dm * .485, galFar + SD + LR + .2);
    const Xa = Xr - LL;                                                     // the left end of the run across
    const root3d = make("div", "nrp-3d nrp-built nrp-lounge", room);       // the whole lounge sits on the floor line
    Object.assign(root3d.style, { left: "0px", top: PH + "px" });
    // THE RUN ACROSS: its front edge SD in front of Zb, its back to the café
    const gA = group(root3d, Xa, 0, Zb - SD);
    sofaRun(gA, LL, { openR: !!narrow, pillows: narrow
      ? [[.3, "split", 0, -5], [.78, "mudblack", 0, 4], [1.2, "fur2", -10, -3], [.56, "fur1", 0, 3, .14], [1.0, "leather", 0, 7, .12]]   // (both furs here too)
      : [[.42, "split", 0, -5], [1.02, "mudblack", 0, 4], [1.62, "mudwhite", 0, -3], [2.18, "centre", -30, 5],
         [.74, "fur1", 0, 3, .14], [1.34, "leather", 0, 7, .12]] });
    // THE RUN ALONG THE WALL: turned to face left (rotateY -90°), its back against the black brick.
    // Inside it, "along" runs toward the door, starting where the run across ends. Its back cushions start
    // further back (behind the corner seat), so the corner has a cushion behind it on both sides.
    if (LR) {
    const gR = group(root3d, Xr - SD, 0, Zb - SD, "rotateY(-90deg)");
    sofaRun(gR, LR, { openL: false, backFrom: -(SD - SOFA.BT - .02), pillows: [[.12, "arrow", 20, -5], [.62, "fur2", 16, 6], [.36, "leather", 18, -4, .14]] });
    throwOver(gR, LR);
    shadow(floor, { x: (Xr - SD / 2) / Wm, z: (Zb - SD - LR / 2) / Dm, w: SD + .25, d: LR + .4, a: .62 });
    }
    else throwOver(gA, LL);                    // (no wall run on narrow screens: the throw goes over the sofa's right end)
    // A NOT RISING ISSUE left lying on the middle seat, turned at an angle, as if someone just got up to grab a coffee
    // (Issue 01's cover; to show a different one, change "cover01" to another name from IMAGES in data.js)
    const mag = NR && NR.IMAGES && NR.IMAGES.cover01;
    if (mag) {
      const mg = group(gA, LL * .52, SOFA.BH + SOFA.CT + .008, .12, "rotateY(-24deg)");
      box(mg, 0, 0, 0, .21, 0, .28, { top: "nrp-mag" }).top.style.backgroundImage = `url(${IMG}thumbs/${mag})`;
    }
    // THE POUF, beside the sofa's left end, in line with it: its front lines up with the front of the seats, so it sits
    // on the same level as the couch. (A round thing looks the same from anywhere, so it stands as a picture facing you.)
    const pz = Zb - SD, px = Xa - .4;
    shadow(floor, { x: px / Wm, z: (pz + .3) / Dm, w: .75, d: .7, a: .5 });
    stand(make("div", "nrp-built nrp-painted nrp-pouf", room, `<img src="${LZ}pouf.webp" alt="">`), { x: px / Wm, z: pz / Dm, w: .6, h: .58 });
    // THE JUTE RUG, a thick round one after Kathi's rug photo (woven by tools/weave-rug.py, seen from straight above),
    // laid flat on the floor under the lounge so it takes the room's own perspective. It is centred on the seating
    // (in front of the sofa, under the pouf), and kept clear of the Gallery wall. RUG_D = how wide it is (m).
    // It sits in the space the L wraps around: its back third under the long seat, the rest out in front of it.
    const RUG_D = narrow ? 2.4 : 3.4;
    const rugX = Math.min(Xa + (LL - (LR ? SD : 0)) / 2 + .1, Wm - RUG_D / 2 - .1), rugZ = Zb - SD - RUG_D * .28;
    // The floor is two slabs (see onFloor), and each only shows what lies on it, so the rug is laid on BOTH, at the
    // same spot: the far slab shows its back part, the near slab its front part, and they meet seamlessly.
    [[floor, (Dm - rugZ) * u], [$("nrp-floor-near"), (DN - rugZ) * u]].forEach(([slab, cy]) => {
      const el = make("div", "nrp-rug nrp-onfloor", slab, `<img src="${LZ}rug.webp" alt="">`);
      Object.assign(el.style, { left: ((rugX - RUG_D / 2) * u) + "px", top: (cy - RUG_D * u / 2) + "px", width: (RUG_D * u) + "px", height: (RUG_D * u) + "px" });
    });
    // SHADOWS on the floor: a soft dark pool under each run, so the sofa sits ON the floor
    shadow(floor, { x: (Xa + LL / 2) / Wm, z: (Zb - SD / 2) / Dm, w: LL + .25, d: SD + .45, a: .62 });
    // WARM LIGHT from the bulbs above, on the floor in front of the lounge and on the black brick behind it
    onFloor(make("div", "nrp-loungeglow", floor), { x: Xa - .3, z: (Zb - SD - .4) / Dm, w: LL + .6, d: LR + 1.6 });
    onWall(make("div", "nrp-wallglow", $("nrp-right")), { x: Dm - Zb - .2, y: 0, w: LR + SD + .8, h: 2.6 });
    return { Xa, Xr, LL, LR, Zb };
  }

  /* HOW FAR TOWARD THE DOOR can something on the Gallery wall reach before it runs off the right-hand edge of the
     screen? A tiny probe is slid along the wall at height y (metres), measured on screen each time, and the search
     halves the distance left each try (18 tries pins it to the pixel). Returns the answer in metres along the wall. */
  function flushX(wall, y) {
    const probe = onWall(make("div", "", wall), { x: 0, y, w: .01, h: .01 }), edge = innerWidth - 6;
    let lo = 0, hi = Dm - .01;
    for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; probe.style.left = (mid * u) + "px";
      const r = probe.getBoundingClientRect(); if (r.right <= edge && r.width > 0) lo = mid; else hi = mid; }
    probe.remove(); return lo + .01;
  }
  /* GALLERY, FLUSH TO THE FRONT EDGE. Slide the word along the floor line toward the door, measuring where it lands
     on screen each time (the browser reports where 3D things end up), and stop where its near end just meets the
     right-hand edge of the screen. Each try halves the distance left to search, so 18 tries pin it to the pixel. */
  function placeGalleryWord() {
    const gal = $("nrp-gallery-word"); if (!gal) return;
    const edge = innerWidth - 6, wordW = gal.offsetWidth;
    let lo = 0, hi = D - wordW;
    for (let k = 0; k < 18; k++) {
      const mid = (lo + hi) / 2; gal.style.left = mid + "px";
      const r = gal.getBoundingClientRect();
      if (r.right <= edge && r.width > 0 && r.width < innerWidth) lo = mid; else hi = mid;
    }
    gal.style.left = lo + "px";
  }

  /* THE WISHING WALL: every cover feature's wish (data.js, WISHES), spray-painted on the white brick around the
     cowboy mural, from the Newsstand to the corner by the café, floor to ceiling. It is laid out by wallLayout()
     (STEP 6A); the same painted wall appears in the room and, up close, in the popup. These are its lettering tools. */

  // THE SIX WALL FONTS, MEASURED (Oct 2026), so every wish can be made as easy to read as WHOLENESS.
  // Each number is a share of the font size:
  //   cap  = how tall a CAPITAL letter is        xh = how tall a small letter is (an x)
  //   stem = how thick the pen stroke is (Reenie Beanie is a thin pencil; Permanent Marker is a fat marker)
  //   lh   = the space from one line to the next (Rock Salt's letters are tall and loopy, so it needs more;
  //          Reenie Beanie's are small for their size, so it needs less)
  //   ws   = extra space between words (Rock Salt's tails reach into the next word, so it gets the most)
  const WALL_FONTS = {
    "Permanent Marker":     { cap: .745, xh: .595, stem: .153, lh: 1.12, ws: .08 },
    "Sedgwick Ave Display": { cap: .815, xh: .635, stem: .120, lh: 1.12, ws: .08 },   // its small letters look like small capitals (WHOLENESS)
    "Rock Salt":            { cap: 1.045, xh: .78, stem: .107, lh: 1.4,  ws: .3 },
    "Bebas Neue":           { cap: .70,  xh: .70,  stem: .103, lh: 1.08, ws: .04 },   // capitals only, so both heights are the same
    "Black Ops One":        { cap: .65,  xh: .52,  stem: .148, lh: 1.08, ws: 0 },
    "Reenie Beanie":        { cap: .58,  xh: .41,  stem: .048, lh: 1.0,  ws: .1 }
  };
  const fontOf = q => WALL_FONTS[q.font] || WALL_FONTS["Permanent Marker"];
  // BOLDER: the lettering is fattened by painting a black edge round every letter, the same black as the letter
  // (-webkit-text-stroke in post.css). thicken() works out how wide that edge has to be so the stroke is at least
  // BOLD of the font size (WHOLENESS's own font, Sedgwick, is .12, so even it gets a little bolder) and at least
  // minStem thick. Fonts that are already fat still get a hair more (BOLD_MIN), so every wish reads blacker.
  // fs and minStem are in pixels; so is the answer.
  const BOLD = .13, BOLD_MIN = .012;
  const thicken = (q, fs, minStem = 0) => Math.max(BOLD_MIN * fs, Math.max(BOLD * fs, minStem) - fontOf(q).stem * fs);
  const caseOf = (t, c) => c === "up" ? t.toUpperCase() : c === "low" ? t.toLowerCase() : t;

  /* ================================================================
     STEP 4 · THE DRAWINGS (little SVG pictures, in centimetres)
     ================================================================ */


  /* ---- THE NEWSSTAND KIOSK ----
     This is the Newsstand page itself, in miniature: the same HTML classes (sign, board, awning,
     tabs, rack, pockets, glass shelves, tags), styled by the Newsstand's own stylesheet
     (newsstand.css, loaded in post/index.html), so it matches the real one exactly. It is built at
     the Newsstand's full width (1180 px) and then shrunk to fit the wall. The bulbs are drawn with
     the same recipe as drawGlobes() in newsstand.js: Edison bulbs. */
  const tiles = (word, seed = 0) => [...word].map((ch, i) => {                // letter tiles, each a hair crooked (same as newsstand.js)
    const r = Math.sin((i + seed) * 12.9898 + 4.1) * 43758.5453, f = r - Math.floor(r);
    const g = Math.sin((i + seed) * 78.233 + 1.7) * 12345.678, h = g - Math.floor(g);
    return ch === " " ? `<span class="lt sp"> </span>` : `<span class="lt" style="--rot:${((f - .5) * 3.2).toFixed(2)}deg;--dy:${((h - .5) * .05).toFixed(3)}em">${esc(ch)}</span>`;
  }).join("");
  /* THE BULBS, STAMPED (Oct 2026, for a fast, smooth room).
     Every Edison bulb in the room looks the same; only its size and place differ. So ONE bulb (glass, filament,
     socket and glow, drawn by edison() below) is drawn once into a small picture, the "stamp", and then copied onto
     a flat canvas wherever a bulb goes, at its size. Copying a picture is very cheap; drawing ~130 vector bulbs was
     slow to load, and in a 3D room vector drawings get redrawn at every new camera angle, which made scrolling
     stutter. A canvas is a flat picture, which the graphics chip just slides and stretches.
     bulbStamp(halo) gives the stamp (halo = how wide its glow is; made once per glow size, then reused).
     paintBulbs(el, bulbs, halo, x, y, w, h): bulbs = [{x, y, r}] in pixels (the glass's centre and radius), drawn
     onto a canvas covering (x, y, w, h), measured from el's top-left corner (it can reach outside el, for the glow). */
  const STAMPS = {}, SR = 48;                                                          // the stamp's bulb is 48 px in radius
  function bulbStamp(halo) {
    if (STAMPS[halo]) return STAMPS[halo];
    const R = SR * 4.4 * halo, S = Math.ceil(R * 2);                                   // the stamp is just big enough for the glow
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="${-S / 2} ${-S / 2} ${S} ${S}"><defs>${edisonDefs("st")}</defs>${edison("st", 0, 0, SR, { halo })}</svg>`;
    return (STAMPS[halo] = new Promise(res => { const img = new Image();
      img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = S; c.getContext("2d").drawImage(img, 0, 0); res(c); };
      img.onerror = () => res(null);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); }));
  }
  function paintBulbs(el, bulbs, halo, x, y, w, h) {
    const k = Math.min(window.devicePixelRatio || 1, 1.5), c = document.createElement("canvas");   // sharp enough, without huge pictures
    c.width = Math.ceil(w * k); c.height = Math.ceil(h * k);
    Object.assign(c.style, { position: "absolute", left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
    el.appendChild(c);
    bulbStamp(halo).then(st => { if (!st) return; const g = c.getContext("2d"), f = 4.4 * halo;
      bulbs.forEach(b => g.drawImage(st, (b.x - x - b.r * f) * k, (b.y - y - b.r * f) * k, 2 * b.r * f * k, 2 * b.r * f * k)); });
  }
  function globes(el, { sides = ["top", "left", "right"], big = 16, edgeBig = 28, gapBig = 92 } = {}) {
    const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    const r = big, edge = edgeBig, pts = [];
    const row = y => { const n = Math.max(2, Math.round((W - 2 * edge) / gapBig)); for (let i = 0; i <= n; i++) pts.push([edge + (W - 2 * edge) * i / n, y]); };
    const col = x => { const n = Math.max(1, Math.round((H - 2 * edge) / gapBig)); for (let j = 0; j <= n; j++) pts.push([x, edge + (H - 2 * edge) * j / n]); };
    if (sides.includes("top")) row(edge); if (sides.includes("bottom")) row(H - edge);
    if (sides.includes("left")) col(edge); if (sides.includes("right")) col(W - edge);
    const seen = new Set(), uniq = pts.filter(p => { const id = p.map(Math.round).join(","); return !seen.has(id) && seen.add(id); });
    const pad = Math.ceil(r * .72 * 4.5);                                             // room for each bulb's glow
    el.replaceChildren();
    paintBulbs(el, uniq.map(([x, y]) => ({ x, y: y + r * .55, r: r * .72 })), 1, -pad, -pad, W + 2 * pad, H + 2 * pad);
  }
  /* ONE EDISON BULB, drawn in SVG (the same recipe in newsstand.js, storefront.js and post.js).
     Clear amber glass with a glowing spiral filament inside, on a turned oak socket, in a warm halo,
     after the bulbs in Kathi's plant-corner photo. r = the glass's radius; (x, y) = the glass's centre.
     The socket sits above the glass, so the bulb hangs. Call edisonDefs(id) once per <svg>. */
  const edisonDefs = id => `<radialGradient id="${id}-halo"><stop offset="0" stop-color="#ffd38a" stop-opacity=".62"/><stop offset=".22" stop-color="#ffb24a" stop-opacity=".3"/><stop offset=".55" stop-color="#ff9a30" stop-opacity=".1"/><stop offset="1" stop-color="#ff8a20" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}-glass" cx=".46" cy=".56" r=".62"><stop offset="0" stop-color="#fff3d2" stop-opacity=".75"/><stop offset=".45" stop-color="#ffc66e" stop-opacity=".4"/><stop offset=".85" stop-color="#e8963a" stop-opacity=".32"/><stop offset="1" stop-color="#b8661e" stop-opacity=".5"/></radialGradient>
    <radialGradient id="${id}-core"><stop offset="0" stop-color="#fffbea" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd68a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb04a" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-sock" x1="0" x2="1"><stop offset="0" stop-color="#7a5434"/><stop offset=".3" stop-color="#d8ad74"/><stop offset=".55" stop-color="#c39058"/><stop offset="1" stop-color="#5e3e22"/></linearGradient>
    <linearGradient id="${id}-brass" x1="0" x2="1"><stop offset="0" stop-color="#6b5320"/><stop offset=".35" stop-color="#f1d58e"/><stop offset=".6" stop-color="#b8923f"/><stop offset="1" stop-color="#4f3b14"/></linearGradient>`;
  function edison(id, x, y, r, { halo = 1, cord = 0 } = {}) {
    const f = v => (v * r).toFixed(2), coil = [];
    for (let i = 0; i <= 84; i++) { const t = i / 84, a = t * Math.PI * 2 * 7;           // a spiral filament, seen from the side: seven loops down the middle
      coil.push(`${f(Math.sin(a) * .2 * (1 - Math.abs(t - .5) * .5))},${f(-.72 + t * 1.12 + Math.cos(a) * .045)}`); }
    const c = coil.join(" ");
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      ${halo ? `<circle r="${f(4.4 * halo)}" fill="url(#${id}-halo)"/>` : ""}
      ${cord ? `<line x1="0" y1="${f(-2.2)}" x2="0" y2="${(-2.2 * r - cord).toFixed(1)}" stroke="#141414" stroke-width="${f(.09)}"/>` : ""}
      <rect x="${f(-.4)}" y="${f(-2.2)}" width="${f(.8)}" height="${f(.92)}" rx="${f(.1)}" fill="url(#${id}-sock)"/>
      <path d="M${f(-.4)} ${f(-1.86)}h${f(.8)}M${f(-.4)} ${f(-1.62)}h${f(.8)}" stroke="#4a3018" stroke-opacity=".45" stroke-width="${f(.04)}"/>
      <rect x="${f(-.36)}" y="${f(-1.3)}" width="${f(.72)}" height="${f(.2)}" fill="url(#${id}-brass)"/>
      <path d="M${f(-.3)} ${f(-1.1)} C${f(-.33)} ${f(-.72)} ${f(-1)} ${f(-.55)} ${f(-1)} ${f(.25)} A${f(1)} ${f(1)} 0 0 0 ${f(1)} ${f(.25)} C${f(1)} ${f(-.55)} ${f(.33)} ${f(-.72)} ${f(.3)} ${f(-1.1)} Z" fill="url(#${id}-glass)" stroke="#ffe6bf" stroke-opacity=".55" stroke-width="${f(.05)}"/>
      <circle cy="${f(.02)}" r="${f(.78)}" fill="url(#${id}-core)"/>
      <path d="M${f(-.07)} ${f(-1.05)}L${f(-.2)} ${f(-.72)}M${f(.07)} ${f(-1.05)}L${f(.2)} ${f(-.72)}" stroke="#d8a874" stroke-width="${f(.035)}"/>
      <polyline points="${c}" fill="none" stroke="#ff9a2e" stroke-opacity=".35" stroke-width="${f(.3)}" stroke-linecap="round"/>
      <polyline points="${c}" fill="none" stroke="#ffc25a" stroke-opacity=".8" stroke-width="${f(.13)}" stroke-linecap="round"/>
      <polyline points="${c}" fill="none" stroke="#fffbe8" stroke-width="${f(.05)}" stroke-linecap="round"/>
      <ellipse cx="${f(-.58)}" cy="${f(.12)}" rx="${f(.09)}" ry="${f(.4)}" fill="#fff" opacity=".42" transform="rotate(14 ${f(-.58)} ${f(.12)})"/>
      <ellipse cx="${f(.42)}" cy="${f(.62)}" rx="${f(.16)}" ry="${f(.06)}" fill="#fff" opacity=".22"/></g>`;
  }

  function kiosk(host, widthPx) {
    const FEATURES = (NR && NR.FEATURES) || [], two = n => String(n).padStart(2, "0");
    const thumb = key => IMG + "thumbs/" + NR.IMAGES[key];
    const pocket = (f, n) => `<div class="pocket">${f
      ? `<div class="stack"></div><span class="cover-btn">${f.cover ? `<img src="${thumb(f.cover)}" alt="">` : ""}</span>`
      : `<div class="empty"><span class="slip">Coming soon</span></div>`}<span class="glass"></span><span class="tag">ISSUE ${two(n)}</span></div>`;
    const pockets = Array.from({ length: 20 }, (_, i) => pocket(FEATURES[i], i + 1)).join("");
    const tab = (label, cls, on) => `<span class="tab${cls}" aria-selected="${on}"><span class="tb">${tiles(label.toUpperCase(), label.length * 3)}</span></span>`;
    host.innerHTML = `<div class="nrns stand nrp-kiosk" aria-hidden="true">
      <header class="sign"><div class="lights nrp-signlights"></div><div class="board"><h1>${tiles("NOW SOARING")}</h1></div></header>
      <span class="awning"></span>
      <div class="tabs">${tab("01–20", "", true)}${tab("21–40", " upcoming", false)}${tab("Memoirs", " memoirs", false)}</div>
      <section class="rack"><div class="pockets">${pockets}</div></section>
      <div class="lights nrp-marquee"></div>
    </div>`;
    const k = host.firstElementChild;
    // THE MARQUEE LIGHTS, two complete frames (Oct 2026):
    //   1. NOW SOARING has its own frame: a ring of bulbs set in the sign's black border, all the way round the
    //      letter board (the border is made wider here, in post.css, so the bulbs fit without touching the letters).
    //   2. The stand has its own frame below it: from the tabs, round the rack, to the foot of the stand, set just
    //      outside its edge. It starts below the awning, so the two frames don't double up along the top.
    // The bulbs are bigger than the real Newsstand's, so they read from across the room.
    globes(k.querySelector(".nrp-signlights"), { sides: ["top", "bottom", "left", "right"], big: 21, edgeBig: 27, gapBig: 66 });
    const mq = k.querySelector(".nrp-marquee"), tabsEl = k.querySelector(".tabs");
    mq.style.top = (tabsEl.offsetTop - 74) + "px";                                     // its top row hangs in the gap between the awning and the tabs
    globes(mq, { sides: ["top", "bottom", "left", "right"], big: 30, edgeBig: 34, gapBig: 100 });
    // shrink it to the wall's width and stand it on the floor
    const sc = Math.min(widthPx / k.offsetWidth, (HM - 2.5) * u / k.offsetHeight);   // fits the wall's width AND stays below the hanging greenery
    k.style.transform = `scale(${sc})`;
    k.style.top = (host.clientHeight - (k.offsetHeight * sc) - 0.25 * u) + "px";
    return { bottom: 0.25, height: k.offsetHeight * sc / u };                           // where it stands, in metres (the mural matches it)
  }

  /* ================================================================
     STEP 5 · BUILD THE ROOM (and the LAYOUT numbers)
     ================================================================ */
  function build() {
    measure();
    room.querySelectorAll(".nrp-built").forEach(n => n.remove());
    ["nrp-back", "nrp-left", "nrp-right", "nrp-floor", "nrp-floor-near", "nrp-ceiling"].forEach(id => ($(id).innerHTML = ""));
    const back = $("nrp-back"), left = $("nrp-left"), right = $("nrp-right"), floor = $("nrp-floor"), ceil = $("nrp-ceiling");
    const add = (cls, html) => make("div", "nrp-built " + cls, room, html);
    const covers = (NR && NR.FEATURES || []).map(f => NR.IMAGES[f.cover]).filter(Boolean);

    // the painted textures, sized so a brick is a brick and a board is a board
    const paper = (el, t) => { el.style.backgroundImage = `url(${t.url})`; el.style.backgroundSize = `${t.wm * u}px ${t.hm * u}px`; };
    paper(left, TILE.white); paper(right, TILE.black); paper(floor, TILE.floor);
    // THE ARCH WALL (the back wall the café arch is cut into): smooth black (it was white plaster, then black brick).
    // (Later in Oct 2026: changed again to smooth black, so the obsidian and the neon carry the drama. See .nrp-blackback.)
    const backWall = $("nrp-back"); backWall.classList.add("nrp-brickback", "nrp-blackback");
    const floorNear = $("nrp-floor-near"); paper(floorNear, TILE.floor);
    floorNear.style.backgroundPosition = `0px ${-(D - DN * u)}px`;    // the stones line up across the join

    /* ---- THE BACK WALL: NEBULA CAFE ---- */
    // One great arch across the whole back wall, almost up to the skylight. Through it: the café.
    // The bar (painted in post-paint.js: concrete counter, oak shelves of jars and bottles) runs the full
    // width along the bottom; above it is the café's own white brick wall, in shadow, with the name in neon.
    const aX = 0.25, aW = Wm - 0.5, aH = Math.min(HM - 0.3, 2 * Math.min(Math.max(3.4, Wm * 0.56), 6));   // twice the old arch's height
    const arch = onWall(make("a", "nrp-arch nrp-hot", back, `<span class="nrp-arch-shade"></span>`), { x: aX, y: 0, w: aW, h: aH });
    const rv = Math.min(aW / 2, aH * 0.42);                                               // the curve at the top: as round as the height allows
    arch.style.borderRadius = `${aW / 2 * u}px ${aW / 2 * u}px 0 0 / ${rv * u}px ${rv * u}px 0 0`;
    arch.dataset.room = "cafe"; arch.dataset.tip = "Nebula Cafe"; arch.setAttribute("aria-label", "Nebula Cafe");
    const barH = TILE.bar.hm, barW = TILE.bar.wm;                                          // 2.4 m tall, one repeat 4 m wide
    arch.style.backgroundImage = `url(${TILE.bar.url}), url(${TILE.white.url})`;
    arch.style.backgroundSize = `${barW * u}px ${barH * u}px, ${TILE.white.wm * u}px ${TILE.white.hm * u}px`;
    arch.style.backgroundPosition = `50% 100%, 0 0`;
    arch.style.backgroundRepeat = "repeat-x, repeat";
    // THE OBSIDIAN COUNTER (Oct 2026): a thick block of polished black stone that glitters like a nebula, after Kathi's
    // black galaxy-stone photo. It is laid over the front of the counter in the bar picture, the full width of the arch,
    // from the floor to the top of the slab (OBS_H m). Its picture is painted by tools/polish-obsidian.py and repeats
    // every 2 m. A few dozen of its brightest flecks twinkle (post.css), each at its own pace, so it really glitters.
    const OBS_H = 1.15, obs = onWall(make("div", "nrp-obsidian", back), { x: aX + .08, y: 0, w: aW - .16, h: OBS_H });
    obs.style.backgroundSize = `${2 * u}px ${OBS_H * u}px`;
    { const rs = seeded(777); let tw = "";
      for (let i = 0; i < (narrow ? 10 : 18); i++) {                                       // (kept few: each one is a moving layer)
        const top = rs() < .25 ? rs() * .06 : .09 + rs() * .82;                           // some on the lit top, most on the front
        tw += `<i style="left:${(rs() * 100).toFixed(2)}%;top:${(top / OBS_H * 100).toFixed(2)}%;--s:${(.6 + rs() * .9).toFixed(2)};animation-delay:${(-rs() * 6).toFixed(2)}s;animation-duration:${(2.6 + rs() * 3.4).toFixed(2)}s"></i>`;
      }
      obs.innerHTML = tw; }
    // RED AND GREEN IVY ON THE ARCH WALL (Oct 2026), grown by tools/grow-ivy.py like the side walls' ivy:
    //   a short fringe along the whole top that drapes just over the crown of the arch (so the arch still reads), and
    //   a long cascade in each corner, trailing far down where this wall meets the side walls, framing the café.
    // The right corner is the left one mirrored. They go in before the NEBULA cafe neon, so the sign stays on top.
    const ivyTop = onWall(make("div", "nrp-archivy", back), { x: 0, y: HM - 1.0, w: Wm, h: 1.0 });
    Object.assign(ivyTop.style, { backgroundImage: `url(${IMG}post/ivy-arch-top.webp)`, backgroundSize: `${6.4 * u}px ${1.0 * u}px`, backgroundRepeat: "repeat-x" });
    const cW = narrow ? 1.05 : 1.5, cH = cW * 4.6 / 1.5;                                  // the corner picture is 1.5 m x 4.6 m
    [[0, false], [Wm - cW, true]].forEach(([cx, flip]) => {
      const c = onWall(make("div", "nrp-archivy", back), { x: cx, y: HM - cH, w: cW, h: cH });
      Object.assign(c.style, { backgroundImage: `url(${IMG}post/ivy-arch-corner.webp)`, backgroundSize: "100% 100%", transform: flip ? "scaleX(-1)" : "" });
    });
    // The name in warm white neon on the café's brick, above the shelves
    const nw = Math.min(aW * 0.7, 4.2), neon = onWall(make("a", "nrp-neon nrp-hot", back, `<b>NEBULA</b><i>cafe</i>`), { x: (Wm - nw) / 2, y: barH + 0.7, w: nw, h: 1.3 });
    neon.dataset.room = "cafe"; neon.dataset.tip = "Nebula Cafe"; neon.setAttribute("aria-label", "Nebula Cafe");
    neon.style.setProperty("--nw", (nw * u) + "px");
    onWall(make("div", "nrp-plastershade", back), { x: 0, y: 0, w: Wm, h: HM });
    // THE PINK NEON, after your photo: hand-written neon tube. (Oct 31: moved up off the front of the stone bar, onto the
    // café's white brick between the top shelf and NEBULA cafe, so the lounge in front of the café never hides it.)
    // It is three layers of the same words: a wide soft pink glow, a brighter pink tube, and a near-white
    // core where the light is strongest (see .nrp-pink in post.css). It also throws a pink wash on the counter.
    const NE = DATA.NEON || { lines: [] };
    if (NE.lines.length) {
      // centred on the café wall, with the same margin at each end, just above the top shelf (barH is the bar's height)
      const free0 = aX + (narrow ? 0.15 : 1.25), free1 = Wm - free0;
      const pw = Math.min(free1 - free0, 2.2), ph = 0.52, sign = onWall(make(NE.link ? "a" : "div", "nrp-pink", back,
        `<span class="nrp-pink-wash"></span>${NE.lines.map(l => `<span class="nrp-pink-line" data-t="${esc(l)}">${esc(l)}</span>`).join("")}`), { x: (Wm - pw) / 2, y: barH + 0.1, w: pw, h: ph });   // smaller (Oct 2026), centred on the café wall
      sign.style.setProperty("--fs", Math.min(ph / NE.lines.length * .85, pw / Math.max(...NE.lines.map(l => l.length)) * 2.7) * u + "px");   // as big as fits (this script's letters are narrow)
      if (NE.link) { sign.href = NE.link; sign.target = "_blank"; sign.rel = "noopener"; sign.setAttribute("aria-label", NE.lines.join(" ") + " (Buy Me a Coffee, opens in a new tab)"); sign.classList.add("nrp-hot"); sign.dataset.tip = "Buy me a coffee"; }
      else sign.setAttribute("aria-label", NE.lines.join(" "));
    }

    // The lettering on the floor line of both long walls (GALLERY, and WISHING … WALL): letters this many metres tall.
    // Smaller on phones, so the mural keeps its size in the narrow room.
    const WORD_FS = narrow ? 0.55 : 0.53;

    // THE SPECTATOR LINE: the potted plant at the back left and the two benches in front of the Newsstand and the
    // Wishing Wall all stand this far out from the left wall (m), leaving room to sit and look at the wall.
    const LINE_X = narrow ? 1.0 : 1.25;

    /* ---- THE LEFT WALL (white brick): the Newsstand, then the Wishing Wall, both floor to ceiling ---- */
    // Along this wall x = 0 is the door end and x = Dm is the window end.
    // (On a computer the room is shorter, so the kiosk starts nearer the door to leave room for a full-height mural.)
    const newsX = narrow ? Dm * 0.07 : 0.45, newsW = Math.min(3.6, Dm * 0.26);   // the kiosk is ~1.5x as tall as it is wide, so this keeps it under the planters
    const news = onWall(make("a", "nrp-news nrp-hot", left), { x: newsX, y: 0, w: newsW, h: HM });
    news.dataset.room = "newsstand"; news.dataset.tip = "Newsstand"; news.setAttribute("aria-label", "The Newsstand: every NOT RISING cover");
    const kio = kiosk(news, newsW * u);
    // THE WISHING WALL: everything from the Newsstand to the corner by the café, floor to ceiling. wallLayout()
    // (STEP 6A) paints it: the cowboy mural running the full height, every wish in its own block around him, and
    // WISHING / WALL in Impact on the floor line. It takes about a second to work out, so it fades in just after
    // the room appears; the popup shows the very same wall up close. The whole stretch is clickable (an invisible
    // panel over it) and opens that popup.
    const newsEnd = newsX + newsW;
    SECTION = { x: newsEnd, w: Dm - newsEnd };
    const hot = onWall(make("a", "nrp-wallhot nrp-hot", left), { x: SECTION.x, y: 0, w: SECTION.w, h: HM - TILE.planter.hm / 2 });
    paintRoomWall(left, ++buildNo);
    hot.dataset.room = "wishingWall"; hot.dataset.tip = "Read the Wishing Wall"; hot.setAttribute("aria-label", "Open the Wishing Wall full screen");
    onWall(make("div", "nrp-wallshade", left), { x: 0, y: 0, w: Dm, h: HM });

    /* ---- THE RIGHT WALL (black brick): the Gallery ---- */
    // Along this wall x = 0 is the window end and x = Dm is the door end.
    // THE HANG: 16 square canvas prints, 4 across and 4 down, the same gap (GAP) between every one. The grid is as
    // tall as the space between GALLERY and the track lights allows (yBot to yTop), and is slid along the wall toward
    // the door until its near edge meets the front (right-hand) edge of the screen, just like the word GALLERY
    // (flushX() finds the spot by measuring). LIFE stands just beyond the grid's far end.
    // Each canvas shows the middle of its photo (or the part named by "crop" in data.js); the viewer shows it whole.
    const COLS = 4, ROWS = 4, GAP = 0.28, G = DATA.GALLERY, yBot = 1.35, yTop = 5.35;
    const cs = (yTop - yBot - GAP * (ROWS - 1)) / ROWS, gridW = COLS * cs + (COLS - 1) * GAP;
    const gx1 = Math.min(Dm - .2, flushX(right, yBot)), gx0 = Math.max(1.6, gx1 - gridW);   // the grid's door end, and its far end
    G.slice(0, COLS * ROWS).forEach((p, gi) => {
      const r = Math.floor(gi / COLS), c = gi % COLS;
      const wallImg = p.thumb || p.img.replace(/[^/]+$/, "wall/$&");                             // a small copy for the wall; the big one loads only in the viewer
      const a = onWall(make("a", "nrp-photo nrp-canvas nrp-hot", right,
        `<img src="${IMG}${wallImg}" alt="" decoding="async" style="object-position:${p.crop || "50% 50%"}">`),
        { x: gx0 + c * (cs + GAP), y: yBot + (ROWS - 1 - r) * (cs + GAP), w: cs, h: cs });      // y is measured up from the floor, so row 0 is the top
      a.dataset.room = "gallery"; a.dataset.tip = "View"; a.dataset.gi = gi;
      a.setAttribute("aria-label", "View photo: " + p.alt);
    });
    // LIFE: one tall letter beside each row of canvases, just beyond the grid's far end
    const lifeW = 1.1, life = onWall(make("div", "nrp-life", right, "<span>L</span><span>I</span><span>F</span><span>E</span>"),
      { x: gx0 - GAP - lifeW, y: yBot, w: lifeW, h: yTop - yBot });
    life.style.fontSize = (cs * 0.95 * u) + "px"; life.style.rowGap = (GAP * u) + "px"; life.setAttribute("aria-hidden", "true");
    // (Oct 31: the track, its spotlights and their beams of light are gone. The canvases hang straight on the brick,
    //  so the wall reads as one brick wall and the ivy runs down it without a rail cutting across.)
    // GALLERY, on the floor line, slid toward the door until its near end meets the front (right-hand) edge of the
    // screen. The wall runs away from you in 3D, so the right spot depends on the screen's shape: placeGalleryWord()
    // finds it by measuring (see the end of build()).
    const gal = onWall(make("div", "nrp-galword", right, "GALLERY"), { x: 0, y: 0.12, w: 1, h: 1.1 }); gal.id = "nrp-gallery-word";
    gal.style.fontSize = (WORD_FS * u) + "px"; gal.style.width = "auto"; gal.style.whiteSpace = "nowrap"; gal.setAttribute("aria-hidden", "true");
    onWall(make("div", "nrp-wallshade nrp-wallshade-r", right), { x: 0, y: 0, w: Dm, h: HM });

    /* ---- THE FLOOR: daylight from the skylight, and shadows ---- */
    // (The Beni Ourain rug that lay under the lounge was taken out with the furniture, Oct 2026.)
    onFloor(make("div", "nrp-skyfloor", floor), { x: Wm * 0.2, z: 0.5, w: Wm * 0.6, d: Dm * 0.8 });      // daylight from the skylight, pooled down the middle
    onFloor(make("div", "nrp-floorshade", floor), { x: 0, z: 0.5, w: Wm, d: Dm });
    // These two big washes of light sit under the near slab too, or the floor would show a step in brightness
    // where the two slabs meet. Same size and position, just measured from the near slab's top edge.
    [["nrp-skyfloor", Wm * 0.2, Wm * 0.6, Dm * 0.8], ["nrp-floorshade", 0, Wm, Dm]].forEach(([cls, x, w, d]) => {
      const el = make("div", cls + " nrp-onfloor", $("nrp-floor-near"));
      Object.assign(el.style, { left: (x * u) + "px", top: ((DN - 0.5 * Dm) * u - (d * u) / 2) + "px", width: (w * u) + "px", height: (d * u) + "px" });
    });

    /* ---- THE ROOF: pitched glass in black steel, after Kathi's glass-roof photo, on a fall day ----
       Two sloping panes of glass meet at a ridge down the middle of the room, ROOF_PITCH degrees up from level.
       Each slope is one big painting (post-roof.js): the valley sky, red leaves lying on the glass and glowing
       with the sun behind them, the milky glass from her photo, a little mist, and the steel.
       How each slope is put in place (CSS, in 3D): it starts lying flat at the top of the wall like the old
       ceiling (rotateX -90°), then tips up along the wall (rotateZ), hinged on the wall's top edge. */
    const ROOF_PITCH = 22, th = ROOF_PITCH * Math.PI / 180;
    const rise = (Wm / 2) * Math.tan(th), slopeL = (Wm / 2) / Math.cos(th);              // how high the ridge is above the walls; how long each slope is
    roofH = xm => rise * (1 - Math.abs(xm - Wm / 2) / (Wm / 2));                        // the roof's height above the wall top, x metres from the left wall
    ceil.style.display = "none";                                                         // the old flat ceiling is not used any more
    const RS = Math.min(130, 2400 / Dm), key = [Wm.toFixed(2), Dm, RS].join("|");        // RS = pixels per metre the roof is painted at
    if (TILE.roofKey !== key) {
      // The leaves on the glass are the SAME colours as the ivy on the walls (IVY_PALETTE, from Kathi's ivy photo; the
      // ivy on the walls is grown in these colours by tools/grow-ivy.py). Each colour is listed as often as it is common.
      const o = { L: slopeL, D: Dm, s: RS, sky: TEX.view, glass: TEX.glass, ivy: null, palette: IVY_PALETTE };
      TILE.roofL = NRROOF.slope({ ...o, sunny: true, sun: [.6, .14], seed: 5 }); TILE.roofR = NRROOF.slope({ ...o, right: true, seed: 9 });
      TILE.gable = NRROOF.gable({ W: Wm, rise, s: RS, view: TEX.view, ivy: null, palette: o.palette });
      TILE.roofKey = key;
    }
    [[TILE.roofL, false], [TILE.roofR, true]].forEach(([cv, isR]) => {
      const el = add("nrp-roof", ""); el.appendChild(cv);
      Object.assign(el.style, { left: (isR ? Wr - slopeL * u : 0) + "px", top: "0px", width: (slopeL * u) + "px", height: D + "px",
        transformOrigin: isR ? "100% 0" : "0 0", transform: `rotateZ(${isR ? ROOF_PITCH : -ROOF_PITCH}deg) rotateX(-90deg)` });
    });
    const gab = add("nrp-gable", ""); gab.appendChild(TILE.gable);                          // the glass triangle above the café wall
    Object.assign(gab.style, { left: "0px", top: (-rise * u) + "px", width: Wr + "px", height: (rise * u) + "px", transform: `translateZ(${-D}px)` });
    // IVY crawling down from the top of both long walls, the whole length of each wall (one picture from Kathi's ivy
    // photo, repeated). It goes in FIRST on each wall, underneath everything else there, so the Gallery's photos,
    // the Newsstand and the wishes sit on top of it, as if the ivy grows behind and around them.
    [left, right].forEach(w => {
      const g = onWall(make("div", "nrp-greens", null), { x: 0, y: HM - TILE.planter.hm, w: Dm, h: TILE.planter.hm });
      w.insertBefore(g, w.firstChild);
      if (w === right) g.style.backgroundPositionX = (-2.3 * u) + "px";   // the right wall starts at a different spot, so the walls don't mirror each other
      g.style.backgroundImage = `url(${TILE.planter.url})`; g.style.backgroundSize = `${TILE.planter.wm * u}px ${TILE.planter.hm * u}px`;
    });

    /* ---- STANDING IN THE ROOM. LAYOUT: x across (0–1), z deep (0–1), sizes in metres ---- */
    // A CLUSTER OF EDISON BULBS on long black cords from the skylight. x = centre (0–1), z = depth,
    // w = how wide the cluster spreads (metres), drops = how far below the ceiling each bulb hangs (metres).
    function bulbCluster(id, x, z, w, drops) {
      // (For smooth scrolling: the bulbs are stamped onto a flat picture by paintBulbs(), and the cords are plain lines.
      //  They no longer "breathe" all the time, which kept the browser redrawing them every frame; they warm up once
      //  as you walk in.)
      const el = make("div", "nrp-bulbs nrp-built nrp-warmup", room), br = .085 * u, n = drops.length;
      const bulbs = drops.map((d, i) => ({ bx: (i + .5) / n * w * u + (hash(i, 7) - .5) * Math.min(.25, w / n * .4) * u, by: d * u, r: br * (1.4 + hash(i, 3) * .3) }));
      const cords = make("div", "", el);
      cords.innerHTML = `<svg width="${w * u}" height="${HM * u}" style="position:absolute;left:0;top:0;overflow:visible">${bulbs.map(b => {
        const up = roofH(x * Wm - w / 2 + b.bx / u) * u;                                // the cord runs all the way up to the glass
        return `<line x1="${b.bx.toFixed(1)}" y1="${(b.by - 2.2 * b.r).toFixed(1)}" x2="${b.bx.toFixed(1)}" y2="${(-up).toFixed(1)}" stroke="#141414" stroke-width="${(b.r * .09).toFixed(2)}"/>`; }).join("")}</svg>`;
      const lit = make("div", "", el), maxR = Math.max(...bulbs.map(b => b.r)), pad = Math.ceil(maxR * 4.4 * 1.3);
      const top = Math.min(...bulbs.map(b => b.by)) - pad, bottom = Math.max(...bulbs.map(b => b.by)) + pad;
      paintBulbs(lit, bulbs.map(b => ({ x: b.bx, y: b.by, r: b.r })), 1.3, -pad, top, w * u + 2 * pad, bottom - top);
      return stand(el, { x, z, w, h: HM });
    }
    // A painted picture standing in the room (w = width in metres; height follows the picture's shape)
    const put = (t, w, o) => { const h = w * t.ph / t.pw; return stand(add("nrp-painted", `<img src="${t.url}" alt="">`), { w, h, ...o }); };

    // NEBULA CAFE, in front of the arch: lights hanging from the skylight
    const ax = (aX + aW / 2) / Wm;
    // On the left, a cluster of Edison bulbs at different heights, kept between the left wall and the
    // NEBULA cafe neon so none hangs in front of the name. On the right, a raffia shade and a rattan bell.
    const textLeft = (Wm - nw) / 2, eL = 0.3, eR = textLeft - 0.2;
    bulbCluster("nrp-cl2", (eL + eR) / 2 / Wm, 0.84, eR - eL, narrow ? [2.7, 3.6, 3.0, 3.9] : [2.6, 3.5, 2.9, 4.0, 3.2]);
    [[0.12, 0.86, TILE.raffia, 0.66], [0.32, 0.79, TILE.bell, 0.5]].forEach(([dx, z, t, w]) => {
      const h = w * t.ph / t.pw, drop = 3.2 + (z - .8) * 4;                              // how far below the ceiling the shade hangs
      const p = stand(add("nrp-pendant", `<i></i><img src="${t.url}" alt="">`), { x: ax + dx, z, w, h: h + drop, lift: HM - drop - h }); p.style.setProperty("--drop", (drop * u) + "px");
      p.style.setProperty("--up", (roofH((ax + dx) * Wm) * u) + "px"); p.classList.add("nrp-sway", "nrp-hang"); p.style.setProperty("--d", (z * 1.4).toFixed(2) + "s");
    });


    // A BIRD OF PARADISE in a big basket
    // TWO BIRDS OF PARADISE in baskets, one tucked in each back corner: the right one is the left one flipped,
    // so they mirror each other either side of the café bar
    // LINE_X = how far out from the left wall the plant stands (m); the two benches stand on the same line.
    // The right-hand plant mirrors it.
    const bpw0 = narrow ? 1.0 : 1.3, bpw = bpw0 * 2.7 / 1.7, bpx = LINE_X / Wm;   // bpw0 = the basket-and-stalks width it was sized by
    [[bpx, false], [1 - bpx, true]].forEach(([x, flip], i) => {
      shadow(floor, { x, z: .96, w: bpw0 * .85, d: .9, a: .5 });
      const bp = put(TILE.bigA, bpw, { x, z: 0.975 });
      if (flip) bp.querySelector("img").style.transform = "scaleX(-1)";
      bp.classList.add("nrp-sway"); bp.style.setProperty("--d", (1.35 + i * .1) + "s");
    });

    // THE LOUNGE (back right): Kathi's low rattan L-sofa and tufted pouf, after her couch photo, built in 3D
    // (lounge3d(), above): the long side runs across the room with its back to the café, the short side runs
    // toward you with its back against the Gallery wall, the pouf stands out in front on the left.
    // A cluster of Edison bulbs hangs over the corner from the roof.
    // (it is built at the end of build(), once the word GALLERY has found its place, so the sofa can keep clear of it)
    // TWO SPECTATOR BENCHES along the left wall, running alongside it (turned 90°) so you sit facing the displays:
    // one centred on the Newsstand, one centred on the Wishing Wall. They stand on one line with the potted plant
    // at the back (LINE_X, set up with the plants above), far enough out from the wall to sit and take it all in,
    // and the middle of the room stays an open hallway from the door to Nebula.
    const gl = narrow ? 1.5 : 2.1;
    [newsX + newsW / 2, (newsEnd + Dm) / 2].forEach(along => bench3d(LINE_X / Wm, along / Dm, gl, 90));

    // THE CEILING FAN: one big black industrial fan, after Kathi's fan photo (Oct 2026; it replaced two smaller
    // three-blade fans). Six long slender blades that widen toward their tips, a small dark motor, and a thin rod
    // hanging all the way down from the ridge. It's built in real 3D (post.css): the blades lie flat, level with
    // the floor, and turn slowly about the rod, so you see them from below at an angle.
    // FAN_SPAN = how far it reaches, tip to tip (m). FAN_Y = how high above the floor the blades turn (m): raised from
    // 3.4 to 4.1 (Oct 31), a shorter rod, so the blades sit higher, above the bar and clear of the lounge's pendant.
    // FAN_Z = where it hangs, front to back (0 = the door, 1 = the café): forward enough that, seen from the door,
    // it floats above the NEBULA cafe sign instead of across it, and (Oct 31) from the landing view up high it hangs
    // below the "buy me a coffee" neon instead of across it.
    {
      const FAN_SPAN = narrow ? 2.7 : 3.4, FAN_Y = 4.1, FAN_Z = narrow ? .22 : .1, ridge = HM + roofH(Wm / 2), h = ridge - FAN_Y;
      const fan = stand(add("nrp-fan", `<i class="nrp-fan-rod"></i><div class="nrp-fan-blades"><div class="nrp-fan-spin">${"<b></b>".repeat(6)}</div></div><i class="nrp-fan-motor"></i>`),
        { x: .5, z: FAN_Z, w: FAN_SPAN, h, lift: FAN_Y });
      const bl = fan.querySelector(".nrp-fan-blades");
      Object.assign(bl.style, { width: FAN_SPAN * u + "px", height: FAN_SPAN * u + "px", left: "0px", top: (h * u - FAN_SPAN * u / 2 - .1 * u) + "px" });
    }

    placeGalleryWord();
    // THE LOUNGE (Oct 31, 2026): the L-sofa, pouf and rug built here are gone. The new lounge is Kathi's own lounge
    // photo (green floor sofa, jute rug and pouf, rattan pendant, plants), cut out and set into THE POST's photograph
    // by tools/bake-post.js. lounge3d() above is kept only as a record; it is no longer called.
    // THE RIGHT-HAND EDISON BULBS hang back by the café now, in front of the arch's right side, to the right of the
    // NEBULA neon (they used to hang out over the lounge, in front of the Gallery). The left cluster mirrors them.
    // THE LOUNGE: Kathi's lounge photo, cut into layers by tools/cut-lounge.py, each put back in the room at its own
    // distance, so everything stands on the floor (Oct 31; it used to be one upright picture, which looked raised from
    // low down: the rug filled its bottom metre, so the sofa stood on top of it):
    //   the rug lies flat on the floor; the sofa's long run, its short run (the L), the coffee table and the pouf each
    //   stand upright at the distance where their feet touch the floor.
    // THE PHOTO'S CAMERA (the same numbers as in cut-lounge.py): FOCAL = pixels per metre 1 m away, HORIZON = the photo
    // row level with the camera, CAM_H = its height (m), CX = the column straight ahead. A spot on the floor at photo row
    // y is DIST(y) metres from that camera; something there that is p pixels wide is p x DIST / FOCAL metres wide.
    // PUTTING THE PHOTO IN THE ROOM: LS = its size (1.15 = a little bigger than life; the phone corridor is narrower,
    //   so 0.9 there); the short run's near end stands just past the end of the Gallery (ZN m from the door), so the
    //   Gallery keeps its open standing room; ZB = where the sofa's long run stands; the short run's near end is against
    //   the black wall. A spot DIST metres from the photo's camera stands at ZC + LS x DIST metres from the door.
    // The numbers in [ ] are the part of her photo each layer came from (left, top, right, bottom, in its pixels), and
    // "base" is the photo row where it touches the floor.
    {
      const FOCAL = 688, HORIZON = 390, CAM_H = .888, CX = 368, DIST = y => FOCAL * CAM_H / (y - HORIZON);
      const LS = narrow ? .9 : 1.15, ZN = narrow ? Dm - 6.9 : 7.4, ZC = ZN - LS * DIST(645), ZB = ZC + LS * DIST(552);
      const X0 = Wm - .05 - LS * (726 - CX) * DIST(645) / FOCAL;          // the room x of the photo's centre line
      const LZ = IMG + "post/lounge-";
      const layer = (file, box, base, o = {}) => {
        const d = DIST(base), k = LS * d / FOCAL;                         // k = metres per photo pixel, at that distance
        const w = (box[2] - box[0]) * k, h = (box[3] - box[1]) * k, left = X0 + (box[0] - CX) * k;
        const el = stand(add("nrp-painted nrp-lounge-photo", `<img src="${LZ}${file}" alt="">`),
          { x: (left + w / 2) / Wm, z: (ZC + LS * d) / Dm, w, h, lift: -(box[3] - base) * k, ...o });
        return { el, x: left + w / 2, z: ZC + LS * d, w, d };
      };
      // 1 · THE RUG, flat on the floor: cut-lounge.py made it as seen from straight above, 2.32 m across (photo x
      //     -1.55 .. 0.77 m from its centre line) and 2.13 m from its front edge (DIST 1.87) back under the sofa (4.0).
      //     The floor is two slabs (see onFloor), so it is laid on both, at the same spot; each shows its own part.
      const rx0 = X0 - LS * 1.55, rw = LS * 2.32, rz0 = ZC + LS * DIST(717), rz1 = ZC + LS * 4.0;
      [[floor, Dm], [$("nrp-floor-near"), DN]].forEach(([slab, edge]) => {
        const el = make("div", "nrp-onfloor nrp-lounge-rug", slab, `<img src="${LZ}rug.webp" alt="" style="display:block;width:100%;height:100%">`);
        Object.assign(el.style, { left: rx0 * u + "px", top: (edge - rz1) * u + "px", width: rw * u + "px", height: (rz1 - rz0) * u + "px" });
      });
      // 2 · the sofa's long run, the coffee table, the short run, the pouf (back to front)
      const sofa = layer("sofa.webp", [90, 230, 700, 553], 552);
      const table = layer("table.webp", [170, 390, 460, 603], 601);
      const run = layer("return.webp", [480, 400, 736, 650], 645);
      const pouf = layer("pouf.webp", [18, 524, 218, 662], 660);
      // soft shadows where each touches the floor (on the rug)
      shadow(floor, { x: sofa.x / Wm, z: (sofa.z - .25) / Dm, w: sofa.w * .9, d: .6, a: .55 });
      shadow(floor, { x: (Wm - .5) / Wm, z: (run.z + .5) / Dm, w: .9, d: 1.6, a: .5 });
      shadow(floor, { x: table.x / Wm, z: table.z / Dm, w: table.w * .9, d: .7, a: .35 });
      shadow(floor, { x: pouf.x / Wm, z: pouf.z / Dm, w: pouf.w * 1.1, d: .5, a: .55 });
      // 3 · the rattan pendant over the coffee table. PEND_LOW = how high its bottom hangs (m): a little lower than in
      //     the photo, so from the door it hangs below the ceiling fan's blades, not across them. Its cord runs up to the roof.
      const PEND_LOW = 2.0, pk = LS * table.d / FOCAL, pX = X0 + (367 - CX) * pk, pH = 234 * pk, pZ = table.z / Dm;
      stand(add("nrp-painted nrp-lounge-photo", `<img src="${TILE.loungePendant.url}" alt="">`), { x: pX / Wm, z: pZ, w: 102 * pk, h: pH, lift: PEND_LOW });
      const cord = stand(add("nrp-lounge-cord nrp-lounge-photo", ""), { x: pX / Wm, z: pZ, w: .014, h: HM + roofH(pX) - PEND_LOW - pH + .05, lift: PEND_LOW + pH - .05 });
      cord.style.background = "#1b1a19";
      const LOUNGE_D = run.z;                                            // (the plant and the bulbs below are placed from here)
      // 3 · THE PINK PLANT (Oct 31), at the open end of the L, against the black wall, a little in front of the sofa:
      //     its leaves hide the end of the sofa, where the photo runs out. (It replaces the small potted plant from the
      //     photo.) After Kathi's reference: pink heart-shaped leaves with green edges and rose veins, in a white pot
      //     with bold black lines. It's a 3D render (tools/render-monstera.py), photographed at MON.m metres per pixel,
      //     with its pot's middle MON.pot pixels in from its left edge. MON_K = how big it stands compared with the render
      //     (1 = its true size, about 1.6 m tall; 0.8 = about 1.3 m); MON_X = how far its pot's middle is from the black wall (m): just far
      //     enough that its widest leaf reaches the wall without poking through it (which would cut the leaf off).
      const MON = TILE.monstera, MON_K = narrow ? .68 : .8, MON_X = MON.reach * MON_K + .05;
      const mw = MON.pw * MON.m * MON_K, mh = MON.ph * MON.m * MON_K, mx = Wm - MON_X - MON.pot * MON.m * MON_K + mw / 2;
      stand(add("nrp-painted nrp-lounge-photo", `<img src="${MON.url}" alt="">`), { x: mx / Wm, z: (LOUNGE_D - .35) / Dm, w: mw, h: mh });   // (just in front of the short run's near end: from the door its leaves cover it)
      // THE EDISON BULBS hang over the sofa's corner, in front of the plain black brick (not the Gallery):
      // a cluster 0.8 m wide, 0.35 m in from the wall (clear of the pendant). Five bulbs at the same uneven heights as
      // the cluster left of NEBULA (the same drops, each 1.5 m longer, so they hang over the sofa below the fan's
      // blades): 1.7 to 3.1 m off the floor. (drops = metres below the ceiling)
      // Their glow is faded out before it reaches the wall (a glow that ran on past the wall was cut off by it in a hard
      // line), and a soft warm patch is laid on the wall itself, as if the bulbs light it.
      const cl = bulbCluster("nrp-cl", (Wm - .75) / Wm, (sofa.z - .9) / Dm, .8, [2.6, 3.5, 2.9, 4.0, 3.2].map(d => d + 1.5));   // (over the corner of the L)
      const glow = cl.querySelector("canvas");
      if (glow) glow.style.maskImage = glow.style.webkitMaskImage = "linear-gradient(to right, #000 71%, transparent 82%)";
      onWall(make("div", "nrp-wallglow", $("nrp-right")), { x: Dm - (sofa.z - .9) - 1.4, y: .9, w: 2.8, h: 2.8 });
    }
    wire();
  }

  /* ================================================================
     STEP 6 · WHAT CLICKING DOES
     A room with an address in data.js opens it (fading through white,
     like the storefront doors). A room with no address yet shows a note.
     ================================================================ */
  const toastEl = $("nrp-toast"); let toastTimer;
  function toast(msg) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 2800); }
  const byKey = {}; DATA.ROOMS.forEach(rm => (byKey[rm.key] = rm));
  function go(href) {
    if (reduceMotion) { location.href = href; return; }
    root.classList.add("leaving");
    try { sessionStorage.setItem("nr-light", "1"); } catch (e) {}
    setTimeout(() => (location.href = href), 700);
  }
  function wire() {
    root.querySelectorAll("[data-room]").forEach(a => {
      // The Gallery opens in the viewer (below) instead of going to another page: a frame opens its own
      // photo; anything else marked "gallery" (the directory panel) opens the first one.
      if (a.dataset.room === "wishingWall") {                       // the Wishing Wall opens full screen (below)
        if (a.tagName === "A") a.href = "#";
        a.onclick = e => { e.preventDefault(); openWall(a); };
        return;
      }
      if (a.dataset.room === "gallery") {
        if (a.tagName === "A") a.href = "#";
        a.onclick = e => { e.preventDefault(); openPhoto(+(a.dataset.gi || 0), a); };
        return;
      }
      const rm = byKey[a.dataset.room]; if (!rm) return;
      if (a.tagName === "A") a.href = rm.href || "#";
      // an address on another website (like the café's Buy Me a Coffee page) opens in a new tab, so THE POST stays open
      if (/^https?:/.test(rm.href || "")) { if (a.tagName === "A") { a.target = "_blank"; a.rel = "noopener"; } a.onclick = null; return; }
      a.onclick = e => { e.preventDefault(); if (rm.href) go(rm.href); else toast(`${rm.label}: opening soon.`); };
    });
    root.querySelectorAll("a.nrp-door").forEach(a => (a.onclick = e => { e.preventDefault(); go(a.getAttribute("href")); }));
  }
  addEventListener("pageshow", () => root.classList.remove("leaving"));

  /* ================================================================
     STEP 6A · THE WISHING WALL, UP CLOSE (the popup)
     Click the wishes (or WISHING / WALL) and the popup shows the wall flat, straight on: the same stretch of
     wall as in the room (the Newsstand to the corner by the café), floor to ceiling.
       · The cowboy mural runs floor to ceiling.
       · Every wish is a block of words, built around him wherever his outline leaves room. Like the
         type-specimen wallpaper Kathi chose, but with the words running across: a block is only turned on its
         side when its words can't fit any other way. No frames or lines.
       · WISHING / WALL, in Impact, stand on the floor line beside him.
     The popup opens showing the whole wall; click (or tap) it to zoom in and read, click again to see it all.
     (The wall is the size it is in the room, so the words are as big as that space allows: all the wishes and
      names come out the same smallest size, and the shorter wishes bigger.)

     HOW IT IS LAID OUT (wallLayout(), below), in five steps:
       1. Measure how much wall each wish needs at a given smallest letter size.
       2. Map the wall on a grid of 10 cm squares and mark the squares the cowboy's paint covers (read from the
          stencil picture itself), keeping 20 cm clear of it, plus the ivy at the top and the floor strip.
       3. Cut the free squares into the biggest rectangles it can find (the "carve" step), and put WISHING / WALL
          in the free space on the floor line.
       4. Share the wishes out between the rectangles, then split each rectangle into near-square blocks, one per
          wish, sized by how much it needs (a "squarified treemap", the usual way to cut a box into squares).
       5. Make each block's words as big as fit. If a wish comes out too small, give it a bigger block and lay
          it all out again; if there still isn't room, make every letter a little smaller and try again.
     It is worked out once, at 100 pixels to the metre, while you look around the room, then sized to fit your
     screen (so it never has to be worked out again).
     ================================================================ */
  const READ = {
    width: 9.5,      // metres: the Wishing Wall section's width if the room hasn't been measured yet (it is
                     // really the Newsstand's end to the corner by the café: 9.5 m on a computer, wider on a phone)
    height: 7.2,     // floor to ceiling, as in the room (HM)
    letter: .1,      // the first try at the smallest letters (a small letter's height; a capital's in ALL-CAPS wishes).
                     // It comes down 4% at a time until every wish fits; WHOLENESS's letters in the room are .14 m
    stem: .18,       // the thinnest pen stroke, as a share of the smallest letters' height (WHOLENESS's share)
    bold: 1.3,       // a **word** is painted this many times bigger than the rest of its wish
    gap: .14,        // the bare wall between two blocks
    clear: .2,       // how far the words keep from the cowboy's paint
    ivy: .7,         // the strip at the top where the ivy hangs (no words there)
    floor: .15,      // the strip along the floor (no words there)
    base: .1,        // the cowboy's feet are this far above the floor; his hat reaches the ceiling
    under: 1.05,     // when a wish goes under the mural (place: "under" in data.js), the cowboy is raised this much
                     // more, and that wish is painted centred in the strip it leaves, across the middle of his body
    underSpan: [.02, .82],   // the part of the stencil picture (left to right, 0 to 1) the cowboy's paint covers
    minA: 1.2, minB: .8,    // the smallest space a block can go in: 1.2 m one way, 0.8 m the other
    title: 2.8,      // WISHING / WALL are at most this wide
    aspect: 1.5,     // the blocks aim to be this many times wider than tall (so the words can run across)
    zoom: 16         // zoomed in, the smallest letters are this many pixels tall on screen
  };
  const PX = 100;    // pixels to the metre, while it is laid out
  const CELL = .1;   // the grid's squares, in metres

  // The cowboy stencil, read pixel by pixel: how much of any part of the picture has paint on it.
  // (A "summed-area table": each entry holds the paint count of everything above and to the left of it, so the
  //  paint in any rectangle is found with four look-ups instead of counting every pixel.)
  function stencilInk(img) {
    const w = img.naturalWidth, h = img.naturalHeight, cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0);
    const a = cx.getImageData(0, 0, w, h).data, S = new Uint32Array((w + 1) * (h + 1));
    for (let y = 0; y < h; y++) { let row = 0;
      for (let x = 0; x < w; x++) { row += a[(y * w + x) * 4 + 3] > 60 ? 1 : 0; S[(y + 1) * (w + 1) + x + 1] = S[y * (w + 1) + x + 1] + row; } }
    // the share of pixels with paint in the picture's rectangle (u0..u1 across, v0..v1 down, each 0 to 1)
    return (u0, v0, u1, v1) => {
      const x0 = Math.max(0, Math.floor(u0 * w)), x1 = Math.min(w, Math.max(x0 + 1, Math.ceil(u1 * w)));
      const y0 = Math.max(0, Math.floor(v0 * h)), y1 = Math.min(h, Math.max(y0 + 1, Math.ceil(v1 * h)));
      if (x1 <= x0 || y1 <= y0) return 0;
      const W1 = w + 1, n = S[y1 * W1 + x1] - S[y0 * W1 + x1] - S[y1 * W1 + x0] + S[y0 * W1 + x0];
      return n / ((x1 - x0) * (y1 - y0));
    };
  }

  // Step 2: the grid. 1 = free wall, 0 = paint (or too near it), the ivy strip or the floor strip.
  // Rows count down from the top of the wall; columns count across from the left.
  function freeGrid(H, cow, ink) {
    const R = Math.round(H / CELL), C = Math.round(READ.width / CELL), g = new Uint8Array(R * C);
    const top = H - cow.y - cow.h;                                   // the top of the cowboy's picture, from the top of the wall
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const v0 = (r * CELL - top) / cow.h, v1 = ((r + 1) * CELL - top) / cow.h, u0 = (c * CELL - cow.x) / cow.w, u1 = ((c + 1) * CELL - cow.x) / cow.w;
      g[r * C + c] = (v1 <= 0 || v0 >= 1 || u1 <= 0 || u0 >= 1 || ink(u0, v0, u1, v1) <= .1) ? 1 : 0;
    }
    // tidy the paint: ignore lone specks (shrink the paint by one square, then grow it back), then keep a margin
    const grow = (src, paint) => { const out = src.slice(); for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const i = r * C + c; if (src[i] !== paint) continue;
      if (r > 0) out[i - C] = paint; if (r < R - 1) out[i + C] = paint; if (c > 0) out[i - 1] = paint; if (c < C - 1) out[i + 1] = paint; } return out; };
    let f = grow(g, 1); f = grow(f, 0);                              // specks gone
    for (let k = 0; k < Math.round(READ.clear / CELL); k++) f = grow(f, 0);   // the clear margin round the paint
    for (let r = 0; r < R; r++) if (r < READ.ivy / CELL || r >= R - READ.floor / CELL) for (let c = 0; c < C; c++) f[r * C + c] = 0;
    return { f, R, C };
  }
  // Step 3: the biggest free rectangle on the grid (at least minA × minB squares, either way round).
  // The classic "largest rectangle in a histogram", row by row: h[c] = how many free squares stack up above.
  function biggestRect(G, minA, minB) {
    const { f, R, C } = G, h = new Int32Array(C); let best = null, bestA = 0;
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) h[c] = f[r * C + c] ? h[c] + 1 : 0;
      const st = [];
      for (let c = 0; c <= C; c++) {
        const cur = c < C ? h[c] : 0; let start = c;
        while (st.length && st[st.length - 1][1] >= cur) {
          const [s, hh] = st.pop(), w = c - s;
          if (w * hh > bestA && ((w >= minA && hh >= minB) || (w >= minB && hh >= minA))) { bestA = w * hh; best = { r0: r - hh + 1, c0: s, h: hh, w }; }
          start = s;
        }
        st.push([start, cur]);
      }
    }
    return best;
  }
  const takeCells = (G, r0, c0, h, w, m) => {                         // mark a rectangle (and a margin m round it) as used
    for (let r = Math.max(0, r0 - m); r < Math.min(G.R, r0 + h + m); r++) for (let c = Math.max(0, c0 - m); c < Math.min(G.C, c0 + w + m); c++) G.f[r * G.C + c] = 0; };
  function carve(G) {
    const out = [], a = Math.round(READ.minA / CELL), b = Math.round(READ.minB / CELL);
    for (let rect; (rect = biggestRect(G, a, b));) { out.push(rect); takeCells(G, rect.r0, rect.c0, rect.h, rect.w, 1); }
    return out;
  }
  // Step 4b: cut a rectangle into near-square blocks, one per wish, each sized by its weight ("squarified treemap").
  function squarify(items, r) {
    if (!items.length) return [];
    const out = [], total = items.reduce((t, q) => t + q._w, 0), k = r.w * r.h / total;
    let rest = items.map(q => ({ q, a: q._w * k })), rect = { ...r };
    const worst = (row, side) => { const s = row.reduce((t, i) => t + i.a, 0); return Math.max(...row.map(i => Math.max(side * side * i.a / (s * s), (s * s) / (side * side * i.a)))); };
    while (rest.length) {
      const side = Math.min(rect.w, rect.h); let row = [rest[0]], i = 1;
      while (i < rest.length && worst([...row, rest[i]], side) <= worst(row, side)) { row.push(rest[i]); i++; }
      rest = rest.slice(i);
      const s = row.reduce((t, i) => t + i.a, 0);
      if (rect.w >= rect.h) {                                        // the row stands as a column down the left
        const cw = s / rect.h; let y = rect.y;
        row.forEach(it => { const ch = it.a / cw; out.push({ q: it.q, x: rect.x, y, w: cw, h: ch }); y += ch; });
        rect = { x: rect.x + cw, y: rect.y, w: rect.w - cw, h: rect.h };
      } else {                                                       // the row lies along the top
        const rh = s / rect.w; let x = rect.x;
        row.forEach(it => { const cw = it.a / rh; out.push({ q: it.q, x, y: rect.y, w: cw, h: rh }); x += cw; });
        rect = { x: rect.x, y: rect.y + rh, w: rect.w, h: rect.h - rh };
      }
    }
    return out;
  }

  // THE WHOLE LAYOUT. Returns the finished wall (an element, PX pixels to the metre) and its size.
  async function wallLayout(width) {
    const R = READ, W = width || R.width, list = DATA.WISHES || [], pause = () => new Promise(r => setTimeout(r, 0));
    const stencil = await load(IMG + "post/stencil.webp"); if (!stencil) return null;
    await document.fonts.load('100px Impact, Anton').catch(() => {});
    const ink = stencilInk(stencil), AR = stencil.naturalWidth / stencil.naturalHeight;
    const wall = make("div", "nrwv-wall", document.body);           // built off screen, then moved into the popup
    Object.assign(wall.style, { visibility: "hidden", left: "-99999px", top: "0px", width: (W * PX) + "px" });
    wall.style.setProperty("--bold-k", R.bold);

    // 1. What each wish needs: its words on one line at the smallest size, times the line's height, plus its name.
    //    (Measured with letters 1 m tall; at any other size L it needs that times L × L.)
    let L = 1;                                                       // the smallest letters' height, in metres
    const ht = q => q.case === "up" ? fontOf(q).cap : fontOf(q).xh;
    const minFs = q => L / ht(q), byFs = q => L / fontOf(q).xh;
    const words = q => esc(caseOf(q.wish, q.case)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    const signed = q => "— " + esc(q.name) + (q.human === false ? "" : ", " + esc(q.title || "Human"));   // (human: false in data.js = the name alone; title: "..." in place of "Human")
    const probe = make("div", "nrwv-probe", wall);
    list.forEach(q => {
      const f = fontOf(q);
      probe.innerHTML = `<span style="font:${minFs(q) * PX}px/${f.lh} '${q.font}';word-spacing:${f.ws}em">${words(q)}</span> <span style="font:${byFs(q) * PX}px/${f.lh} '${q.font}'">${signed(q)}</span>`;
      const [a, b] = probe.children;
      q._unit = (a.offsetWidth * minFs(q) * f.lh + b.offsetWidth * byFs(q) * f.lh) / PX;   // square metres, at L = 1
    });
    // WISHING / WALL: how wide each word is at a size of 1 m (so it can be sized to fill the title's width)
    probe.innerHTML = `<span class="nrwv-title">WISHING</span><span class="nrwv-title">WALL</span>`;
    [...probe.children].forEach(s => Object.assign(s.style, { fontSize: PX + "px", display: "inline-block" }));
    const tw = [...probe.children].map(s => s.offsetWidth / PX);
    probe.remove();

    // 5. Fill one block: the words as big as fit (found by halving the range 13 times), the name underneath at the
    //    smallest size. The words run across (horizontal). Only if they can't reach the smallest size that way,
    //    and turning them on their side (reading upward) does better, is the block turned: vertical only when needed.
    function fill(bk, allowUp) {
      const q = bk.q, f = fontOf(q), g2 = R.gap / 2, el = make("div", "nrwv-block", wall);
      const bw = bk.w - R.gap, bh = bk.h - R.gap;
      Object.assign(el.style, { left: (bk.x + g2) * PX + "px", top: (bk.y + g2) * PX + "px", width: bw * PX + "px", height: bh * PX + "px" });
      const inner = make("div", "nrwv-in", el);
      inner.innerHTML = `<div class="nrwv-words">${words(q)}</div><div class="nrwv-name">${signed(q)}</div>`;
      if (q.place === "under") el.classList.add("under");             // (centred, like a caption)
      const wd = inner.firstChild, nm = inner.lastChild, nfs = byFs(q), fmin = minFs(q);
      Object.assign(nm.style, { font: `${nfs * PX}px/${f.lh} "${q.font}"`, wordSpacing: f.ws + "em" });
      nm.style.setProperty("--bold", thicken(q, nfs * PX, R.stem * L * PX) + "px");
      const set = fs => { Object.assign(wd.style, { font: `${fs * PX}px/${f.lh} "${q.font}"`, wordSpacing: f.ws + "em" }); wd.style.setProperty("--bold", thicken(q, fs * PX, R.stem * L * PX) + "px"); };
      const fits = () => wd.offsetHeight + nm.offsetHeight <= inner.clientHeight && wd.scrollWidth <= wd.clientWidth + 1 && nm.scrollWidth <= nm.clientWidth + 1;
      const orient = up => {                                        // lay the block out one way round; returns how big the words got
        inner.classList.toggle("up", up);
        Object.assign(inner.style, { width: (up ? bh : bw) * PX + "px", height: (up ? bw : bh) * PX + "px", top: (up ? bh * PX : 0) + "px" });
        let lo = fmin * .4, hi = fmin * 6;
        for (let i = 0; i < 13; i++) { const m = (lo + hi) / 2; set(m); if (fits()) lo = m; else hi = m; }
        set(lo); return fits() ? lo / fmin : 0;
      };
      const across = orient(false);
      if (across >= 1 || !allowUp) return { q, k: across, up: false };
      const upward = orient(true);
      if (upward > across) return { q, k: upward, up: true };
      orient(false); return { q, k: across, up: false };
    }

    // 2-5 at the current letter size L. Returns the blocks' results, or null if the wishes can't all be given a space.
    const H = R.height; let title;
    // the wishes painted under the mural, and the rest (laid out around him)
    const under = list.filter(q => q.place === "under"), around = list.filter(q => q.place !== "under");
    const lift = under.length ? R.under : 0;
    const cow = { y: R.base + lift, h: H - R.base - lift }; cow.w = cow.h * AR; cow.x = (W - cow.w) / 2;   // the cowboy: up to the ceiling, in the middle
    // the strip under him: across the middle of his body, from the floor strip up to his feet (y counts down from the top)
    const ub = { x: cow.x + R.underSpan[0] * cow.w, w: (R.underSpan[1] - R.underSpan[0]) * cow.w, y: H - cow.y, h: cow.y - R.floor };
    function attempt(allowUp) {
      [...wall.querySelectorAll(".nrwv-block")].forEach(n => n.remove());
      const G = freeGrid(H, cow, ink);
      // WISHING / WALL stand on the floor line, in the free space nearest the right-hand edge, as wide as fits
      // (at most R.title): each word sized to fill that width, so the shorter WALL comes out bigger.
      title = null;
      const rB = G.R - Math.round(R.floor / CELL);                   // the first row of the floor strip
      if (under.length) takeCells(G, Math.floor(ub.y / CELL), Math.floor(ub.x / CELL), Math.ceil(ub.h / CELL), Math.ceil(ub.w / CELL), 1);   // (keep the strip under him for his caption)
      const isFree = (r0, r1, c0, c1) => { for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) if (!G.f[r * G.C + c]) return false; return true; };
      for (let tW = R.title; tW >= 1.2 && !title; tW -= .1) {
        const fs1 = tW / tw[0], fs2 = tW / tw[1], tH = (fs1 + fs2) * .86 + .06, cw = Math.ceil(tW / CELL), ch = Math.ceil(tH / CELL);
        for (let c0 = G.C - cw - 1; c0 >= 0; c0--) if (isFree(rB - ch, rB, c0, c0 + cw)) { title = { x: c0 * CELL, w: tW, fs1, fs2, h: tH }; takeCells(G, rB - ch, c0, ch, cw, 2); break; }
      }
      // (no room on the floor? then they go at the top left, under the ivy)
      for (let tW = R.title, r0 = Math.round(R.ivy / CELL); !title && tW >= 1.2; tW -= .1) {
        const fs1 = tW / tw[0], fs2 = tW / tw[1], tH = (fs1 + fs2) * .86 + .06, cw = Math.ceil(tW / CELL), ch = Math.ceil(tH / CELL);
        if (isFree(r0, r0 + ch, 1, 1 + cw)) { title = { x: CELL, w: tW, fs1, fs2, h: tH, top: r0 * CELL }; takeCells(G, r0, 1, ch, cw, 2); }
      }
      if (!title) return null;
      const rects = carve(G).map(r => ({ x: r.c0 * CELL, y: r.r0 * CELL, w: r.w * CELL, h: r.h * CELL, items: [], left: 0 }));
      rects.forEach(r => (r.left = r.w * r.h));
      // share the wishes out: the biggest first, each to the rectangle with the most room left
      for (const q of around.slice().sort((a, b) => b._w - a._w)) {
        const r = rects.reduce((best, r) => (!best || r.left > best.left ? r : best), null);
        if (!r || r.left < q._w) return null;
        r.items.push(q); r.left -= q._w;
      }
      rects.forEach(r => r.items.sort((a, b) => list.indexOf(a) - list.indexOf(b)));
      // (the treemap makes squares; drawing it on a wall stretched R.aspect times taller and squashing it back
      //  turns them into blocks R.aspect times wider than tall, the shape words running across fill best)
      const a = R.aspect, wide = r => squarify(r.items, { x: r.x, y: r.y * a, w: r.w, h: r.h * a }).map(b => ({ ...b, y: b.y / a, h: b.h / a }));
      // the wishes under the mural share its strip, side by side
      const underBlocks = under.map((q, i) => ({ q, x: ub.x + ub.w * i / under.length, y: ub.y, w: ub.w / under.length, h: ub.h }));
      return [...rects.flatMap(wide), ...underBlocks].map(bk => fill(bk, allowUp && bk.q.place !== "under"));
    }
    // Start with letters R.letter tall and every block a bit bigger than its words need. Then, all words running
    // across: grow the blocks that came out too small and lay it out again (up to 6 tries). Still not there? Let the
    // blocks that need it turn on their side (6 more tries). Still not? Make every letter 4% smaller and start
    // again. And if the wishes don't all get a space at all, the letters get smaller straight away.
    const scaleTo = v => { list.forEach(q => (q._w = (q._w || q._unit * 1.8 * L * L) * (v / L) ** 2)); L = v; };
    list.forEach(q => (q._w = 0)); scaleTo(R.letter);
    let done = false, allowUp = false;
    for (let round = 0, tries = 0; round < 200 && !done; round++) {
      const res = attempt(allowUp);
      if (res && res.every(r => r.k >= 1)) { done = true; break; }
      if (!res) { scaleTo(L * .96); tries = 0; allowUp = false; continue; }
      if (++tries > 6) { tries = 0; if (!allowUp) allowUp = true; else { scaleTo(L * .96); allowUp = false; continue; } }
      res.filter(r => r.k < 1).forEach(r => (r.q._w *= r.k ? Math.min(2.2, Math.max(1.06, 1.03 / (r.k * r.k))) : 1.5));
      await pause();                                                 // let the room breathe while it works
    }
    if (!done) { wall.remove(); return null; }                      // (it never found a layout: the popup keeps its "Painting the wall…" note)

    // The wall itself: the same white brick and ivy as the room, the cowboy, WISHING / WALL.
    Object.assign(wall.style, { height: (H * PX) + "px", backgroundImage: `url(${TILE.white.url})`,
      backgroundSize: `${TILE.white.wm * PX}px ${TILE.white.hm * PX}px`, backgroundPosition: "0 100%" });
    const ivy = make("div", "nrp-greens", null); wall.insertBefore(ivy, wall.firstChild);
    Object.assign(ivy.style, { left: 0, top: (R.ivy - TILE.planter.hm) * PX + "px", width: W * PX + "px", height: TILE.planter.hm * PX + "px",
      backgroundImage: `url(${TILE.planter.url})`, backgroundSize: `${TILE.planter.wm * PX}px ${TILE.planter.hm * PX}px` });
    const art = make("div", "nrp-graffiti", wall, `<img src="${IMG}post/stencil.webp" alt="Stencil graffiti of a cowboy holding a rifle">`);
    Object.assign(art.style, { left: cow.x * PX + "px", top: (H - cow.y - cow.h) * PX + "px", width: cow.w * PX + "px", height: cow.h * PX + "px" });
    const t = make("div", "nrwv-titles", wall, `<span class="nrwv-title">WISHING</span><span class="nrwv-title">WALL</span>`);
    Object.assign(t.style, { left: title.x * PX + "px", top: (title.top != null ? title.top : H - R.floor - title.h) * PX + "px", width: title.w * PX + "px" });
    t.children[0].style.fontSize = title.fs1 * PX + "px"; t.children[1].style.fontSize = title.fs2 * PX + "px";
    t.style.gap = (.06 * PX) + "px";
    return { el: wall, w: W * PX, h: H * PX, L };
  }
  // The layout for the wall as wide as the room's Wishing Wall section (SECTION, set by build()). Each width is
  // worked out once and kept (a phone's room is longer than a computer's, so its section is wider).
  let SECTION = null, buildNo = 0, wallReady = null;
  const wallCache = new Map();
  const prepareWall = () => { const w = +((SECTION && SECTION.w) || READ.width).toFixed(2);
    if (!wallCache.has(w)) wallCache.set(w, wallLayout(w)); return (wallReady = wallCache.get(w)); };
  // Paint the room's own wall: a copy of the laid-out wall (all but its ivy: the room has its own), placed on the
  // left wall at the section and shrunk from 100 pixels to the metre to the room's scale, fading in.
  function paintRoomWall(left, n) {
    setTimeout(() => prepareWall().then(res => {
      if (!res || n !== buildNo || !left.isConnected) return;       // (the room has been rebuilt since: skip)
      const c = make("div", "nrwv-wall nrp-wishwall", null);
      [...res.el.children].forEach(ch => { if (!ch.classList.contains("nrp-greens")) c.appendChild(ch.cloneNode(true)); });
      Object.assign(c.style, { left: SECTION.x * u + "px", top: (HM - READ.height) * u + "px", width: res.w + "px", height: res.h + "px", transform: `scale(${u / PX})` });
      c.style.setProperty("--bold-k", READ.bold);
      left.insertBefore(c, left.querySelector(".nrp-wallhot"));
      requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add("on")));
    }), 400);
  }

  let wv = null, wvOpener = null, wvZoom = false;
  const coarse = matchMedia("(pointer: coarse)").matches;          // a touch screen (a phone or tablet)
  function openWall(opener) {
    wvOpener = opener;
    if (!wv) {
      wv = make("div", "nrwv", document.body, `<button class="nrlb-btn nrlb-close" type="button" aria-label="Close">×</button><div class="nrwv-scroll"><div class="nrwv-frame"><p class="nrwv-wait">Painting the wall…</p></div></div><p class="nrwv-hint" aria-hidden="true">${coarse ? "Tap" : "Click"} the wall to zoom in</p>`);
      wv.setAttribute("role", "dialog"); wv.setAttribute("aria-modal", "true"); wv.setAttribute("aria-label", "The Wishing Wall");
      wv.querySelector(".nrlb-close").onclick = closeWall;
      wv.addEventListener("click", e => { if (e.target === wv || e.target.classList.contains("nrwv-scroll")) closeWall(); });
      // click (or tap) the wall: zoom in on that spot to read; again: back to the whole wall
      wv.querySelector(".nrwv-frame").addEventListener("click", e => {
        if (!wallReady) return;
        wallReady.then(res => { if (!res) return;
          wvZoom = !wvZoom; showWall(res, e);
          const hint = wv.querySelector(".nrwv-hint");
          hint.textContent = wvZoom ? `${coarse ? "Tap" : "Click"} again to see the whole wall` : `${coarse ? "Tap" : "Click"} the wall to zoom in`;
        });
      });
    }
    wvZoom = false;
    wv.hidden = false; document.documentElement.classList.add("nrlb-open");
    wv.querySelector(".nrlb-close").focus({ preventScroll: true });
    prepareWall().then(res => { if (res) showWall(res); });
  }
  // Put the finished wall in the popup at the right size. Whole: the entire wall fits the screen.
  // Zoomed: the smallest letters are READ.zoom pixels tall (and at least 1.6 times the whole view), and the spot
  // you clicked stays under your finger or pointer; you scroll around the wall to read the rest.
  function showWall({ el, w, h, L }, at) {
    if (!wv || wv.hidden) return;
    const frame = wv.querySelector(".nrwv-frame"), sc = wv.querySelector(".nrwv-scroll");
    if (el.parentNode !== frame) { frame.innerHTML = ""; frame.appendChild(el); Object.assign(el.style, { visibility: "", left: "0px", top: "0px" }); }
    const pad = 24, fit = Math.min((innerWidth - pad * 2) / w, (innerHeight - pad * 2) / h);
    const k = wvZoom ? Math.max(fit * 1.6, READ.zoom / (L * PX)) : fit;
    const r0 = frame.getBoundingClientRect(), fx = at ? (at.clientX - r0.left) / r0.width : .5, fy = at ? (at.clientY - r0.top) / r0.height : .5;
    Object.assign(frame.style, { width: (w * k) + "px", height: (h * k) + "px" });
    el.style.transform = `scale(${k})`;
    frame.classList.toggle("zoomed", wvZoom);
    const sr = sc.getBoundingClientRect(), cx = at ? at.clientX - sr.left : sr.width / 2, cy = at ? at.clientY - sr.top : sr.height / 2;
    sc.scrollLeft = pad + fx * w * k - cx; sc.scrollTop = pad + fy * h * k - cy;
  }
  function closeWall() { wv.hidden = true; document.documentElement.classList.remove("nrlb-open"); if (wvOpener) wvOpener.focus({ preventScroll: true }); }
  addEventListener("keydown", e => {
    if (!wv || wv.hidden) return;
    if (e.key === "Escape") closeWall();
    const sc = wv.querySelector(".nrwv-scroll"), step = { ArrowDown: [0, 1], ArrowUp: [0, -1], PageDown: [0, 1], PageUp: [0, -1], ArrowRight: [1, 0], ArrowLeft: [-1, 0] }[e.key];
    if (step) { e.preventDefault(); sc.scrollBy({ left: step[0] * sc.clientWidth * .8, top: step[1] * sc.clientHeight * .8, behavior: reduceMotion ? "auto" : "smooth" }); }
  });
  addEventListener("resize", () => { if (wv && !wv.hidden && wallReady) wallReady.then(res => res && showWall(res)); });

  /* ================================================================
     STEP 6B · THE GALLERY VIEWER
     Click a canvas on the black wall and the photo opens big, whole and untrimmed,
     with a museum wall label beside it (below it on a phone), always lined up with
     the photo's outer edge. The label is a white card behind clear glass, held off
     the wall on four little chrome standoffs. The wall behind is black-painted brick.
     The label's words come from data.js: GALLERY_LABEL, unless that photo's own
     line has its own artist / title / medium.
     Ways around: the ‹ › buttons, the arrow keys, or a swipe on a phone.
     Ways out: ×, the Escape key, or a click on the dark around the photo.
     ================================================================ */
  let lb = null, lbIndex = 0, lbOpener = null;
  function buildViewer() {
    lb = make("div", "nrlb", document.body, `
      <p class="nrlb-count" aria-hidden="true"></p>
      <button class="nrlb-btn nrlb-close" type="button" aria-label="Close">×</button>
      <button class="nrlb-btn nrlb-prev" type="button" aria-label="Previous photo">‹</button>
      <button class="nrlb-btn nrlb-next" type="button" aria-label="Next photo">›</button>
      <figure class="nrlb-piece">
        <div class="nrlb-frame"><img alt=""></div>
        <figcaption class="nrlb-label">
          <div class="nrlb-glass">
            <div class="nrlb-card">
              <p class="nrlb-artist"></p>
              <p class="nrlb-title"></p>
              <p class="nrlb-medium"></p>
            </div>
            <i class="nrlb-screw" style="left:6px;top:6px"></i><i class="nrlb-screw" style="right:6px;top:6px"></i>
            <i class="nrlb-screw" style="left:6px;bottom:6px"></i><i class="nrlb-screw" style="right:6px;bottom:6px"></i>
          </div>
        </figcaption>
      </figure>`);
    lb.hidden = true;
    lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Gallery: LIFE Exhibit");
    lb.querySelector(".nrlb-close").onclick = closePhoto;
    lb.querySelector(".nrlb-prev").onclick = () => showPhoto(lbIndex - 1);
    lb.querySelector(".nrlb-next").onclick = () => showPhoto(lbIndex + 1);
    lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("nrlb-piece")) closePhoto(); });   // the dark around it
    // a swipe left or right on a phone: compare where the finger went down and where it came up
    let sx = null;
    lb.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", e => {
      if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 45) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
  function showPhoto(i) {
    const G = DATA.GALLERY, n = G.length;
    lbIndex = ((i % n) + n) % n;                                   // wrap around: after the last comes the first
    const p = G[lbIndex], L = Object.assign({}, DATA.GALLERY_LABEL, p);   // the shared label, with this photo's own words on top
    const img = lb.querySelector(".nrlb-frame img");
    img.src = IMG + p.img; img.alt = p.alt || "";
    img.style.aspectRatio = String(p.ar || 1);
    lb.querySelector(".nrlb-artist").textContent = L.artist || "";
    lb.querySelector(".nrlb-title").textContent = L.title || "";
    lb.querySelector(".nrlb-medium").textContent = L.medium || "";
    lb.querySelector(".nrlb-count").textContent = String(lbIndex + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");
    [lbIndex + 1, lbIndex - 1].forEach(j => { new Image().src = IMG + G[((j % n) + n) % n].img; });   // fetch the neighbours early
  }
  function openPhoto(i, opener) {
    if (!lb) buildViewer();
    lbOpener = opener || null;
    showPhoto(i);
    lb.hidden = false;
    document.documentElement.classList.add("nrlb-open");          // stops the room scrolling underneath
    lb.querySelector(".nrlb-close").focus({ preventScroll: true });
  }
  function closePhoto() {
    lb.hidden = true;
    document.documentElement.classList.remove("nrlb-open");
    if (lbOpener) lbOpener.focus({ preventScroll: true });       // back to the frame you came from
  }
  addEventListener("keydown", e => {
    if (!lb || lb.hidden) return;
    if (e.key === "Escape") closePhoto();
    else if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
    else if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
    else if (e.key === "Tab") {                                   // keep the keyboard inside the viewer while it's open
      const b = [...lb.querySelectorAll("button")], k = b.indexOf(document.activeElement);
      e.preventDefault(); b[(k + (e.shiftKey ? -1 : 1) + b.length) % b.length].focus();
    }
  });

  /* THE CAMERA COMES DOWN THE STAIRS.
     The room is drawn two storeys tall, but the camera (the scene, with its perspective) stays fixed to
     the screen. As you scroll, the whole room slides UP past the camera by exactly the distance scrolled,
     which is what a camera being lowered sees: at the top you are up among the skylight and the planters,
     by the bottom you are on the shop floor at eye level.
     Only one thing changes per frame (the room's "translate"), and the browser can do that on the
     graphics chip without repainting anything, so the scroll stays smooth. */
  function eye() {
    room.style.translate = `0 ${-scrollY}px 0`;
    const c = $("nrp-down"); if (c) c.classList.toggle("gone", scrollY > 40);   // the "Scroll down" cue goes once you start down
  }
  let eyeQueued = false;
  addEventListener("scroll", () => { if (eyeQueued) return; eyeQueued = true; requestAnimationFrame(() => { eyeQueued = false; eye(); }); }, { passive: true });

  /* ================================================================
     STEP 7 · START: load the photo textures, paint, build, and rebuild when the window changes shape
     ================================================================ */
  // Before building, load only the two photos the roof is painted from (everything else streams in as it's shown):
  // sky.webp = the Ogden Valley sky and mountains (seen through the roof and the glass gable);
  // roof-glass.webp = one pane of glass cut from Kathi's glass-roof photo
  // ...and the six spray-paint fonts the Wishing Wall is lettered in (the wall is measured in them, so they must be
  // ready first; if one is slow, the wall goes ahead after 2.5 seconds with a stand-in)
  // (and Anton, the free stand-in for Impact, for WISHING / WALL on phones that don't have Impact)
  const wallFonts = Promise.race([Promise.all(["Permanent Marker", "Sedgwick Ave Display", "Rock Salt", "Bebas Neue", "Black Ops One", "Reenie Beanie", "Anton"]
    .map(f => document.fonts.load(`40px "${f}"`).catch(() => {}))), new Promise(r => setTimeout(r, 2500))]);
  // (The ivy photo, ivy-colour.webp, is no longer loaded here: the roof's leaves now take the ivy's colours from
  //  IVY_PALETTE instead. The storefront still uses that photo for its own ivy.)
  Promise.all([load(IMG + "post/sky.webp"), load(IMG + "post/roof-glass.webp"), wallFonts]).then(([view, glass]) => {
    TEX.view = view; TEX.glass = glass;
    paintTextures();
    build();
    root.classList.add("ready");
    if (!reduceMotion) root.classList.add("walk-in");
  });
  let t, lastW = innerWidth, lastH = innerHeight;
  addEventListener("resize", () => {
    if (innerWidth === lastW && Math.abs(innerHeight - lastH) < lastH * 0.15) return;   // phones: ignore the address bar sliding away
    lastW = innerWidth; lastH = innerHeight; clearTimeout(t); t = setTimeout(build, 150);
  });
})();
