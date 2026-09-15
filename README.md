# They Point At You 👉

A little game: the whole page is a photo of people pointing. Hold your
cursor still at any spot, wait a moment, and the photo swivels so the
finger points EXACTLY at your cursor. Move again, hold still, and they
re-aim.

## How the trick works

A photo's fingers can't move — but the photo itself can rotate and
slide. The app keeps a pool of 115 calibrated photos. Every
photo knows its TRUE finger angle, measured from the actual pixels
(guessing got angles wrong by up to 18°), plus the exact knuckle
position that serves as the rotation pivot. When your cursor settles,
the app:

1. measures the exact angle from the screen center to your cursor,
2. picks the loaded photo whose true finger angle is nearest,
3. rotates the photo about the knuckle by exactly the leftover difference,
4. slides the photo so the knuckle sits on the aim line, back from your
   cursor — so the finger's ray passes precisely through the cursor pixel.

The finger lands right on your cursor, every time, with small natural
rotations (max ~33°). A blurred copy of the photo fills the screen edges.

## Run it

Open `index.html` in any browser (or visit the GitHub Pages link),
hover somewhere, and hold still.

## Files

- `index.html` — two stacked full-screen photos (for crossfading), a
  lock-on ring, and the intro hint
- `styles.css` — oversized swiveling photos, the filling progress ring
- `app.js` — cursor settle detection (2.5 s), exact-aim angle math
- `img/` — 115 photos: 112 pointing directions × varied people/scenes,
  plus 3 pointing at the camera (extra photos load lazily after the core set)
