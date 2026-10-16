"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { EVENT } from "@/lib/event";
import { SOCIALS } from "@/lib/socials";

const EASE = [0.2, 0.7, 0.2, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

const HEADLINE = [
  { text: "Meet", className: "" },
  { text: "the", className: "" },
  { text: "developers.", className: "text-racing" },
] as const;

/** Letters that rise out of a clipped line, one after another. */
function RisingLetters({ text, delay = 0, step = 0.05 }: { text: string; delay?: number; step?: number }) {
  return text.split("").map((letter, i) => (
    <motion.span
      key={i}
      className="inline-block"
      variants={{
        hidden: { y: "115%", rotate: 8 },
        show: { y: "0%", rotate: 0, transition: { duration: 0.8, delay: delay + i * step, ease: EASE } },
      }}
    >
      {letter === " " ? "\u00A0" : letter}
    </motion.span>
  ));
}

/**
 * The people who built this site. As the section scrolls into view the
 * headline rises in letter by letter, each card lifts up, the portrait pops
 * inside a turning ring, and a redline draws under a name crossed by a sheen.
 */
export function Developers() {
  const reduce = useReducedMotion();
  const initial = reduce ? false : "hidden";

  return (
    <section id="developers" aria-labelledby="developers-title" className="relative scroll-mt-20 overflow-hidden border-b border-silver/10 bg-carbon py-12 lg:py-16">
      <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="absolute -right-40 top-1/2 size-[40rem] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_90_31/0.14),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <motion.div initial={initial} whileInView="show" viewport={VIEWPORT}>
          <motion.p
            className="label-tech flex items-center gap-4 text-silver/70"
            variants={{
              hidden: { opacity: 0, letterSpacing: "0.8em" },
              show: { opacity: 1, letterSpacing: "0.32em", transition: { duration: 0.9, ease: EASE } },
            }}
          >
            <span className="h-px w-10 bg-racing" aria-hidden="true" />
            Behind the site
          </motion.p>
          <h2
            id="developers-title"
            aria-label="Meet the developers."
            className="display mt-4 text-[clamp(1.75rem,4vw,3rem)] text-paper"
          >
            <span className="flex flex-wrap gap-x-[0.25em]" aria-hidden="true">
              {HEADLINE.map((word, i) => (
                <span key={word.text} className={`block overflow-hidden pb-[0.05em] pt-[0.08em] ${word.className}`}>
                  <RisingLetters text={word.text} delay={0.1 + i * 0.18} step={0.035} />
                </span>
              ))}
            </span>
          </h2>
        </motion.div>

        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:gap-5">
          {EVENT.developers.map((developer, i) => {
            const base = i * 0.15;
            return (
              <motion.li
                key={developer.name}
                initial={initial}
                whileInView="show"
                viewport={VIEWPORT}
                variants={{
                  hidden: { opacity: 0, y: 36 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.8, delay: base, ease: EASE } },
                }}
                className="group flex h-full flex-col items-center gap-5 border border-silver/10 bg-obsidian/70 p-5 text-center transition-colors hover:border-fire/60 sm:flex-row sm:p-6 sm:text-left"
              >
                <motion.span
                  className="relative grid size-24 shrink-0 place-items-center lg:size-28"
                  variants={{
                    hidden: { opacity: 0, scale: 0.6 },
                    show: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: base + 0.15, ease: EASE } },
                  }}
                >
                  <svg viewBox="0 0 80 80" className="anim-spin-slow absolute inset-0 text-silver/40" aria-hidden="true">
                    <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
                    <path d="M40 2 A38 38 0 0 1 78 40" fill="none" stroke="#FF5A1F" strokeWidth="2" />
                  </svg>
                  <span className="relative block size-20 overflow-hidden rounded-full lg:size-24">
                    <Image
                      src={developer.photo}
                      alt={`Portrait of ${developer.name}`}
                      fill
                      sizes="(min-width: 1024px) 96px, 80px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </span>
                </motion.span>

                <div className="min-w-0">
                  <motion.p
                    className="label-tech text-fire"
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { duration: 0.6, delay: base + 0.2, ease: EASE } },
                    }}
                  >
                    Developer
                  </motion.p>
                  <h3
                    className="display mt-2 text-[clamp(1.5rem,2.2vw,2rem)]"
                    aria-label={developer.name}
                  >
                    <span className="anim-sheen block overflow-hidden pb-[0.05em] pt-[0.08em]" aria-hidden="true">
                      <RisingLetters text={developer.name} delay={base + 0.25} step={0.06} />
                    </span>
                  </h3>
                  <motion.span
                    className="mt-3 block h-[3px] w-full max-w-[12rem] origin-left bg-gradient-to-r from-fire via-racing to-transparent max-sm:mx-auto max-sm:origin-center"
                    variants={{
                      hidden: { scaleX: 0 },
                      show: { scaleX: 1, transition: { duration: 1.1, delay: base + 0.6, ease: EASE } },
                    }}
                    aria-hidden="true"
                  />
                  <motion.ul
                    className="mt-4 flex flex-wrap justify-center gap-2.5 sm:justify-start"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: base + 0.9, ease: EASE } },
                    }}
                  >
                    {SOCIALS.map((social) => (
                      <li key={social.label}>
                        <a
                          href={developer.links[social.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="label-tech inline-flex items-center gap-2.5 border border-silver/15 px-3.5 py-2.5 text-silver/80 transition-colors hover:border-fire hover:text-fire"
                        >
                          <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                            <path d={social.icon} />
                          </svg>
                          {social.label}
                          <span className="sr-only"> profile of {developer.name} (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
