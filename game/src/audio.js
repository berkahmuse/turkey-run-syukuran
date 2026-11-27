// Dinner Table Dash — every sound is synthesized with WebAudio: no audio
// files, nothing fetched. Created lazily on the first user gesture so the
// page never asks for anything before the player presses a key.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') void ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, slideTo) {
    const ac = ensure();
    if (!ac || muted) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
    g.gain.setValueAtTime(gain || 0.12, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(g).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  function noise(dur, gain, lowpass) {
    const ac = ensure();
    if (!ac || muted) return;
    const len = Math.floor(ac.sampleRate * dur);
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass || 1200;
    const g = ac.createGain();
    g.gain.value = gain || 0.15;
    src.connect(filter).connect(g).connect(ac.destination);
    src.start();
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    // Two-note gobble: the turkey's happy cluck.
    gobble() {
      tone(520, 0.09, 'square', 0.07);
      setTimeout(() => tone(660, 0.12, 'square', 0.07), 90);
    },
    pickup() {
      tone(880, 0.08, 'sine', 0.1, 1320);
    },
    stuffing() {
      tone(660, 0.1, 'triangle', 0.12, 990);
      setTimeout(() => tone(990, 0.14, 'triangle', 0.1), 100);
    },
    jump() {
      tone(300, 0.12, 'sine', 0.07, 520);
    },
    dash() {
      noise(0.18, 0.12, 2400);
    },
    // The carving knife whistles down.
    slash() {
      noise(0.22, 0.2, 3200);
    },
    hit() {
      tone(160, 0.25, 'sawtooth', 0.16, 70);
      noise(0.15, 0.14, 700);
    },
    // The window swings open: the escape jingle.
    escape() {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.12), i * 130));
    },
    caught() {
      [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.28, 'triangle', 0.11), i * 160));
    },
  };
}
