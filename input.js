'use strict';

// ─── Key state ────────────────────────────────────────────────────────────────
const _keys     = {};   // currently held
const _pressed  = {};   // became pressed this frame (consumed on read)

function initInput() {
  // Keyboard
  window.addEventListener('keydown', e => {
    if (!_keys[e.code]) _pressed[e.code] = true;
    _keys[e.code] = true;
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    _keys[e.code] = false;
  });

  // Touch controls
  _setupTouchControls();
}

// Map touch button IDs → key codes they emulate
const _TOUCH_MAP = [
  ['tbtn-up',    'ArrowUp'],
  ['tbtn-down',  'ArrowDown'],
  ['tbtn-left',  'ArrowLeft'],
  ['tbtn-right', 'ArrowRight'],
  ['tbtn-jump',  'Space'],
];

function _setupTouchControls() {
  // Only wire up if we have touch capability
  const hasTouchUI = document.getElementById('touch-ui');
  if (!hasTouchUI) return;

  // Show on coarse-pointer (touch) devices
  if (window.matchMedia('(pointer: coarse)').matches) {
    hasTouchUI.style.display = 'block';
  }

  for (const [id, code] of _TOUCH_MAP) {
    const el = document.getElementById(id);
    if (!el) continue;

    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      _keys[code]    = true;
      _pressed[code] = true;
      // Capture so pointerup fires even if finger slides off
      el.setPointerCapture(e.pointerId);
    }, { passive: false });

    el.addEventListener('pointerup', e => {
      e.preventDefault();
      _keys[code] = false;
    }, { passive: false });

    el.addEventListener('pointercancel', () => {
      _keys[code] = false;
    });
  }

  // Prevent the canvas from triggering browser scroll / zoom on touch
  document.getElementById('c').addEventListener('touchstart', e => {
    e.preventDefault();
  }, { passive: false });
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

  // Directional "just pressed" for menus
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
