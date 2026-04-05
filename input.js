'use strict';

// ─── Key state ────────────────────────────────────────────────────────────────
const _keys    = {};  // currently held
const _pressed = {};  // became pressed this frame (consumed on read)

// ─── Tap-key timers ───────────────────────────────────────────────────────────
// When a tap fires an action (jump / ladder climb), the key is held for N frames
// so the engine's continuous checks (inp.up, inp.down, inp.jump) see it.
const _tapTimers = {};  // code → frames remaining

function _fireTapKey(code, frames) {
  _pressed[code] = true;
  _keys[code]    = true;
  _tapTimers[code] = Math.max(_tapTimers[code] || 0, frames);
}

// ─── Canvas zone state ────────────────────────────────────────────────────────
// Left 25 % (hold) → walk left   |   right 25 % (hold) → walk right
// Middle 50 % and edges: quick TAP → jump / climb ladder
const _pointerZones = {};  // pointerId → 'ArrowLeft' | 'ArrowRight'
const _tapData      = {};  // pointerId → { t0, x0, y0 }

function _releasePointer(id) {
  const code = _pointerZones[id];
  if (code) {
    delete _pointerZones[id];
    if (!Object.values(_pointerZones).includes(code)) _keys[code] = false;
  }
}

function _canvasXY(c, e) {
  const r = c.getBoundingClientRect();
  return {
    cx: (e.clientX - r.left) * (c.width  / r.width),
    cy: (e.clientY - r.top)  * (c.height / r.height),
  };
}

// ─── Tap action dispatcher ────────────────────────────────────────────────────
function _handleTap(cx, cy) {
  // Before game loads, or on menu screens: any tap = confirm (Space)
  if (typeof State === 'undefined' ||
      (State.phase !== 'playing' && State.phase !== 'dead')) {
    _fireTapKey('Space', 2);
    return;
  }

  // If already on a ladder: tap above/below player → climb up/down
  if (typeof player !== 'undefined' && player.onLadder) {
    const mid = player.y + (typeof PH !== 'undefined' ? PH / 2 : 22);
    _fireTapKey(cy < mid ? 'ArrowUp' : 'ArrowDown', 60);
    return;
  }

  // Tap on or near a ladder graphic → try to grab and climb
  const lad = _nearLadder(cx, cy);
  if (lad) {
    // Direction: tap in upper half of the ladder → up, lower half → down
    const lMid = lad.y + lad.h / 2;
    _fireTapKey(cy < lMid ? 'ArrowUp' : 'ArrowDown', 60);
    return;
  }

  // Default: jump
  _fireTapKey('Space', 2);
}

function _nearLadder(cx, cy) {
  if (typeof LADDERS === 'undefined') return null;
  const lw   = typeof LADDER_W !== 'undefined' ? LADDER_W : 32;
  const padX = 40, padY = 24;
  for (const l of LADDERS) {
    if (cx >= l.x - padX && cx <= l.x + lw + padX &&
        cy >= l.y - padY && cy <= l.y + l.h + padY) return l;
  }
  return null;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
function initInput() {
  // Keyboard
  window.addEventListener('keydown', e => {
    if (!_keys[e.code]) _pressed[e.code] = true;
    _keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))
      e.preventDefault();
  });
  window.addEventListener('keyup', e => { _keys[e.code] = false; });

  // Canvas pointer events
  const c = document.getElementById('c');

  c.addEventListener('pointerdown', e => {
    e.preventDefault();
    const { cx, cy } = _canvasXY(c, e);
    _tapData[e.pointerId] = { t0: Date.now(), x0: cx, y0: cy };
    c.setPointerCapture(e.pointerId);

    // Hold zones for continuous walking (outer 25 % each side)
    const leftBound  = c.width * 0.25;
    const rightBound = c.width * 0.75;
    if (cx < leftBound) {
      _pointerZones[e.pointerId] = 'ArrowLeft';
      if (!_keys['ArrowLeft']) _pressed['ArrowLeft'] = true;
      _keys['ArrowLeft'] = true;
    } else if (cx > rightBound) {
      _pointerZones[e.pointerId] = 'ArrowRight';
      if (!_keys['ArrowRight']) _pressed['ArrowRight'] = true;
      _keys['ArrowRight'] = true;
    }
  }, { passive: false });

  c.addEventListener('pointerup', e => {
    e.preventDefault();
    const td = _tapData[e.pointerId];
    delete _tapData[e.pointerId];

    if (td) {
      const { cx, cy } = _canvasXY(c, e);
      const dt   = Date.now() - td.t0;
      const dist = Math.hypot(cx - td.x0, cy - td.y0);

      if (dt < 320 && dist < 35) {
        // It's a tap.  Movement-zone taps still get ladder/climb check.
        const inMove = _pointerZones[e.pointerId] !== undefined;
        if (!inMove) {
          _handleTap(td.x0, td.y0);
        } else {
          // Movement zone tap: only handle ladder (don't also jump)
          const lad = _nearLadder(td.x0, td.y0);
          if (lad) {
            const lMid = lad.y + lad.h / 2;
            _fireTapKey(td.y0 < lMid ? 'ArrowUp' : 'ArrowDown', 60);
          }
        }
      }
    }

    _releasePointer(e.pointerId);
  }, { passive: false });

  c.addEventListener('pointercancel', e => {
    delete _tapData[e.pointerId];
    _releasePointer(e.pointerId);
  });
}

// ─── Input snapshot ───────────────────────────────────────────────────────────
function getInput() {
  const left  = !!(_keys['ArrowLeft']  || _keys['KeyA']);
  const right = !!(_keys['ArrowRight'] || _keys['KeyD']);
  const up    = !!(_keys['ArrowUp']    || _keys['KeyW']);
  const down  = !!(_keys['ArrowDown']  || _keys['KeyS']);
  const jump  = !!(_keys['Space'] || _keys['ArrowUp'] || _keys['KeyW']);

  const jumpJust = !!(
    _pressed['Space'] || _pressed['ArrowUp'] || _pressed['KeyW']
  );

  const leftJust  = !!_pressed['ArrowLeft'];
  const rightJust = !!_pressed['ArrowRight'];
  const upJust    = !!_pressed['ArrowUp'];
  const downJust  = !!_pressed['ArrowDown'];
  const enterJust = !!(_pressed['Enter'] || _pressed['Space']);

  return { left, right, up, down, jump, jumpJust,
           leftJust, rightJust, upJust, downJust, enterJust };
}

// Call at end of each frame to clear just-pressed states.
function flushPressed() {
  for (const k in _pressed) delete _pressed[k];

  // Count down tap-key timers; release when expired
  for (const code in _tapTimers) {
    _tapTimers[code]--;
    if (_tapTimers[code] <= 0) {
      delete _tapTimers[code];
      // Only clear the key if not also held by a zone pointer
      if (!Object.values(_pointerZones).includes(code)) {
        _keys[code] = false;
      }
    }
  }
}
