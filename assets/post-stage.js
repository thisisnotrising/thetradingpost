/* NOT RISING · THE POST — THE STAGE SET (written by tools/bake-stage.js: don't edit by hand, re-bake instead)
   Two sets: "wide" (computers, tablets on their side) and "narrow" (phones).
   Every size and position is in METRES; post/index.html multiplies by --u (pixels per metre) to fit the screen.
   room    the box: Wm wide, Dm deep, HM tall; the floor is laid in two slabs, the near one DNm deep
   walls   back, left, right, floor, floor-near: each one or more pictures (bands) laid on that surface, and its clickable spots (hot)
   pieces  the glass roof slopes (panels) and everything standing in the room (pieces): a picture, where it stands (x, y),
           how big (w, h) and how far back from the door (z)
   live    the ceiling fan and the benches, kept as little 3D objects, with their look (css) */
window.NRSTAGE = {
 "wide": {
  "room": {
   "Wm": 6.4,
   "Dm": 13.5,
   "DNm": 4.5,
   "HM": 7.2
  },
  "walls": {
   "back": {
    "bands": [
     { "img": "wide/back.webp", "x": 0, "y": 0, "w": 6.4, "h": 7.2 }
    ],
    "hot": [
     { "pop": "cafe", "label": "Nebula Cafe", "box": [ 0.25, 0.3, 5.9, 6.9 ] }
    ]
   },
   "left": {
    "bands": [
     { "img": "wide/left-0.webp", "x": 0, "y": 0, "w": 3.03, "h": 7.2 },
     { "img": "wide/left-3.webp", "x": 3, "y": 0, "w": 4.03, "h": 7.2 },
     { "img": "wide/left-7.webp", "x": 7, "y": 0, "w": 6.5, "h": 7.2 }
    ],
    "hot": [
     { "pop": "newsstand", "label": "Newsstand", "box": [ 0.45, 0, 3.51, 7.2 ] },
     { "pop": "wall", "label": "Wishing Wall", "box": [ 3.96, 1.25, 9.54, 5.95 ] }
    ]
   },
   "right": {
    "bands": [
     { "img": "wide/right-0.webp", "x": 10.47, "y": 0, "w": 3.03, "h": 7.2 },
     { "img": "wide/right-3.webp", "x": 6.47, "y": 0, "w": 4.03, "h": 7.2 },
     { "img": "wide/right-7.webp", "x": 0, "y": 0, "w": 6.5, "h": 7.2 }
    ],
    "hot": [
     { "pop": "gallery", "label": "Gallery", "box": [ 6.63, 1.85, 5.38, 4 ] }
    ]
   },
   "floor": {
    "bands": [
     { "img": "wide/floor.webp", "x": 0, "y": 0, "w": 6.4, "h": 9 }
    ],
    "style": "background-image: url(\"../assets/img/post/obsidian-floor.webp\"); background-size: calc(var(--u) * 2) calc(var(--u) * 2);",
    "hot": []
   },
   "floor-near": {
    "bands": [
     { "img": "wide/floor-near.webp", "x": 0, "y": 0, "w": 6.4, "h": 4.5 }
    ],
    "style": "background-image: url(\"../assets/img/post/obsidian-floor.webp\"); background-size: calc(var(--u) * 2) calc(var(--u) * 2); background-position: calc(var(--u) * 0) calc(var(--u) * -9);",
    "hot": []
   }
  },
  "pieces": [
   {
    "bands": [
     { "img": "wide/roof6-0.webp", "x": 0, "y": 0, "w": 3.4513, "h": 3.03 },
     { "img": "wide/roof6-3.webp", "x": 0, "y": 3, "w": 3.4513, "h": 4.03 },
     { "img": "wide/roof6-7.webp", "x": 0, "y": 7, "w": 3.4513, "h": 6.5 }
    ],
    "hot": [],
    "kind": "panel",
    "cls": "nrp-roof",
    "style": "left: calc(var(--u) * 0); top: calc(var(--u) * 0); width: calc(var(--u) * 3.4513); height: calc(var(--u) * 13.5); transform-origin: calc(var(--u) * 0) calc(var(--u) * 0); transform: rotateZ(-22deg) rotateX(-90deg);"
   },
   {
    "bands": [
     { "img": "wide/roof7-0.webp", "x": 0, "y": 0, "w": 3.4513, "h": 3.03 },
     { "img": "wide/roof7-3.webp", "x": 0, "y": 3, "w": 3.4513, "h": 4.03 },
     { "img": "wide/roof7-7.webp", "x": 0, "y": 7, "w": 3.4513, "h": 6.5 }
    ],
    "hot": [],
    "kind": "panel",
    "cls": "nrp-roof",
    "style": "left: calc(var(--u) * 2.9487); top: calc(var(--u) * 0); width: calc(var(--u) * 3.4513); height: calc(var(--u) * 13.5); transform-origin: 100% calc(var(--u) * 0); transform: rotateZ(22deg) rotateX(-90deg);"
   },
   { "kind": "piece", "img": "wide/piece8.webp", "x": 0.0067, "y": -1.6429, "w": 6.3867, "h": 1.9929, "z": 13.5 },
   { "kind": "piece", "img": "wide/piece9.webp", "x": 0.0067, "y": -0.7123, "w": 2.0717, "h": 7.8973, "z": 11.34 },
   { "kind": "piece", "img": "wide/piece10.webp", "x": 3.288, "y": -1.3326, "w": 1.36, "h": 5.8677, "z": 11.61 },
   { "kind": "piece", "img": "wide/piece11.webp", "x": 4.648, "y": -0.8154, "w": 1.2, "h": 4.8899, "z": 10.665 },
   { "kind": "piece", "img": "wide/piece12.webp", "x": 0.0067, "y": 4.8617, "w": 2.6256, "h": 2.3233, "z": 13.1625 },
   { "kind": "piece", "img": "wide/piece13.webp", "x": 3.7676, "y": 4.8617, "w": 2.6257, "h": 2.3233, "z": 13.1625 },
   { "kind": "piece", "img": "wide/piece17.webp", "x": 1.91, "y": 4.2006, "w": 4.4833, "h": 2.9844, "z": 8 },
   { "kind": "piece", "img": "wide/piece18.webp", "x": 3.6875, "y": 3.5337, "w": 1.2737, "h": 2.0162, "z": 7.95 },
   { "kind": "piece", "img": "wide/piece19.webp", "x": 3.9673, "y": -1.1886, "w": 0.714, "h": 5.4723, "z": 7.95 },
   { "kind": "piece", "img": "wide/piece20.webp", "x": 4.356, "y": 4.92, "w": 2.0373, "h": 2.265, "z": 7.2 },
   { "kind": "piece", "img": "wide/piece21.webp", "x": 4.1067, "y": -0.7893, "w": 2.2867, "h": 7.9743, "z": 7.9 }
  ],
  "live": "<div class=\"nrp-bench3d nrp-built\" style=\"left: calc(var(--u) * 0.2); top: calc(var(--u) * 6.75); width: calc(var(--u) * 2.1); height: calc(var(--u) * 0.45); transform: translateZ(calc(var(--u) * -2.205)) rotateY(90deg);\"><i class=\"nrp-b-top\" style=\"left:0;top:calc(var(--u) * -0.19);width:calc(var(--u) * 2.1);height:calc(var(--u) * 0.38);background-image:url(../assets/img/post/bench.webp);background-size:132.8% 647.1%;background-position:calc(var(--u) * -0.3397) calc(var(--u) * -0.0447)\"></i><i class=\"nrp-b-edge\" style=\"left:0;top:0;width:calc(var(--u) * 2.1);height:calc(var(--u) * 0.05);transform:translateZ(calc(var(--u) * 0.19));background-image:url(../assets/img/post/bench.webp);background-size:132.8% 785.7%;background-position:calc(var(--u) * -0.3397) calc(var(--u) * -0.068)\"></i><i class=\"nrp-b-edge\" style=\"left:0;top:0;width:calc(var(--u) * 2.1);height:calc(var(--u) * 0.05);transform:translateZ(calc(var(--u) * -0.19)) rotateY(180deg);background-image:url(../assets/img/post/bench.webp);background-size:132.8% 785.7%;background-position:calc(var(--u) * -0.3397) calc(var(--u) * -0.068)\"></i><i class=\"nrp-b-end\" style=\"left:calc(var(--u) * -0.19);top:0;width:calc(var(--u) * 0.38);height:calc(var(--u) * 0.05);transform:rotateY(90deg)\"></i><i class=\"nrp-b-end\" style=\"left:calc(var(--u) * 1.91);top:0;width:calc(var(--u) * 0.38);height:calc(var(--u) * 0.05);transform:rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.875);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(-7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.875);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(-7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.875);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(-7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.875);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(-7deg) rotateY(90deg)\"></i></div>\n<div class=\"nrp-bench3d nrp-built\" style=\"left: calc(var(--u) * 0.2); top: calc(var(--u) * 6.75); width: calc(var(--u) * 2.1); height: calc(var(--u) * 0.45); transform: translateZ(calc(var(--u) * -8.73)) rotateY(90deg);\"><i class=\"nrp-b-top\" style=\"left:0;top:calc(var(--u) * -0.19);width:calc(var(--u) * 2.1);height:calc(var(--u) * 0.38);background-image:url(../assets/img/post/bench.webp);background-size:132.8% 647.1%;background-position:calc(var(--u) * -0.3397) calc(var(--u) * -0.0447)\"></i><i class=\"nrp-b-edge\" style=\"left:0;top:0;width:calc(var(--u) * 2.1);height:calc(var(--u) * 0.05);transform:translateZ(calc(var(--u) * 0.19));background-image:url(../assets/img/post/bench.webp);background-size:132.8% 785.7%;background-position:calc(var(--u) * -0.3397) calc(var(--u) * -0.068)\"></i><i class=\"nrp-b-edge\" style=\"left:0;top:0;width:calc(var(--u) * 2.1);height:calc(var(--u) * 0.05);transform:translateZ(calc(var(--u) * -0.19)) rotateY(180deg);background-image:url(../assets/img/post/bench.webp);background-size:132.8% 785.7%;background-position:calc(var(--u) * -0.3397) calc(var(--u) * -0.068)\"></i><i class=\"nrp-b-end\" style=\"left:calc(var(--u) * -0.19);top:0;width:calc(var(--u) * 0.38);height:calc(var(--u) * 0.05);transform:rotateY(90deg)\"></i><i class=\"nrp-b-end\" style=\"left:calc(var(--u) * 1.91);top:0;width:calc(var(--u) * 0.38);height:calc(var(--u) * 0.05);transform:rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.875);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(-7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.875);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(-7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.875);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(-7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.875);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(-7deg) rotateY(90deg)\"></i></div>\n<div class=\"nrp-built nrp-fan nrp-stand\" style=\"left: calc(var(--u) * 1.5); top: calc(var(--u) * -1.2929); width: calc(var(--u) * 3.4); height: calc(var(--u) * 4.3929); transform: translateZ(calc(var(--u) * -1.35));\"><i class=\"nrp-fan-rod\"></i><div class=\"nrp-fan-blades\" style=\"width: calc(var(--u) * 3.4); height: calc(var(--u) * 3.4); left: calc(var(--u) * 0); top: calc(var(--u) * 2.5929);\"><div class=\"nrp-fan-spin\"><b></b><b></b><b></b><b></b><b></b><b></b></div></div><i class=\"nrp-fan-motor\"></i></div>",
  "css": ".nrp-stand { position: absolute; }\n.nrp-stand > svg, .nrp-stand > img { display: block; width: 100%; height: 100%; }\n.nrp-stand > img { object-fit: fill; }\n.nrp-fan { transform-style: preserve-3d; pointer-events: none; }\n.nrp-fan-rod { position: absolute; left: 50%; top: 0px; bottom: calc(var(--u) * .16); width: calc(var(--u) * .03); margin-left: calc(var(--u) * -.015); background: linear-gradient(90deg, rgb(5, 5, 5), rgb(58, 58, 58) 45%, rgb(12, 12, 12)); }\n.nrp-fan-motor { position: absolute; left: 50%; bottom: 0px; width: calc(var(--u) * .26); height: calc(var(--u) * .18); margin-left: calc(var(--u) * -.13); border-radius: 18% 18% 45% 45% / 20% 20% 60% 60%; background: radial-gradient(at 38% 30%, rgb(74, 74, 74), rgb(22, 22, 22) 45%, rgb(4, 4, 4)); box-shadow: 0 calc(var(--u) * .02) calc(var(--u) * .05) rgba(0,0,0,.4); }\n.nrp-fan-blades { position: absolute; transform: rotateX(90deg); transform-style: preserve-3d; }\n.nrp-fan-spin { position: absolute; inset: 0px; animation: 7s linear 0s infinite normal none running nrp-spin; }\n.nrp-fan-spin b { position: absolute; left: 50%; top: 48.2%; width: 49%; height: 3.6%; transform-origin: 0px 50%; clip-path: polygon(0px 40%, 14% 30%, 30% 14%, 97% 0px, 100% 12%, 100% 88%, 97% 100%, 30% 86%, 14% 70%, 0px 60%); background: linear-gradient(rgb(58, 58, 58), rgb(18, 18, 18) 45%, rgb(5, 5, 5) 70%, rgb(30, 30, 30)); }\n.nrp-fan-spin b:nth-child(2) { transform: rotate(60deg); }\n.nrp-fan-spin b:nth-child(3) { transform: rotate(120deg); }\n.nrp-fan-spin b:nth-child(4) { transform: rotate(180deg); }\n.nrp-fan-spin b:nth-child(5) { transform: rotate(240deg); }\n.nrp-fan-spin b:nth-child(6) { transform: rotate(300deg); }\n@keyframes nrp-spin { \n  100% { transform: rotate(360deg); }\n}\n@media (prefers-reduced-motion: reduce) { .nrp-fan-spin { animation: none; } }\n.nrp-bench3d { position: absolute; transform-style: preserve-3d; pointer-events: none; }\n.nrp-bench3d i { position: absolute; display: block; backface-visibility: visible; }\n.nrp-b-top { transform: rotateX(90deg); background-repeat: no-repeat; }\n.nrp-b-edge { background-repeat: no-repeat; }\n.nrp-b-end { background: linear-gradient(rgb(122, 76, 44), rgb(78, 46, 25)); }\n.nrp-b-leg { transform-origin: 50% 0px; background: linear-gradient(90deg, rgb(63, 36, 20), rgb(140, 90, 53) 40%, rgb(107, 65, 38) 70%, rgb(58, 33, 18)); clip-path: polygon(0px 0px, 100% 0px, 72% 100%, 28% 100%); }"
 },
 "narrow": {
  "room": {
   "Wm": 4.2,
   "Dm": 17,
   "DNm": 4.5,
   "HM": 7.2
  },
  "walls": {
   "back": {
    "bands": [
     { "img": "narrow/back.webp", "x": 0, "y": 0, "w": 4.2, "h": 7.2 }
    ],
    "hot": [
     { "pop": "cafe", "label": "Nebula Cafe", "box": [ 0.249, 0.399, 3.701, 6.801 ] }
    ]
   },
   "left": {
    "bands": [
     { "img": "narrow/left-0.webp", "x": 0, "y": 0, "w": 3.53, "h": 7.2 },
     { "img": "narrow/left-3.5.webp", "x": 3.5, "y": 0, "w": 5.03, "h": 7.2 },
     { "img": "narrow/left-8.5.webp", "x": 8.5, "y": 0, "w": 8.5, "h": 7.2 }
    ],
    "hot": [
     { "pop": "newsstand", "label": "Newsstand", "box": [ 1.191, 0, 3.6, 7.2 ] },
     { "pop": "wall", "label": "Wishing Wall", "box": [ 4.791, 1.25, 12.211, 5.95 ] }
    ]
   },
   "right": {
    "bands": [
     { "img": "narrow/right-0.webp", "x": 13.47, "y": 0, "w": 3.53, "h": 7.2 },
     { "img": "narrow/right-3.5.webp", "x": 8.47, "y": 0, "w": 5.03, "h": 7.2 },
     { "img": "narrow/right-8.5.webp", "x": 0, "y": 0, "w": 8.5, "h": 7.2 }
    ],
    "hot": [
     { "pop": "gallery", "label": "Gallery", "box": [ 7.144, 1.849, 5.377, 3.999 ] }
    ]
   },
   "floor": {
    "bands": [
     { "img": "narrow/floor.webp", "x": 0, "y": 0, "w": 4.2, "h": 12.5 }
    ],
    "style": "background-image: url(\"../assets/img/post/obsidian-floor.webp\"); background-size: calc(var(--u) * 2) calc(var(--u) * 2);",
    "hot": []
   },
   "floor-near": {
    "bands": [
     { "img": "narrow/floor-near.webp", "x": 0, "y": 0, "w": 4.2, "h": 4.5 }
    ],
    "style": "background-image: url(\"../assets/img/post/obsidian-floor.webp\"); background-size: calc(var(--u) * 2) calc(var(--u) * 2); background-position: calc(var(--u) * 0) calc(var(--u) * -12.5);",
    "hot": []
   }
  },
  "pieces": [
   {
    "bands": [
     { "img": "narrow/roof6-0.webp", "x": 0, "y": 0, "w": 2.2649, "h": 3.53 },
     { "img": "narrow/roof6-3.5.webp", "x": 0, "y": 3.5, "w": 2.2649, "h": 5.03 },
     { "img": "narrow/roof6-8.5.webp", "x": 0, "y": 8.5, "w": 2.2649, "h": 8.5 }
    ],
    "hot": [],
    "kind": "panel",
    "cls": "nrp-roof",
    "style": "left: calc(var(--u) * 0); top: calc(var(--u) * 0); width: calc(var(--u) * 2.2649); height: calc(var(--u) * 17); transform-origin: calc(var(--u) * 0) calc(var(--u) * 0); transform: rotateZ(-22deg) rotateX(-90deg);"
   },
   {
    "bands": [
     { "img": "narrow/roof7-0.webp", "x": 0, "y": 0, "w": 2.2649, "h": 3.53 },
     { "img": "narrow/roof7-3.5.webp", "x": 0, "y": 3.5, "w": 2.2649, "h": 5.03 },
     { "img": "narrow/roof7-8.5.webp", "x": 0, "y": 8.5, "w": 2.2649, "h": 8.5 }
    ],
    "hot": [],
    "kind": "panel",
    "cls": "nrp-roof",
    "style": "left: calc(var(--u) * 1.9351); top: calc(var(--u) * 0); width: calc(var(--u) * 2.2649); height: calc(var(--u) * 17); transform-origin: 100% calc(var(--u) * 0); transform: rotateZ(22deg) rotateX(-90deg);"
   },
   { "kind": "piece", "img": "narrow/piece8.webp", "x": 0.0065, "y": -1.1986, "w": 4.1869, "h": 1.5488, "z": 17 },
   { "kind": "piece", "img": "narrow/piece9.webp", "x": 0.0065, "y": -0.5776, "w": 1.7406, "h": 7.7626, "z": 14.28 },
   { "kind": "piece", "img": "narrow/piece10.webp", "x": 1.9238, "y": -0.995, "w": 1.3603, "h": 5.5303, "z": 14.62 },
   { "kind": "piece", "img": "narrow/piece11.webp", "x": 2.8438, "y": -0.6556, "w": 1.2003, "h": 4.7303, "z": 13.43 },
   { "kind": "piece", "img": "narrow/piece12.webp", "x": 0.0065, "y": 5.3204, "w": 2.1377, "h": 1.8646, "z": 16.575 },
   { "kind": "piece", "img": "narrow/piece13.webp", "x": 2.0557, "y": 5.3204, "w": 2.1378, "h": 1.8646, "z": 16.575 },
   { "kind": "piece", "img": "narrow/piece17.webp", "x": 0.5498, "y": 4.738, "w": 3.6436, "h": 2.447, "z": 11.5 },
   { "kind": "piece", "img": "narrow/piece18.webp", "x": 1.9667, "y": 3.8006, "w": 1.1577, "h": 1.7495, "z": 11.45 },
   { "kind": "piece", "img": "narrow/piece19.webp", "x": 2.1883, "y": -1.0186, "w": 0.7143, "h": 5.5696, "z": 11.45 },
   { "kind": "piece", "img": "narrow/piece20.webp", "x": 2.4024, "y": 5.2093, "w": 1.7911, "h": 1.9757, "z": 10.7 },
   { "kind": "piece", "img": "narrow/piece21.webp", "x": 1.9078, "y": -0.7894, "w": 2.2856, "h": 7.9744, "z": 11.4 }
  ],
  "live": "<div class=\"nrp-bench3d nrp-built\" style=\"left: calc(var(--u) * 0.25); top: calc(var(--u) * 6.75); width: calc(var(--u) * 1.5); height: calc(var(--u) * 0.45); transform: translateZ(calc(var(--u) * -2.99)) rotateY(90deg);\"><i class=\"nrp-b-top\" style=\"left:0;top:calc(var(--u) * -0.19);width:calc(var(--u) * 1.5);height:calc(var(--u) * 0.38);background-image:url(../assets/img/post/bench.webp);background-size:132.8% 647.1%;background-position:calc(var(--u) * -0.2425) calc(var(--u) * -0.0448)\"></i><i class=\"nrp-b-edge\" style=\"left:0;top:0;width:calc(var(--u) * 1.5);height:calc(var(--u) * 0.05);transform:translateZ(calc(var(--u) * 0.19));background-image:url(../assets/img/post/bench.webp);background-size:132.8% 785.7%;background-position:calc(var(--u) * -0.2425) calc(var(--u) * -0.0677)\"></i><i class=\"nrp-b-edge\" style=\"left:0;top:0;width:calc(var(--u) * 1.5);height:calc(var(--u) * 0.05);transform:translateZ(calc(var(--u) * -0.19)) rotateY(180deg);background-image:url(../assets/img/post/bench.webp);background-size:132.8% 785.7%;background-position:calc(var(--u) * -0.2425) calc(var(--u) * -0.0677)\"></i><i class=\"nrp-b-end\" style=\"left:calc(var(--u) * -0.19);top:0;width:calc(var(--u) * 0.38);height:calc(var(--u) * 0.05);transform:rotateY(90deg)\"></i><i class=\"nrp-b-end\" style=\"left:calc(var(--u) * 1.31);top:0;width:calc(var(--u) * 0.38);height:calc(var(--u) * 0.05);transform:rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.275);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(-7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.275);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(-7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.275);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(-7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.275);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(-7deg) rotateY(90deg)\"></i></div>\n<div class=\"nrp-bench3d nrp-built\" style=\"left: calc(var(--u) * 0.25); top: calc(var(--u) * 6.75); width: calc(var(--u) * 1.5); height: calc(var(--u) * 0.45); transform: translateZ(calc(var(--u) * -10.895)) rotateY(90deg);\"><i class=\"nrp-b-top\" style=\"left:0;top:calc(var(--u) * -0.19);width:calc(var(--u) * 1.5);height:calc(var(--u) * 0.38);background-image:url(../assets/img/post/bench.webp);background-size:132.8% 647.1%;background-position:calc(var(--u) * -0.2425) calc(var(--u) * -0.0448)\"></i><i class=\"nrp-b-edge\" style=\"left:0;top:0;width:calc(var(--u) * 1.5);height:calc(var(--u) * 0.05);transform:translateZ(calc(var(--u) * 0.19));background-image:url(../assets/img/post/bench.webp);background-size:132.8% 785.7%;background-position:calc(var(--u) * -0.2425) calc(var(--u) * -0.0677)\"></i><i class=\"nrp-b-edge\" style=\"left:0;top:0;width:calc(var(--u) * 1.5);height:calc(var(--u) * 0.05);transform:translateZ(calc(var(--u) * -0.19)) rotateY(180deg);background-image:url(../assets/img/post/bench.webp);background-size:132.8% 785.7%;background-position:calc(var(--u) * -0.2425) calc(var(--u) * -0.0677)\"></i><i class=\"nrp-b-end\" style=\"left:calc(var(--u) * -0.19);top:0;width:calc(var(--u) * 0.38);height:calc(var(--u) * 0.05);transform:rotateY(90deg)\"></i><i class=\"nrp-b-end\" style=\"left:calc(var(--u) * 1.31);top:0;width:calc(var(--u) * 0.38);height:calc(var(--u) * 0.05);transform:rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 0.175);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.275);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(-7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.275);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * -0.11)) rotateZ(-7deg) rotateY(90deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.275);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(-7deg) rotateY(0deg)\"></i><i class=\"nrp-b-leg\" style=\"left:calc(var(--u) * 1.275);top:calc(var(--u) * 0.05);width:calc(var(--u) * 0.05);height:calc(var(--u) * 0.4);transform:translateZ(calc(var(--u) * 0.11)) rotateZ(-7deg) rotateY(90deg)\"></i></div>\n<div class=\"nrp-built nrp-fan nrp-stand\" style=\"left: calc(var(--u) * 0.75); top: calc(var(--u) * -0.8485); width: calc(var(--u) * 2.7); height: calc(var(--u) * 3.9484); transform: translateZ(calc(var(--u) * -3.74));\"><i class=\"nrp-fan-rod\"></i><div class=\"nrp-fan-blades\" style=\"width: calc(var(--u) * 2.7); height: calc(var(--u) * 2.7); left: calc(var(--u) * 0); top: calc(var(--u) * 2.4985);\"><div class=\"nrp-fan-spin\"><b></b><b></b><b></b><b></b><b></b><b></b></div></div><i class=\"nrp-fan-motor\"></i></div>",
  "css": ".nrp-stand { position: absolute; }\n.nrp-stand > svg, .nrp-stand > img { display: block; width: 100%; height: 100%; }\n.nrp-stand > img { object-fit: fill; }\n.nrp-fan { transform-style: preserve-3d; pointer-events: none; }\n.nrp-fan-rod { position: absolute; left: 50%; top: 0px; bottom: calc(var(--u) * .16); width: calc(var(--u) * .03); margin-left: calc(var(--u) * -.015); background: linear-gradient(90deg, rgb(5, 5, 5), rgb(58, 58, 58) 45%, rgb(12, 12, 12)); }\n.nrp-fan-motor { position: absolute; left: 50%; bottom: 0px; width: calc(var(--u) * .26); height: calc(var(--u) * .18); margin-left: calc(var(--u) * -.13); border-radius: 18% 18% 45% 45% / 20% 20% 60% 60%; background: radial-gradient(at 38% 30%, rgb(74, 74, 74), rgb(22, 22, 22) 45%, rgb(4, 4, 4)); box-shadow: 0 calc(var(--u) * .02) calc(var(--u) * .05) rgba(0,0,0,.4); }\n.nrp-fan-blades { position: absolute; transform: rotateX(90deg); transform-style: preserve-3d; }\n.nrp-fan-spin { position: absolute; inset: 0px; animation: 7s linear 0s infinite normal none running nrp-spin; }\n.nrp-fan-spin b { position: absolute; left: 50%; top: 48.2%; width: 49%; height: 3.6%; transform-origin: 0px 50%; clip-path: polygon(0px 40%, 14% 30%, 30% 14%, 97% 0px, 100% 12%, 100% 88%, 97% 100%, 30% 86%, 14% 70%, 0px 60%); background: linear-gradient(rgb(58, 58, 58), rgb(18, 18, 18) 45%, rgb(5, 5, 5) 70%, rgb(30, 30, 30)); }\n.nrp-fan-spin b:nth-child(2) { transform: rotate(60deg); }\n.nrp-fan-spin b:nth-child(3) { transform: rotate(120deg); }\n.nrp-fan-spin b:nth-child(4) { transform: rotate(180deg); }\n.nrp-fan-spin b:nth-child(5) { transform: rotate(240deg); }\n.nrp-fan-spin b:nth-child(6) { transform: rotate(300deg); }\n@keyframes nrp-spin { \n  100% { transform: rotate(360deg); }\n}\n@media (prefers-reduced-motion: reduce) { .nrp-fan-spin { animation: none; } }\n.nrp-bench3d { position: absolute; transform-style: preserve-3d; pointer-events: none; }\n.nrp-bench3d i { position: absolute; display: block; backface-visibility: visible; }\n.nrp-b-top { transform: rotateX(90deg); background-repeat: no-repeat; }\n.nrp-b-edge { background-repeat: no-repeat; }\n.nrp-b-end { background: linear-gradient(rgb(122, 76, 44), rgb(78, 46, 25)); }\n.nrp-b-leg { transform-origin: 50% 0px; background: linear-gradient(90deg, rgb(63, 36, 20), rgb(140, 90, 53) 40%, rgb(107, 65, 38) 70%, rgb(58, 33, 18)); clip-path: polygon(0px 0px, 100% 0px, 72% 100%, 28% 100%); }"
 }
};
