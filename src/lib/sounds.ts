// Sound effects utility using Web Audio API
const audioCtx = () => {
  if (!(window as any).__audioCtx) {
    (window as any).__audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return (window as any).__audioCtx as AudioContext;
};

/** Bright upward piano-like chime for button clicks */
export function playPipeSound() {
  const ctx = audioCtx();
  const freqs = [660, 880]; // E5 → A5 ascending
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    const delay = i * 0.07;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.12);
  });
}

/** Correct answer — cheerful ascending tone */
export function playCorrectSound() {
  const ctx = audioCtx();

  [0, 0.1, 0.2].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    const freqs = [523, 659, 784]; // C5, E5, G5
    osc.frequency.setValueAtTime(freqs[i], ctx.currentTime + delay);

    gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.15);
  });
}

/** Page turn sound — soft paper swish */
export function playPageTurnSound() {
  const ctx = audioCtx();
  // White noise burst shaped to sound like a page flip
  const bufferSize = ctx.sampleRate * 0.25;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 3000;
  bandpass.Q.value = 0.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + 0.25);
}

/** Wrong answer — playful "tadã" buzzer (two descending tones) */
export function playWrongSound() {
  const ctx = audioCtx();

  // First tone — mid "tah"
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(350, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.12);
  gain1.gain.setValueAtTime(0.15, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.15);

  // Second tone — lower "dã" (descending)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(260, ctx.currentTime + 0.15);
  osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.35);
  gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.15);
  gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
  osc2.start(ctx.currentTime + 0.15);
  osc2.stop(ctx.currentTime + 0.4);
}
