/* NOT RISING · THE POST — THE FINAL STAGE (phones and tablets)
   ------------------------------------------------------------------
   THE BIG IDEA
   The stage set (post/index.html) holds every picture of the room up in 3D and lets the browser
   arrange them. On a computer that's fine. On a phone it's too heavy: Safari keeps a fully
   painted copy of every tilted surface (both long walls, the floor, the roof slopes) at 3 pixels
   per point, which for this room is hundreds of megabytes, and the page crashes.

   The final stage draws the very same pictures, with the very same camera, onto ONE flat canvas
   the size of the screen, using the phone's graphics chip directly (WebGL). Each picture is
   handed to the chip once; after that, moving the camera only means drawing them again in their
   new places. The memory it needs is the pictures themselves, and nothing more.

   HOW IT FITS IN
   post/index.html still puts up the room exactly as before: the walls, the four buttons, the
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
     (the scroll), and how far it has been pushed back (the walk-in). */
  const VERT = `#version 300 es
in vec3 a_pos;
in vec2 a_uv;
uniform vec2 u_screen;
uniform vec3 u_shift;
uniform float u_P;
out vec2 v_uv;
void main() {
  vec3 p = a_pos + u_shift;
  float w = 1.0 - p.z / u_P;
  vec2 mid = u_screen * 0.5;
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

  function create(canvas, scene) {
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
              screen: gl.getUniformLocation(prog, "u_screen"), shift: gl.getUniformLocation(prog, "u_shift"),
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
       (post/index.html, step 2B, works out those numbers: "look", all in metres). Here the same things are painted,
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

    /* 4 · THE CORNERS
       Where a box inside the room really is: the browser has placed it (left, top, its size) inside its wall, and
       tilted the wall into place (transform, around its transform-origin). Doing the same sums here, from the inside
       out, gives one "matrix" that takes any spot of the box to its spot in the room. */
    function toRoom(el, room) {
      let M = new DOMMatrix();
      for (let e = el; e && e !== room; e = e.parentElement) {
        const cs = getComputedStyle(e);
        let step = new DOMMatrix().translate(parseFloat(cs.left) || 0, parseFloat(cs.top) || 0);
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

    let list = [], buffer = gl.createBuffer(), room = null;
    /* Gather everything to draw, in drawing order:
         the walls, the floor slabs and the roof slopes (the inside of a box: they never overlap on the screen, so
         any order works), each with its own colour first, then its pictures in the order they were laid;
         then everything standing in the room, the farthest first, so nearer things are painted over farther ones. */
    function build(theRoom, posterLook) {
      room = theRoom;
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
      for (const el of room.querySelectorAll(":scope > [data-gl]")) {
        const [w, h] = size(el);
        standing.push({ z: +el.dataset.z || 0, q: quad(picture(el.dataset.gl, false), toRoom(el, room), [0, 0, w, h], null) });
      }
      standing.sort((a, b) => b.z - a.z);                   // the farthest back first
      list = faces.concat(standing.map(s => s.q)).filter(Boolean);
      // pictures from before (the other set, after the phone was turned) are let go of
      const used = new Set(list.map(q => q.t));
      textures.forEach((t, key) => { if (!used.has(t)) { t.dead = true; gl.deleteTexture(t.tex); textures.delete(key); } });
      // the empty boxes have done their job: out of the room they go
      room.querySelectorAll("[data-gl]").forEach(el => el.remove());
      // every corner, one after another, in one list for the graphics chip: x, y, z, then which spot of the picture
      const data = new Float32Array(list.length * 4 * 5);
      list.forEach((q, i) => q.pts.forEach((p, k) => data.set(p, (i * 4 + k) * 5)));
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return Promise.all([...new Set(list.map(q => q.t))].map(t => t.ready));
    }

    /* 5 · DRAWING
       Called whenever the camera moves (a scroll), while the room walks in, and when a picture arrives.
       It reads where the room is right now: its left edge, the scroll, and the walk-in push (the room's own
       transform, which the browser is animating), then draws every picture in order. */
    let P = 1000, queued = false;
    function draw() {
      queued = false;
      if (!room || gl.isContextLost()) return;
      const W = scene.clientWidth, H = scene.clientHeight;
      const cw = Math.round(W * PIXELS), ch = Math.round(H * PIXELS);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      gl.viewport(0, 0, cw, ch);
      gl.clearColor(13 / 255, 13 / 255, 14 / 255, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      const cs = getComputedStyle(room);
      const push = cs.transform && cs.transform !== "none" ? new DOMMatrix(cs.transform).m43 : 0;
      gl.useProgram(prog);
      gl.uniform2f(loc.screen, W, H);
      gl.uniform3f(loc.shift, parseFloat(cs.left) || 0, -window.scrollY, push);
      gl.uniform1f(loc.P, P);
      gl.uniform1i(loc.tex, 0); gl.activeTexture(gl.TEXTURE0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 20, 12);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      list.forEach((q, i) => { if (!q.t.ok) return; gl.bindTexture(gl.TEXTURE_2D, q.t.tex); gl.drawArrays(gl.TRIANGLE_STRIP, i * 4, 4); });
    }
    const redraw = () => { if (!queued) { queued = true; requestAnimationFrame(draw); } };
    onChange = redraw;
    // keep drawing for a while (the walk-in: the browser moves the room, the canvas follows it frame by frame)
    function follow(ms) {
      const end = performance.now() + ms;
      const step = () => { draw(); if (performance.now() < end) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
    // If the phone takes the graphics chip away (it can, when the page is in the background), start again when it's back
    let rebuild = () => {};
    canvas.addEventListener("webglcontextlost", e => e.preventDefault());
    canvas.addEventListener("webglcontextrestored", () => { textures.clear(); buffer = gl.createBuffer(); compile(); rebuild(); });

    return window.NRFINAL.current = {
      build, draw, redraw, follow,
      setCamera(p) { P = p; },
      onRestore(fn) { rebuild = fn; },
      // how much the pictures take on the graphics chip, in MB (to check the weight)
      weight() { let b = 0; textures.forEach(t => (b += t.bytes)); return +(b / 1e6).toFixed(1); }
    };
  }

  window.NRFINAL = { supported, create };
})();
