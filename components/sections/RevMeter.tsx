"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SEGMENTS = 32;

type Engine = { ctx: AudioContext; osc: OscillatorNode; sub: OscillatorNode; gain: GainNode };

/**
 * Hold-to-rev toy gauge. It is an illustration, not a measurement: it shows a
 * 0–100% signal, never a decibel figure. Sound is synthesised in the browser,
 * off by default, quiet, and only ever starts from an explicit click.
 */
export function RevMeter() {
  const [level, setLevel] = useState(0);
  const [sound, setSound] = useState(false);
  const holding = useRef(false);
  const value = useRef(0);
  const engine = useRef<Engine | null>(null);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const target = holding.current ? 1 : 0;
      const rate = holding.current ? 1.5 : 2.4;
      const next = value.current + (target - value.current) * Math.min(1, rate * dt * 2);
      if (Math.abs(next - value.current) > 0.0005) {
        value.current = next;
        setLevel(next);
        const e = engine.current;
        if (e) {
          const t = e.ctx.currentTime;
          e.osc.frequency.setTargetAtTime(55 + next * 190, t, 0.05);
          e.sub.frequency.setTargetAtTime(27.5 + next * 95, t, 0.05);
          e.gain.gain.setTargetAtTime(0.015 + next * 0.05, t, 0.05);
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(
    () => () => {
      void engine.current?.ctx.close();
      engine.current = null;
    },
    [],
  );

  const toggleSound = () => {
    if (engine.current) {
      void engine.current.ctx.close();
      engine.current = null;
      setSound(false);
      return;
    }
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = 0.015;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 55;
    const sub = ctx.createOscillator();
    sub.type = "square";
    sub.frequency.value = 27.5;
    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain).connect(ctx.destination);
    osc.start();
    sub.start();
    engine.current = { ctx, osc, sub, gain };
    setSound(true);
  };

  const rev = () => {
    holding.current = true;
  };
  const release = () => {
    holding.current = false;
  };

  const lit = Math.round(level * SEGMENTS);
  const percent = Math.round(level * 100);

  return (
    <div className="border border-silver/15 bg-obsidian/70 p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="label-tech text-[0.625rem] text-silver/60">Rev simulator · Illustration only</p>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={sound}
          className="label-tech flex items-center gap-2 px-2 py-1.5 text-[0.625rem] text-silver/70 transition-colors hover:text-cyan"
        >
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          Sound {sound ? "on" : "off"}
        </button>
      </div>

      <div
        className="mt-5 flex h-16 items-end gap-[3px]"
        role="meter"
        aria-label="Simulated rev signal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const on = i < lit;
          const zone = i >= SEGMENTS * 0.8 ? "bg-racing" : i >= SEGMENTS * 0.55 ? "bg-fire" : "bg-silver";
          return (
            <span
              key={i}
              className={`flex-1 transition-opacity duration-75 ${zone} ${on ? "opacity-100" : "opacity-15"}`}
              style={{ height: `${30 + (i / SEGMENTS) * 70}%` }}
            />
          );
        })}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="display text-5xl text-paper" style={{ fontVariantNumeric: "tabular-nums" }}>
          {String(percent).padStart(2, "0")}
          <span className="ml-1 text-xl text-silver/60">% signal</span>
        </p>
        <button
          type="button"
          onPointerDown={rev}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") rev();
          }}
          onKeyUp={release}
          onBlur={release}
          onContextMenu={(event) => event.preventDefault()}
          className="label-tech touch-none select-none bg-fire px-5 py-4 font-semibold text-obsidian transition-colors hover:bg-paper active:bg-racing active:text-paper"
        >
          Hold to rev
        </button>
      </div>
    </div>
  );
}
