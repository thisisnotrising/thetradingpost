/* NOT RISING · THE POST — THE FINAL STAGE (every screen, since Oct 31)
   ------------------------------------------------------------------
   (Oct 31, later: computers use it too. Holding ~60 pictures up in 3D made Chrome flicker, blank out parts of the
   room, black out a wedge of the glass roof and stutter as you scrolled, and the fan and benches, left live in front
   of the canvas, drifted against the floor. Now EVERYTHING in the room is drawn here, on one canvas: the whole
   room is one flat picture, redrawn in 3D as the camera moves. Only the invisible buttons stay in the page.)

   THE BIG IDEA
   The stage set (post/cafe.html) holds every picture of the room up in 3D and lets the browser
   arrange them. On a computer that's fine. On a phone it's too heavy: Safari keeps a fully
   painted copy of every tilted surface (both long walls, the floor, the roof slopes) at 3 pixels
   per point, which for this room is hundreds of megabytes, and the page crashes.

   The final stage draws the very same pictures, with the very same camera, onto ONE flat canvas
   the size of the screen, using the phone's graphics chip directly (WebGL). Each picture is
   handed to the chip once; after that, moving the camera only means drawing them again in their
   new places. The memory it needs is the pictures themselves, and nothing more.

   HOW IT FITS IN
   post/cafe.html still puts up the room exactly as before: the walls, the four buttons, the
   poster's button, the fan and the benches. On a phone it builds the pictures as empty boxes
   (with data-gl = which picture), and this file:
     1. measures where each box's four corners are in the room (the browser has already worked
        that out from the CSS, so the two can never disagree),
     2. loads each picture onto the graphics chip (a "texture"),
     3. takes the empty boxes out of the room,
     4. draws the pictures on the canvas behind the room, every time the camera moves.
   The buttons, the fan and the benches stay in the room, in front of the canvas, so they work
   and move exactly as before.

   THE PARTS
     1 · THE CAMERA     the sum that puts a point of the room on the screen (the same as CSS 3D)
     2 · THE PICTURES   loading a picture onto the graphics chip, once
     3 · THE POSTER     the black wall's poster, its frame, the ivy over it and the room's light,
                        painted together into one picture
     4 · THE CORNERS    where each picture's corners are in the room
     5 · DRAWING        the walls, floor and roof first, then everything standing in the room,
                        back to front (the way a painter would: far things first)
------------------------------------------------------------------ */
(function () {
  "use strict";

  /* 1 · THE CAMERA
     The browser's 3D works like this: the camera is P pixels in front of the middle of the screen.
     A point of the room at (x, y, z) (z = how far toward you; the room's points all have z of 0 or less)
     lands on the screen at
          middle + (point - middle) x P / (P - z)
     so far points (big negative z) crowd toward the middle, near points spread out.
     The graphics chip wants that written with a 4th number, w = (P - z) / P: it divides by w itself.
     u_shift is where the room is right now: its left edge on the screen, how far it has slid up
     (the scroll), and how far it has been pushed back (the walk-in).
     u_mid is the "middle" the camera looks at (Nov 1). It's set once, when the room is sized, and never follows the
     screen's height after that: when a phone's toolbars slide away and the screen gets taller, the picture just
     carries on further down, instead of everything jumping to a new middle. */
  const VERT = `#version 300 es
in vec3 a_pos;
in vec2 a_uv;
uniform vec2 u_screen;
uniform vec2 u_mid;
uniform vec3 u_shift;
uniform float u_P;
out vec2 v_uv;
void main() {
  vec3 p = a_pos + u_shift;
  float w = 1.0 - p.z / u_P;
  vec2 mid = u_mid;
  vec2 s = mid * w + (p.xy - mid);
  gl_Position = vec4(s.x * 2.0 / u_screen.x - w, w - s.y * 2.0 / u_screen.y, 0.0, w);
  v_uv = a_uv;
}`;
  // each spot of a picture is simply its colour (the pictures are loaded "premultiplied", so see-through edges blend cleanly).
  // (-0.4: lean a little toward the sharper copy of each picture, so slanted walls stay as crisp as on the stage set)
  const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tex;
out vec4 colour;
void main() { colour = texture(u_tex, v_uv, -0.4); }`;

  // Is there a graphics chip to draw with? (WebGL 2; without it, the page keeps the stage set)
  function supported() {
    try { return !!document.createElement("canvas").getContext("webgl2"); } catch (e) { return false; }
  }

  function create(canvas) {
    // (antialias off: at the phone's full sharpness, edges are already fine, and it would cost 4 extra copies of the screen)
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) return null;
    const PIXELS = Math.min(window.devicePixelRatio || 1, 3);   // canvas pixels per point: as sharp as the screen (up to 3)

    // the little program the graphics chip runs for every corner (VERT) and every pixel (FRAG)
    let prog, loc;
    function compile() {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      loc = { pos: gl.getAttribLocation(prog, "a_pos"), uv: gl.getAttribLocation(prog, "a_uv"),
              screen: gl.getUniformLocation(prog, "u_screen"), mid: gl.getUniformLocation(prog, "u_mid"), shift: gl.getUniformLocation(prog, "u_shift"),
              P: gl.getUniformLocation(prog, "u_P"), tex: gl.getUniformLocation(prog, "u_tex") };
    }
    compile();
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");

    /* 2 · THE PICTURES
       Each picture is loaded once, unpacked, handed to the graphics chip, and then let go of (so the phone
       doesn't keep a second copy). "Mipmaps" are smaller copies the chip makes of a picture, so a wall seen far
       off or at a slant still looks smooth instead of glittering. They add a third to its weight, so only the
       walls, floor and roof get them: the things standing in the room always face you, at full size or bigger. */
    const textures = new Map();   // picture address -> { tex, ok, bytes, ready }
    let onChange = () => {};
    function upload(t, source, mip = true) {
      if (t.dead) return;                                  // (no longer wanted: the phone was turned while it loaded)
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      if (mip) gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      t.ok = true; t.bytes = Math.round((source.width || source.naturalWidth) * (source.height || source.naturalHeight) * 4 * (mip ? 4 / 3 : 1));
    }
    function picture(url, mip = true) {
      if (textures.has(url)) return textures.get(url);
      const t = { tex: gl.createTexture(), ok: false, bytes: 0 };
      textures.set(url, t);
      const img = new Image(); img.decoding = "async";
      img.src = url;
      t.ready = img.decode().then(() => { upload(t, img, mip); img.removeAttribute("src"); onChange(); }).catch(() => {});
      return t;
    }
    // a plain colour (a wall's own colour, under its pictures): a picture one pixel big
    function colour(css) {
      const key = "colour:" + css;
      if (textures.has(key)) return textures.get(key);
      const c = document.createElement("canvas"); c.width = c.height = 1;
      const x = c.getContext("2d"); x.fillStyle = css; x.fillRect(0, 0, 1, 1);
      const t = { tex: gl.createTexture(), ok: false, bytes: 0, ready: Promise.resolve() };
      upload(t, c); textures.set(key, t);
      return t;
    }

    /* 3 · THE POSTER
       On the stage set the poster is live: a black frame with a fine grey edge and a soft shadow, the poster in
       it, the wall's ivy draping over its top (fading out above the lettering), and the room's light over it all
       (post/cafe.html, step 2B, works out those numbers: "look", all in metres). Here the same things are painted,
       in the same order, onto one picture, 160 pixels to the metre, with room around it for the shadow. */
    const K = 160, MARGIN = .25;
    function posterPicture(look) {
      const key = "poster:" + JSON.stringify(look);
      if (textures.has(key)) return textures.get(key);
      const t = { tex: gl.createTexture(), ok: false, bytes: 0 };
      textures.set(key, t);
      const load = src => { const i = new Image(); i.decoding = "async"; i.src = src; return i.decode().then(() => i); };
      t.ready = Promise.all([load(look.img), load(look.ivy.img)]).then(([poster, ivy]) => {
        const { w, h, x, y } = look, M = MARGIN * K;
        const c = document.createElement("canvas");
        c.width = Math.round((w + 2 * MARGIN) * K); c.height = Math.round((h + 2 * MARGIN) * K);
        const g = c.getContext("2d");
        g.translate(M, M);                                  // from here on, (0, 0) is the poster's top-left corner
        const W = w * K, H = h * K;
        // the soft shadow on the brick (box-shadow: 0 .04 .14 rgba(0,0,0,.85)), then the fine grey edge (.012), then the black frame
        g.save(); g.shadowColor = look.shadow.colour; g.shadowBlur = look.shadow.blur * K; g.shadowOffsetY = look.shadow.dy * K;
        g.fillStyle = "#0a0a0a"; g.fillRect(0, 0, W, H); g.restore();
        const r = look.ring * K; g.fillStyle = look.ringColour; g.fillRect(-r, -r, W + 2 * r, H + 2 * r);
        g.fillStyle = "#0a0a0a"; g.fillRect(0, 0, W, H);
        // the poster itself, inside the frame
        const p = look.pad * K; g.drawImage(poster, p, p, W - 2 * p, H - 2 * p);
        // everything after this stays inside the poster's edge
        g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip();
        // the ivy: the wall's ivy picture, repeated sideways, faded out toward the lettering (painted on its own, then laid on)
        const iv = document.createElement("canvas"); iv.width = Math.ceil(W); iv.height = Math.ceil(H);
        const ig = iv.getContext("2d");
        const [sw, sh] = look.ivy.size.map(v => v * K), [px, py] = look.ivy.pos.map(v => v * K);
        for (let ix = px - Math.ceil(px / sw) * sw; ix < W; ix += sw) ig.drawImage(ivy, ix, py, sw, sh);
        const fade = ig.createLinearGradient(0, 0, 0, look.ivy.fade[1] * K);
        fade.addColorStop(0, "#000"); fade.addColorStop(look.ivy.fade[0] / look.ivy.fade[1], "#000"); fade.addColorStop(1, "rgba(0,0,0,0)");
        ig.globalCompositeOperation = "destination-in"; ig.fillStyle = fade; ig.fillRect(0, 0, W, H);
        g.drawImage(iv, 0, 0); iv.width = iv.height = 0;
        // the room's light, bottom layer first: the warm wash from the glass at the back (across the wall)...
        const L = look.light, wx = -x * K, wy = -y * K;   // the wall's top-left corner, seen from the poster
        const wash = g.createLinearGradient(wx, 0, wx + L.Dm * K, 0);
        wash.addColorStop(0, "rgba(255,246,226,.16)"); wash.addColorStop(.3, "rgba(255,246,226,0)"); wash.addColorStop(.7, "rgba(0,0,0,0)"); wash.addColorStop(1, "rgba(0,0,0,.35)");
        g.fillStyle = wash; g.fillRect(0, 0, W, H);
        // ...darker toward the floor and the top (up the wall)...
        const dark = g.createLinearGradient(0, wy + L.HM * K, 0, wy);
        dark.addColorStop(0, "rgba(0,0,0,.45)"); dark.addColorStop(.14, "rgba(0,0,0,0)"); dark.addColorStop(.85, "rgba(0,0,0,0)"); dark.addColorStop(1, "rgba(0,0,0,.35)");
        g.fillStyle = dark; g.fillRect(0, 0, W, H);
        // ...and on top, the Edison bulbs' warm glow: an oval, gw wide and gh tall, centred where it's brightest
        const [gx, gy, gw, gh] = L.glow, cx = (gx - x) * K, cy = (L.HM - gy - y) * K;
        g.save(); g.translate(cx, cy); g.scale(1, gh / gw);
        const glow = g.createRadialGradient(0, 0, 0, 0, 0, gw / 2 * K);
        glow.addColorStop(0, "rgba(255,186,110,.16)"); glow.addColorStop(.69, "rgba(255,170,90,.05)"); glow.addColorStop(1, "rgba(255,170,90,0)");
        g.fillStyle = glow; g.fillRect(-gw / 2 * K, -gw / 2 * K, gw * K, gw * K); g.restore();
        g.restore();
        upload(t, c); c.width = c.height = 0; onChange();
      }).catch(() => {});
      return t;
    }

    /* 3B · THE FAN AND THE BENCHES (Oct 31)
       These two are little 3D objects built from flat parts: the fan's rod, motor and six blades; each bench's top,
       sides, ends and legs. They used to stay in the room as live 3D, in front of the canvas, and that's what made
       them drift against the floor and walls while you scrolled. Now each part is painted once into a small picture,
       here, from its own look in the page's CSS (its colours, its picture, its cut-out shape), and drawn on the canvas
       with everything else.
       What it can read: a background picture (url), straight and round colour fades (linear- and radial-gradient),
       a plain colour, a cut-out shape (clip-path: polygon) and rounded corners. That's everything the parts use. */
    // split "a(b, c), d" at the commas that aren't inside brackets
    const splitTop = s => { const out = []; let depth = 0, cur = ""; for (const ch of s) { if (ch === "(") depth++; if (ch === ")") depth--; if (ch === "," && !depth) { out.push(cur.trim()); cur = ""; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
    // "40%" or "12.5px" -> pixels, given what 100% is
    const len = (v, full) => /%$/.test(v) ? parseFloat(v) / 100 * full : parseFloat(v) || 0;
    // the colour stops of a fade: "rgb(1, 2, 3) 45%" -> [colour, where (0 to 1, or null = spread evenly)]
    function stops(parts, L) {
      const s = parts.map(p => { const m = p.match(/^(.*\))\s*([-\d.]+(?:%|px))?$/) || [null, p, null]; return [m[1], m[2] == null ? null : len(m[2], L) / L]; });
      if (s[0][1] == null) s[0][1] = 0; if (s[s.length - 1][1] == null) s[s.length - 1][1] = 1;
      for (let i = 1; i < s.length - 1; i++) if (s[i][1] == null) {
        let j = i; while (s[j][1] == null) j++;
        for (let k = i; k < j; k++) s[k][1] = s[i - 1][1] + (s[j][1] - s[i - 1][1]) * (k - i + 1) / (j - i + 1);
      }
      return s.map(([c, p], i) => [c, Math.max(0, Math.min(1, Math.max(p, i ? s[i - 1][1] : 0)))]);
    }
    function paintLayer(g, layer, w, h, cs, imgs) {
      let m;
      if ((m = layer.match(/^linear-gradient\((.*)\)$/))) {
        const args = splitTop(m[1]);
        let a = Math.PI;                                    // (no angle given: top to bottom)
        if (/deg$/.test(args[0])) a = parseFloat(args.shift()) * Math.PI / 180;
        else if (/^to /.test(args[0])) { const t = args.shift(); a = /right/.test(t) ? Math.PI / 2 : /left/.test(t) ? -Math.PI / 2 : /top/.test(t) ? 0 : Math.PI; }
        const L = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a)), dx = Math.sin(a) * L / 2, dy = -Math.cos(a) * L / 2;
        const grad = g.createLinearGradient(w / 2 - dx, h / 2 - dy, w / 2 + dx, h / 2 + dy);
        stops(args, L).forEach(([c, p]) => grad.addColorStop(p, c));
        g.fillStyle = grad; g.fillRect(0, 0, w, h);
      } else if ((m = layer.match(/^radial-gradient\((.*)\)$/))) {
        const args = splitTop(m[1]);
        let cx = w / 2, cy = h / 2;
        const at = /(^|\s)at\s/.test(args[0]) ? args.shift() : "";
        const pos = at.match(/at\s+(\S+)\s+(\S+)/); if (pos) { cx = len(pos[1], w); cy = len(pos[2], h); }
        const rx = Math.max(cx, w - cx) * Math.SQRT2, ry = Math.max(cy, h - cy) * Math.SQRT2;   // (an oval out to the farthest corner)
        const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        stops(args, rx).forEach(([c, p]) => grad.addColorStop(p, c));
        g.save(); g.translate(cx, cy); g.scale(1, ry / rx); g.fillStyle = grad; g.fillRect(-cx, -cy * rx / ry, w, h * rx / ry); g.restore();
      } else if ((m = layer.match(/^url\("?(.*?)"?\)$/)) && imgs[m[1]]) {
        const i = imgs[m[1]], [sw0, sh0 = "auto"] = cs.backgroundSize.split(",")[0].trim().split(/\s+/);
        let sw = sw0 === "auto" ? i.naturalWidth : len(sw0, w), sh = sh0 === "auto" ? sw * i.naturalHeight / i.naturalWidth : len(sh0, h);
        if (sw0 === "auto" && sh0 !== "auto") sw = sh * i.naturalWidth / i.naturalHeight;
        const [px, py = "50%"] = cs.backgroundPosition.split(",")[0].trim().split(/\s+/);
        const x = /%$/.test(px) ? (w - sw) * parseFloat(px) / 100 : parseFloat(px) || 0, y = /%$/.test(py) ? (h - sh) * parseFloat(py) / 100 : parseFloat(py) || 0;
        g.drawImage(i, x, y, sw, sh);
      }
    }
    function partPicture(el) {
      // (its look is copied out now: the part is taken out of the page before its picture is painted, and a part
      //  that's no longer in the page has no look left to read)
      const live = getComputedStyle(el), cs = {};
      ["width", "height", "backgroundImage", "backgroundSize", "backgroundPosition", "backgroundColor", "clipPath"].forEach(k => (cs[k] = live[k]));
      const w = parseFloat(cs.width), h = parseFloat(cs.height);
      const corners = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"].map(k => live[k]);
      const key = ["part", cs.backgroundImage, cs.backgroundSize, cs.backgroundPosition, cs.backgroundColor, cs.clipPath, corners.join(" "), w.toFixed(1), h.toFixed(1)].join("|");
      if (textures.has(key)) return textures.get(key);
      const t = { tex: gl.createTexture(), ok: false, bytes: 0 };
      textures.set(key, t);
      const layers = cs.backgroundImage === "none" ? [] : splitTop(cs.backgroundImage);
      const urls = layers.map(l => (l.match(/^url\("?(.*?)"?\)$/) || [])[1]).filter(Boolean);
      const imgs = {};
      t.ready = Promise.all(urls.map(u => { const i = new Image(); i.decoding = "async"; i.src = u; return i.decode().then(() => (imgs[u] = i)).catch(() => {}); })).then(() => {
        // painted at up to 2 pixels for each of the page's pixels (sharp up close), never more than 1024 across
        const k = Math.max(.05, Math.min(2, 1024 / Math.max(w, h, 1)));
        const c = document.createElement("canvas"); c.width = Math.max(2, Math.ceil(w * k)); c.height = Math.max(2, Math.ceil(h * k));
        const g = c.getContext("2d"); g.scale(c.width / w, c.height / h);
        // the cut-out shape: a polygon, or rounded corners
        const poly = cs.clipPath.match(/^polygon\((.*)\)$/);
        if (poly) {
          g.beginPath();
          splitTop(poly[1]).forEach((pt, i) => { const [x, y] = pt.trim().split(/\s+/); g[i ? "lineTo" : "moveTo"](len(x, w), len(y, h)); });
          g.closePath(); g.clip();
        } else if (corners.some(r => parseFloat(r)) && g.roundRect) {
          const radii = corners.map(r => { const [x, y = x] = r.split(/\s+/); return { x: len(x, w), y: len(y, h) }; });
          g.beginPath(); g.roundRect(0, 0, w, h, radii); g.clip();
        }
        if (cs.backgroundColor && !/rgba\(.*,\s*0\)$|transparent/.test(cs.backgroundColor)) { g.fillStyle = cs.backgroundColor; g.fillRect(0, 0, w, h); }
        for (let i = layers.length - 1; i >= 0; i--) paintLayer(g, layers[i], w, h, cs, imgs);   // (the first one listed goes on top)
        upload(t, c); c.width = c.height = 0; onChange();
      });
      return t;
    }

    /* 4 · THE CORNERS
       Where a box inside the room really is: the browser has placed it (left, top, its size) inside its wall, and
       tilted the wall into place (transform, around its transform-origin). Doing the same sums here, from the inside
       out, gives one "matrix" that takes any spot of the box to its spot in the room. */
    function toRoom(el, room) {
      let M = new DOMMatrix();
      for (let e = el; e && e !== room; e = e.parentElement) {
        const cs = getComputedStyle(e);
        // (its margins count too: the fan's rod and motor are centred with a negative margin)
        let step = new DOMMatrix().translate((parseFloat(cs.left) || 0) + (parseFloat(cs.marginLeft) || 0), (parseFloat(cs.top) || 0) + (parseFloat(cs.marginTop) || 0));
        if (cs.transform && cs.transform !== "none") {
          const [ox, oy, oz] = cs.transformOrigin.split(" ").map(parseFloat);
          step = step.translate(ox, oy, oz || 0).multiply(new DOMMatrix(cs.transform)).translate(-ox, -oy, -(oz || 0));
        }
        M = step.multiply(M);
      }
      return M;
    }
    const size = el => { const cs = getComputedStyle(el); return [parseFloat(cs.width), parseFloat(cs.height)]; };
    // one picture to draw: its texture, and its 4 corners in the room (top-left, top-right, bottom-left, bottom-right)
    // with which part of the picture goes there. The box is first trimmed to its wall (walls cut off anything that
    // runs past their edges, and so do we).
    function quad(t, M, box, clip) {
      let [x0, y0, x1, y1] = [box[0], box[1], box[0] + box[2], box[1] + box[3]];
      let [u0, v0, u1, v1] = [0, 0, 1, 1];
      if (clip) {
        const cx0 = Math.max(x0, 0), cy0 = Math.max(y0, 0), cx1 = Math.min(x1, clip[0]), cy1 = Math.min(y1, clip[1]);
        if (cx1 <= cx0 || cy1 <= cy0) return null;
        u0 = (cx0 - x0) / (x1 - x0); u1 = (cx1 - x0) / (x1 - x0); v0 = (cy0 - y0) / (y1 - y0); v1 = (cy1 - y0) / (y1 - y0);
        [x0, y0, x1, y1] = [cx0, cy0, cx1, cy1];
      }
      const at = (x, y) => { const p = M.transformPoint(new DOMPoint(x, y, 0, 1)); return [p.x / p.w, p.y / p.w, p.z / p.w]; };
      return { t, pts: [[...at(x0, y0), u0, v0], [...at(x1, y0), u1, v0], [...at(x0, y1), u0, v1], [...at(x1, y1), u1, v1]] };
    }

    let list = [], buffer = gl.createBuffer(), room = null, nFaces = 0, items = [];
    /* Gather everything to draw, in drawing order:
         the walls, the floor slabs and the roof slopes (the inside of a box: they never overlap on the screen, so
         any order works), each with its own colour first, then its pictures in the order they were laid;
         then everything standing in the room, the farthest first, so nearer things are painted over farther ones.
         The fan and the benches count as "standing" too, each as a group of parts (3B); the order of the parts
         inside a group is worked out as the camera moves (see 5 · DRAWING).
       list  = every picture with its 4 corners (the walls' first: nFaces of them)
       items = what stands in the room, farthest first: { i } one picture, or { kind, parts: [{ i, role, c }] } a group */
    const centre = q => [0, 1, 2].map(k => q.pts.reduce((s, p) => s + p[k], 0) / 4);
    const roleOf = el => (el.className.match(/nrp-(?:b|fan)-(leg|end|edge|top|rod|motor)/) || [])[1] || (el.tagName === "B" ? "blade" : "part");
    function build(theRoom, posterLook) {
      room = theRoom;
      left = parseFloat(getComputedStyle(room).left) || 0;  // the room's left edge on the screen (it only changes when the room is re-sized, which re-builds)
      const faces = [], standing = [];
      for (const face of room.querySelectorAll(":scope > .wall, :scope > .panel")) {
        const M = toRoom(face, room), [w, h] = size(face);
        const bg = getComputedStyle(face).backgroundColor;
        if (bg && !/rgba\(.*,\s*0\)$|transparent/.test(bg)) faces.push(quad(colour(bg), M, [0, 0, w, h], [w, h]));
        face.style.background = "none";                     // (its colour is drawn on the canvas now; the wall itself paints nothing)
        for (const el of face.children) {
          if (el.dataset.gl) {
            const cs = getComputedStyle(el);
            faces.push(quad(picture(el.dataset.gl), M, [parseFloat(cs.left), parseFloat(cs.top), parseFloat(cs.width), parseFloat(cs.height)], [w, h]));
          } else if (el.classList.contains("poster") && posterLook) {
            const u = parseFloat(getComputedStyle(el).width) / posterLook.w;      // pixels per metre, right now
            const L = posterLook;
            faces.push(quad(posterPicture(L), M, [(L.x - MARGIN) * u, (L.y - MARGIN) * u, (L.w + 2 * MARGIN) * u, (L.h + 2 * MARGIN) * u], [w, h]));
          }
        }
      }
      list = faces.filter(Boolean); nFaces = list.length;
      for (const el of room.querySelectorAll(":scope > [data-gl]")) {
        const [w, h] = size(el), q = quad(picture(el.dataset.gl, false), toRoom(el, room), [0, 0, w, h], null);
        standing.push({ z: q.pts[0][2], i: list.push(q) - 1 });
      }
      // the fan and the benches: every part that has a look of its own (a colour, a fade or a picture) becomes a picture
      for (const obj of room.querySelectorAll(":scope > .nrp-fan, :scope > .nrp-bench3d")) {
        const parts = [];
        for (const el of obj.querySelectorAll("*")) {
          if (el.children.length) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || (cs.backgroundImage === "none" && /rgba\(.*,\s*0\)$|transparent/.test(cs.backgroundColor))) continue;
          const [w, h] = size(el); if (!(w > 0 && h > 0)) continue;
          const q = quad(partPicture(el), toRoom(el, room), [0, 0, w, h], null);
          parts.push({ i: list.push(q) - 1, role: roleOf(el), c: centre(q) });
        }
        if (parts.length) standing.push({ z: parts.reduce((s, p) => s + p.c[2], 0) / parts.length, kind: obj.classList.contains("nrp-fan") ? "fan" : "bench", parts });
      }
      standing.sort((a, b) => a.z - b.z);                   // the farthest back first (z: how far back, as a negative number)
      items = standing;
      // pictures from before (the other set, after the phone was turned) are let go of
      const used = new Set(list.map(q => q.t));
      textures.forEach((t, key) => { if (!used.has(t)) { t.dead = true; gl.deleteTexture(t.tex); textures.delete(key); } });
      // the empty boxes, the fan and the benches have done their job: out of the room they go
      room.querySelectorAll("[data-gl], :scope > .nrp-fan, :scope > .nrp-bench3d").forEach(el => el.remove());
      // every corner, one after another, in one list for the graphics chip: x, y, z, then which spot of the picture
      const data = new Float32Array(list.length * 4 * 5);
      list.forEach((q, i) => q.pts.forEach((p, k) => data.set(p, (i * 4 + k) * 5)));
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return Promise.all([...new Set(list.map(q => q.t))].map(t => t.ready));
    }

    /* 5 · DRAWING
       Called whenever the camera moves (a scroll), while the room walks in, and when a picture arrives.
       Everything it needs is handed to it ahead of time, so drawing never has to stop and ask the page anything
       (Nov 1: asking, every frame, is what made some phones stutter as you scrolled):
         W, H, mid, P  the camera: its size, the middle it looks at, how far back it stands (frame(), when the room is sized)
         left          the room's left edge (build())
         camY          how far down the room the camera is (look(), on every scroll; post/cafe.html keeps it inside the room)
         push          the walk-in: only read from the page while the room is walking in (follow()) */
    let P = 1000, W = 1, H = 1, mid = 0, left = 0, camY = 0, push = 0, following = false, queued = false;
    function draw() {
      queued = false;
      if (!room || gl.isContextLost()) return;
      const cw = Math.round(W * PIXELS), ch = Math.round(H * PIXELS);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }   // (only when the camera changes size)
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(13 / 255, 13 / 255, 14 / 255, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      if (following) { const t = getComputedStyle(room).transform; push = t && t !== "none" ? new DOMMatrix(t).m43 : 0; }
      gl.useProgram(prog);
      gl.uniform2f(loc.screen, W, H);
      gl.uniform2f(loc.mid, W / 2, mid || H / 2);
      const sy = camY;
      gl.uniform3f(loc.shift, left, -sy, push);
      gl.uniform1f(loc.P, P);
      gl.uniform1i(loc.tex, 0); gl.activeTexture(gl.TEXTURE0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 20, 12);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const one = i => { const q = list[i]; if (!q.t.ok) return; gl.bindTexture(gl.TEXTURE_2D, q.t.tex); gl.drawArrays(gl.TRIANGLE_STRIP, i * 4, 4); };
      for (let i = 0; i < nFaces; i++) one(i);             // the walls, floor and roof
      // where the camera is, in the room: the middle it looks at, as far down as you've scrolled, P in front
      const cam = [W / 2 - left, (mid || H / 2) + sy, P - push];
      const far = c => Math.hypot(c[0] - cam[0], c[1] - cam[1], c[2] - cam[2]);
      for (const it of items) {
        if (!it.parts) { one(it.i); continue; }
        // A group's parts, back to front for where the camera is right now. The camera is always above a bench, so:
        // legs, then ends, then sides, then the top. The fan depends on which side of its blades you're on: from above,
        // blades, then motor, then the rod coming down to them; from below, the rod (hidden above), blades, motor.
        let rank;
        if (it.kind === "fan") {
          const blades = it.parts.filter(p => p.role === "blade"), bladeY = blades.reduce((s, p) => s + p.c[1], 0) / (blades.length || 1);
          rank = cam[1] < bladeY ? { blade: 0, part: 0, motor: 1, rod: 2 } : { rod: 0, blade: 1, part: 1, motor: 2 };
        } else rank = { leg: 0, end: 1, part: 1, edge: 2, top: 3 };
        it.parts.map(p => [rank[p.role] || 0, -far(p.c), p.i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(p => one(p[2]));
      }
    }
    const redraw = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    onChange = redraw;
    // keep drawing for a while (the walk-in: the browser moves the room, the canvas follows it frame by frame);
    // when it's over the room is back in place (push 0) and the page isn't asked again
    function follow(ms) {
      const end = performance.now() + ms;
      following = true;
      const step = () => { draw(); if (performance.now() < end) requestAnimationFrame(step); else { following = false; push = 0; draw(); } };
      requestAnimationFrame(step);
    }
    // If the phone takes the graphics chip away (it can, when the page is in the background), start again when it's back
    let rebuild = () => {};
    canvas.addEventListener("webglcontextlost", e => e.preventDefault());
    canvas.addEventListener("webglcontextrestored", () => { textures.clear(); buffer = gl.createBuffer(); compile(); rebuild(); });

    return window.NRFINAL.current = {
      build, draw, redraw, follow,
      // the camera: its size on the screen (w, h), how far back it stands (p) and the middle it looks at (m, down from the top)
      frame(w, h, p, m) { W = w; H = h; P = p; mid = m; },
      // the camera moves to y (how far down the room), and the room is drawn there, right away
      look(y) { camY = y; draw(); },
      onRestore(fn) { rebuild = fn; },
      // how much the pictures take on the graphics chip, in MB (to check the weight)
      weight() { let b = 0; textures.forEach(t => (b += t.bytes)); return +(b / 1e6).toFixed(1); }
    };
  }

  window.NRFINAL = { supported, create };
})();
