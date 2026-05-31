// Web Audio API sound synthesizer — no files needed
// Falls back silently if AudioContext not available

let _ctx = null;
function getCtx() {
  if (!_ctx && typeof window !== 'undefined') {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {}
  }
  return _ctx;
}

function resume() {
  const ctx = getCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(freq, type, startTime, duration, vol = 0.25) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

const SOUNDS = {
  correct() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    tone(523, 'sine', t,       0.12, 0.3);  // C5
    tone(659, 'sine', t + 0.07, 0.12, 0.3); // E5
    tone(784, 'sine', t + 0.14, 0.18, 0.28); // G5
  },
  wrong() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    tone(250, 'sawtooth', t,       0.08, 0.18);
    tone(220, 'sawtooth', t + 0.09, 0.08, 0.18);
    tone(196, 'sawtooth', t + 0.18, 0.12, 0.15);
  },
  mastery() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', t + i * 0.1, 0.22, 0.28));
  },
  'streak-3'() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    [600, 750, 900].forEach((f, i) => tone(f, 'sine', t + i * 0.08, 0.1, 0.22));
  },
  'streak-5'() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    [600, 750, 900, 1050, 1200].forEach((f, i) => tone(f, 'sine', t + i * 0.07, 0.1, 0.22));
  },
  'streak-10'() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      tone(f, 'sine', t + i * 0.06, 0.15, 0.3);
      tone(f * 1.5, 'sine', t + i * 0.06, 0.15, 0.15);
    });
  },
  'level-up'() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    [261, 329, 392, 523, 659, 784, 1047].forEach((f, i) =>
      tone(f, 'sine', t + i * 0.07, 0.18, 0.28));
  },
  summit() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    const chord = [523, 659, 784, 1047];
    chord.forEach((f) => tone(f, 'sine', t, 0.6, 0.22));
    chord.forEach((f) => tone(f, 'sine', t + 0.7, 0.8, 0.2));
    tone(2093, 'sine', t + 1.1, 0.5, 0.18);
  },
  achievement() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    [784, 988, 1047, 1319].forEach((f, i) => tone(f, 'sine', t + i * 0.09, 0.15, 0.25));
  },
  'daily-login'() {
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime;
    tone(440, 'sine', t, 0.1, 0.22);
    tone(550, 'sine', t + 0.12, 0.1, 0.22);
    tone(660, 'sine', t + 0.24, 0.18, 0.25);
  },
  click() {
    const ctx = getCtx(); if (!ctx) return;
    tone(800, 'sine', ctx.currentTime, 0.04, 0.12);
  },
};

export const SoundService = {
  muted: localStorage.getItem('summit_mute') === '1',

  play(name) {
    if (this.muted) return;
    resume();
    const fn = SOUNDS[name];
    if (fn) fn();
  },

  setMuted(v) {
    this.muted = v;
    localStorage.setItem('summit_mute', v ? '1' : '0');
  },

  toggle() {
    this.setMuted(!this.muted);
    return this.muted;
  },
};

export default SoundService;
