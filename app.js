// They Point At You — hold your cursor still and the photo swivels so
// the finger points EXACTLY at your cursor.
//
// How the trick works (for real this time):
//  1. Every photo is calibrated with its TRUE finger angle (beta,
//     measured from the actual pixels — never assumed) and the knuckle
//     position (kx, ky), which is the rotation pivot.
//  2. We pick the photo whose beta is closest to the cursor's angle and
//     rotate it by exactly (angle - beta) about the knuckle.
//  3. Then we slide the whole photo so the knuckle sits on the line
//     between screen center and the cursor, a comfortable distance back
//     from it. The finger's ray then passes precisely through the cursor,
//     the person stays nicely framed, and the photo barely has to tilt.

const PHOTOS = [
  // src, beta (deg, 0=east, y-down), knuckle, fingertip, crop center
  // (cx/cy are object-position values; the cover-crop window follows)
  { src: "img/point-right.jpg",     beta: -5.56,   kx: 0.793, ky: 0.556, tx: 0.947, ty: 0.541, cx: 0.788, cy: 0.500 },
  { src: "img/point-right-2.jpg",   beta: -4.57,   kx: 0.631, ky: 0.624, tx: 0.706, ty: 0.618, cx: 0.500, cy: 0.500 },
  { src: "img/point-left.jpg",      beta: -174.44, kx: 0.207, ky: 0.556, tx: 0.053, ty: 0.541, cx: 0.211, cy: 0.500 },
  { src: "img/point-left-2.jpg",    beta: -175.43, kx: 0.369, ky: 0.624, tx: 0.294, ty: 0.618, cx: 0.500, cy: 0.500 },
  { src: "img/point-up.jpg",        beta: -88.91,  kx: 0.308, ky: 0.140, tx: 0.310, ty: 0.035, cx: 0.500, cy: 0.024 },
  { src: "img/point-down.jpg",      beta: 84.81,   kx: 0.320, ky: 0.838, tx: 0.330, ty: 0.948, cx: 0.500, cy: 0.949 },
  { src: "img/point-upright.jpg",   beta: -47.77,  kx: 0.505, ky: 0.508, tx: 0.554, ty: 0.454, cx: 0.500, cy: 0.500 },
  { src: "img/point-upleft.jpg",    beta: -132.23, kx: 0.495, ky: 0.508, tx: 0.446, ty: 0.454, cx: 0.500, cy: 0.500 },
  { src: "img/point-downright.jpg", beta: 27.43,   kx: 0.794, ky: 0.768, tx: 0.927, ty: 0.837, cx: 0.661, cy: 0.771 },
  { src: "img/point-downleft.jpg",  beta: 152.57,  kx: 0.206, ky: 0.768, tx: 0.073, ty: 0.837, cx: 0.339, cy: 0.771 },
];
const CAMERA = ["img/point-camera.jpg", "img/point-camera-2.jpg"]; // cursor near center

const IMG_AR = 1280 / 1920; // source photos are portrait
const S = 1.05; // sharp layer is slightly oversized; blurred bg covers the rest
const SETTLE_MS = 2500; // how long the cursor must sit still
const CIRC = 2 * Math.PI * 22; // lock-on ring circumference (r=22)

const layerA = document.getElementById("layerA");
const layerB = document.getElementById("layerB");
const moverA = document.getElementById("moverA");
const moverB = document.getElementById("moverB");
const bgA = document.getElementById("bgA");
const bgB = document.getElementById("bgB");
const photoA = document.getElementById("photoA");
const photoB = document.getElementById("photoB");
const ring = document.getElementById("ring");
const ringFg = document.getElementById("ringFg");
const hint = document.getElementById("hint");

let showingA = true;
let settleTimer = null;
let settleStart = 0;
let rafId = null;
const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// Warm the cache so swaps are instant.
PHOTOS.map((p) => p.src)
  .concat(CAMERA)
  .forEach((src) => {
    const img = new Image();
    img.src = src;
  });

function wrapDeg(d) {
  d = d % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

// Image fractions -> fractions of the displayed element, accounting for
// the object-fit: cover crop on this viewport.
// (object-position q% puts the crop window at [q*(1-f), q*(1-f)+f].)
function toEl(fx, fy, p) {
  const A = window.innerWidth / window.innerHeight;
  if (A >= IMG_AR) {
    const h = IMG_AR / A; // visible height fraction of the image
    return { x: fx, y: (fy - p.cy * (1 - h)) / h };
  }
  const w = A / IMG_AR; // visible width fraction of the image
  return { x: (fx - p.cx * (1 - w)) / w, y: fy };
}

// Element fractions -> screen pixels (photo centered, S overscan).
function toScreen(ex, ey) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  return { x: W / 2 + (ex - 0.5) * S * W, y: H / 2 + (ey - 0.5) * S * H };
}

// Returns the photo plus the exact rotation and slide that puts the
// finger's ray through (cx, cy). The rotation pivots around the knuckle
// (which is rotation-invariant), then the slide moves the knuckle onto
// the aim line, back from the cursor — so the ray hits it dead-on.
function aimFor(cx, cy) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dx = cx - W / 2;
  const dy = cy - H / 2;
  if (Math.hypot(dx, dy) < Math.min(W, H) * 0.12) {
    return { src: CAMERA[(Math.random() * CAMERA.length) | 0], cam: true };
  }
  const theta = (Math.atan2(dy, dx) * 180) / Math.PI;
  let best = PHOTOS[0];
  let bestD = 999;
  for (const p of PHOTOS) {
    const d = Math.abs(wrapDeg(theta - p.beta));
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  const rot = wrapDeg(theta - best.beta);
  const k = toEl(best.kx, best.ky, best);
  const tp = toEl(best.tx, best.ty, best);
  const Ks = toScreen(k.x, k.y);
  const Ts = toScreen(tp.x, tp.y);
  const fingerLen = Math.hypot(Ts.x - Ks.x, Ts.y - Ks.y);
  // Park the knuckle back from the cursor along the aim line, far enough
  // that the fingertip never overshoots past the cursor.
  const L = Math.max(0.38 * Math.min(W, H), fingerLen * 1.25);
  const ur = (theta * Math.PI) / 180;
  const Ox = cx - Math.cos(ur) * L;
  const Oy = cy - Math.sin(ur) * L;
  return {
    src: best.src,
    rot,
    ox: k.x,
    oy: k.y,
    cx: best.cx,
    cy: best.cy,
    tx: Ox - Ks.x, // slide that carries the knuckle to (Ox, Oy)
    ty: Oy - Ks.y,
    cam: false,
  };
}

function showPhoto(a) {
  const layer = showingA ? layerB : layerA;
  const hideLayer = showingA ? layerA : layerB;
  const mover = showingA ? moverB : moverA;
  const bg = showingA ? bgB : bgA;
  const sharp = showingA ? photoB : photoA;
  bg.src = a.src;
  sharp.src = a.src;
  const pos = `${(a.cx || 0.5) * 100}% ${(a.cy || 0.5) * 100}%`;
  bg.style.objectPosition = pos;
  sharp.style.objectPosition = pos;
  if (a.cam) {
    mover.style.transform = "translate(0px, 0px)";
    sharp.style.transformOrigin = "50% 50%";
    sharp.style.transform = "translate(-50%, -50%)";
  } else {
    mover.style.transform = `translate(${a.tx}px, ${a.ty}px)`;
    sharp.style.transformOrigin = `${a.ox * 100}% ${a.oy * 100}%`;
    sharp.style.transform = `translate(-50%, -50%) rotate(${a.rot}deg)`;
  }
  layer.classList.add("visible");
  hideLayer.classList.remove("visible");
  showingA = !showingA;
}

// The cursor sat still long enough: aim a photo exactly at it.
function lockIn() {
  ring.classList.add("hidden");
  rafId = null;
  showPhoto(aimFor(cursor.x, cursor.y));
}

// Fills the lock-on ring while we wait for the cursor to settle.
function tick(now) {
  const p = Math.min(1, (now - settleStart) / SETTLE_MS);
  ringFg.style.strokeDashoffset = String(CIRC * (1 - p));
  ring.style.left = cursor.x + "px";
  ring.style.top = cursor.y + "px";
  rafId = p < 1 ? requestAnimationFrame(tick) : null;
}

window.addEventListener("pointermove", (e) => {
  cursor.x = e.clientX;
  cursor.y = e.clientY;
  hint.classList.add("hidden");
  ring.classList.remove("hidden");
  clearTimeout(settleTimer);
  settleStart = performance.now();
  settleTimer = setTimeout(lockIn, SETTLE_MS);
  if (rafId === null) rafId = requestAnimationFrame(tick);
});
