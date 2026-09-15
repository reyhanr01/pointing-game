// They Point At You — hold your cursor still and the photo SWIVELS so
// the finger points EXACTLY at your cursor, not just roughly toward it.
//
// How the trick works: every photo has a known pointing angle
// (0° = east, 90° = south, -90° = north). We pick the photo whose angle
// is nearest the cursor's angle from screen center, then rotate the
// photo by the leftover difference. The finger lands right on target.

const SETS = {
  0:    { files: ["img/point-right.jpg", "img/point-right-2.jpg"] },
  "-45":  { files: ["img/point-upright.jpg"] },
  "-90":  { files: ["img/point-up.jpg"] },
  "-135": { files: ["img/point-upleft.jpg"] },
  180:  { files: ["img/point-left.jpg", "img/point-left-2.jpg"] },
  135:  { files: ["img/point-downleft.jpg"] },
  90:   { files: ["img/point-down.jpg"] },
  45:   { files: ["img/point-downright.jpg"] },
};
const CAMERA = ["img/point-camera.jpg", "img/point-camera-2.jpg"]; // cursor near center

const SETTLE_MS = 2500; // how long the cursor must sit still
const CIRC = 2 * Math.PI * 22; // lock-on ring circumference (r=22)

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
Object.values(SETS)
  .flatMap((s) => s.files)
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

// Returns the photo + rotation that aims exactly at (cx, cy).
function aimFor(cx, cy) {
  const dx = cx - window.innerWidth / 2;
  const dy = cy - window.innerHeight / 2;
  if (Math.hypot(dx, dy) < Math.min(window.innerWidth, window.innerHeight) * 0.12) {
    return { src: CAMERA[(Math.random() * CAMERA.length) | 0], rot: 0 };
  }
  const theta = (Math.atan2(dy, dx) * 180) / Math.PI;
  let best = 0;
  let bestD = 999;
  for (const k of Object.keys(SETS)) {
    const b = Number(k);
    const d = Math.abs(wrapDeg(theta - b));
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  const files = SETS[best].files;
  return { src: files[(Math.random() * files.length) | 0], rot: wrapDeg(theta - best) };
}

function showPhoto(src, rot) {
  const showEl = showingA ? photoB : photoA;
  const hideEl = showingA ? photoA : photoB;
  showEl.src = src;
  showEl.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
  showEl.classList.add("visible");
  hideEl.classList.remove("visible");
  showingA = !showingA;
}

// The cursor sat still long enough: aim a photo exactly at it.
function lockIn() {
  ring.classList.add("hidden");
  rafId = null;
  const { src, rot } = aimFor(cursor.x, cursor.y);
  showPhoto(src, rot);
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
