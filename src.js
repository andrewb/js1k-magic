// 20x10 grid
// VARS
// ----
// Note, using `let` crushed better than globals
// Width
let w = 640;
// Height
let h = 320;
// Worm x
let x = 312;
// Worm y
let y = 152;
// Entity count
let e = 10;
// Scroll offset
let o = 0;
// Start time
let t = 0;
// Game command
let g = 1;
// Matrix
let m = [];
// Path
let p = [];
// Active key
let k;
// Level
let l;
// Timeout
let v;
// Speed in pixels per second
let s;
// FUNCS
// -----
// Random
// Note, crushing is better with braces...
// $ = max
let R = ($) => {
  return ~~(Math.random() * $);
}
// Worm
let W = () => {
  let i;
  let s = [];
  // Build array of line segments
  for (i = 0; i < p.length - 1; i++) {
    let a = p[i].x - p[i + 1].x;
    let b = p[i].y - p[i + 1].y;
    let l = Math.sqrt((a * a) + (b * b));
    s.push({
      // Length
      l: l,
      // Normalized x vector
      v: a / l,
      // Normalized y vector
      w: b / l,
      p: p[i]
    });
  }
  // Segment offset
  let a = 16;
  // Current segment
  let j = 0;
  // Point position
  let u = 0;
  // Previous length
  let n = 0;
  // Length
  let l = s[0].l;
  // Draw segments
  for (i = 0; i < 9; i++) {
    while(u > l && s[j + 1]) {
      // If the point is beyond the segment, move to the next one
      n = l;
      l += s[++j].l;
    }
    c.beginPath();
    c.arc(s[j].p.x - s[j].v * (u - n) - o, s[j].p.y - s[j].w * (u - n), a / 2, 0, 2 * Math.PI);
    c.fillStyle = g > 1 ? (g == 2 ? '#f00' : '#0f0') : '#fff';
    c.fill();
    u += a--;
  }
};
let B = () => {
  // Fill background
  c.fillStyle = g ? '#000' : '#f00';
  c.fillRect(0, 0, w, h);
  // Render entities
  let n = [];
  for (let i = 0; i < m.length; i++) {
    // Bounding box
    let b = {x: (m[i].x * 32) - o, y: m[i].y * 32, s: m[i].t ? 16 : 32};
    // Potion?
    if (m[i].t) {
      // Center potions in grid
      b.x += 8;
      b.y += 8;
    }
    // Draw
    c.fillStyle = g ? (m[i].t ? (m[i].t == 2 ? '#f00' : '#0f0') : '#fff') : '#600';
    c.fillRect(b.x, b.y, b.s, b.s);
    // Check for hit
    // For brevity we'll combine rendering and hit detection
    // Only the worm collides...
    let j = x < b.x + b.s && x + 16 > b.x && y < b.y + b.s && y + 16 > b.y;
    if (j) {
      // Collision!
      g = m[i].t;
      // Potions last for 5 seconds
      v = g ? 5 : 0;
    }
    // Remove entity if it is a potion and has been hit, or if it is out of bounds
    if (!(j && m[i].t) && b.x > -32) {
      n.push(m[i]);
    }
  }
  m = n;
};
// Loop
// $ = timestamp
let L = ($) => {
  // Calculate delta
  let i = ($ - t) / 1e3;
  t = $;
  // Set horizontal offset
  // Use ~~ to floor (we can also get away with s being undefined)
  o = o + ~~(s * i);
  // Commands
  if (k == 38 || k == 40) {
    // Set offset (climbs at 1.5x)
    y += ((k > 38 ? 1 : -1) * s * i) * 1.5;
  }
  // Clamp to bounds
  y = Math.max(0, Math.min(y, h - 16));
  // Save point
  // Offset x and y by half of the worm size to match circle offsets
  p.unshift({x: x + 8 + o, y: y + 8});
  // Stop array bloat in a naive way
  // We shouldn't need any more than this to draw the segments
  p = p.slice(0, 99);
  // Update timeout (do it here so `i` can be reused)
  v -= i;
  // Get current level
  // Use ~~ to floor
  i = ~~(o / w);
  // Has the level changed?
  if (l != i) {
    // Save current level
    l = i;
    // Add level to the matrix
    // Ideally this would be limited to 40 to allow infinite game play
    // e.g. `i = 4 + e < 40 ? e++ : e;`
    // Re-use i
    i = 4 + e++;
    while(i) {
      // Create a matrix of random blocks and potions
      m.push({
        x: R(20) + 20 * (l + 1),
        y: R(10),
        // Type
        // Add potions last so they're behind bricks if positions overlap
        t: i >= e ? R(2) + 2 : 0
      });
      i--;
    }
  }
  // Background
  B();
  // Worm
  p.length > 1 && W();
  // Check for timeout
  if (v > 0) {
    s = g == 2 ? 300 : 100;
    c.fillStyle = g == 2 ? '#f00' : '#0f0';
    c.fillRect(8, 8, 48 * v / 5, 4);
  } else {
    // Default speed
    s = 200;
    // Default game command
    g ? g = 1 : g;
  }
  // Game over?
  if (g) {
    // Nope...
    requestAnimationFrame(L);
  } else {
    // Yep...
    // Render one more time to show the "death" frame
    // This is clunky, but given that we're combining rendering and hit
    // detection it is necessary.
    B();
    W();
  }
};
// EVENTS
// ------
// Note, crushing is better with braces...
onkeydown = ($) => {
  k = $.which;
}
// Note, crushing is better with braces...
onkeyup = () => {
  k = 0;
};
// LOOP
// ----
requestAnimationFrame(L);
