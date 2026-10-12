/**
 * Synthesised exhaust for the 3D car (Web Audio, no audio files): three
 * throttle blips, a long pull, then pops and bangs on the overrun.
 * It is independent of the music switch: the car is heard whether the
 * soundtrack is on or off, and the soundtrack goes silent while it plays.
 * Browsers only allow sound after an interaction, so a call made before the
 * first tap is silent. The returned plan always
 * describes the timing, so the flames can follow it with or without audio.
 */

/** Fired when a rev starts so the soundtrack can step aside. Detail: seconds. */
export const DUCK_EVENT = "dtd:duck";

export type RevPlan = {
  /** Total length in seconds. */
  duration: number;
  /** Throttle-open windows, [start, end, strength 0–1], in seconds. */
  bursts: [start: number, end: number, strength: number][];
  /** Backfire times in seconds. */
  pops: number[];
};

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume().catch(() => undefined);
  return context.state === "running" || navigator.userActivation?.hasBeenActive ? context : null;
}

function makeDrive(ctx: AudioContext, amount: number): WaveShaperNode {
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * amount);
  }
  const shaper = ctx.createWaveShaper();
  shaper.curve = curve;
  shaper.oversample = "2x";
  return shaper;
}

function makeNoise(ctx: AudioContext, seconds: number): AudioBufferSourceNode {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

function makePlan(): RevPlan {
  const pops: number[] = [];
  let t = 2.42;
  while (t < 3.5) {
    pops.push(t);
    t += 0.07 + Math.random() * 0.22;
  }
  return {
    duration: 3.9,
    bursts: [
      [0.05, 0.36, 0.55],
      [0.56, 0.9, 0.7],
      [1.12, 2.3, 1],
    ],
    pops,
  };
}

/** Engine pitch (firing frequency, Hz) and loudness over the rev, as [time, hz, gain]. */
const CURVE: [number, number, number][] = [
  [0, 46, 0.16],
  [0.05, 46, 0.16],
  [0.3, 175, 0.55],
  [0.52, 62, 0.2],
  [0.56, 62, 0.2],
  [0.82, 210, 0.68],
  [1.08, 70, 0.22],
  [1.12, 70, 0.22],
  [1.55, 265, 0.95],
  [2.25, 285, 1],
  [2.45, 190, 0.5],
  [3.5, 52, 0.2],
  [3.9, 44, 0.0001],
];

/** Plays the rev (if sound is allowed) and returns its timing. */
export function playRev(): RevPlan {
  const plan = makePlan();
  const ctx = getContext();
  if (!ctx) return plan;

  window.dispatchEvent(new CustomEvent<number>(DUCK_EVENT, { detail: plan.duration }));
  const t0 = ctx.currentTime + 0.03;
  const end = t0 + plan.duration;

  // Master: glue everything and add a short slap so it sounds like it is in a space.
  const master = ctx.createGain();
  master.gain.value = 0.62;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -16;
  compressor.ratio.value = 7;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.12;
  const delay = ctx.createDelay(0.5);
  delay.delayTime.value = 0.085;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.22;
  const wet = ctx.createGain();
  wet.gain.value = 0.18;
  // Trim after the compressor so peaks stay clear of clipping.
  const output = ctx.createGain();
  output.gain.value = 0.72;
  master.connect(compressor).connect(output).connect(ctx.destination);
  master.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(compressor);

  // --- Engine voice -------------------------------------------------------
  const saw = ctx.createOscillator();
  saw.type = "sawtooth";
  const sub = ctx.createOscillator();
  sub.type = "square";
  const upper = ctx.createOscillator();
  upper.type = "sawtooth";
  // Half-order modulation: the uneven pulse that makes it sound like cylinders firing.
  const lump = ctx.createOscillator();
  lump.type = "sine";
  const lumpDepth = ctx.createGain();
  lumpDepth.gain.value = 0.4;

  const mix = ctx.createGain();
  mix.gain.value = 0.6;
  lump.connect(lumpDepth).connect(mix.gain);
  const upperLevel = ctx.createGain();
  upperLevel.gain.value = 0.35;
  saw.connect(mix);
  sub.connect(mix);
  upper.connect(upperLevel).connect(mix);

  const drive = makeDrive(ctx, 7);
  const body = ctx.createBiquadFilter();
  body.type = "lowpass";
  body.Q.value = 1.1;
  // Exhaust-pipe resonances.
  const boom = ctx.createBiquadFilter();
  boom.type = "peaking";
  boom.frequency.value = 210;
  boom.Q.value = 1.6;
  boom.gain.value = 9;
  const rasp = ctx.createBiquadFilter();
  rasp.type = "peaking";
  rasp.frequency.value = 820;
  rasp.Q.value = 1.3;
  rasp.gain.value = 7;
  const voice = ctx.createGain();
  mix.connect(drive).connect(body).connect(boom).connect(rasp).connect(voice).connect(master);

  // Gas rush through the pipe, louder with the throttle.
  const hiss = makeNoise(ctx, plan.duration);
  const hissBand = ctx.createBiquadFilter();
  hissBand.type = "bandpass";
  hissBand.frequency.value = 1400;
  hissBand.Q.value = 0.5;
  const hissLevel = ctx.createGain();
  hiss.connect(hissBand).connect(hissLevel).connect(master);

  CURVE.forEach(([time, hz, gain], i) => {
    const at = t0 + time;
    const ramp = (param: AudioParam, value: number) =>
      i === 0 ? param.setValueAtTime(value, at) : param.exponentialRampToValueAtTime(value, at);
    ramp(saw.frequency, hz);
    ramp(sub.frequency, hz / 2);
    ramp(upper.frequency, hz * 2.01);
    ramp(lump.frequency, hz / 2);
    ramp(body.frequency, 420 + hz * 11);
    ramp(voice.gain, gain * 0.55);
    ramp(hissLevel.gain, Math.max(0.0001, gain * gain * 0.1));
  });

  [saw, sub, upper, lump].forEach((osc) => {
    osc.start(t0);
    osc.stop(end);
  });
  hiss.start(t0);

  // --- Pops and bangs on the overrun -------------------------------------
  plan.pops.forEach((offset) => {
    const at = t0 + offset;
    const loud = 0.55 + Math.random() * 0.45;

    const crack = makeNoise(ctx, 0.2);
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 1500 + Math.random() * 1600;
    tone.Q.value = 2.5;
    const crackLevel = ctx.createGain();
    crackLevel.gain.setValueAtTime(loud, at);
    crackLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.11 + Math.random() * 0.06);
    crack.connect(tone).connect(crackLevel).connect(master);
    crack.start(at);

    const thump = ctx.createOscillator();
    thump.type = "sine";
    thump.frequency.setValueAtTime(130, at);
    thump.frequency.exponentialRampToValueAtTime(42, at + 0.14);
    const thumpLevel = ctx.createGain();
    thumpLevel.gain.setValueAtTime(loud * 0.9, at);
    thumpLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
    thump.connect(thumpLevel).connect(master);
    thump.start(at);
    thump.stop(at + 0.2);
  });

  return plan;
}
