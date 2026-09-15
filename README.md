# They Point At You 👉

A little game: the whole page is a photo of people pointing. Hold your
cursor still at any spot, wait a moment, and the photo swaps to people
pointing right at that spot. Move again, hold still, and they follow.

## How it works

- `index.html` — two stacked full-screen photos (for crossfading), a
  lock-on ring, and the intro hint
- `styles.css` — full-bleed photos, the filling progress ring
- `app.js` — cursor settle detection (2.5 s), angle math from screen
  center, and photo crossfade
- `img/` — one photo per pointing direction: left, right, up, down,
  and at-the-camera (for the center). Faces are blurred.

The trick: the people stand in the middle of every frame, so measuring
the angle from the screen center to your cursor tells us which photo
"points" at you.

## Run it

Open `index.html` in any browser (or visit the GitHub Pages link),
hover somewhere, and hold still.
