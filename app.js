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

// They Point At You — hold your cursor still and the photo swivels so
// the finger points EXACTLY at your cursor.
//
// Photos are real, freely-licensed photos from Pexels (pexels.com/license),
// each calibrated with its TRUE finger angle (beta, measured from the actual
// pixels) and knuckle position (kx, ky), the rotation pivot. Mirrored copies
// double the directional coverage.
//
// How the trick works:
//  1. Pick the photo whose beta is closest to the cursor's angle.
//  2. Rotate it by exactly (angle - beta) about the knuckle.
//  3. Slide the photo so the knuckle sits on the aim line back from the
//     cursor — the finger's ray then passes precisely through the cursor.
// They Point At You — hold your cursor still and the photo swivels so
// the finger points EXACTLY at your cursor.
//
// Photos are real, freely-licensed photos from Pexels (pexels.com/license),
// each calibrated with its TRUE finger angle (beta, measured from the actual
// pixels and corrected for the photo's aspect ratio) and knuckle position
// (kx, ky), the rotation pivot. Mirrored copies double the coverage.
//
// How the trick works:
//  1. Pick the photo whose beta is closest to the cursor's angle.
//  2. Rotate it by exactly (angle - beta) about the knuckle.
//  3. Slide the photo so the knuckle sits on the aim line back from the
//     cursor — the finger's ray then passes precisely through the cursor.
const PHOTOS = [
  // src, beta (deg, 0=east, y-down), knuckle, fingertip, crop center, aspect
  // beta/kx/ky/tx/ty measured from the actual pixels via visual grounding;
  // beta is aspect-corrected (atan2(dy, dx*ar)) so it matches screen space.
  { src: "img/online-10029797.jpg", beta: -25.57, kx: 0.518, ky: 0.312, tx: 0.603, ty: 0.251, cx: 0.55, cy: 0.35, ar: 1.4995 },
  { src: "img/online-10029797-mirror.jpg", beta: -154.43, kx: 0.482, ky: 0.312, tx: 0.397, ty: 0.251, cx: 0.45, cy: 0.35, ar: 1.4995 },
  { src: "img/online-12357440.jpg", beta: -113.80, kx: 0.166, ky: 0.248, tx: 0.146, ty: 0.180, cx: 0.45, cy: 0.45, ar: 1.4995 },
  { src: "img/online-12357440-mirror.jpg", beta: -66.20, kx: 0.834, ky: 0.248, tx: 0.854, ty: 0.180, cx: 0.55, cy: 0.45, ar: 1.4995 },
  { src: "img/online-1981863.jpg", beta: -179.69, kx: 0.323, ky: 0.458, tx: 0.079, ty: 0.456, cx: 0.35, cy: 0.50, ar: 1.4995 },
  { src: "img/online-1981863-mirror.jpg", beta: -0.31, kx: 0.677, ky: 0.458, tx: 0.921, ty: 0.456, cx: 0.65, cy: 0.50, ar: 1.4995 },
  { src: "img/online-4756992.jpg", beta: -91.54, kx: 0.432, ky: 0.551, tx: 0.428, ty: 0.328, cx: 0.50, cy: 0.50, ar: 1.4995 },
  { src: "img/online-4756992-mirror.jpg", beta: -88.46, kx: 0.568, ky: 0.551, tx: 0.572, ty: 0.328, cx: 0.50, cy: 0.50, ar: 1.4995 },
  { src: "img/online-5883626.jpg", beta: 178.80, kx: 0.668, ky: 0.380, tx: 0.541, ty: 0.382, cx: 0.35, cy: 0.50, ar: 0.7515 },
  { src: "img/online-5883626-mirror.jpg", beta: 1.20, kx: 0.332, ky: 0.380, tx: 0.459, ty: 0.382, cx: 0.65, cy: 0.50, ar: 0.7515 },
  { src: "img/online-5898471.jpg", beta: 109.09, kx: 0.576, ky: 0.258, tx: 0.330, ty: 0.732, cx: 0.50, cy: 0.45, ar: 0.6667 },
  { src: "img/online-5898471-mirror.jpg", beta: 70.91, kx: 0.424, ky: 0.258, tx: 0.670, ty: 0.732, cx: 0.50, cy: 0.45, ar: 0.6667 },
  { src: "img/online-7114325.jpg", beta: -116.68, kx: 0.385, ky: 0.597, tx: 0.324, ty: 0.415, cx: 0.55, cy: 0.50, ar: 1.4995 },
  { src: "img/online-7114325-mirror.jpg", beta: -63.32, kx: 0.615, ky: 0.597, tx: 0.676, ty: 0.415, cx: 0.45, cy: 0.50, ar: 1.4995 },
  { src: "img/online-7640491.jpg", beta: -30.09, kx: 0.155, ky: 0.775, tx: 0.219, ty: 0.721, cx: 0.50, cy: 0.50, ar: 1.4559 },
  { src: "img/online-7640491-mirror.jpg", beta: -149.91, kx: 0.845, ky: 0.775, tx: 0.781, ty: 0.721, cx: 0.50, cy: 0.50, ar: 1.4559 },
  { src: "img/online-7640495.jpg", beta: -166.68, kx: 0.925, ky: 0.456, tx: 0.830, ty: 0.441, cx: 0.50, cy: 0.45, ar: 0.6667 },
  { src: "img/online-7640495-mirror.jpg", beta: -13.32, kx: 0.075, ky: 0.456, tx: 0.170, ty: 0.441, cx: 0.50, cy: 0.45, ar: 0.6667 },
  { src: "img/online-8727459.jpg", beta: -143.81, kx: 0.435, ky: 0.580, tx: 0.394, ty: 0.560, cx: 0.50, cy: 0.45, ar: 0.6667 },
  { src: "img/online-8727459-mirror.jpg", beta: -36.19, kx: 0.565, ky: 0.580, tx: 0.606, ty: 0.560, cx: 0.50, cy: 0.45, ar: 0.6667 },
  { src: "img/online-8727471.jpg", beta: -174.96, kx: 0.275, ky: 0.730, tx: 0.105, ty: 0.720, cx: 0.50, cy: 0.50, ar: 0.6667 },
  { src: "img/online-8727471-mirror.jpg", beta: -5.04, kx: 0.725, ky: 0.730, tx: 0.895, ty: 0.720, cx: 0.50, cy: 0.50, ar: 0.6667 },
  { src: "img/online-9017571.jpg", beta: -89.33, kx: 0.504, ky: 0.535, tx: 0.508, ty: 0.308, cx: 0.50, cy: 0.50, ar: 0.6667 },
  { src: "img/online-9017571-mirror.jpg", beta: -90.67, kx: 0.496, ky: 0.535, tx: 0.492, ty: 0.308, cx: 0.50, cy: 0.50, ar: 0.6667 },
  { src: "img/online-9127687.jpg", beta: 155.91, kx: 0.412, ky: 0.389, tx: 0.251, ty: 0.437, cx: 0.45, cy: 0.45, ar: 0.6667 },
  { src: "img/online-9127687-mirror.jpg", beta: 24.09, kx: 0.588, ky: 0.389, tx: 0.749, ty: 0.437, cx: 0.55, cy: 0.45, ar: 0.6667 },
  { src: "img/online-9486678.jpg", beta: -88.73, kx: 0.768, ky: 0.353, tx: 0.771, ty: 0.151, cx: 0.62, cy: 0.40, ar: 1.4981 },
  { src: "img/online-9486678-mirror.jpg", beta: -91.27, kx: 0.232, ky: 0.353, tx: 0.229, ty: 0.151, cx: 0.38, cy: 0.40, ar: 1.4981 },
];
const CAMERA = ["img/online-12306550.jpg", "img/online-1259327.jpg", "img/online-12969117.jpg", "img/online-13371234.jpg", "img/online-3779430.jpg", "img/online-3779434.jpg", "img/online-652355.jpg", "img/online-905947.jpg"]; // cursor near center

const IMG_AR = 1280 / 1920; // default source aspect (portrait); photos carry their own `ar`
const S = 1.05; // sharp layer is slightly oversized; blurred bg covers the rest
const SETTLE_MS = 2500; // how long the cursor must sit still
const CIRC = 2 * Math.PI * 22; // lock-on ring circumference (r=22)

// Photo loading is lazy: the first 10 load immediately, the rest trickle in
// afterwards so the page is usable instantly. Aim only picks loaded photos.
const loaded = {};
function preload(src, delay) {
  const im = new Image();
  im.onload = () => {
    loaded[src] = 1;
  };
  if (delay) setTimeout(() => (im.src = src), delay);
  else im.src = src;
}
PHOTOS.forEach((p, i) => preload(p.src, i < 10 ? 0 : 1500 + (i - 10) * 120));
CAMERA.forEach((src) => preload(src, 0));

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
  const ar = p.ar || IMG_AR;
  const A = window.innerWidth / window.innerHeight;
  if (A >= ar) {
    const h = ar / A; // visible height fraction of the image
    return { x: fx, y: (fy - p.cy * (1 - h)) / h };
  }
  const w = A / ar; // visible width fraction of the image
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
  // Prefer fully-loaded photos so the swap is instant; fall back to the
  // core set if the page just opened and nothing is cached yet.
  const pool = PHOTOS.filter((p) => loaded[p.src]);
  const candidates = pool.length ? pool : PHOTOS.slice(0, 10);
  let best = candidates[0];
  let bestD = 999;
  for (const p of candidates) {
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
