'use strict';

// ─── Canvas / game area constants ─────────────────────────────────────────────
const CW  = 800;   // canvas width
const CH  = 600;   // canvas height
const HH  = 50;    // HUD height (top strip)
const GY  = HH;    // game area top y (canvas coords)
const GH  = CH - HH;  // game area height = 550

// ─── Player physics ───────────────────────────────────────────────────────────
const GRAVITY    = 1800;  // px / s²
const JUMP_VY    = -640;  // px / s  (max height ≈ 114 px, just clears one floor gap)
const MOVE_SPEED = 220;   // px / s
const CLIMB_SPEED = 160;  // px / s
const PW = 28;            // player bounding-box width
const PH = 44;            // player bounding-box height

// ─── Platforms ────────────────────────────────────────────────────────────────
// All y values are in canvas coordinates (0 = top of canvas).
// solid:true  → collision from all sides (ground, pedestal)
// solid:false → one-way (player lands on top only; can jump through from below)
const PLATFORMS = [
  // Ground floor (3 tiles tall, full width)
  { x: 0,   y: 504, w: 800, h: 96, solid: true,  label: 'ground'  },

  // Fire-flower pedestal — sits ON the ground, raises the flower to a mid-height
  { x: 144, y: 440, w: 64,  h: 64, solid: true,  label: 'pedestal' },

  // Floor 1 — left and right sections with a gap in the center
  { x: 0,   y: 408, w: 256, h: 24, solid: false, label: 'f1l' },
  { x: 544, y: 408, w: 256, h: 24, solid: false, label: 'f1r' },

  // Floor 2 — nearly full-width (small gaps at left/right for left-edge ladders)
  { x: 64,  y: 312, w: 672, h: 24, solid: false, label: 'f2'  },

  // Floor 3 — left and right sections with a gap in the center
  { x: 0,   y: 216, w: 352, h: 24, solid: false, label: 'f3l' },
  { x: 448, y: 216, w: 352, h: 24, solid: false, label: 'f3r' },

  // Top floor — center section
  { x: 128, y: 120, w: 544, h: 24, solid: false, label: 'top' },
];

// ─── Ladders ──────────────────────────────────────────────────────────────────
// { x, y, h } — x is left edge, y is top, h is height. Width is LADDER_W (32 px).
// Every pair of adjacent floors has a left and right ladder option.
const LADDER_W = 32;
const LADDERS = [
  // Ground ↔ Floor 1
  { x:   8, y: 408, h: 96 },   // left  edge
  { x: 760, y: 408, h: 96 },   // right edge

  // Floor 1 ↔ Floor 2
  { x:  64, y: 312, h: 96 },   // left  (at left edge of floor 2)
  { x: 704, y: 312, h: 96 },   // right (at right edge of floor 2)

  // Floor 2 ↔ Floor 3
  { x: 288, y: 216, h: 96 },   // left  (within floor 3-L range)
  { x: 512, y: 216, h: 96 },   // right (within floor 3-R range)

  // Floor 3 ↔ Top
  { x: 192, y: 120, h: 96 },   // left  (within floor 3-L and top ranges)
  { x: 576, y: 120, h: 96 },   // right (within floor 3-R and top ranges)
];

// ─── Coins ────────────────────────────────────────────────────────────────────
// { x, y } = center of coin in canvas coords.
// Coins float 28 px above the surface they rest on (surface_y - 28).
const COIN_DEFS = [
  // Floor 1 left (surface y=408)
  { x: 112, y: 380 },
  { x: 192, y: 380 },

  // Floor 1 right
  { x: 592, y: 380 },
  { x: 656, y: 380 },
  { x: 720, y: 380 },

  // Floor 2 (surface y=312)
  { x: 128, y: 284 },
  { x: 224, y: 284 },
  { x: 352, y: 284 },
  { x: 480, y: 284 },
  { x: 608, y: 284 },
  { x: 704, y: 284 },

  // Floor 3 left (surface y=216)
  { x:  96, y: 188 },
  { x: 240, y: 188 },

  // Floor 3 right
  { x: 512, y: 188 },
  { x: 672, y: 188 },

  // Top floor (surface y=120)
  { x: 208, y:  92 },
  { x: 336, y:  92 },
  { x: 464, y:  92 },
  { x: 592, y:  92 },
];

// ─── Enemies ──────────────────────────────────────────────────────────────────
const ENEMY_DEFS = [
  {
    type:     'fire_flower',
    x:        176,    // center x (middle of pedestal x=144..208)
    y:        440,    // top of pedestal (flower sits here)
    interval: 3500,   // ms between fireball shots
  },
];

// ─── Player start ─────────────────────────────────────────────────────────────
// x = player left edge, y = player feet (bottom of bbox)
const PLAYER_START = { x: 700 - PW / 2, y: 504 - PH };

// ─── Builders (called when a game starts / respawn) ───────────────────────────
function buildCoins() {
  return COIN_DEFS.map((c, i) => ({ ...c, id: i, collected: false }));
}

function buildEnemies() {
  return ENEMY_DEFS.map(e => ({
    ...e,
    shotTimer:  e.interval * Math.random(),  // stagger first shot
    shotDir:    1,                           // alternates: +1 right, -1 left
    animTimer:  0,
    fireballs:  [],
  }));
}
