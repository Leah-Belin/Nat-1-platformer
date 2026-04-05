'use strict';

// ─── Key state ────────────────────────────────────────────────────────────────
const _keys    = {};  // currently held
const _pressed = {};  // became pressed this frame (consumed on read)

// ─── Canvas zone controls ─────────────────────────────────────────────────────
// Canvas is split into three horizontal zones:
//   Left  third  (0 – 33%)  → ArrowLeft
//   Center third (33 – 67%) → Space (jump / confirm)
//   Right  third (67 – 100%)→ ArrowRight
// Works with both mouse (desktop) and touch (mobile).

const _pointerZones = {};  // pointerId → 'left' | 'center' | 'right'

function _zoneCode(zone) {
  if (zone === 'left')   return 'ArrowLeft';
  if (zone === 'right')  return 'ArrowRight';
  return 'Space';
}

function _releasePointer(id) {
  const zone = _pointerZones[id];
  if (!zone) return;
  delete _pointerZones[id];
  // Only clear the key if no other active pointer occupies the same zone
  const stillHeld = Object.values(_pointerZones).includes(zone);
  if (!stillHeld) _keys[_zoneCode(zone)] = false;
}

function initInput() {
  // ── Keyboard ──
  window.addEventListener('keydown', e => {
    if (!_keys[e.code]) _pressed[e.code] = true;
    _keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => { _keys[e.code] = false; });

  // ── Canvas zone pointer events (mouse + touch) ──
  const c = document.getElementById('c');

  c.addEventListener('pointerdown', e => {
    e.preventDefault();
    const rect = c.getBoundingClientRect();
    const x    = (e.clientX - rect.left) * (c.width / rect.width);
    const zone = x < c.width / 3 ? 'left'
               : x > c.width * 2 / 3 ? 'right'
               : 'center';
    _pointerZones[e.pointerId] = zone;
    c.setPointerCapture(e.pointerId);
    const code = _zoneCode(zone);
    if (!_keys[code]) _pressed[code] = true;
    _keys[code] = true;
  }, { passive: false });

  c.addEventListener('pointerup',     e => { e.preventDefault(); _releasePointer(e.pointerId); }, { passive: false });
  c.addEventListener('pointercancel', e => { _releasePointer(e.pointerId); });
}

// ─── Input snapshot (called each frame) ──────────────────────────────────────
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
}
