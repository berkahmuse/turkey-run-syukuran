// Dinner Table Dash — keyboard and mouse input.
// Arrow keys / WASD run and jump, Shift is the gobble dash, Space confirms,
// P pauses, M mutes, R restarts. Clicking also jumps / confirms.
export const ACTION_JUMP = 1;
export const ACTION_DASH = 2;
export const ACTION_CONFIRM = 4;
export const ACTION_PAUSE = 8;
export const ACTION_MUTE = 16;
export const ACTION_RESTART = 32;

export function createInput(canvas) {
  const keys = new Set();
  let actions = 0;

  function press(code) {
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') actions |= ACTION_JUMP | ACTION_CONFIRM;
    if (code === 'ShiftLeft' || code === 'ShiftRight') actions |= ACTION_DASH;
    if (code === 'Enter') actions |= ACTION_CONFIRM;
    if (code === 'KeyP' || code === 'Escape') actions |= ACTION_PAUSE;
    if (code === 'KeyM') actions |= ACTION_MUTE;
    if (code === 'KeyR') actions |= ACTION_RESTART;
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.code);
    press(event.code);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      event.preventDefault();
    }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  canvas.addEventListener('pointerdown', () => {
    actions |= ACTION_JUMP | ACTION_CONFIRM;
  });

  return {
    // -1 left, 0 still, +1 right.
    direction() {
      const left = keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0;
      const right = keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0;
      return right - left;
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
