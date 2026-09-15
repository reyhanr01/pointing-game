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
  // src, beta (deg, 0=east, y-down), knuckle, fingertip, crop center, aspect
  // (cx/cy are object-position values; the cover-crop window follows)
  // beta/kx/ky/tx/ty are measured from the actual pixels — never assumed.
  { src: "img/point-right.jpg",     beta: -5.56,   kx: 0.793, ky: 0.556, tx: 0.947, ty: 0.541, cx: 0.788, cy: 0.500, ar: 0.6667 },
  { src: "img/point-right-2.jpg",   beta: -4.57,   kx: 0.631, ky: 0.624, tx: 0.706, ty: 0.618, cx: 0.500, cy: 0.500, ar: 0.6667 },
  { src: "img/point-left.jpg",      beta: -174.44, kx: 0.207, ky: 0.556, tx: 0.053, ty: 0.541, cx: 0.211, cy: 0.500, ar: 0.6667 },
  { src: "img/point-left-2.jpg",    beta: -175.43, kx: 0.369, ky: 0.624, tx: 0.294, ty: 0.618, cx: 0.500, cy: 0.500, ar: 0.6667 },
  { src: "img/point-up.jpg",        beta: -88.91,  kx: 0.308, ky: 0.140, tx: 0.310, ty: 0.035, cx: 0.500, cy: 0.024, ar: 0.6667 },
  { src: "img/point-down.jpg",      beta: 84.81,   kx: 0.320, ky: 0.838, tx: 0.330, ty: 0.948, cx: 0.500, cy: 0.949, ar: 0.6667 },
  { src: "img/point-upright.jpg",   beta: -47.77,  kx: 0.505, ky: 0.508, tx: 0.554, ty: 0.454, cx: 0.500, cy: 0.500, ar: 0.6667 },
  { src: "img/point-upleft.jpg",    beta: -132.23, kx: 0.495, ky: 0.508, tx: 0.446, ty: 0.454, cx: 0.500, cy: 0.500, ar: 0.6667 },
  { src: "img/point-downright.jpg", beta: 27.43,   kx: 0.794, ky: 0.768, tx: 0.927, ty: 0.837, cx: 0.661, cy: 0.771, ar: 0.6667 },
  { src: "img/point-downleft.jpg",  beta: 152.57,  kx: 0.206, ky: 0.768, tx: 0.073, ty: 0.837, cx: 0.339, cy: 0.771, ar: 0.6667 },
  // Wave 1 — 38 more calibrated photos (19 generated + 19 mirrors).
  { src: "img/wave1-a1.jpg", beta: -9.14, kx: 0.866, ky: 0.429, tx: 0.953, ty: 0.415, cx: 1.0, cy: 0.001, ar: 1.5 },
  { src: "img/wave1-a1-mirror.jpg", beta: -170.86, kx: 0.134, ky: 0.429, tx: 0.047, ty: 0.415, cx: 0.0, cy: 0.001, ar: 1.5 },
  { src: "img/wave1-a2.jpg", beta: -6.93, kx: 0.718, ky: 0.511, tx: 0.932, ty: 0.485, cx: 1.0, cy: 0.497, ar: 0.6667 },
  { src: "img/wave1-a2-mirror.jpg", beta: -173.07, kx: 0.282, ky: 0.511, tx: 0.068, ty: 0.485, cx: 0.0, cy: 0.497, ar: 0.6667 },
  { src: "img/wave1-a3.jpg", beta: -3.27, kx: 0.795, ky: 0.455, tx: 0.935, ty: 0.447, cx: 1.0, cy: 0.422, ar: 0.6667 },
  { src: "img/wave1-a3-mirror.jpg", beta: -176.73, kx: 0.205, ky: 0.455, tx: 0.065, ty: 0.447, cx: 0.0, cy: 0.422, ar: 0.6667 },
  { src: "img/wave1-a4.jpg", beta: -9.46, kx: 0.873, ky: 0.354, tx: 0.957, ty: 0.34, cx: 1.0, cy: 0.0, ar: 1.5 },
  { src: "img/wave1-a4-mirror.jpg", beta: -170.54, kx: 0.127, ky: 0.354, tx: 0.043, ty: 0.34, cx: 0.0, cy: 0.0, ar: 1.5 },
  { src: "img/wave1-b1.jpg", beta: -48.37, kx: 0.835, ky: 0.232, tx: 0.915, ty: 0.142, cx: 1.0, cy: 0.0, ar: 0.6667 },
  { src: "img/wave1-b1-mirror.jpg", beta: -131.63, kx: 0.165, ky: 0.232, tx: 0.085, ty: 0.142, cx: 0.0, cy: 0.0, ar: 0.6667 },
  { src: "img/wave1-b2.jpg", beta: -55.24, kx: 0.86, ky: 0.208, tx: 0.928, ty: 0.11, cx: 1.0, cy: 0.0, ar: 0.6667 },
  { src: "img/wave1-b2-mirror.jpg", beta: -124.76, kx: 0.14, ky: 0.208, tx: 0.072, ty: 0.11, cx: 0.0, cy: 0.0, ar: 0.6667 },
  { src: "img/wave1-b3.jpg", beta: -54.67, kx: 0.835, ky: 0.238, tx: 0.908, ty: 0.135, cx: 1.0, cy: 0.0, ar: 0.6667 },
  { src: "img/wave1-b3-mirror.jpg", beta: -125.33, kx: 0.165, ky: 0.238, tx: 0.092, ty: 0.135, cx: 0.0, cy: 0.0, ar: 0.6667 },
  { src: "img/wave1-b4.jpg", beta: -43.84, kx: 0.771, ky: 0.256, tx: 0.897, ty: 0.135, cx: 1.0, cy: 0.013, ar: 0.6667 },
  { src: "img/wave1-b4-mirror.jpg", beta: -136.16, kx: 0.229, ky: 0.256, tx: 0.103, ty: 0.135, cx: 0.0, cy: 0.013, ar: 0.6667 },
  { src: "img/wave1-c1.jpg", beta: 46.42, kx: 0.87, ky: 0.77, tx: 0.929, ty: 0.832, cx: 1.0, cy: 1.0, ar: 1.5 },
  { src: "img/wave1-c1-mirror.jpg", beta: 133.58, kx: 0.13, ky: 0.77, tx: 0.071, ty: 0.832, cx: 0.0, cy: 1.0, ar: 1.5 },
  { src: "img/wave1-c2.jpg", beta: 38.9, kx: 0.833, ky: 0.794, tx: 0.921, ty: 0.865, cx: 1.0, cy: 1.0, ar: 1.5 },
  { src: "img/wave1-c2-mirror.jpg", beta: 141.1, kx: 0.167, ky: 0.794, tx: 0.079, ty: 0.865, cx: 0.0, cy: 1.0, ar: 1.5 },
  { src: "img/wave1-c3.jpg", beta: 54.54, kx: 0.814, ky: 0.831, tx: 0.866, ty: 0.904, cx: 1.0, cy: 1.0, ar: 1.5 },
  { src: "img/wave1-c3-mirror.jpg", beta: 125.46, kx: 0.186, ky: 0.831, tx: 0.134, ty: 0.904, cx: 0.0, cy: 1.0, ar: 1.5 },
  { src: "img/wave1-c4.jpg", beta: 19.17, kx: 0.7, ky: 0.73, tx: 0.91, ty: 0.803, cx: 0.5, cy: 0.871, ar: 0.5 },
  { src: "img/wave1-c4-mirror.jpg", beta: 160.83, kx: 0.3, ky: 0.73, tx: 0.09, ty: 0.803, cx: 0.5, cy: 0.871, ar: 0.5 },
  { src: "img/wave1-d1.jpg", beta: 83.73, kx: 0.485, ky: 0.731, tx: 0.504, ty: 0.904, cx: 0.487, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-d1-mirror.jpg", beta: 96.27, kx: 0.515, ky: 0.731, tx: 0.496, ty: 0.904, cx: 0.513, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-d2.jpg", beta: 96.28, kx: 0.485, ky: 0.69, tx: 0.461, ty: 0.908, cx: 0.438, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-d2-mirror.jpg", beta: 83.72, kx: 0.515, ky: 0.69, tx: 0.539, ty: 0.908, cx: 0.562, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-d3.jpg", beta: 83.27, kx: 0.444, ky: 0.682, tx: 0.467, ty: 0.877, cx: 0.398, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-d3-mirror.jpg", beta: 96.73, kx: 0.556, ky: 0.682, tx: 0.533, ty: 0.877, cx: 0.602, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-d4.jpg", beta: 86.52, kx: 0.508, ky: 0.737, tx: 0.519, ty: 0.918, cx: 0.586, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-d4-mirror.jpg", beta: 93.48, kx: 0.492, ky: 0.737, tx: 0.481, ty: 0.918, cx: 0.414, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-m1.jpg", beta: -72.78, kx: 0.305, ky: 0.168, tx: 0.336, ty: 0.068, cx: 0.09, cy: 0.0, ar: 1.0 },
  { src: "img/wave1-m1-mirror.jpg", beta: -107.22, kx: 0.695, ky: 0.168, tx: 0.664, ty: 0.068, cx: 0.91, cy: 0.0, ar: 1.0 },
  { src: "img/wave1-m2.jpg", beta: -40.91, kx: 0.845, ky: 0.245, tx: 0.92, ty: 0.18, cx: 1.0, cy: 0.04, ar: 0.6667 },
  { src: "img/wave1-m2-mirror.jpg", beta: -139.09, kx: 0.155, ky: 0.245, tx: 0.08, ty: 0.18, cx: 0.0, cy: 0.04, ar: 0.6667 },
  { src: "img/wave1-m3.jpg", beta: 34.88, kx: 0.875, ky: 0.76, tx: 0.941, ty: 0.806, cx: 1.0, cy: 1.0, ar: 1.0 },
  { src: "img/wave1-m3-mirror.jpg", beta: 145.12, kx: 0.125, ky: 0.76, tx: 0.059, ty: 0.806, cx: 0.0, cy: 1.0, ar: 1.0 },
  // Wave 2 — 32 more calibrated photos (16 generated + 16 mirrors).
{ src: "img/wave2-e1.jpg", beta: -139.46, kx: 0.168, ky: 0.2, tx: 0.092, ty: 0.135, cx: 0.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave2-e1-mirror.jpg", beta: -40.54, kx: 0.832, ky: 0.2, tx: 0.908, ty: 0.135, cx: 1.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave2-e2.jpg", beta: -121.2, kx: 0.181, ky: 0.275, tx: 0.138, ty: 0.204, cx: 0.0, cy: 0.083, ar: 0.6667 },
{ src: "img/wave2-e2-mirror.jpg", beta: -58.8, kx: 0.819, ky: 0.275, tx: 0.862, ty: 0.204, cx: 1.0, cy: 0.083, ar: 0.6667 },
{ src: "img/wave2-e3.jpg", beta: -104.52, kx: 0.178, ky: 0.287, tx: 0.142, ty: 0.148, cx: 0.0, cy: 0.048, ar: 0.6667 },
{ src: "img/wave2-e3-mirror.jpg", beta: -75.48, kx: 0.822, ky: 0.287, tx: 0.858, ty: 0.148, cx: 1.0, cy: 0.048, ar: 0.6667 },
{ src: "img/wave2-e4.jpg", beta: -131.38, kx: 0.158, ky: 0.296, tx: 0.084, ty: 0.212, cx: 0.0, cy: 0.106, ar: 0.6667 },
{ src: "img/wave2-e4-mirror.jpg", beta: -48.62, kx: 0.842, ky: 0.296, tx: 0.916, ty: 0.212, cx: 1.0, cy: 0.106, ar: 0.6667 },
{ src: "img/wave2-f1.jpg", beta: -171.95, kx: 0.285, ky: 0.568, tx: 0.087, ty: 0.54, cx: 0.0, cy: 0.586, ar: 0.6667 },
{ src: "img/wave2-f1-mirror.jpg", beta: -8.05, kx: 0.715, ky: 0.568, tx: 0.913, ty: 0.54, cx: 1.0, cy: 0.586, ar: 0.6667 },
{ src: "img/wave2-f2.jpg", beta: -158.75, kx: 0.11, ky: 0.575, tx: 0.02, ty: 0.54, cx: 0.0, cy: 0.592, ar: 0.6667 },
{ src: "img/wave2-f2-mirror.jpg", beta: -21.25, kx: 0.89, ky: 0.575, tx: 0.98, ty: 0.54, cx: 1.0, cy: 0.592, ar: 0.6667 },
{ src: "img/wave2-f3.jpg", beta: -166.1, kx: 0.155, ky: 0.47, tx: 0.058, ty: 0.446, cx: 0.0, cy: 0.433, ar: 0.6667 },
{ src: "img/wave2-f3-mirror.jpg", beta: -13.9, kx: 0.845, ky: 0.47, tx: 0.942, ty: 0.446, cx: 1.0, cy: 0.433, ar: 0.6667 },
{ src: "img/wave2-f4.jpg", beta: -165.58, kx: 0.118, ky: 0.424, tx: 0.048, ty: 0.406, cx: 0.0, cy: 0.364, ar: 0.6667 },
{ src: "img/wave2-f4-mirror.jpg", beta: -14.42, kx: 0.882, ky: 0.424, tx: 0.952, ty: 0.406, cx: 1.0, cy: 0.364, ar: 0.6667 },
{ src: "img/wave2-g1.jpg", beta: 97.79, kx: 0.124, ky: 0.786, tx: 0.108, ty: 0.903, cx: 0.0, cy: 1.0, ar: 0.6667 },
{ src: "img/wave2-g1-mirror.jpg", beta: 82.21, kx: 0.876, ky: 0.786, tx: 0.892, ty: 0.903, cx: 1.0, cy: 1.0, ar: 0.6667 },
{ src: "img/wave2-g2.jpg", beta: 149.48, kx: 0.209, ky: 0.72, tx: 0.058, ty: 0.809, cx: 0.0, cy: 0.923, ar: 0.6667 },
{ src: "img/wave2-g2-mirror.jpg", beta: 30.52, kx: 0.791, ky: 0.72, tx: 0.942, ty: 0.809, cx: 1.0, cy: 0.923, ar: 0.6667 },
{ src: "img/wave2-g3.jpg", beta: 160.18, kx: 0.32, ky: 0.75, tx: 0.098, ty: 0.83, cx: 0.0, cy: 0.964, ar: 0.6667 },
{ src: "img/wave2-g3-mirror.jpg", beta: 19.82, kx: 0.68, ky: 0.75, tx: 0.902, ty: 0.83, cx: 1.0, cy: 0.964, ar: 0.6667 },
{ src: "img/wave2-g4.jpg", beta: 147.91, kx: 0.117, ky: 0.698, tx: 0.058, ty: 0.735, cx: 0.0, cy: 0.846, ar: 0.6667 },
{ src: "img/wave2-g4-mirror.jpg", beta: 32.09, kx: 0.883, ky: 0.698, tx: 0.942, ty: 0.735, cx: 1.0, cy: 0.846, ar: 0.6667 },
{ src: "img/wave2-h1.jpg", beta: -93.85, kx: 0.352, ky: 0.208, tx: 0.345, ty: 0.104, cx: 0.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave2-h1-mirror.jpg", beta: -86.15, kx: 0.648, ky: 0.208, tx: 0.655, ty: 0.104, cx: 1.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave2-h2.jpg", beta: -76.48, kx: 0.284, ky: 0.165, tx: 0.303, ty: 0.086, cx: 0.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave2-h2-mirror.jpg", beta: -103.52, kx: 0.716, ky: 0.165, tx: 0.697, ty: 0.086, cx: 1.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave2-h3.jpg", beta: -92.25, kx: 0.333, ky: 0.088, tx: 0.331, ty: 0.037, cx: 0.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave2-h3-mirror.jpg", beta: -87.75, kx: 0.667, ky: 0.088, tx: 0.669, ty: 0.037, cx: 1.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave2-h4.jpg", beta: -71.57, kx: 0.276, ky: 0.152, tx: 0.303, ty: 0.071, cx: 0.5, cy: 0.0, ar: 0.5 },
{ src: "img/wave2-h4-mirror.jpg", beta: -108.43, kx: 0.724, ky: 0.152, tx: 0.697, ty: 0.071, cx: 0.5, cy: 0.0, ar: 0.5 },
  // Wave 3 — final 32 calibrated photos (16 generated + 16 mirrors).
{ src: "img/wave3-i1.jpg", beta: -51.09, kx: 0.825, ky: 0.222, tx: 0.892, ty: 0.139, cx: 1.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave3-i1-mirror.jpg", beta: -128.91, kx: 0.175, ky: 0.222, tx: 0.108, ty: 0.139, cx: 0.0, cy: 0.0, ar: 0.6667 },
{ src: "img/wave3-i2.jpg", beta: -46.92, kx: 0.792, ky: 0.194, tx: 0.864, ty: 0.117, cx: 0.5, cy: 0.021, ar: 0.5 },
{ src: "img/wave3-i2-mirror.jpg", beta: -133.08, kx: 0.208, ky: 0.194, tx: 0.136, ty: 0.117, cx: 0.5, cy: 0.021, ar: 0.5 },
{ src: "img/wave3-i3.jpg", beta: -62.04, kx: 0.818, ky: 0.343, tx: 0.887, ty: 0.213, cx: 1.0, cy: 0.145, ar: 0.6667 },
{ src: "img/wave3-i3-mirror.jpg", beta: -117.96, kx: 0.182, ky: 0.343, tx: 0.113, ty: 0.213, cx: 0.0, cy: 0.145, ar: 0.6667 },
{ src: "img/wave3-i4.jpg", beta: -45.0, kx: 0.808, ky: 0.278, tx: 0.885, ty: 0.201, cx: 1.0, cy: 0.083, ar: 0.6667 },
{ src: "img/wave3-i4-mirror.jpg", beta: -135.0, kx: 0.192, ky: 0.278, tx: 0.115, ty: 0.201, cx: 0.0, cy: 0.083, ar: 0.6667 },
{ src: "img/wave3-j1.jpg", beta: -6.91, kx: 0.77, ky: 0.39, tx: 0.902, ty: 0.374, cx: 1.0, cy: 0.311, ar: 0.6667 },
{ src: "img/wave3-j1-mirror.jpg", beta: -173.09, kx: 0.23, ky: 0.39, tx: 0.098, ty: 0.374, cx: 0.0, cy: 0.311, ar: 0.6667 },
{ src: "img/wave3-j2.jpg", beta: -23.08, kx: 0.805, ky: 0.482, tx: 0.92, ty: 0.433, cx: 1.0, cy: 0.432, ar: 0.6667 },
{ src: "img/wave3-j2-mirror.jpg", beta: -156.92, kx: 0.195, ky: 0.482, tx: 0.08, ty: 0.433, cx: 0.0, cy: 0.432, ar: 0.6667 },
{ src: "img/wave3-j3.jpg", beta: -5.85, kx: 0.711, ky: 0.497, tx: 0.916, ty: 0.476, cx: 1.0, cy: 0.478, ar: 0.6667 },
{ src: "img/wave3-j3-mirror.jpg", beta: -174.15, kx: 0.289, ky: 0.497, tx: 0.084, ty: 0.476, cx: 0.0, cy: 0.478, ar: 0.6667 },
{ src: "img/wave3-j4.jpg", beta: -10.65, kx: 0.832, ky: 0.368, tx: 0.949, ty: 0.346, cx: 1.0, cy: 0.271, ar: 0.6667 },
{ src: "img/wave3-j4-mirror.jpg", beta: -169.35, kx: 0.168, ky: 0.368, tx: 0.051, ty: 0.346, cx: 0.0, cy: 0.271, ar: 0.6667 },
{ src: "img/wave3-k1.jpg", beta: 45.0, kx: 0.875, ky: 0.688, tx: 0.935, ty: 0.748, cx: 1.0, cy: 0.849, ar: 0.6667 },
{ src: "img/wave3-k1-mirror.jpg", beta: 135.0, kx: 0.125, ky: 0.688, tx: 0.065, ty: 0.748, cx: 0.0, cy: 0.849, ar: 0.6667 },
{ src: "img/wave3-k2.jpg", beta: 17.88, kx: 0.715, ky: 0.73, tx: 0.87, ty: 0.78, cx: 1.0, cy: 0.908, ar: 0.6667 },
{ src: "img/wave3-k2-mirror.jpg", beta: 162.12, kx: 0.285, ky: 0.73, tx: 0.13, ty: 0.78, cx: 0.0, cy: 0.908, ar: 0.6667 },
{ src: "img/wave3-k3.jpg", beta: 16.83, kx: 0.782, ky: 0.779, tx: 0.944, ty: 0.828, cx: 1.0, cy: 0.986, ar: 0.6667 },
{ src: "img/wave3-k3-mirror.jpg", beta: 163.17, kx: 0.218, ky: 0.779, tx: 0.056, ty: 0.828, cx: 0.0, cy: 0.986, ar: 0.6667 },
{ src: "img/wave3-k4.jpg", beta: 43.81, kx: 0.857, ky: 0.718, tx: 0.906, ty: 0.765, cx: 1.0, cy: 0.886, ar: 0.6667 },
{ src: "img/wave3-k4-mirror.jpg", beta: 136.19, kx: 0.143, ky: 0.718, tx: 0.094, ty: 0.765, cx: 0.0, cy: 0.886, ar: 0.6667 },
{ src: "img/wave3-l1.jpg", beta: 74.58, kx: 0.445, ky: 0.73, tx: 0.485, ty: 0.875, cx: 0.276, cy: 0.984, ar: 0.6667 },
{ src: "img/wave3-l1-mirror.jpg", beta: 105.42, kx: 0.555, ky: 0.73, tx: 0.515, ty: 0.875, cx: 0.724, cy: 0.984, ar: 0.6667 },
{ src: "img/wave3-l2.jpg", beta: 88.34, kx: 0.528, ky: 0.75, tx: 0.532, ty: 0.888, cx: 0.692, cy: 1.0, ar: 0.6667 },
{ src: "img/wave3-l2-mirror.jpg", beta: 91.66, kx: 0.472, ky: 0.75, tx: 0.468, ty: 0.888, cx: 0.308, cy: 1.0, ar: 0.6667 },
{ src: "img/wave3-l3.jpg", beta: 77.99, kx: 0.494, ky: 0.82, tx: 0.514, ty: 0.914, cx: 0.526, cy: 1.0, ar: 0.6667 },
{ src: "img/wave3-l3-mirror.jpg", beta: 102.01, kx: 0.506, ky: 0.82, tx: 0.486, ty: 0.914, cx: 0.474, cy: 1.0, ar: 0.6667 },
{ src: "img/wave3-l4.jpg", beta: 73.4, kx: 0.483, ky: 0.71, tx: 0.531, ty: 0.871, cx: 0.545, cy: 0.965, ar: 0.6667 },
{ src: "img/wave3-l4-mirror.jpg", beta: 106.6, kx: 0.517, ky: 0.71, tx: 0.469, ty: 0.871, cx: 0.455, cy: 0.965, ar: 0.6667 },
];
const CAMERA = ["img/point-camera.jpg", "img/point-camera-2.jpg", "img/wave1-m4.jpg"]; // cursor near center

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
