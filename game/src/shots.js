// Dinner Table Dash — deterministic staging for the screenshots. Each shot
// builds the same world from the same seed, places the turkey and the
// hazards by hand, and paints it twice so the browser has settled before
// the screenshot is taken.
import { TABLE_Y, WINDOW_X } from './config.js';

export function stageShot(name, world) {
  if (name === 'start') {
    world.reset();
    world.state = 'title';
    world.time = 1.2;
    world.turkey.x = 1060;
    world.turkey.y = TABLE_Y;
    world.turkey.runPhase = 0.6;
    return { screen: 'title', best: 0 };
  }

  if (name === 'play') {
    // The cover: mid-run, turkey leaping over a gravy puddle toward a plate
    // while the farmer's knife telegraphs a slash just ahead — hand, red
    // zone, candle burning, cranberries in the air.
    world.startRun(7);
    world.turkey.x = 940;
    world.turkey.y = TABLE_Y - 130;
    world.turkey.vy = -220;
    world.turkey.onGround = false;
    world.turkey.runPhase = 2.4;
    world.time = 12.5;
    world.runTime = 12.5;
    world.score = 1480;
    world.cranberries = 9;
    world.combo = 3;
    world.comboTimer = 2;
    world.lives = 3;
    world.camX = 510;
    world.slashes.push({ x: 1150, w: 104, phase: 'warn', t: 0.55, hitDone: false });
    world.rolls.push({ x: 1560, y: TABLE_Y - 15, r: 15, vx: -210, spin: 1.2 });
    world.burst(880, TABLE_Y - 60, '#a31621', 6, 120);
    return { screen: 'playing', best: 0 };
  }

  if (name === 'slash') {
    // The knife is falling: the turkey gobble-dashes clear of the red zone
    // with feathers flying, the blade mid-swing.
    world.startRun(11);
    world.turkey.x = 1400;
    world.turkey.y = TABLE_Y;
    world.turkey.runPhase = 4.1;
    world.time = 21.4;
    world.runTime = 21.4;
    world.score = 2310;
    world.cranberries = 14;
    world.combo = 2;
    world.comboTimer = 1.5;
    world.lives = 2;
    world.dashTimer = 0.14;
    world.dashCooldown = 1.2;
    world.camX = 900;
    world.slashes.push({ x: 1240, w: 104, phase: 'slash', t: 0.05, hitDone: true });
    world.burst(1240, TABLE_Y - 40, '#b5772f', 12, 240);
    world.floatText(1400, TABLE_Y - 130, 'CLOSE!', '#ffe08a');
    return { screen: 'playing', best: 0 };
  }

  if (name === 'end') {
    // Escaped: the turkey stands at the glowing open window, feathers and
    // golden light everywhere, the end panel up.
    world.startRun(7);
    world.turkey.x = WINDOW_X - 60;
    world.turkey.y = TABLE_Y;
    world.turkey.runPhase = 0;
    world.time = 38.2;
    world.runTime = 38.2;
    world.score = 3420;
    world.cranberries = 18;
    world.stuffing = 2;
    world.lives = 2;
    world.camX = 1320;
    world.state = 'escaped';
    world.finalScore = 3420;
    world.escapedAt = 38.2;
    world.burst(WINDOW_X - 60, TABLE_Y - 60, '#ffe08a', 18, 260);
    return { screen: 'over', best: 0 };
  }

  return { screen: 'title', best: 0 };
}
