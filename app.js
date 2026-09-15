// They Point At You — the game: hold your cursor still at any spot,
// wait a moment, and the photo swaps to people pointing at that spot.
//
// How the trick works: we keep one photo per pointing direction
// (left / right / up / down / at-the-camera). When the cursor settles,
// we measure the angle from the middle of the screen to the cursor and
// crossfade to the photo pointing that way.

const PHOTOS = {
  right: "img/point-right.jpg",
  left: "img/point-left.jpg",
  up: "img/point-up.jpg",
  down: "img/point-down.jpg",
  camera: "img/point-camera.jpg", // pointing at the viewer = cursor near center
};

const SETTLE_MS = 2500; // how long the cursor must sit still
const CIRC = 2 * Math.PI * 22; // lock-on ring circumference (r=22)

const photoA = document.getElementById("photoA");
const photoB = document.getElementById("photoB");
const ring = document.getElementById("ring");
const ringFg = document.getElementById("ringFg");
const hint = document.getElementById("hint");

let showingA = true;
let current = "camera"; // matches photoA's initial src
let settleTimer = null;
let settleStart = 0;
let rafId = null;
const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// Warm the cache so swaps are instant.
Object.values(PHOTOS).forEach((src) => {
  const img = new Image();
  img.src = src;
});

// Which photo points at (cx, cy)? Measured from screen center,
// because the people stand in the middle of each frame.
function directionFor(cx, cy) {
  const dx = cx - window.innerWidth / 2;
  const dy = cy - window.innerHeight / 2;
  if (Math.hypot(dx, dy) < Math.min(window.innerWidth, window.innerHeight) * 0.12) {
    return "camera";
  }
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI; // 0° = east, 90° = south
  if (deg >= -45 && deg < 45) return "right";
  if (deg >= 45 && deg < 135) return "down";
  if (deg >= -135 && deg < -45) return "up";
  return "left";
}

function crossfade(dir) {
  const showEl = showingA ? photoB : photoA;
  const hideEl = showingA ? photoA : photoB;
  showEl.src = PHOTOS[dir];
  showEl.classList.add("visible");
  hideEl.classList.remove("visible");
  showingA = !showingA;
}

// The cursor sat still long enough: pick the photo pointing at it.
function lockIn() {
  ring.classList.add("hidden");
  rafId = null;
  const dir = directionFor(cursor.x, cursor.y);
  if (dir !== current) {
    current = dir;
    crossfade(dir);
  }
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
