"use client";

import { useEffect, useRef, useState } from "react";
import { SOUND_OFF_KEY } from "@/lib/constants";
import { DUCK_EVENT } from "@/lib/engine-audio";

const SRC = "/audio/soundtrack.mp3";
const VOLUME = 0.45;
const GESTURES = ["pointerdown", "keydown", "touchend"] as const;

/** Fired by the film player so the soundtrack ducks out while the film has sound. */
export const FILM_AUDIO_EVENT = "dtd:film-audio";
export type FilmAudioDetail = { playing: boolean };

const optedOut = () => {
  try {
    return sessionStorage.getItem(SOUND_OFF_KEY) === "1";
  } catch {
    return false;
  }
};

const rememberOptOut = (off: boolean) => {
  try {
    if (off) sessionStorage.setItem(SOUND_OFF_KEY, "1");
    else sessionStorage.removeItem(SOUND_OFF_KEY);
  } catch {
    // Storage unavailable: the choice just lasts for this page view.
  }
};

/**
 * Site soundtrack. Lives in the root layout, so it keeps playing across page
 * navigations. It starts automatically: on load where the browser allows it,
 * otherwise on the visitor's first tap, click or key press (browsers refuse to
 * start sound before any interaction). The button switches it off, and that
 * choice is remembered for the session.
 */
export function SoundToggle() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  /** The visitor wants music (true unless they switched it off). */
  const wanted = useRef(true);
  /** The film is currently playing with sound, so the soundtrack must wait. */
  const ducked = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = new Audio();
    el.loop = true;
    el.volume = VOLUME;
    el.preload = "none";
    el.src = SRC;
    audio.current = el;
    wanted.current = !optedOut();

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    const removeGestures = () => GESTURES.forEach((type) => window.removeEventListener(type, onGesture, true));
    const start = () => {
      if (!wanted.current || ducked.current) return;
      void el.play().then(removeGestures, () => undefined);
    };
    function onGesture(event: Event) {
      // A press on the music button itself is handled by its own click handler.
      if (button.current?.contains(event.target as Node)) return;
      start();
    }

    const onFilm = (event: Event) => {
      ducked.current = (event as CustomEvent<FilmAudioDetail>).detail.playing;
      if (ducked.current) el.pause();
      else start();
    };

    // Go silent for the car's rev so it is heard on its own, then fade back in.
    let duckTimer = 0;
    let fadeFrame = 0;
    const fadeTo = (target: number, ms: number) => {
      cancelAnimationFrame(fadeFrame);
      const from = el.volume;
      const started = performance.now();
      const step = (now: number) => {
        // The frame timestamp can predate `started`, so clamp both ends.
        const t = Math.min(1, Math.max(0, (now - started) / ms));
        el.volume = from + (target - from) * t;
        if (t < 1) fadeFrame = requestAnimationFrame(step);
      };
      fadeFrame = requestAnimationFrame(step);
    };
    const onDuck = (event: Event) => {
      fadeTo(0, 120);
      window.clearTimeout(duckTimer);
      duckTimer = window.setTimeout(() => fadeTo(VOLUME, 700), (event as CustomEvent<number>).detail * 1000);
    };

    GESTURES.forEach((type) => window.addEventListener(type, onGesture, true));
    window.addEventListener(FILM_AUDIO_EVENT, onFilm);
    window.addEventListener(DUCK_EVENT, onDuck);
    start();

    return () => {
      removeGestures();
      window.removeEventListener(FILM_AUDIO_EVENT, onFilm);
      window.removeEventListener(DUCK_EVENT, onDuck);
      window.clearTimeout(duckTimer);
      cancelAnimationFrame(fadeFrame);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.pause();
      audio.current = null;
    };
  }, []);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      wanted.current = true;
      rememberOptOut(false);
      if (!ducked.current) void el.play().catch(() => undefined);
    } else {
      wanted.current = false;
      rememberOptOut(true);
      el.pause();
    }
  };

  return (
    <button
      ref={button}
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Turn music off" : "Turn music on"}
      className={`label-tech fixed bottom-4 right-4 z-40 flex items-center gap-3 border px-4 py-3 text-[0.625rem] backdrop-blur-sm transition-colors sm:bottom-6 sm:right-6 print:hidden ${
        playing
          ? "border-fire bg-fire text-obsidian hover:bg-paper"
          : "border-silver/30 bg-obsidian/85 text-paper hover:border-fire hover:text-fire"
      }`}
    >
      <span className="flex h-3.5 items-end gap-[2px]" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`block w-[2px] bg-current ${playing ? "anim-bar h-full" : "h-1"}`}
            style={playing ? { animationDelay: `${-i * 180}ms`, animationDuration: `${700 + i * 130}ms` } : undefined}
          />
        ))}
      </span>
      <span className="max-sm:sr-only">{playing ? "Music on" : "Play music"}</span>
    </button>
  );
}
