'use strict';

// ─── Portrait image cache ─────────────────────────────────────────────────────
const _portImgs = {};  // char.id → HTMLImageElement

function preloadPortraits() {
  for (const ch of CHARS) {
    if (!ch.portrait) continue;
    const img = new Image();
    // crossOrigin lets drawImage work even for same-site external images
    img.crossOrigin = 'anonymous';
    img.src = ch.portrait;
    _portImgs[ch.id] = img;
  }
}

// ─── Palette ──────────────────────────────────────────────────────────────────
const PAL = {
  brickBase:  '#4a7ea8',
  brickLight: '#5c96c2',
  brickDark:  '#2d5270',
  brickGrout: '#1e3a52',
  ladderRail: '#a07820',
  ladderRung: '#c8a040',
  ladderShadow: '#604800',
  coinGold:   '#ffd700',
  coinLight:  '#fff080',
  coinEdge:   '#b8860b',
  hudBg:      '#0a0a14',
  hudLine:    '#2a4080',
  heartFull:  '#e02020',
  heartEmpty: '#502020',
  textWhite:  '#ffffff',
  textYellow: '#ffd700',
  textGray:   '#888888',
};

// ─── Brick background ─────────────────────────────────────────────────────────
function drawBackground(ctx) {
  const BW = 32, BH = 16;
  ctx.fillStyle = PAL.brickDark;
  ctx.fillRect(0, GY, CW, GH);

  for (let row = 0; row <= GH / BH + 1; row++) {
    const offset = (row % 2 === 0) ? 0 : BW / 2;
    for (let col = -1; col <= CW / BW + 1; col++) {
      const bx = col * BW + offset;
      const by = GY + row * BH;

      // Brick face
      ctx.fillStyle = PAL.brickBase;
      ctx.fillRect(bx + 1, by + 1, BW - 2, BH - 2);

      // Top highlight
      ctx.fillStyle = PAL.brickLight;
      ctx.fillRect(bx + 1, by + 1, BW - 2, 2);

      // Grout lines
      ctx.fillStyle = PAL.brickGrout;
      ctx.fillRect(bx, by, BW, 1);
      ctx.fillRect(bx, by, 1, BH);
    }
  }

  // Subtle window shapes every ~200px for depth
  ctx.fillStyle = 'rgba(180,220,255,0.06)';
  for (let wx = 120; wx < CW; wx += 200) {
    ctx.fillRect(wx, GY + 40, 80, 64);
    ctx.fillRect(wx + 8, GY + 48, 64, 48);
  }
}

// ─── Platforms ────────────────────────────────────────────────────────────────
function drawPlatforms(ctx, platforms) {
  for (const p of platforms) {
    if (p.label === 'pedestal') {
      _drawBrickBlock(ctx, p.x, p.y, p.w, p.h, '#6a3010', '#8b4014', '#3a1808');
    } else {
      _drawBrickBlock(ctx, p.x, p.y, p.w, p.h, '#7a4820', '#9a5c28', '#4a2c10');
    }
  }
}

function _drawBrickBlock(ctx, x, y, w, h, base, light, dark) {
  const BW = 32, BH = 16;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);

  for (let row = 0; row <= h / BH + 1; row++) {
    const offset = (row % 2 === 0) ? 0 : BW / 2;
    for (let col = Math.floor(x / BW) - 1; col <= (x + w) / BW + 1; col++) {
      const bx = col * BW + offset;
      const by = y + row * BH;

      ctx.fillStyle = light;
      ctx.fillRect(bx + 1, by + 1, BW - 2, 2);   // top highlight

      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, 1, BH);                 // left grout
      ctx.fillRect(bx, by, BW, 1);                 // top grout
    }
  }

  // Top edge highlight
  ctx.fillStyle = 'rgba(255,200,120,0.5)';
  ctx.fillRect(x, y, w, 3);
  // Bottom shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x, y + h - 3, w, 3);

  ctx.restore();
}

// ─── Ladders ──────────────────────────────────────────────────────────────────
function drawLadders(ctx, ladders) {
  for (const l of ladders) {
    const rx = l.x;
    const ry = l.y;
    const rh = l.h;
    const rw = LADDER_W;

    // Rails
    ctx.fillStyle = PAL.ladderRail;
    ctx.fillRect(rx + 3, ry, 5, rh);
    ctx.fillRect(rx + rw - 8, ry, 5, rh);

    // Rail shadows
    ctx.fillStyle = PAL.ladderShadow;
    ctx.fillRect(rx + 2, ry, 2, rh);
    ctx.fillRect(rx + rw - 9, ry, 2, rh);

    // Rungs
    const RUNG_SPACING = 12;
    for (let rug = 0; rug <= rh; rug += RUNG_SPACING) {
      ctx.fillStyle = PAL.ladderRung;
      ctx.fillRect(rx + 3, ry + rug, rw - 6, 4);
      ctx.fillStyle = PAL.ladderShadow;
      ctx.fillRect(rx + 3, ry + rug + 3, rw - 6, 1);
    }
  }
}

// ─── Dice (d20) ───────────────────────────────────────────────────────────────
function drawDice(ctx, dice, t) {
  for (const d of dice) {
    if (d.collected) continue;
    _drawDie(ctx, d.x, d.y, t);
  }
}

function _drawDie(ctx, x, y, t) {
  const bob = Math.sin(t * 2.2 + x * 0.015) * 3;
  const r = 11;
  const dy = y + bob;

  // Drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(x + 2, dy + r + 3, r * 0.75, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, dy);

  // Pentagon body (d20 face, point up)
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();

  const grd = ctx.createRadialGradient(-r * 0.3, -r * 0.35, 0, 0, 0, r);
  grd.addColorStop(0,    '#ffffff');
  grd.addColorStop(0.55, '#e0d4bc');
  grd.addColorStop(1,    '#a89878');
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.strokeStyle = '#2a1808';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Internal lines from center to each vertex (d20 face detail)
  ctx.strokeStyle = 'rgba(60,35,10,0.28)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88);
    ctx.stroke();
  }

  // "20" label
  ctx.fillStyle = '#1a0800';
  ctx.font = 'bold 7px "Courier New"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('20', 0, 1);

  ctx.restore();
}

// ─── Fire flower & fireballs ──────────────────────────────────────────────────
function drawEnemies(ctx, enemies, t) {
  for (const e of enemies) {
    if (e.type === 'fire_flower') {
      _drawFireFlower(ctx, e.x, e.y, t);
      for (const fb of e.fireballs) {
        _drawFireball(ctx, fb.x, fb.y, t);
      }
    }
  }
}

function _drawFireFlower(ctx, cx, topY, t) {
  const pulse = Math.sin(t * 4) * 0.15 + 1;

  // Stem
  ctx.fillStyle = '#2a6e20';
  ctx.fillRect(cx - 3, topY - 28, 6, 28);

  // Leaves
  ctx.fillStyle = '#38a030';
  // Left leaf
  ctx.save();
  ctx.translate(cx - 3, topY - 16);
  ctx.rotate(-0.5);
  ctx.fillRect(-12, -4, 14, 6);
  ctx.restore();
  // Right leaf
  ctx.save();
  ctx.translate(cx + 3, topY - 10);
  ctx.rotate(0.5);
  ctx.fillRect(-2, -4, 14, 6);
  ctx.restore();

  // Petals (8, alternating red/orange)
  const PETALS = 8;
  const pR = 12 * pulse;
  ctx.save();
  ctx.translate(cx, topY - 32);
  for (let i = 0; i < PETALS; i++) {
    const angle = (i / PETALS) * Math.PI * 2 + t * 0.8;
    const px = Math.cos(angle) * pR;
    const py = Math.sin(angle) * pR;
    ctx.fillStyle = i % 2 === 0 ? '#e03000' : '#ff6000';
    ctx.beginPath();
    ctx.ellipse(px, py, 6, 8, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Center fire
  ctx.save();
  ctx.translate(cx, topY - 32);
  // Outer glow
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 12 * pulse);
  grd.addColorStop(0, 'rgba(255,230,50,0.9)');
  grd.addColorStop(0.5, 'rgba(255,120,0,0.6)');
  grd.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, 12 * pulse, 0, Math.PI * 2);
  ctx.fill();
  // Inner bright
  ctx.fillStyle = '#fff8a0';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function _drawFireball(ctx, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  // Outer glow
  const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
  grd.addColorStop(0, 'rgba(255,220,50,1)');
  grd.addColorStop(0.4, 'rgba(255,100,0,0.8)');
  grd.addColorStop(1, 'rgba(200,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  // Core
  ctx.fillStyle = '#fffac0';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Player character ─────────────────────────────────────────────────────────
// x, y = top-left of bounding box (PW × PH).
function drawPlayer(ctx, player, char, t) {
  if (!char) return;

  // Blink when invincible
  if (State.invTimer > 0 && Math.floor(t * 10) % 2 === 0) return;

  const cx = player.x + PW / 2;  // center x
  const by = player.y + PH;       // feet y
  const flip = !player.facingRight;

  ctx.save();
  if (flip) {
    ctx.translate(cx * 2, 0);
    ctx.scale(-1, 1);
  }

  _drawChar(ctx, cx, by, char, player.animFrame, player.onLadder, t);
  ctx.restore();
}

function _drawChar(ctx, cx, feet, char, frame, onLadder, t) {
  const S = 2;  // pixel size (2px per "pixel" for chunky look)

  // ── Leg animation ──
  // frames 0-3 = walk cycle, 4 = jump, 5-6 = climb
  let legL = 0, legR = 0;
  if (onLadder) {
    legL = Math.sin(t * 6) * 4;
    legR = -legL;
  } else {
    const cycle = [0, 4, 0, -4];
    legL = frame < 4 ? cycle[frame] : 0;
    legR = frame < 4 ? -cycle[frame] : 0;
  }

  // ── Shadow ──
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, feet, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Shoes ──
  ctx.fillStyle = char.shoe;
  ctx.fillRect(cx - 12*S/2 + legL - S, feet - 4, 6*S, 4);
  ctx.fillRect(cx + 0  + legR - S, feet - 4, 6*S, 4);

  // ── Pants / legs ──
  ctx.fillStyle = char.pants;
  ctx.fillRect(cx - 10*S/2 + legL, feet - 14, 4*S, 10);
  ctx.fillRect(cx + 2  + legR, feet - 14, 4*S, 10);

  // ── Belt ──
  ctx.fillStyle = '#3a2800';
  ctx.fillRect(cx - 7*S/2, feet - 18, 7*S, 3);

  // ── Body / shirt ──
  ctx.fillStyle = char.shirt;
  ctx.fillRect(cx - 7*S/2, feet - 30, 7*S, 12);

  // ── Arms (swing with walk cycle) ──
  const armSwing = frame < 4 ? [4, 0, -4, 0][frame] : 0;
  ctx.fillStyle = char.shirt;
  ctx.fillRect(cx - 8*S/2 - 3, feet - 28 + armSwing, 3, 8);  // left arm
  ctx.fillRect(cx + 7*S/2,     feet - 28 - armSwing, 3, 8);  // right arm
  // Hands
  ctx.fillStyle = char.skin;
  ctx.fillRect(cx - 8*S/2 - 3, feet - 20 + armSwing, 4, 4);
  ctx.fillRect(cx + 7*S/2,     feet - 20 - armSwing, 4, 4);

  // ── Neck ──
  ctx.fillStyle = char.skin;
  ctx.fillRect(cx - S, feet - 34, 2*S, 4);

  // ── Head ──
  ctx.fillStyle = char.skin;
  ctx.fillRect(cx - 5*S/2, feet - 44, 5*S, 10);

  // ── Hair ──
  ctx.fillStyle = char.hair;
  ctx.fillRect(cx - 5*S/2 - 1, feet - 46, 5*S + 2, 6);  // top
  ctx.fillRect(cx - 5*S/2 - 1, feet - 44, 2, 8);          // left sideburn

  // ── Hat ──
  if (char.hasHat) {
    const hc = char.hat || char.hair;
    ctx.fillStyle = hc;
    ctx.fillRect(cx - 6*S/2 - 1, feet - 47, 6*S + 2, 3);  // brim
    ctx.fillRect(cx - 4*S/2,     feet - 55, 4*S,      9);  // crown
    // Crown highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(cx - 4*S/2 + 1, feet - 54, 2, 7);
  }

  // ── Glasses ──
  if (char.hasGlasses) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(cx - 5*S/2, feet - 40, 4, 3);  // left frame
    ctx.fillRect(cx + S,     feet - 40, 4, 3);  // right frame
    ctx.fillRect(cx - S/2,   feet - 39, S, 2);  // bridge
    ctx.fillStyle = 'rgba(160,210,240,0.5)';
    ctx.fillRect(cx - 5*S/2 + 1, feet - 39, 3, 2);  // left lens
    ctx.fillRect(cx + S + 1,     feet - 39, 3, 2);  // right lens
  }

  // ── Beard / stubble ──
  if (char.hasBeard) {
    ctx.fillStyle = char.hair;
    ctx.fillRect(cx - 4*S/2, feet - 36, 4*S, 2);
    ctx.fillRect(cx - 3*S/2, feet - 35, 3*S, 2);
  }
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function drawHUD(ctx, state) {
  // Background bar
  ctx.fillStyle = PAL.hudBg;
  ctx.fillRect(0, 0, CW, HH);
  ctx.fillStyle = PAL.hudLine;
  ctx.fillRect(0, HH - 2, CW, 2);

  // ── Hearts (left) ──
  const heartX = 16, heartY = 14;
  for (let i = 0; i < state.maxHearts; i++) {
    _drawHeart(ctx, heartX + i * 32, heartY, i < state.hearts);
  }

  // ── Score (center) ──
  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.textGray;
  ctx.font = '11px "Courier New"';
  ctx.fillText('SCORE', CW / 2, 16);
  ctx.fillStyle = PAL.textWhite;
  ctx.font = 'bold 18px "Courier New"';
  ctx.fillText(String(state.score).padStart(8, '0'), CW / 2, 36);

  // ── Hi-Score ──
  ctx.fillStyle = PAL.textGray;
  ctx.font = '9px "Courier New"';
  ctx.fillText('HI ' + String(state.hiScore).padStart(8, '0'), CW / 2, 48);

  // ── Level + Lives (right) ──
  ctx.textAlign = 'right';
  ctx.fillStyle = PAL.textGray;
  ctx.font = '11px "Courier New"';
  ctx.fillText('LEVEL', CW - 16, 16);
  ctx.fillStyle = PAL.textWhite;
  ctx.font = 'bold 18px "Courier New"';
  ctx.fillText('1-1', CW - 16, 36);

  ctx.fillStyle = PAL.textGray;
  ctx.font = '11px "Courier New"';
  ctx.fillText('LIVES ×' + state.lives, CW - 16, 48);

  ctx.textAlign = 'left';
}

function _drawHeart(ctx, x, y, full) {
  ctx.fillStyle = full ? PAL.heartFull : PAL.heartEmpty;
  // Simple pixel-art heart (12×10)
  const h = [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ];
  for (let row = 0; row < h.length; row++) {
    for (let col = 0; col < h[row].length; col++) {
      if (h[row][col]) ctx.fillRect(x + col * 3, y + row * 3, 3, 3);
    }
  }
  // Highlight
  if (full) {
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(x + 3, y + 3, 3, 3);
    ctx.fillRect(x + 15, y + 3, 3, 3);
  }
}

// ─── Title screen ─────────────────────────────────────────────────────────────
function drawTitle(ctx, t) {
  // Background with parallax brick
  drawBackground(ctx);
  ctx.fillStyle = 'rgba(0,0,20,0.55)';
  ctx.fillRect(0, GY, CW, GH);

  // Logo box
  ctx.fillStyle = 'rgba(0,0,30,0.85)';
  ctx.fillRect(80, 120, 640, 200);
  ctx.strokeStyle = PAL.textYellow;
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 120, 640, 200);

  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.textYellow;
  ctx.font = 'bold 52px "Courier New"';
  ctx.fillText('NAT 1', CW / 2, 195);
  ctx.font = 'bold 32px "Courier New"';
  ctx.fillText('PLATFORMER', CW / 2, 240);

  ctx.fillStyle = PAL.textGray;
  ctx.font = '13px "Courier New"';
  ctx.fillText('A NAT 1 PUBLISHING PRODUCTION', CW / 2, 290);

  // Blink prompt
  if (Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = PAL.textWhite;
    ctx.font = 'bold 16px "Courier New"';
    ctx.fillText('CLICK  ·  TAP  ·  OR  PRESS  SPACE  TO  START', CW / 2, 380);
  }

  ctx.fillStyle = PAL.textGray;
  ctx.font = '12px "Courier New"';
  ctx.fillText('TAP ZONES: [ ◀ LEFT ] [ ▲ JUMP ] [ RIGHT ▶ ]', CW / 2, 440);
  ctx.fillText('OR USE  ARROWS / WASD + SPACE  ·  COLLECT ALL DICE', CW / 2, 460);
  ctx.fillText('HI-SCORE  ' + String(State.hiScore).padStart(8,'0'), CW / 2, 490);

  ctx.textAlign = 'left';
}

// ─── Character select ─────────────────────────────────────────────────────────
function drawSelect(ctx, t) {
  drawBackground(ctx);
  ctx.fillStyle = 'rgba(0,0,20,0.60)';
  ctx.fillRect(0, GY, CW, GH);

  ctx.textAlign = 'center';
  ctx.fillStyle = PAL.textYellow;
  ctx.font = 'bold 22px "Courier New"';
  ctx.fillText('CHOOSE  YOUR  CHARACTER', CW / 2, GY + 36);

  const PER_ROW = 4;
  const cardW = 160, cardH = 175, gap = 12;
  const rowW  = PER_ROW * cardW + (PER_ROW - 1) * gap;
  const startX = (CW - rowW) / 2;

  CHARS.forEach((ch, i) => {
    const col = i % PER_ROW;
    const row = Math.floor(i / PER_ROW);
    const cx  = startX + col * (cardW + gap);
    const cy  = GY + 52 + row * (cardH + 10);
    const selected = i === State.selectedChar;

    // Card background
    ctx.fillStyle = selected ? 'rgba(80,160,255,0.25)' : 'rgba(0,0,40,0.6)';
    ctx.fillRect(cx, cy, cardW, cardH);
    ctx.strokeStyle = selected ? PAL.textYellow : '#335';
    ctx.lineWidth = selected ? 3 : 1;
    ctx.strokeRect(cx, cy, cardW, cardH);

    // Draw portrait image if loaded, otherwise fall back to pixel-art character
    const portImg = _portImgs[ch.id];
    const portraitAreaH = 120;
    if (portImg && portImg.complete && portImg.naturalWidth > 0) {
      const scale = Math.min(cardW / portImg.naturalWidth, portraitAreaH / portImg.naturalHeight);
      const iw = portImg.naturalWidth  * scale;
      const ih = portImg.naturalHeight * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx, cy, cardW, portraitAreaH);
      ctx.clip();
      ctx.drawImage(portImg, cx + (cardW - iw) / 2, cy + (portraitAreaH - ih) / 2, iw, ih);
      ctx.restore();
    } else {
      const charCX    = cx + cardW / 2;
      const charFeetY = cy + 115;
      ctx.save();
      _drawChar(ctx, charCX, charFeetY, ch, Math.floor(t * 6) % 4, false, t);
      ctx.restore();
    }

    // Name (wrap long names to two lines)
    ctx.fillStyle = selected ? PAL.textYellow : PAL.textWhite;
    ctx.font = `bold 10px "Courier New"`;
    const words  = ch.name.split(' ');
    const half   = Math.ceil(words.length / 2);
    const line1  = words.slice(0, half).join(' ');
    const line2  = words.slice(half).join(' ');
    ctx.fillText(line1, cx + cardW / 2, cy + 136);
    if (line2) ctx.fillText(line2, cx + cardW / 2, cy + 148);

    ctx.fillStyle = PAL.textGray;
    ctx.font = '9px "Courier New"';
    ctx.fillText(ch.tagline, cx + cardW / 2, cy + 162);

    // Selected indicator
    if (selected) {
      ctx.fillStyle = PAL.textYellow;
      ctx.font = 'bold 16px "Courier New"';
      ctx.fillText('▲', cx + cardW / 2, cy - 8);
    }
  });

  // Blink confirm prompt (below both rows)
  if (Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = PAL.textWhite;
    ctx.font = 'bold 13px "Courier New"';
    ctx.fillText('[ ◀ ] [ ▶ ]  SELECT   ·   CENTER ZONE / SPACE  CONFIRM', CW / 2, GY + 490);
  }

  ctx.textAlign = 'left';
}

// ─── Control zone hints ───────────────────────────────────────────────────────
function drawZoneHints(ctx) {
  const zH = 36;
  const zY = CH - zH;
  const lEdge = CW * 0.25;
  const rEdge = CW * 0.75;

  ctx.save();
  ctx.globalAlpha = 0.11;
  ctx.fillStyle = '#4488ff';
  ctx.fillRect(0,     zY, lEdge,        zH);  // left walk zone
  ctx.fillRect(rEdge, zY, CW - rEdge,   zH);  // right walk zone
  ctx.fillStyle = '#44cc88';
  ctx.fillRect(lEdge, zY, rEdge - lEdge, zH); // center tap zone

  ctx.globalAlpha = 0.50;
  ctx.fillStyle = '#ffffff';
  ctx.font = '11px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('HOLD ◀',              lEdge / 2,          zY + 23);
  ctx.fillText('TAP: JUMP / LADDER',  CW / 2,             zY + 23);
  ctx.fillText('HOLD ▶',              rEdge + (CW - rEdge) / 2, zY + 23);
  ctx.restore();
}

// ─── Overlay screens (dead / win / gameover) ──────────────────────────────────
function drawOverlay(ctx, text, sub, color, t) {
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(0, GY, CW, GH);

  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.font = 'bold 56px "Courier New"';
  ctx.fillText(text, CW / 2, GY + GH / 2 - 20);

  ctx.fillStyle = PAL.textWhite;
  ctx.font = '18px "Courier New"';
  ctx.fillText(sub, CW / 2, GY + GH / 2 + 30);

  ctx.textAlign = 'left';
}

// ─── Main render entry ────────────────────────────────────────────────────────
function render(ctx, player, coins, enemies, t) {
  ctx.clearRect(0, 0, CW, CH);

  const phase = State.phase;

  if (phase === 'title') {
    ctx.fillStyle = PAL.hudBg;
    ctx.fillRect(0, 0, CW, HH);
    drawTitle(ctx, t);
    return;
  }

  if (phase === 'select') {
    ctx.fillStyle = PAL.hudBg;
    ctx.fillRect(0, 0, CW, HH);
    drawSelect(ctx, t);
    return;
  }

  // ── Playing / dead / win / gameover ──
  drawBackground(ctx);
  drawLadders(ctx, LADDERS);
  drawPlatforms(ctx, PLATFORMS);
  drawDice(ctx, coins, t);
  drawEnemies(ctx, enemies, t);
  drawPlayer(ctx, player, CHARS[State.selectedChar], t);
  drawZoneHints(ctx);
  drawHUD(ctx, State);

  if (phase === 'dead') {
    drawOverlay(ctx, 'OUCH!', 'Respawning...', '#ff8800', t);
  } else if (phase === 'gameover') {
    drawOverlay(ctx, 'GAME OVER', 'Press ENTER to try again', '#cc0000', t);
  } else if (phase === 'win') {
    drawOverlay(ctx, 'YOU WIN!',
      `Score: ${State.score}  ·  Press ENTER to play again`, '#ffd700', t);
  }
}
