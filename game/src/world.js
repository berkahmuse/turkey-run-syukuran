// Dinner Table Dash — the run itself: the turkey, the table, the farmer's
// carving knife, gravy, candles and rolling bread rolls. The turkey runs
// along the dinner table toward the open window; the farmer's hand reaches
// in from above and telegraphs every slash before it lands, so a good
// player is never hit without warning.
import {
  TABLE_LEN,
  TABLE_Y,
  WINDOW_X,
  GRAVITY,
  RUN_SPEED,
  DASH_SPEED,
  DASH_TIME,
  DASH_COOLDOWN,
  JUMP_VELOCITY,
  MAX_LIVES,
} from './config.js';
import { mulberry32 } from './random.js';

const TURKEY_W = 52;
const TURKEY_H = 84;
const SLASH_WARN = 0.85;
const SLASH_HIT = 0.22;
const BLADE_TOP = TABLE_Y - 120; // the blade sweeps the table, not the air:
// a well-timed jump clears it, a dash carries the turkey out of the zone.

// One-way platforms: plates, glasses and dishes the turkey can stand on.
const PLATFORMS = [
  { x: 380, top: 540, w: 150, kind: 'plate' },
  { x: 560, top: 505, w: 46, kind: 'glass' },
  { x: 760, top: 545, w: 150, kind: 'plate' },
  { x: 1080, top: 500, w: 150, kind: 'plate' },
  { x: 1260, top: 505, w: 46, kind: 'glass' },
  { x: 1450, top: 550, w: 150, kind: 'plate' },
  { x: 1680, top: 520, w: 130, kind: 'dish' },
  { x: 1900, top: 500, w: 150, kind: 'plate' },
  { x: 2080, top: 505, w: 46, kind: 'glass' },
  { x: 2260, top: 545, w: 150, kind: 'plate' },
];

const GRAVY = [
  { x0: 880, x1: 1000 },
  { x0: 1520, x1: 1650 },
  { x0: 2140, x1: 2270 },
];

const CANDLES = [640, 1330, 1990];

const CRANBERRY_SPOTS = [300, 700, 950, 1200, 1500, 1800, 2100, 2350];

export class World {
  constructor(seed) {
    this.rng = mulberry32(seed || 7);
    this.reset();
  }

  reset() {
    this.state = 'title'; // title | playing | paused | caught | escaped
    this.time = 0;
    this.runTime = 0;
    this.turkey = { x: 170, y: TABLE_Y, vy: 0, onGround: true, facing: 1, runPhase: 0 };
    this.vx = 0;
    this.knockX = 0;
    this.score = 0;
    this.cranberries = 0;
    this.stuffing = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.lives = MAX_LIVES;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.invulnTimer = 0;
    this.flashTimer = 0;
    this.slashTimer = 2.6;
    this.rollTimer = 4.5;
    this.idleTimer = 0;
    this.lastX = 170;
    this.camX = 0;
    this.platforms = PLATFORMS.map((p) => ({ ...p }));
    this.gravy = GRAVY.map((g) => ({ ...g }));
    this.candles = CANDLES.map((x) => ({ x, flicker: this.rng() * 10 }));
    this.pickups = [];
    for (const spot of CRANBERRY_SPOTS) {
      for (let i = 0; i < 3; i += 1) {
        this.pickups.push({
          kind: 'cranberry',
          x: spot + (i - 1) * 36,
          y: TABLE_Y - 96 - (i === 1 ? 34 : 0),
          taken: false,
          phase: this.rng() * 6,
        });
      }
    }
    this.pickups.push({ kind: 'stuffing', x: 1080, y: 500 - 26, taken: false, phase: 0 });
    this.pickups.push({ kind: 'stuffing', x: 1680, y: 520 - 26, taken: false, phase: 0 });
    this.pickups.push({ kind: 'wishbone', x: 2380, y: TABLE_Y - 120, taken: false, phase: 0 });
    this.slashes = [];
    this.rolls = [];
    this.particles = [];
    this.floats = [];
    this.endReason = '';
    this.finalScore = 0;
    this.escapedAt = 0;
  }

  startRun(seed) {
    this.rng = mulberry32(seed === undefined ? 7 : seed);
    this.reset();
    this.state = 'playing';
  }

  turkeyBox() {
    return {
      x: this.turkey.x - TURKEY_W / 2,
      y: this.turkey.y - TURKEY_H,
      w: TURKEY_W,
      h: TURKEY_H,
    };
  }

  distanceM() {
    return Math.max(0, Math.floor((WINDOW_X - this.turkey.x) / 40));
  }

  inGravy() {
    if (this.turkey.y < TABLE_Y - 1) return false;
    return this.gravy.some((g) => this.turkey.x > g.x0 && this.turkey.x < g.x1);
  }

  burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const a = this.rng() * Math.PI * 2;
      const s = speed * (0.4 + this.rng() * 0.8);
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 120,
        life: 0.6 + this.rng() * 0.5,
        max: 1.1,
        color,
        size: 3 + this.rng() * 5,
      });
    }
  }

  floatText(x, y, text, color) {
    this.floats.push({ x, y, text, color: color || '#fdf3d8', life: 1.1 });
  }

  spawnSlash(targeted) {
    const x = targeted
      ? this.turkey.x
      : Math.min(Math.max(this.turkey.x + 170 + this.rng() * 150, 140), TABLE_LEN - 120);
    this.slashes.push({ x, w: 104, phase: 'warn', t: 0, hitDone: false });
    return x;
  }

  hurt(sourceX) {
    if (this.invulnTimer > 0 || this.state !== 'playing') return false;
    this.lives -= 1;
    this.invulnTimer = 1.4;
    this.flashTimer = 0.35;
    this.combo = 0;
    this.knockX = this.turkey.x < sourceX ? -340 : 340;
    this.burst(this.turkey.x, this.turkey.y - 50, '#b5772f', 14, 260);
    this.floatText(this.turkey.x, this.turkey.y - 110, 'OUCH!', '#ff6b5e');
    if (this.lives <= 0) {
      this.state = 'caught';
      this.endReason = 'The farmer carved you up. Gobble no more.';
      this.finalScore = Math.floor(this.score);
      return 'caught';
    }
    return 'hit';
  }

  // One fixed step. Returns event names for the sound layer.
  step(dt, dir, jump, dash) {
    const events = [];
    this.time += dt;
    if (this.state === 'title') {
      this.turkey.runPhase += dt * 2;
      return events;
    }
    if (this.state !== 'playing') {
      this.updateParticles(dt);
      return events;
    }
    this.runTime += dt;

    // Dash: a short burst with a cooldown, shown on the HUD.
    if (dash && this.dashCooldown <= 0 && this.dashTimer <= 0) {
      this.dashTimer = DASH_TIME;
      this.dashCooldown = DASH_COOLDOWN;
      events.push('dash');
      this.burst(this.turkey.x, this.turkey.y - 20, '#ffe08a', 8, 160);
    }
    if (this.dashTimer > 0) this.dashTimer -= dt;
    if (this.dashCooldown > 0) this.dashCooldown -= dt;

    // Horizontal movement; gravy drags the turkey down to a waddle.
    const slow = this.inGravy() ? 0.45 : 1;
    let speed = RUN_SPEED * slow;
    if (this.dashTimer > 0) speed = DASH_SPEED;
    this.vx = dir * speed + this.knockX;
    this.knockX *= Math.pow(0.02, dt);
    if (Math.abs(this.knockX) < 8) this.knockX = 0;
    const prevX = this.turkey.x;
    this.turkey.x += this.vx * dt;
    this.turkey.x = Math.max(40, Math.min(TABLE_LEN - 30, this.turkey.x));
    if (dir !== 0) this.turkey.facing = dir;
    if (Math.abs(this.vx) > 20) this.turkey.runPhase += dt * Math.abs(this.vx) * 0.045;
    if (this.turkey.x > prevX) this.score += (this.turkey.x - prevX) * 0.05;

    // Jump, gravity, and one-way platforms.
    if (jump && this.turkey.onGround) {
      this.turkey.vy = JUMP_VELOCITY;
      this.turkey.onGround = false;
      events.push('jump');
    }
    const prevFeet = this.turkey.y;
    this.turkey.vy += GRAVITY * dt;
    this.turkey.y += this.turkey.vy * dt;
    this.turkey.onGround = false;
    if (this.turkey.y >= TABLE_Y) {
      this.turkey.y = TABLE_Y;
      this.turkey.vy = 0;
      this.turkey.onGround = true;
    } else if (this.turkey.vy > 0) {
      for (const p of this.platforms) {
        if (
          prevFeet <= p.top + 1 && this.turkey.y >= p.top
          && this.turkey.x > p.x - p.w / 2 && this.turkey.x < p.x + p.w / 2
        ) {
          this.turkey.y = p.top;
          this.turkey.vy = 0;
          this.turkey.onGround = true;
          break;
        }
      }
    }

    // Gravy splashes under running feet.
    if (this.inGravy() && Math.abs(this.vx) > 40 && this.rng() < 0.35) {
      this.particles.push({
        x: this.turkey.x + (this.rng() - 0.5) * 30,
        y: TABLE_Y - 4,
        vx: (this.rng() - 0.5) * 120,
        vy: -60 - this.rng() * 90,
        life: 0.5, max: 0.5,
        color: '#8a5a1e',
        size: 3 + this.rng() * 3,
      });
    }

    // Pickups.
    const box = this.turkeyBox();
    for (const p of this.pickups) {
      if (p.taken) continue;
      const dx = p.x - this.turkey.x;
      const dy = p.y - (this.turkey.y - 46);
      if (Math.abs(dx) < 40 && Math.abs(dy) < 56) {
        p.taken = true;
        if (p.kind === 'cranberry') {
          this.combo = this.comboTimer > 0 ? Math.min(this.combo + 1, 5) : 1;
          this.comboTimer = 3;
          const pts = 25 * this.combo;
          this.score += pts;
          this.cranberries += 1;
          this.floatText(p.x, p.y - 24, `+${pts}${this.combo > 1 ? ` x${this.combo}` : ''}`, '#ff8fa0');
          this.burst(p.x, p.y, '#a31621', 8, 140);
          events.push('pickup');
        } else if (p.kind === 'stuffing') {
          this.score += 50;
          this.stuffing += 1;
          this.floatText(p.x, p.y - 24, '+50 STUFFING!', '#ffd166');
          this.burst(p.x, p.y, '#d9a441', 10, 160);
          events.push('stuffing');
        } else {
          this.score += 150;
          this.floatText(p.x, p.y - 24, '+150 WISHBONE!', '#ffe08a');
          this.burst(p.x, p.y, '#ffe08a', 14, 200);
          events.push('stuffing');
        }
      }
    }
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Candle flames burn.
    for (const c of this.candles) {
      if (
        this.turkey.x > c.x - 20 && this.turkey.x < c.x + 20
        && this.turkey.y > TABLE_Y - 130
      ) {
        const r = this.hurt(c.x);
        if (r) events.push(r);
        break;
      }
    }

    // Rolling bread rolls.
    this.rollTimer -= dt;
    if (this.rollTimer <= 0 && this.turkey.x < WINDOW_X - 320) {
      this.rolls.push({ x: this.camX + 1280 + 80, y: TABLE_Y - 15, r: 15, vx: -210, spin: 0 });
      this.rollTimer = 4 + this.rng() * 2.5;
    }
    for (let i = this.rolls.length - 1; i >= 0; i -= 1) {
      const roll = this.rolls[i];
      roll.x += roll.vx * dt;
      roll.spin += dt * 8;
      if (roll.x < this.camX - 120) {
        this.rolls.splice(i, 1);
        continue;
      }
      const dx = roll.x - this.turkey.x;
      const dy = roll.y - (this.turkey.y - 30);
      if (Math.abs(dx) < 36 && Math.abs(dy) < 52 && this.invulnTimer <= 0) {
        const r = this.hurt(roll.x);
        if (r) events.push(r);
        this.rolls.splice(i, 1);
      }
    }

    // The carving knife: telegraphed, then it falls.
    const interval = Math.max(1.5, 2.4 - (this.turkey.x / TABLE_LEN) * 0.9);
    this.slashTimer -= dt;
    if (this.slashTimer <= 0) {
      this.spawnSlash(false);
      this.slashTimer = interval;
      events.push('warn');
    }
    // Stand still and the farmer stops waiting: a slash lands on the turkey.
    if (this.turkey.x - this.lastX > 2) {
      this.idleTimer = 0;
      this.lastX = this.turkey.x;
    } else {
      this.idleTimer += dt;
      if (this.idleTimer > 4) {
        this.spawnSlash(true);
        this.idleTimer = 0;
        events.push('warn');
      }
    }
    for (let i = this.slashes.length - 1; i >= 0; i -= 1) {
      const s = this.slashes[i];
      s.t += dt;
      if (s.phase === 'warn' && s.t >= SLASH_WARN) {
        s.phase = 'slash';
        s.t = 0;
        events.push('slash');
      } else if (s.phase === 'slash') {
        if (!s.hitDone) {
          s.hitDone = true;
          if (
            Math.abs(this.turkey.x - s.x) < s.w / 2 + TURKEY_W / 2 - 8
            && this.turkey.y - TURKEY_H < TABLE_Y
            && this.turkey.y > BLADE_TOP
            && this.invulnTimer <= 0
          ) {
            const r = this.hurt(s.x);
            if (r) events.push(r);
          }
        }
        if (s.t >= SLASH_HIT) this.slashes.splice(i, 1);
      }
    }

    // Escape through the window.
    if (this.turkey.x >= WINDOW_X) {
      this.state = 'escaped';
      this.escapedAt = this.runTime;
      this.finalScore = Math.floor(this.score);
      this.burst(this.turkey.x, this.turkey.y - 60, '#ffe08a', 22, 300);
      events.push('escape');
    }

    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    this.updateParticles(dt);
    this.camX = Math.max(0, Math.min(TABLE_LEN - 1280, this.turkey.x - 430));
    return events;
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floats.length - 1; i >= 0; i -= 1) {
      const f = this.floats[i];
      f.y -= 42 * dt;
      f.life -= dt;
      if (f.life <= 0) this.floats.splice(i, 1);
    }
  }
}
