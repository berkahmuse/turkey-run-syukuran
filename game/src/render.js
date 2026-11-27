// Dinner Table Dash — every pixel is drawn in code: the dining room, the
// Thanksgiving table with its checkered cloth, the turkey, the farmer's
// hand and carving knife, the HUD and the title / end screens. Warm autumn
// palette, flat vector shapes, no image files.
import { VIEW_W, VIEW_H, TABLE_LEN, TABLE_Y, WINDOW_X, PALETTE } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'playing';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const TAU = Math.PI * 2;

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

// The turkey, drawn big and readable: fan tail, plump body, red wattle,
// worried eye. runPhase swings the legs; airborne tucks them.
export function drawTurkey(ctx, x, y, opts) {
  const run = opts.runPhase || 0;
  const flash = opts.flash;
  if (flash && Math.floor(opts.time * 14) % 2 === 0) return;
  const legSwing = Math.sin(run) * 11;
  const airborne = opts.airborne;
  const facing = opts.facing || 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);

  // Tail fan: five warm feathers with dark tips, fanned behind the body.
  for (let i = -2; i <= 2; i += 1) {
    const angle = -Math.PI / 2 + i * 0.46;
    const fx = Math.cos(angle) * 34 - 16;
    const fy = Math.sin(angle) * 34 - 20;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(angle + Math.PI / 2);
    ellipse(ctx, 0, 0, 8, 19, PALETTE.feather);
    ellipse(ctx, 0, -13, 4.5, 7, PALETTE.featherTip);
    ctx.restore();
  }

  // Legs: orange, swinging while running, tucked in the air.
  ctx.strokeStyle = PALETTE.leg;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, -10);
  ctx.lineTo(-9 + (airborne ? 5 : legSwing), 0);
  ctx.moveTo(9, -10);
  ctx.lineTo(9 + (airborne ? -3 : -legSwing), 0);
  ctx.stroke();

  // Body, belly and wing.
  ellipse(ctx, 0, -32, 30, 25, PALETTE.turkeyBody);
  ellipse(ctx, 6, -24, 20, 14, PALETTE.turkeyLight);
  ellipse(ctx, -8, -34, 14, 10, PALETTE.turkeyLight);

  // Neck, head, beak, wattle and a wide worried eye.
  ellipse(ctx, 20, -58, 8, 16, PALETTE.turkeyBody);
  circle(ctx, 25, -70, 13, PALETTE.head);
  ctx.fillStyle = PALETTE.beak;
  ctx.beginPath();
  ctx.moveTo(34, -74);
  ctx.lineTo(48, -68);
  ctx.lineTo(34, -63);
  ctx.closePath();
  ctx.fill();
  ellipse(ctx, 31, -60, 4, 9, PALETTE.wattle);
  circle(ctx, 28, -73, 3.4, '#241a12');
  circle(ctx, 29.4, -74.4, 1.2, '#ffffff');
  ctx.restore();
}

// The farmer's hand and carving knife, reaching in from the top of the
// frame. progress 0..1 lowers the knife during the telegraph; during the
// slash the blade is at the table with motion lines.
function drawHandAndKnife(ctx, x, progress, slashing, time) {
  const handY = slashing ? 96 : -30 + progress * 130;
  const bladeTop = slashing ? TABLE_Y - 118 : handY + 72;
  const bladeBottom = slashing ? TABLE_Y + 4 : bladeTop + 92;

  // Sleeve and forearm from the top edge.
  ctx.save();
  ctx.translate(x, handY);
  rect(ctx, -26, -140, 52, 150, PALETTE.farmerShirt);
  rect(ctx, -30, -6, 60, 16, '#f7ead2'); // shirt cuff
  // Fist gripping the handle.
  ellipse(ctx, 0, 26, 26, 22, PALETTE.hand);
  circle(ctx, -14, 34, 8, PALETTE.hand);
  circle(ctx, 0, 38, 8, PALETTE.hand);
  circle(ctx, 14, 34, 8, PALETTE.hand);
  // Knife handle in the fist, blade pointing down.
  rect(ctx, -8, 34, 16, 44, PALETTE.knifeHandle);
  ctx.restore();

  // Blade, with a glint.
  ctx.fillStyle = PALETTE.knifeBlade;
  ctx.beginPath();
  ctx.moveTo(x - 9, bladeTop);
  ctx.lineTo(x + 9, bladeTop);
  ctx.lineTo(x + 9, bladeBottom - 26);
  ctx.lineTo(x, bladeBottom);
  ctx.lineTo(x - 9, bladeBottom - 26);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 4, bladeTop + 8);
  ctx.lineTo(x - 4, bladeBottom - 34);
  ctx.stroke();

  if (slashing) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i += 1) {
      const lx = x + i * 22;
      ctx.beginPath();
      ctx.moveTo(lx, bladeTop - 46);
      ctx.lineTo(lx, bladeTop + 6);
      ctx.stroke();
    }
  }
  void time;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawWall(camX, time) {
    // Warm dining-room wall with wainscoting; the open window waits at the
    // far end of the table, glowing with evening light. Everything here is
    // drawn in world space, spanning the visible slice of the table.
    rect(ctx, camX, 0, VIEW_W, TABLE_Y, PALETTE.wall);
    rect(ctx, camX, TABLE_Y - 118, VIEW_W, 118, PALETTE.wainscot);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    for (let wx = Math.floor(camX / 430) * 430; wx < camX + VIEW_W + 430; wx += 430) {
      ctx.fillRect(wx, 30, 120, 300);
    }
    // Framed pumpkin picture on the wall.
    const picX = 1080;
    roundRect(ctx, picX, 90, 150, 110, 8, '#6e451f');
    roundRect(ctx, picX + 8, 98, 134, 94, 4, '#f7ead2');
    ellipse(ctx, picX + 75, 158, 34, 26, '#e8862e');
    ellipse(ctx, picX + 75, 168, 26, 14, '#c96a1e');
    rect(ctx, picX + 72, 126, 6, 12, '#5d8a3c');
    // Pendant lamp swaying gently.
    const lampX = 900;
    const sway = Math.sin(time * 0.7) * 6;
    ctx.strokeStyle = '#6e451f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(lampX, 0);
    ctx.lineTo(lampX + sway, 96);
    ctx.stroke();
    ctx.fillStyle = '#2f6b4f';
    ctx.beginPath();
    ctx.moveTo(lampX + sway - 52, 96);
    ctx.lineTo(lampX + sway + 52, 96);
    ctx.lineTo(lampX + sway, 66);
    ctx.closePath();
    ctx.fill();
    circle(ctx, lampX + sway, 104, 12, '#ffe08a');
    // The open window at the end of the table: the way out.
    const winX = WINDOW_X - 40;
    roundRect(ctx, winX, 90, 190, 300, 10, '#fdfbf4');
    roundRect(ctx, winX + 12, 102, 166, 276, 6, '#7fb3d9');
    ellipse(ctx, winX + 60, 180, 42, 30, '#ffd166'); // low autumn sun
    ellipse(ctx, winX + 130, 330, 26, 18, '#5d8a3c');
    ellipse(ctx, winX + 60, 340, 30, 20, '#7a9e4f');
    rect(ctx, winX + 88, 102, 14, 276, '#fdfbf4');
    rect(ctx, winX + 12, 232, 166, 14, '#fdfbf4');
    text(ctx, 'ESCAPE →', winX + 95, 420, 22, '#fdfbf4', 'center');
  }

  function drawTable(camX) {
    // Wooden table top and front, with the red checkered runner down the
    // middle and a few scattered autumn leaves. Drawn in world space over
    // the visible slice of the table.
    rect(ctx, camX - 40, TABLE_Y, VIEW_W + 80, 26, PALETTE.woodLight);
    rect(ctx, camX - 40, TABLE_Y + 26, VIEW_W + 80, VIEW_H - TABLE_Y - 26, PALETTE.wood);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let wx = Math.floor(camX / 311) * 311; wx < camX + VIEW_W + 311; wx += 311) {
      ctx.fillRect(wx, TABLE_Y + 34, 90, 5);
    }
    // Checkered runner.
    const sq = 34;
    const startX = Math.floor((camX - sq) / sq) * sq;
    for (let x = startX; x < camX + VIEW_W + sq; x += sq) {
      for (let y = TABLE_Y; y < TABLE_Y + 120; y += sq) {
        const col = (Math.floor(x / sq) + Math.floor(y / sq)) % 2 === 0;
        ctx.fillStyle = col ? PALETTE.clothRed : PALETTE.clothCream;
        ctx.globalAlpha = col ? 0.85 : 0.9;
        ctx.fillRect(x, y, sq, sq);
      }
    }
    ctx.globalAlpha = 1;
    // Scattered leaves on the runner.
    for (let wx = Math.floor(camX / 397) * 397; wx < camX + VIEW_W + 397; wx += 397) {
      ellipse(ctx, wx + 120, TABLE_Y + 96, 10, 5, PALETTE.leaf);
    }
  }

  function drawPlatform(p, time) {
    if (p.kind === 'plate') {
      ellipse(ctx, p.x, p.top + 8, p.w / 2, 12, PALETTE.plate);
      ellipse(ctx, p.x, p.top + 4, p.w / 2 - 12, 8, PALETTE.plateRim);
      ellipse(ctx, p.x, p.top + 2, p.w / 2 - 26, 5, PALETTE.plate);
    } else if (p.kind === 'glass') {
      ctx.fillStyle = 'rgba(232,163,61,0.85)';
      ctx.beginPath();
      ctx.moveTo(p.x - 20, p.top);
      ctx.lineTo(p.x - 14, TABLE_Y);
      ctx.lineTo(p.x + 14, TABLE_Y);
      ctx.lineTo(p.x + 20, p.top);
      ctx.closePath();
      ctx.fill();
      rect(ctx, p.x - 22, p.top - 4, 44, 6, PALETTE.glass);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(p.x - 12, p.top + 8, 5, 70);
    } else {
      // Stuffing dish: a wide bowl with golden stuffing.
      ellipse(ctx, p.x, p.top + 8, p.w / 2, 12, '#8e44ad');
      ellipse(ctx, p.x, p.top + 2, p.w / 2 - 8, 8, PALETTE.stuffing);
      circle(ctx, p.x - 18, p.top - 4, 7, '#c98a2e');
      circle(ctx, p.x + 14, p.top - 6, 8, '#c98a2e');
    }
    void time;
  }

  function drawGravy(g, time) {
    const wobble = Math.sin(time * 2 + g.x0) * 3;
    ctx.fillStyle = PALETTE.gravy;
    ctx.beginPath();
    ctx.ellipse((g.x0 + g.x1) / 2, TABLE_Y + 2, (g.x1 - g.x0) / 2, 9 + wobble * 0.3, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse((g.x0 + g.x1) / 2 - 12, TABLE_Y, (g.x1 - g.x0) / 4, 3, 0, 0, TAU);
    ctx.fill();
  }

  function drawCandle(c, time) {
    const flick = Math.sin(time * 9 + c.flicker) * 3;
    rect(ctx, c.x - 9, TABLE_Y - 58, 18, 58, PALETTE.candleWax);
    rect(ctx, c.x - 13, TABLE_Y - 6, 26, 8, '#b98a52');
    // Flame: a teardrop that flickers, with a hot core.
    ctx.fillStyle = PALETTE.flame;
    ctx.beginPath();
    ctx.moveTo(c.x, TABLE_Y - 118 + flick);
    ctx.quadraticCurveTo(c.x + 13, TABLE_Y - 92, c.x, TABLE_Y - 72);
    ctx.quadraticCurveTo(c.x - 13, TABLE_Y - 92, c.x, TABLE_Y - 118 + flick);
    ctx.fill();
    ellipse(ctx, c.x, TABLE_Y - 84, 5, 8, PALETTE.flameCore);
    // Danger glow on the table.
    ctx.fillStyle = 'rgba(255,157,46,0.18)';
    ctx.beginPath();
    ctx.ellipse(c.x, TABLE_Y + 4, 46, 10, 0, 0, TAU);
    ctx.fill();
  }

  function drawPickup(p, time) {
    const bob = Math.sin(time * 3 + p.phase) * 4;
    if (p.kind === 'cranberry') {
      circle(ctx, p.x, p.y + bob, 9, PALETTE.cranberry);
      circle(ctx, p.x - 3, p.y + bob - 3, 3, 'rgba(255,255,255,0.55)');
    } else if (p.kind === 'stuffing') {
      circle(ctx, p.x, p.y + bob, 13, PALETTE.stuffing);
      circle(ctx, p.x - 8, p.y + bob - 4, 5, '#c98a2e');
      circle(ctx, p.x + 7, p.y + bob - 2, 5, '#c98a2e');
    } else {
      // Golden wishbone.
      ctx.strokeStyle = '#ffe08a';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x - 12, p.y + bob + 10);
      ctx.lineTo(p.x, p.y + bob - 10);
      ctx.lineTo(p.x + 12, p.y + bob + 10);
      ctx.stroke();
      circle(ctx, p.x, p.y + bob - 10, 4, '#ffe08a');
    }
  }

  function drawSlash(s, time) {
    const cx = s.x;
    if (s.phase === 'warn') {
      const pulse = 0.5 + Math.sin(time * 16) * 0.5;
      ctx.fillStyle = `rgba(215,38,61,${0.16 + pulse * 0.12})`;
      ctx.fillRect(cx - s.w / 2, TABLE_Y - 260, s.w, 260);
      ctx.strokeStyle = PALETTE.warn;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.strokeRect(cx - s.w / 2, TABLE_Y - 260, s.w, 260);
      ctx.setLineDash([]);
      text(ctx, '!', cx, TABLE_Y - 272, 34, PALETTE.warn, 'center');
      drawHandAndKnife(ctx, cx, Math.min(s.t / 0.85, 1), false, time);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(cx - s.w / 2, TABLE_Y - 260, s.w, 260);
      drawHandAndKnife(ctx, cx, 1, true, time);
    }
  }

  function drawRoll(r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.spin);
    circle(ctx, 0, 0, r.r, '#d9a441');
    ctx.strokeStyle = '#a9743c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r.r + 3, 0);
    ctx.lineTo(r.r - 3, 0);
    ctx.moveTo(0, -r.r + 3);
    ctx.lineTo(0, r.r - 3);
    ctx.stroke();
    ctx.restore();
  }

  function drawHUD(world) {
    roundRect(ctx, 0, 0, VIEW_W, 54, 0, PALETTE.hudBar);
    text(ctx, `SCORE ${Math.floor(world.score)}`, 24, 28, 24, PALETTE.hudText);
    text(ctx, `WINDOW ${world.distanceM()}m`, 400, 28, 24, PALETTE.hudText);
    // Lives as hearts.
    for (let i = 0; i < 3; i += 1) {
      const hx = 640 + i * 34;
      const alive = i < world.lives;
      ctx.fillStyle = alive ? '#e63946' : 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(hx, 36);
      ctx.bezierCurveTo(hx - 12, 22, hx - 26, 30, hx, 46);
      ctx.bezierCurveTo(hx + 26, 30, hx + 12, 22, hx, 36);
      ctx.fill();
    }
    text(ctx, `◉ ${world.cranberries}`, 790, 28, 24, '#ff8fa0');
    text(ctx, `${Math.floor(world.runTime)}s`, 920, 28, 24, PALETTE.hudText);
    // Dash cooldown bar.
    const dashFrac = world.dashCooldown <= 0 ? 1 : 1 - world.dashCooldown / 2;
    text(ctx, 'DASH', 1000, 28, 18, dashFrac >= 1 ? '#ffe08a' : 'rgba(253,243,216,0.6)');
    roundRect(ctx, 1060, 18, 150, 16, 8, 'rgba(255,255,255,0.2)');
    roundRect(ctx, 1060, 18, 150 * dashFrac, 16, 8, '#ffe08a');
    // Combo badge.
    if (world.combo > 1) {
      roundRect(ctx, 24, 66, 150, 34, 17, '#a31621');
      text(ctx, `COMBO x${world.combo}`, 99, 84, 20, '#ffffff', 'center');
    }
    // Progress bar along the table.
    const prog = Math.min(world.turkey.x / WINDOW_X, 1);
    roundRect(ctx, VIEW_W - 260, 66, 236, 10, 5, 'rgba(255,255,255,0.25)');
    roundRect(ctx, VIEW_W - 260, 66, 236 * prog, 10, 5, '#ffe08a');
    text(ctx, 'TO THE WINDOW', VIEW_W - 24, 66, 13, PALETTE.hudText, 'right');
  }

  function drawPanel(title, lines, accent) {
    ctx.fillStyle = 'rgba(30,18,8,0.55)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    roundRect(ctx, 290, 130, 700, 460, 18, 'rgba(74,47,29,0.94)');
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(290, 130, 700, 460);
    text(ctx, title, 640, 190, 52, '#fdf3d8', 'center');
    lines.forEach((line, i) => {
      text(ctx, line, 640, 250 + i * 40, line.startsWith('—') ? 20 : 23, line.startsWith('—') ? '#ffe08a' : '#fdf3d8', 'center');
    });
  }

  function draw(world, screen, best) {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    const camX = world.camX || 0;
    const time = world.time;

    ctx.save();
    ctx.translate(-camX, 0);
    drawWall(camX, time);
    drawTable(camX);
    for (const g of world.gravy) drawGravy(g, time);
    for (const p of world.platforms) drawPlatform(p, time);
    for (const c of world.candles) drawCandle(c, time);
    for (const p of world.pickups) if (!p.taken) drawPickup(p, time);
    for (const r of world.rolls) drawRoll(r);
    for (const s of world.slashes) drawSlash(s, time);
    // Particles and floating score text.
    for (const pt of world.particles) {
      ctx.globalAlpha = Math.max(pt.life / pt.max, 0);
      circle(ctx, pt.x, pt.y, pt.size, pt.color);
    }
    ctx.globalAlpha = 1;
    for (const f of world.floats) {
      ctx.globalAlpha = Math.max(f.life, 0);
      text(ctx, f.text, f.x + 2, f.y + 2, 22, 'rgba(40,20,8,0.85)', 'center');
      text(ctx, f.text, f.x, f.y, 22, f.color, 'center');
    }
    ctx.globalAlpha = 1;
    // The turkey, always drawn big in the middle of the action.
    drawTurkey(ctx, world.turkey.x, world.turkey.y, {
      runPhase: world.turkey.runPhase,
      facing: world.turkey.facing,
      airborne: !world.turkey.onGround,
      flash: world.invulnTimer > 0 && world.flashTimer > 0,
      time,
    });
    ctx.restore();

    if (screen === SCREEN_TITLE) {
      ctx.fillStyle = 'rgba(30,18,8,0.45)';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      text(ctx, 'DINNER TABLE DASH', 640, 150, 64, '#fdf3d8', 'center');
      text(ctx, 'A turkey escape game — Thanksgiving is coming, and YOU are dinner.', 640, 205, 24, '#ffe08a', 'center');
      text(ctx, 'Run the length of the dinner table and slip out the open window.', 640, 250, 22, '#fdf3d8', 'center');
      text(ctx, '← → / A D  run      SPACE / ↑  jump      SHIFT  gobble dash', 640, 320, 22, '#fdf3d8', 'center');
      text(ctx, 'Dodge the farmer’s carving knife — red means SLASH COMING.', 640, 360, 22, '#ff8fa0', 'center');
      text(ctx, 'Gravy slows you. Candle flames burn. Grab cranberries & stuffing.', 640, 400, 22, '#fdf3d8', 'center');
      text(ctx, 'Don’t dawdle: stand still and the knife comes for YOU.', 640, 440, 22, '#fdf3d8', 'center');
      const blink = Math.floor(time * 2) % 2 === 0;
      if (blink) text(ctx, 'PRESS SPACE TO RUN FOR YOUR LIFE', 640, 520, 28, '#ffe08a', 'center');
      if (best > 0) text(ctx, `BEST SCORE ${best}`, 640, 570, 20, 'rgba(253,243,216,0.8)', 'center');
    } else if (screen === SCREEN_PLAY) {
      drawHUD(world);
    } else if (screen === SCREEN_PAUSED) {
      drawHUD(world);
      drawPanel('PAUSED', ['Take a breath. The knife waits for no turkey.', '', 'SPACE — keep running      R — restart'], '#ffe08a');
    } else if (screen === SCREEN_OVER) {
      drawHUD(world);
      if (world.state === 'escaped') {
        drawPanel('ESCAPED!', [
          'You slipped out the window into the autumn evening.',
          'The farmer is still looking for his dinner.',
          '',
          `SCORE ${world.finalScore}    TIME ${Math.floor(world.escapedAt)}s    CRANBERRIES ${world.cranberries}`,
          '',
          '— PRESS SPACE TO RUN AGAIN —',
        ], '#7fb069');
      } else {
        drawPanel('CAUGHT!', [
          world.endReason || 'The farmer got you.',
          '',
          `SCORE ${world.finalScore}    TIME ${Math.floor(world.runTime)}s    CRANBERRIES ${world.cranberries}`,
          '',
          '— PRESS SPACE TO TRY AGAIN —',
        ], '#d7263d');
      }
    }
  }

  return { draw, drawTurkey };
}
