// Dinner Table Dash — boot and the one loop: input is read every frame,
// the world advances in fixed 1/60 s steps, and the renderer paints what
// is there. Four screens: title, play, paused and over (caught / escaped).
//
// ?seed=N fixes the run. ?shot=start|play|slash|end (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { STEP, BEST_KEY } from './config.js';
import { World } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_PAUSE,
  ACTION_MUTE,
  ACTION_RESTART,
  ACTION_JUMP,
  ACTION_DASH,
  createInput,
} from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = new World(seed);
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this
    // visit only, and the game plays on regardless.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let pendingJump = false;
  let pendingDash = false;

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    audio.unlock();
    world.startRun();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Three lives. Reach the window.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.finalScore > best) {
      best = world.finalScore;
      saveBest(best);
    }
    announce(
      world.state === 'escaped'
        ? `Escaped! Score ${world.finalScore}. Best ${best}.`
        : `Caught. Score ${world.finalScore}. Best ${best}.`,
    );
  }

  function playEvents(events) {
    for (const e of events) {
      if (e === 'pickup') audio.pickup();
      else if (e === 'stuffing') audio.stuffing();
      else if (e === 'jump') audio.jump();
      else if (e === 'dash') audio.dash();
      else if (e === 'slash') audio.slash();
      else if (e === 'warn') audio.gobble();
      else if (e === 'hit') audio.hit();
      else if (e === 'escape') audio.escape();
      else if (e === 'caught') audio.caught();
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    // Jump / dash are for the play loop, not for the menus: hold them until
    // the next fixed step instead of dropping them here.
    if (actions & ACTION_JUMP) pendingJump = true;
    if (actions & ACTION_DASH) pendingDash = true;
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_RESTART && (screen === SCREEN_PLAY || screen === SCREEN_PAUSED || screen === SCREEN_OVER)) {
      startGame();
      return;
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) {
      startGame();
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function frame(now) {
    const elapsed = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE) {
      world.step(STEP, 0, false, false);
    } else if (screen === SCREEN_PLAY) {
      accumulator += elapsed;
      let guard = 0;
      while (accumulator >= STEP && guard < 8) {
        const jump = pendingJump;
        const dash = pendingDash;
        pendingJump = false;
        pendingDash = false;
        const events = world.step(STEP, input.direction(), jump, dash);
        playEvents(events);
        accumulator -= STEP;
        guard += 1;
        if (world.state === 'caught' || world.state === 'escaped') {
          endGame();
          break;
        }
      }
      // Any jump/dash pressed between steps still counts on the next one.
    } else if (screen === SCREEN_OVER) {
      world.step(STEP, 0, false, false);
    }
    renderer.draw(world, screen, best);
    requestAnimationFrame(frame);
  }

  announce('Dinner Table Dash. Press Space to run for your life.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
