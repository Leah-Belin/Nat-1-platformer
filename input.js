'use strict';

// ─── Key state ────────────────────────────────────────────────────────────────
const _keys     = {};   // currently held
const _pressed  = {};   // became pressed this frame (consumed on read)

function initInput() {
  window.addEventListener('keydown', e => {
    if (!_keys[e.code]) _pressed[e.code] = true;
    _keys[e.code] = true;
    // Prevent arrow keys / space from scrolling the page
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    _keys[e.code] = false;
  });
}

// Returns a snapshot of the current input state.
// jumpJustPressed is true only on the frame the jump key was first pressed.
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
