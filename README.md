# They Point At You 👉

A little game: the whole page is a photo of people pointing. Hold your
cursor still at any spot, wait a moment, and the photo swivels so the
finger points EXACTLY at your cursor. Move again, hold still, and they
re-aim.

## How the trick works

A photo's fingers can't move — but the photo itself can rotate and
slide. The app keeps a pool of 36 real photos. Every pointing photo
knows its TRUE finger angle, measured from the actual pixels (and
corrected for the photo's aspect ratio, which the old calibration
ignored — that alone threw angles off by up to ~11°), plus the exact
knuckle position that serves as the rotation pivot. When your cursor
settles, the app:

1. measures the exact angle from the screen center to your cursor,
2. picks the loaded photo whose true finger angle is nearest,
3. rotates the photo about the knuckle by exactly the leftover difference,
4. slides the photo so the knuckle sits on the aim line, back from your
   cursor — so the finger's ray passes precisely through the cursor pixel.

The finger lands right on your cursor, every time (tested: max ray
error 0.02°, max rotation ~23°). A blurred copy of the photo fills the
screen edges.

## Photos

Real, freely-licensed photos from [Pexels](https://www.pexels.com/license/)
(free to use, no attribution required — thanks to the photographers
there). 22 photos: 14 pointing in measured directions, each with a
horizontally-mirrored twin for full directional coverage, plus 8 people
pointing straight at the camera for when your cursor sits near the
middle. Each directional photo was calibrated by hand: the knuckle and
fingertip were located in the actual image, and the finger angle was
computed in true pixel space.

## Run it

Open `index.html` in any browser (or visit the GitHub Pages link),
hover somewhere, and hold still.

## Files

- `index.html` — two stacked full-screen photos (for crossfading), a
  lock-on ring, and the intro hint
- `styles.css` — oversized swiveling photos, the filling progress ring
- `app.js` — cursor settle detection (2.5 s), exact-aim angle math,
  calibrated photo pool
- `img/` — 36 photos: 28 directional (14 real photos + mirrors) and
  8 pointing at the camera (extra photos load lazily after the first few)
- `img-src/online/` — the original downloaded Pexels photos
