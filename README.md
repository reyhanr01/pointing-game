# They Point At You 👉

A little game: the whole page is a photo of people pointing. Hold your
cursor still at any spot, wait a moment, and the photo swivels so the
finger points EXACTLY at your cursor. Move again, hold still, and they
re-aim.

## How the trick works

A photo's fingers can't move — but the photo itself can rotate. The
app keeps 12 photos covering 8 pointing angles (plus 2 pointing at the
viewer for the center). When your cursor settles, it:

1. measures the exact angle from the screen center to your cursor,
2. picks the photo pointing nearest that angle,
3. rotates the photo by the leftover difference.

The finger lands right on your cursor, every time. The photo is
oversized (165%) so the swivel never reveals the edges.

## Run it

Open `index.html` in any browser (or visit the GitHub Pages link),
hover somewhere, and hold still.

## Files

- `index.html` — two stacked full-screen photos (for crossfading), a
  lock-on ring, and the intro hint
- `styles.css` — oversized swiveling photos, the filling progress ring
- `app.js` — cursor settle detection (2.5 s), exact-aim angle math
- `img/` — 12 photos: 8 pointing directions × varied people/scenes,
  plus 2 pointing at the camera
