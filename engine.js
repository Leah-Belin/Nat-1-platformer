'use strict';

// ─── Game objects ─────────────────────────────────────────────────────────────
let canvas, ctx;
let lastTs = 0;
let gameTime = 0;

let coins   = [];
let enemies = [];

const player = {
  x: 0, y: 0,
  prevY: 0,
  vx: 0, vy: 0,
  onGround:  false,
  onLadder:  false,
  ladderRef: null,   // current LADDERS entry
  facingRight: true,
  animFrame: 0,
  animTimer: 0,
};

// ─── Init ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  canvas = document.getElementById('c');
  ctx    = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  initInput();
  requestAnimationFrame(loop);
});

// ─── Start / respawn helpers ──────────────────────────────────────────────────
function startGame() {
  coins   = buildCoins();
  enemies = buildEnemies();
  spawnPlayer();
  State.hearts = State.maxHearts;
  State.score  = 0;
  State.invTimer = 0;
  State.phase = 'playing';
}

function respawnPlayer() {
  spawnPlayer();
  State.respawn();
}

function spawnPlayer() {
  player.x = PLAYER_START.x;
  player.y = PLAYER_START.y;
  player.prevY = player.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround  = false;
  player.onLadder  = false;
  player.ladderRef = null;
  player.facingRight = true;
}

// ─── Game loop ────────────────────────────────────────────────────────────────
function loop(ts) {
  const dt = Math.min((ts - lastTs) / 1000, 0.05);
  lastTs   = ts;
  gameTime = ts / 1000;

  const inp = getInput();

  switch (State.phase) {
    case 'title':
      if (inp.enterJust) State.phase = 'select';
      break;

    case 'select':
      if (inp.leftJust)  State.selectedChar = (State.selectedChar - 1 + CHARS.length) % CHARS.length;
      if (inp.rightJust) State.selectedChar = (State.selectedChar + 1) % CHARS.length;
      if (inp.enterJust) startGame();
      break;

    case 'playing':
      updatePlayer(dt, inp);
      updateEnemies(dt);
      updateTimers(dt);
      checkCoins();
      checkEnemies();
      checkWin();
      break;

    case 'dead':
      State.deadTimer -= dt;
      if (State.deadTimer <= 0) respawnPlayer();
      break;

    case 'gameover':
      if (inp.enterJust) State.resetFull();
      break;

    case 'win':
      State.winTimer -= dt;
      if (inp.enterJust || State.winTimer <= 0) State.resetFull();
      break;
  }

  render(ctx, player, coins, enemies, gameTime);
  flushPressed();
  requestAnimationFrame(loop);
}

// ─── Timers ───────────────────────────────────────────────────────────────────
function updateTimers(dt) {
  if (State.invTimer > 0) State.invTimer -= dt;
}

// ─── Player update ────────────────────────────────────────────────────────────
function updatePlayer(dt, inp) {
  player.prevY = player.y;

  if (player.onLadder) {
    _updateOnLadder(dt, inp);
  } else {
    _updateInAir(dt, inp);
  }

  // Clamp to canvas
  player.x = Math.max(0, Math.min(CW - PW, player.x));
  if (player.y + PH > CH) { player.y = CH - PH; player.vy = 0; player.onGround = true; }
  if (player.y < GY)      { player.y = GY; player.vy = 0; }

  // Animation
  if (player.onLadder) {
    if (Math.abs(player.vy) > 5) player.animTimer += dt;
    if (player.animTimer > 0.12) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 2 + 4; }
  } else if (!player.onGround) {
    player.animFrame = 4;
    player.animTimer = 0;
  } else if (Math.abs(player.vx) > 5) {
    player.animTimer += dt;
    if (player.animTimer > 0.09) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 4; }
  } else {
    player.animFrame = 0;
    player.animTimer = 0;
  }
}

function _updateInAir(dt, inp) {
  // Horizontal
  player.vx = 0;
  if (inp.left)  { player.vx = -MOVE_SPEED; player.facingRight = false; }
  if (inp.right) { player.vx =  MOVE_SPEED; player.facingRight = true;  }

  // Jump
  if (inp.jumpJust && player.onGround) {
    player.vy = JUMP_VY;
    player.onGround = false;
  }

  // Try to grab a ladder (up or down)
  if (!player.onGround || inp.down) {
    const lad = _ladderAt(player.x + PW / 2, player.y + PH);
    if (lad && (inp.up || inp.down)) {
      player.onLadder = true;
      player.ladderRef = lad;
      // Snap x to ladder center
      player.x = lad.x + LADDER_W / 2 - PW / 2;
      player.vx = 0;
      player.vy = 0;
      return;
    }
  }

  // Gravity
  if (!player.onGround) player.vy += GRAVITY * dt;

  // Move X then resolve, move Y then resolve
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.onGround = false;
  _resolvePlatforms();
}

function _updateOnLadder(dt, inp) {
  const lad = player.ladderRef;

  player.vx = 0;
  player.vy = 0;

  if (inp.up)    player.vy = -CLIMB_SPEED;
  if (inp.down)  player.vy =  CLIMB_SPEED;
  if (inp.left)  { player.vx = -MOVE_SPEED * 0.4; player.facingRight = false; }
  if (inp.right) { player.vx =  MOVE_SPEED * 0.4; player.facingRight = true;  }

  // Jump off ladder
  if (inp.jumpJust) {
    player.onLadder = false;
    player.ladderRef = null;
    player.vy = JUMP_VY;
    return;
  }

  player.y += player.vy * dt;
  player.x += player.vx * dt;

  // Exit top of ladder
  if (player.y + PH <= lad.y + 4) {
    player.y = lad.y - PH;
    player.vy = 0;
    player.onLadder  = false;
    player.ladderRef = null;
    player.onGround  = true;
    return;
  }
  // Exit bottom of ladder
  if (player.y + PH >= lad.y + lad.h + PH) {
    player.onLadder  = false;
    player.ladderRef = null;
    player.vy = 0;
    return;
  }

  // Keep snapped to ladder center x
  player.x = lad.x + LADDER_W / 2 - PW / 2;
}

// ─── Platform collision ───────────────────────────────────────────────────────
function _resolvePlatforms() {
  for (const p of PLATFORMS) {
    const overlapX = player.x + PW > p.x && player.x < p.x + p.w;
    if (!overlapX) continue;

    const prevFeet = player.prevY + PH;
    const currFeet = player.y + PH;

    if (p.solid) {
      // Full AABB resolution for solid blocks
      const overlapY = player.y + PH > p.y && player.y < p.y + p.h;
      if (!overlapY) continue;

      // Determine push direction from previous position
      if (prevFeet <= p.y + 4 && player.vy >= 0) {
        // Land on top
        player.y = p.y - PH;
        player.vy = 0;
        player.onGround = true;
      } else if (player.prevY >= p.y + p.h - 4 && player.vy < 0) {
        // Hit ceiling
        player.y = p.y + p.h;
        player.vy = 0;
      } else {
        // Side push
        const overlapLeft  = (player.x + PW) - p.x;
        const overlapRight = (p.x + p.w) - player.x;
        if (overlapLeft < overlapRight) {
          player.x = p.x - PW;
          player.vx = 0;
        } else {
          player.x = p.x + p.w;
          player.vx = 0;
        }
      }
    } else {
      // One-way: land on top only when falling through from above
      if (prevFeet <= p.y + 2 && currFeet >= p.y && player.vy >= 0) {
        player.y = p.y - PH;
        player.vy = 0;
        player.onGround = true;
      }
    }
  }
}

// ─── Ladder lookup ────────────────────────────────────────────────────────────
// Returns the ladder whose x-range contains px and whose y-range contains py (feet),
// with a small tolerance at top/bottom for easy grab.
function _ladderAt(px, py) {
  for (const l of LADDERS) {
    const inX = px >= l.x && px <= l.x + LADDER_W;
    const inY = py >= l.y - 8 && py <= l.y + l.h + 8;
    if (inX && inY) return l;
  }
  return null;
}

// ─── Enemies ──────────────────────────────────────────────────────────────────
function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.type === 'fire_flower') {
      e.shotTimer -= dt * 1000;
      if (e.shotTimer <= 0) {
        e.shotTimer = e.interval + (Math.random() * 500 - 250);
        _shootFireball(e);
      }
      // Update fireballs
      for (let i = e.fireballs.length - 1; i >= 0; i--) {
        const fb = e.fireballs[i];
        fb.vy += 1200 * dt;
        fb.x  += fb.vx * dt;
        fb.y  += fb.vy * dt;
        fb.life -= dt;
        // Remove if off screen or expired
        if (fb.life <= 0 || fb.y > CH + 20 || fb.x < -20 || fb.x > CW + 20) {
          e.fireballs.splice(i, 1);
        }
      }
    }
  }
}

function _shootFireball(e) {
  // Alternate left/right
  const dir  = e.shotDir;
  e.shotDir *= -1;
  e.fireballs.push({
    x:    e.x,
    y:    e.y - 40,
    vx:   dir * 220,
    vy:  -360,
    life: 4,
  });
}

// ─── Coin collection ──────────────────────────────────────────────────────────
function checkCoins() {
  for (const c of coins) {
    if (c.collected) continue;
    const dx = (player.x + PW / 2) - c.x;
    const dy = (player.y + PH / 2) - c.y;
    if (Math.abs(dx) < PW / 2 + 10 && Math.abs(dy) < PH / 2 + 10) {
      c.collected = true;
      State.addScore(500);
    }
  }
}

// ─── Enemy collision ──────────────────────────────────────────────────────────
function checkEnemies() {
  if (State.invTimer > 0) return;
  for (const e of enemies) {
    for (const fb of e.fireballs) {
      const dx = (player.x + PW / 2) - fb.x;
      const dy = (player.y + PH / 2) - fb.y;
      if (Math.abs(dx) < PW / 2 + 8 && Math.abs(dy) < PH / 2 + 8) {
        State.hit();
        return;
      }
    }
  }
}

// ─── Win condition ────────────────────────────────────────────────────────────
function checkWin() {
  if (coins.every(c => c.collected)) {
    State.addScore(2000);  // bonus for clearing all coins
    State.winTimer = 4;
    State.phase = 'win';
  }
}
