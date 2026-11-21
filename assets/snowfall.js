/* ============================================================
   SNOWFALL · 777 Daydream St.            (assets/snowfall.js)
   Light, fluffy, powdery snow drifting gracefully past the shop.

   HOW IT WORKS, IN PLAIN WORDS
   1. The flakes are painted on one see-through sheet (a <canvas>)
      laid over the whole street, inside the "nrsf-fall" layer that
      storefront.js already keeps in front of everything.
   2. Before anything moves, a few flake pictures are drawn once,
      in memory: tiny soft dots (far away), little powder puffs
      (the middle), and big out-of-focus discs (close to you).
      Each has a faint cool-grey shadow, so a white flake still
      shows against the white brick.
   3. About 60 times a second, every flake moves a tiny step:
        down      at its own slow speed (near flakes fall faster,
                  which is what makes the street feel deep)
        sideways  a slow swing, like a feather, and it eases at
                  the ends of each swing, so it seems to float
        with the breeze, which slowly rises and falls for the
                  whole street at once
      Then the sheet is wiped and every flake is drawn again.
   4. A flake that reaches the ground melts into the snow there
      (far flakes land by the shopfront, near ones pass below the
      screen) and starts again just above the top.
   5. To keep phones cool: phones get fewer flakes, the sheet is
      never bigger than it needs to be, and nothing is drawn while
      the street is scrolled away or the tab is hidden. Visitors
      who've asked their device for less motion see the snow
      standing still, like a photograph.

   Everything is measured in street units, the same units as the
   storefront plan in storefront.js (the desktop street is 1200
   units wide, the phone street 400), so the snow keeps its size
   on every screen. (A stage picture is measured in its own pixels,
   so storefront.js converts it to street units for the snow.)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- THE KNOBS: change these numbers to change the snow ---------- */
  const SNOW = {
    flakes: 220,          // how many flakes are in the air over a whole desktop street (1200 x 1120 units);
                          // a smaller street gets fewer, in proportion, so the snow is equally thick everywhere
    phoneThicker: 1.3,    // phones: a little more snow for their size (their flakes are smaller)
    phoneSize: .85,       // phone flakes are a touch smaller (the phone street is narrower)
    // the three distances. share = part of all the flakes; size = how wide (street units);
    // speed = how fast it falls (units a second); swing = how far it sways to each side;
    // swingTime = seconds for one full sway; alpha = how solid it looks (0 to 1);
    // drift = how strongly the breeze carries it (close flakes seem to move more)
    layers: [
      { share: .42, size: [2.2, 3.6], speed: [30, 40],  swing: [3, 7],   swingTime: [5, 8], alpha: [.65, .85], drift: .6, sprite: "dot"   },  // far
      { share: .49, size: [4.5, 8.5],   speed: [44, 60],  swing: [9, 20],  swingTime: [4, 7], alpha: [.9, 1],    drift: 1,  sprite: "puff"  },  // middle
      { share: .09, size: [14, 22],   speed: [80, 105], swing: [18, 34], swingTime: [4, 6], alpha: [.4, .6],   drift: 1.6, sprite: "bokeh" }  // near
    ],
    breeze: 5,         // the steady breeze, units a second (+ blows to the right, - to the left)
    gusts: 9,          // how much the breeze slowly rises and falls on top of that
    maxPixels: 2.6e6   // the largest the sheet ever gets, in screen pixels (keeps big screens light)
  };

  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- The flake pictures, drawn once ---------- */
  const SPR = 64;                        // each flake picture is 64 x 64 pixels; the flake itself is the middle third,
  const SPREAD = 3.2;                    // so a flake is drawn 3.2 times its width, leaving room for its soft edge and shadow
  const SHADOW = "92,104,136";           // the faint cool-grey shadow (red, green, blue)

  function soft(x, cx, cy, r, rgb, a, mid = .55) {     // one soft round blob: solid in the middle, fading to nothing
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(mid, `rgba(${rgb},${a * .9})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  function makeSprite(kind) {
    const c = document.createElement("canvas"); c.width = c.height = SPR;
    const x = c.getContext("2d"), m = SPR / 2;
    if (kind === "bokeh") {               // close to you and out of focus: a soft, even disc with a gentle edge
      soft(x, m, m + 1.5, m * .78, SHADOW, .14, .5);
      soft(x, m, m, m * .62, "255,255,255", .95, .6);
    } else if (kind === "dot") {          // far away: one soft dot
      soft(x, m, m + 2, m * .6, SHADOW, .42, .35);
      soft(x, m, m, m * .4, "255,255,255", 1);
    } else {                              // the middle: a little powder puff, a few soft bits clumped together
      soft(x, m, m + 2.5, m * .62, SHADOW, .38, .35);
      const bits = 3 + (Math.random() * 3 | 0);
      for (let i = 0; i < bits; i++) {
        const a = Math.random() * 6.28, d = m * rand(.04, .14);
        soft(x, m + Math.cos(a) * d, m + Math.sin(a) * d, m * rand(.3, .4), "255,255,255", rand(.8, 1), .38);   // soft edges: fluffy, not crisp
      }
    }
    return c;
  }
  let SPRITES = null;
  const sprites = () => SPRITES || (SPRITES = {
    dot: [makeSprite("dot"), makeSprite("dot")],
    puff: [0, 1, 2, 3, 4, 5].map(() => makeSprite("puff")),
    bokeh: [makeSprite("bokeh")]
  });

  /* ---------- Start the snow on a layer ----------
     layer: the element to snow over (the "nrsf-fall" layer)
     opts.unit()   how many screen pixels one street unit is right now
     opts.phone()  true on the phone plan
     opts.ground() where the pavement starts, in street units from the top
     opts.floor()  where the street ends (optional; the bottom of the layer if not given)
     opts.roof     true for snow seen from indoors through a glass roof (THE POST): only the far and middle
                   flakes (nothing passes close to you), and each one settles somewhere on the glass
     opts.thick    more (or less) snow than the street's: 2 = twice as thick (optional)
     opts.still    true for visitors who asked for less motion */
  function start(layer, opts) {
    if (!layer || layer.querySelector(".nrsf-snow")) return;
    const cv = document.createElement("canvas");
    cv.className = "nrsf-snow"; cv.setAttribute("aria-hidden", "true");
    Object.assign(cv.style, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" });
    layer.appendChild(cv);
    const ctx = cv.getContext("2d"), SP = sprites();

    let Wu = 0, Hu = 0, u = 1, k = 1, ground = 0, floor = 0;   // street width and height in units, unit size, sheet sharpness
    let flakes = [];

    // one flake: which distance it's at, where it is, and how it moves
    function flake(L, fresh) {
      const s = SNOW.layers[L], pool = SP[s.sprite];
      const f = {
        L, size: rand(...s.size) * (opts.phone() ? SNOW.phoneSize : 1), vy: rand(...s.speed), alpha: rand(...s.alpha), drift: s.drift,
        swing: rand(...s.swing), w: 6.2832 / rand(...s.swingTime), ph: Math.random() * 6.28,
        flutter: L === 1 ? rand(.6, 1.6) : 0, fw: rand(3, 5), fph: Math.random() * 6.28,   // the puffs also tremble a little
        pic: pool[(Math.random() * pool.length) | 0]
      };
      place(f, fresh);
      return f;
    }
    // where it lands: far flakes by the shopfront, middle ones somewhere on the pavement, near ones below the screen
    function place(f, fresh) {
      f.x = rand(-40, Wu + 40);
      f.y = fresh ? rand(-30, Hu) : -f.size * SPREAD - rand(0, 40);
      f.land = opts.roof ? rand(Hu * .08, Hu + 10)
        : f.L === 0 ? rand(ground - 10, ground + 25) : f.L === 1 ? rand(ground + 10, floor + 20) : Hu + f.size * SPREAD;
      if (fresh && f.y > f.land - 15) f.y = rand(-30, f.land - 15);
    }
    function fill() {
      const n = SNOW.flakes * (Wu * Hu) / (1200 * 1120) * (opts.phone() ? SNOW.phoneThicker : 1) * (opts.thick || 1);
      const want = (opts.still ? .6 : 1) * n;
      const counts = SNOW.layers.map((s, L) => Math.round((opts.roof ? [.55, .45, 0][L] : s.share) * want));
      flakes = [];
      counts.forEach((c, L) => { for (let i = 0; i < c; i++) flakes.push(flake(L, true)); });
      flakes.sort((a, b) => a.L - b.L);                // far ones first, so the near ones are drawn over them
    }
    function measure() {
      const cssW = layer.clientWidth, cssH = layer.clientHeight;
      if (!cssW || !cssH) return false;
      u = opts.unit() || cssW / 1200;
      const before = Wu, beforeH = Hu;
      Wu = cssW / u; Hu = cssH / u; ground = opts.ground() || Hu * .9; floor = (opts.floor && opts.floor()) || Hu;
      k = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(SNOW.maxPixels / (cssW * cssH)));   // soft flakes don't need full sharpness
      cv.width = Math.round(cssW * k); cv.height = Math.round(cssH * k);
      if (!flakes.length || Math.abs(before - Wu) > 1 || Math.abs(beforeH - Hu) > 40) fill();   // a new plan (phone <-> desktop): a new set of flakes
      return true;
    }

    function draw(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(u * k, 0, 0, u * k, 0, 0);       // from here on, draw in street units
      for (const f of flakes) {
        const d = f.size * SPREAD, x = f.x + Math.sin(f.ph + f.w * t) * f.swing + Math.sin(f.fph + f.fw * t) * f.flutter;
        let a = f.alpha;
        if (f.land - f.y < 14) a *= Math.max(0, (f.land - f.y) / 14);   // melting into the snow on the ground
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(f.pic, x - d / 2, f.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    }
    function step(dt, t) {
      const breeze = SNOW.breeze + SNOW.gusts * (.6 * Math.sin(t * .09) + .4 * Math.sin(t * .037 + 1.3));
      for (const f of flakes) {
        const sway = f.ph + f.w * t;
        f.y += f.vy * (1 + .2 * Math.cos(2 * sway)) * dt;   // a little slower at the ends of each swing: it floats
        f.x += breeze * f.drift * dt;
        if (f.x > Wu + 60) f.x -= Wu + 120; else if (f.x < -60) f.x += Wu + 120;   // blown off one side, back in at the other
        if (f.y >= f.land) place(f, false);                                       // landed: start again above the top
      }
    }

    if (!measure()) return;
    if (opts.still) { draw(rand(0, 100)); new ResizeObserver(() => measure() && draw(50)).observe(layer); return; }

    // run only while the street is on screen and the tab is showing
    let onScreen = true, running = false, last = 0, clock = rand(0, 100);
    const frame = now => {
      if (!onScreen || document.hidden) { running = false; return; }
      const dt = Math.min(.05, (now - last) / 1000 || 0);   // never jump more than a twentieth of a second
      last = now; clock += dt;
      step(dt, clock); draw(clock);
      requestAnimationFrame(frame);
    };
    const go = () => { if (running || !onScreen || document.hidden) return; running = true; last = performance.now(); requestAnimationFrame(frame); };
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; go(); }).observe(layer);
    document.addEventListener("visibilitychange", go);
    new ResizeObserver(() => { if (measure()) draw(clock); }).observe(layer);
    go();
  }

  window.NRSnowfall = { start, SNOW };
})();
