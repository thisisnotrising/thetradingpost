/* NOT RISING · THE FULL-SCREEN BUTTON
   ------------------------------------------------------------------
   One small round button in the bottom-right corner of every page of
   the Trading Post. Click it and the page fills the whole screen (no
   browser tabs, no address bar). Click it again, or press Esc, to come
   back out.

   How a page gets the button: one line near the bottom of its HTML,
       <script src="assets/fullscreen.js"></script>      (storefront)
       <script src="../assets/fullscreen.js"></script>   (pages in a folder)
   This file builds the button, its look, and what it does, by itself,
   so no page needs any other changes.

   Two browser rules worth knowing:
   - Full screen only starts from a click. A page can't switch itself on.
   - Moving to another page leaves full screen. Visitors click again there.
   - iPhones don't allow full screen for web pages, so the button hides
     itself there instead of showing a button that does nothing.
   ------------------------------------------------------------------ */
(function () {

  /* STEP 1 · Can this browser do full screen at all?
     Most browsers use the plain names; older Safari uses "webkit" names.
     If neither exists (iPhone), stop here and show nothing. */
  var page = document.documentElement;   // the whole page, top to bottom
  var canGoFull = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  if (!canGoFull) return;

  /* STEP 2 · The two icons, drawn as tiny pictures (SVG).
     "Enter" = four corners pointing out. "Exit" = four corners pointing in. */
  var ICON_ENTER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';
  var ICON_EXIT  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M20 15h-5v5M4 15h5v5"/></svg>';

  /* STEP 3 · The look. Written here as CSS and added to the page.
     z-index 100005 keeps it above the magazine reader (100001) and the
     marquee toast (100002), so it still shows while reading. */
  var css =
    '.nr-fs {' +
      'position: fixed; z-index: 100005;' +
      'right: max(14px, env(safe-area-inset-right, 0px));' +      /* corner spacing, clear of phone notches */
      'bottom: max(14px, env(safe-area-inset-bottom, 0px));' +
      'width: 44px; height: 44px; padding: 0; border-radius: 50%;' +   /* 44px = comfortable fingertip size */
      'display: grid; place-items: center; cursor: pointer;' +
      'background: rgba(6, 6, 6, .55); color: #fff;' +                /* see-through dark disc */
      'border: 1px solid rgba(255, 255, 255, .35);' +
      'opacity: .7; transition: opacity .2s, background .2s;' +       /* quiet until you reach for it */
    '}' +
    '.nr-fs:hover, .nr-fs:focus-visible { opacity: 1; background: rgba(6, 6, 6, .85); }' +
    '.nr-fs:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }' +
    '.nr-fs svg { width: 20px; height: 20px; fill: none; stroke: currentColor;' +
      'stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }' +
    '@media print { .nr-fs { display: none; } }';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* STEP 4 · Make the button and put it on the page. */
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nr-fs';
  document.body.appendChild(btn);

  /* STEP 5 · Small helpers: are we full screen right now? go in, come out. */
  function isFull() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function enter() {
    var go = page.requestFullscreen || page.webkitRequestFullscreen;
    var result = go.call(page);
    if (result && result.catch) result.catch(function () {});   // if the browser says no, fail quietly
  }
  function leave() {
    var stop = document.exitFullscreen || document.webkitExitFullscreen;
    var result = stop.call(document);
    if (result && result.catch) result.catch(function () {});
  }

  /* STEP 6 · Keep the icon and the label in sync with the real state.
     This runs on every change, including when someone presses Esc. */
  function update() {
    var full = isFull();
    btn.innerHTML = full ? ICON_EXIT : ICON_ENTER;
    btn.setAttribute('aria-label', full ? 'Exit full screen' : 'Enter full screen');  // read by screen readers
    btn.title = full ? 'Exit full screen (Esc)' : 'Full screen';                       // hover tooltip
  }

  /* STEP 7 · Wire it up. */
  btn.addEventListener('click', function () {
    if (isFull()) leave(); else enter();
  });
  document.addEventListener('fullscreenchange', update);
  document.addEventListener('webkitfullscreenchange', update);
  update();   // draw the starting icon
})();
