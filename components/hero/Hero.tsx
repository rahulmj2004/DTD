"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { DecibelBars } from "@/components/animations/DecibelBars";
import { SoundWave } from "@/components/animations/SoundWave";
import { CtaLink } from "@/components/ui/CtaLink";
import { EVENT, formatInr } from "@/lib/event";
import { useIgnited } from "@/lib/ignition";

const LINES = ["Destroy", "The Decibel"] as const;
const EASE = [0.2, 0.7, 0.2, 1] as const;

const FACTS = [
  { label: "Date", value: EVENT.dateLabel },
  { label: "Prize pool", value: formatInr(EVENT.prizePool) },
  { label: "Registration fee", value: formatInr(EVENT.entryFee) },
  { label: "Location", value: EVENT.location },
] as const;

const DAY_MS = 86_400_000;
const EVENT_START = Date.parse(`${EVENT.dateIso}T00:00:00+05:30`);
const noSubscription = () => () => {};

/** Whole days until event day in the visitor's clock; null on the server and once the day has passed. */
function daysToGo() {
  const days = Math.ceil((EVENT_START - Date.now()) / DAY_MS);
  return days >= 0 ? days : null;
}

function countdownLabel(days: number) {
  if (days === 0) return "Event day";
  if (days === 1) return "Tomorrow";
  return `${String(days).padStart(2, "0")} days to go`;
}

export function Hero() {
  const ignited = useIgnited();
  const days = useSyncExternalStore(noSubscription, daysToGo, () => null);
  const [filmPlaying, setFilmPlaying] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Reduced motion: hold on the poster frame instead of playing the loop.
  useEffect(() => {
    if (reduce) video.current?.pause();
  }, [reduce]);

  // Scroll parallax: the film drifts down slower than the page.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scrollY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  // Pointer parallax (fine pointers only, so touch scrolling is untouched).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 50, damping: 18 });
  const sy = useSpring(py, { stiffness: 50, damping: 18 });

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set(((event.clientX - rect.left) / rect.width - 0.5) * -22);
    py.set(((event.clientY - rect.top) / rect.height - 0.5) * -12);
  };

  // Reduced motion: no loader and no entrance choreography — content is simply there.
  const state = ignited || reduce ? "show" : "hidden";
  const initial = reduce ? false : "hidden";

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative isolate flex min-h-[min(100svh,75rem)] flex-col overflow-hidden bg-obsidian"
      aria-label="Destroy The Decibel — The Battle of Exhausts"
    >
      {/* ---------- Background film ---------- */}
      <motion.div
        className="relative order-2 -z-10 -mt-4 aspect-video w-full overflow-hidden md:absolute md:inset-0 md:mt-0 md:aspect-auto"
        style={reduce ? undefined : { y: scrollY }}
        aria-hidden="true"
      >
        <motion.div className="absolute -inset-1 md:-inset-6 [container-type:size]" style={{ x: sx, y: sy }}>
          {/* Upright still: what shows before the film starts, and all that shows with reduced motion. */}
          <Image
            src="/video/hero-crowd-poster.jpg"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className={`object-cover brightness-[0.62] saturate-[0.8] ${ignited ? "anim-hero-zoom" : ""}`}
          />
          {/* The clip is a landscape shot stored sideways, so it is rotated back
              here; container units keep it covering the stage. Always muted.
              It has no poster of its own (that would be rotated too) and fades
              in over the still once it is actually playing. timeupdate keeps
              firing, so playback that began before hydration is still caught. */}
          <video
            ref={video}
            src="/video/hero-crowd.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            onTimeUpdate={() => setFilmPlaying(true)}
            className={`absolute left-1/2 top-1/2 h-[100cqw] w-[100cqh] max-w-none -translate-x-1/2 -translate-y-1/2 -rotate-90 object-cover brightness-[0.62] saturate-[0.8] transition-opacity duration-1000 ${filmPlaying && !reduce ? "opacity-100" : "opacity-0"} ${ignited ? "anim-hero-zoom" : ""}`}
          />
        </motion.div>

        {/* Blend the film into the page and keep the type readable */}
        <div className="absolute inset-0 bg-obsidian/25 md:bg-obsidian/40" />
        <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-obsidian via-obsidian/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-obsidian via-obsidian/85 to-transparent md:h-[50%]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(5_7_10/0.8)_100%)]" />
      </motion.div>

      {/* Technical overlays */}
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-[38%] -z-10 h-px overflow-hidden" aria-hidden="true">
        <div className="anim-streak h-px w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent" />
      </div>

      {/* Sound wave running under the headline (desktop: the phone layout stacks the film there) */}
      <SoundWave className="absolute inset-x-0 top-[52%] -z-10 hidden h-28 opacity-60 md:block" />

      {/* ---------- Headline ---------- */}
      <div className="order-1 mx-auto w-full max-w-[1600px] px-5 pt-24 sm:px-8 md:pt-28 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <motion.p
            className="label-tech text-[0.5625rem] text-silver/80 sm:text-[0.6875rem]"
            initial={initial}
            animate={state}
            variants={{
              hidden: { opacity: 0, letterSpacing: "0.6em" },
              show: { opacity: 1, letterSpacing: "0.32em", transition: { duration: 1.2, ease: EASE } },
            }}
          >
            {EVENT.department}
          </motion.p>
          {days !== null && (
            <motion.p
              className="label-tech flex items-center gap-3 border border-racing/50 bg-obsidian/60 px-3 py-2 text-[0.5625rem] text-paper sm:text-[0.6875rem]"
              initial={initial}
              animate={state}
              variants={{
                hidden: { opacity: 0, x: 16 },
                show: { opacity: 1, x: 0, transition: { duration: 0.8, delay: 0.9, ease: EASE } },
              }}
            >
              <span className="relative grid size-2 place-items-center" aria-hidden="true">
                <span className="absolute inset-0 animate-ping rounded-full bg-racing motion-reduce:hidden" />
                <span className="relative block size-2 rounded-full bg-racing" />
              </span>
              {countdownLabel(days)}
              <span className="text-silver/60">· {EVENT.dateShort}</span>
            </motion.p>
          )}
        </div>

        <h1
          className="display mt-5 text-[clamp(3.25rem,19vw,7rem)] text-paper md:text-[clamp(5rem,10.5vw,12.5rem)]"
          aria-label="Destroy The Decibel"
        >
          {LINES.map((line, lineIndex) => (
            <span key={line} className="block overflow-hidden pb-[0.04em] pt-[0.08em]" aria-hidden="true">
              {line.split("").map((char, i) => {
                const delay = 0.15 + (lineIndex * LINES[0].length + i) * 0.035;
                return (
                  <motion.span
                    key={i}
                    className={`inline-block ${lineIndex === 1 ? "text-metal" : ""}`}
                    initial={initial}
                    animate={state}
                    variants={{
                      hidden: { y: "110%" },
                      show: { y: "0%", transition: { duration: 0.9, delay, ease: EASE } },
                    }}
                  >
                    {char === " " ? " " : char}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>

      </div>

      {/* ---------- Lower deck ---------- */}
      <motion.div
        className="order-3 mx-auto w-full max-w-[1600px] px-5 pb-8 pt-6 sm:px-8 md:mt-auto md:pt-10 lg:px-12"
        initial={initial}
        animate={state}
        variants={{
          hidden: { opacity: 0, y: 24 },
          show: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 1.1, ease: EASE } },
        }}
      >
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.5em] text-fire sm:text-sm">{EVENT.tagline}</p>
            <p className="mt-3 max-w-md text-lg font-medium uppercase leading-snug tracking-wide text-paper sm:text-xl">
              One minute. One engine.{" "}
              <span className="text-silver/70">One chance to own the sound.</span>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <CtaLink href="/register" sweep>
                Register your vehicle
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </CtaLink>
              <CtaLink href="/rules" variant="ghost">
                Explore the rules
              </CtaLink>
            </div>
          </div>

          <div className="flex items-end gap-6">
            <div className="hidden xl:block">
              <DecibelBars className="h-14" bars={22} />
              <p className="label-tech mt-2 text-[0.5625rem] text-silver/50">Sound level</p>
            </div>
            <dl className="grid w-full grid-cols-2 border-l border-t border-silver/15 bg-obsidian/60 lg:w-[30rem]">
              {FACTS.map((fact) => (
                <div key={fact.label} className="border-b border-r border-silver/15 px-4 py-3">
                  <dt className="label-tech text-[0.5625rem] text-silver/60">{fact.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-paper sm:text-base">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <a
          href="#machine"
          className="label-tech mt-6 hidden w-fit items-center gap-3 md:flex text-[0.5625rem] text-silver/60 transition-colors hover:text-paper"
        >
          <span className="relative block h-8 w-px overflow-hidden bg-silver/20" aria-hidden="true">
            <span className="anim-scroll-cue absolute inset-x-0 top-0 h-3 bg-fire" />
          </span>
          Scroll
        </a>
      </motion.div>
    </section>
  );
}
