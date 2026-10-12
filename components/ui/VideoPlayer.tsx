"use client";

import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { FILM_AUDIO_EVENT, type FilmAudioDetail } from "@/components/audio/SoundToggle";

type Phase = "idle" | "playing" | "paused" | "ended";

/** Fired when a player starts, so any other player on the page pauses. */
const PLAYER_START_EVENT = "dtd:player-start";

type VideoPlayerProps = {
  src: string;
  poster: string;
  posterAlt: string;
  /** Used in control labels, e.g. "trailer" → "Play trailer". */
  name: string;
  /** Text under the play button, e.g. "Play trailer · 18 sec · with sound". */
  playLabel: string;
  /** Stage shape. */
  aspect?: "video" | "square";
  /**
   * The file is a landscape film stored sideways in a portrait frame: rotate it
   * back with CSS (container-query units keep it filling the stage).
   */
  sideways?: boolean;
  sizes?: string;
  caption?: ReactNode;
};

/**
 * Click-to-play video with its own controls (native ones would be rotated
 * along with a sideways source). Nothing loads until play is pressed; while it
 * plays with sound the site soundtrack pauses, and other players stop.
 */
export function VideoPlayer({
  src,
  poster,
  posterAlt,
  name,
  playLabel,
  aspect = "video",
  sideways = false,
  sizes = "100vw",
  caption,
}: VideoPlayerProps) {
  const id = useId();
  const video = useRef<HTMLVideoElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused || el.ended) void el.play().catch(() => setPhase("paused"));
    else el.pause();
  };

  const toggleMute = () => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  };

  const onTime = () => {
    const el = video.current;
    if (el && bar.current && el.duration) {
      bar.current.style.transform = `scaleX(${el.currentTime / el.duration})`;
    }
  };

  const onPlay = () => {
    setPhase("playing");
    window.dispatchEvent(new CustomEvent<string>(PLAYER_START_EVENT, { detail: id }));
  };

  // Only one player at a time.
  useEffect(() => {
    const onOtherStart = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) video.current?.pause();
    };
    window.addEventListener(PLAYER_START_EVENT, onOtherStart);
    return () => window.removeEventListener(PLAYER_START_EVENT, onOtherStart);
  }, [id]);

  // Pause the site soundtrack while this video is playing with its own sound.
  const audible = phase === "playing" && !muted;
  useEffect(() => {
    if (!audible) return;
    const notify = (playing: boolean) => {
      window.dispatchEvent(new CustomEvent<FilmAudioDetail>(FILM_AUDIO_EVENT, { detail: { playing } }));
    };
    notify(true);
    return () => notify(false);
  }, [audible]);

  const started = phase !== "idle";
  const Icon = phase === "playing" ? Pause : phase === "ended" ? RotateCcw : Play;
  const action = `${phase === "playing" ? "Pause" : phase === "ended" ? "Replay" : "Play"} ${name}`;

  return (
    <figure>
      <div
        className={`group relative overflow-hidden bg-black [container-type:size] ${
          aspect === "square" ? "aspect-square" : "aspect-video"
        }`}
      >
        <video
          ref={video}
          src={src}
          preload="none"
          playsInline
          onClick={toggle}
          onPlay={onPlay}
          onPause={() => setPhase((current) => (current === "ended" ? current : "paused"))}
          onEnded={() => setPhase("ended")}
          onTimeUpdate={onTime}
          aria-label={`Destroy The Decibel — ${name}`}
          className={
            sideways
              ? "absolute left-1/2 top-1/2 h-[100cqw] w-[100cqh] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-90 cursor-pointer object-cover"
              : "absolute inset-0 size-full cursor-pointer object-cover"
          }
        />

        {!started && (
          <>
            <Image src={poster} alt={posterAlt} fill sizes={sizes} className="object-cover" />
            <div className="absolute inset-0 bg-obsidian/60" />
            <button
              type="button"
              onClick={toggle}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-paper"
            >
              <span className="grid size-20 place-items-center bg-fire text-obsidian transition-transform duration-300 group-hover:scale-110 sm:size-24">
                <Play className="size-8 translate-x-0.5 fill-current sm:size-10" aria-hidden="true" />
              </span>
              <span className="label-tech px-4 text-center text-[0.625rem] sm:text-[0.6875rem]">{playLabel}</span>
            </button>
          </>
        )}

        {started && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10 sm:px-5 sm:pb-4">
            <button
              type="button"
              onClick={toggle}
              aria-label={action}
              className="grid size-11 shrink-0 place-items-center bg-fire text-obsidian transition-colors hover:bg-paper"
            >
              <Icon className="size-5" aria-hidden="true" />
            </button>
            <div className="h-[3px] flex-1 overflow-hidden bg-paper/25" aria-hidden="true">
              <div ref={bar} className="h-full origin-left scale-x-0 bg-fire" />
            </div>
            <button
              type="button"
              onClick={toggleMute}
              aria-pressed={muted}
              aria-label={`${muted ? "Unmute" : "Mute"} ${name}`}
              className="grid size-11 shrink-0 place-items-center text-paper transition-colors hover:text-cyan"
            >
              {muted ? <VolumeX className="size-5" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}
            </button>
          </div>
        )}
      </div>

      {caption && (
        <figcaption className="label-tech mt-3 flex flex-col gap-1 text-[0.625rem] text-silver/60 sm:flex-row sm:justify-between">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
