"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { EVENT } from "@/lib/event";

const EASE = [0.2, 0.7, 0.2, 1] as const;

const SOCIALS = [
  {
    label: "LinkedIn",
    href: EVENT.developerLinks.linkedin,
    icon: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  },
  {
    label: "Instagram",
    href: EVENT.developerLinks.instagram,
    icon: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.71 3.71 0 0 1-1.38-.9 3.71 3.71 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88Z",
  },
] as const;

/**
 * Footer signature: the name rises in letter by letter when it scrolls into
 * view, a redline draws under it, and a light sweep keeps crossing the letters.
 */
export function DeveloperCredit() {
  const reduce = useReducedMotion();
  const letters = EVENT.developer.split("");

  return (
    <motion.div
      className="mt-14 border-t border-silver/10 pt-10 max-sm:pb-14"
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
    >
      <motion.p
        className="label-tech text-fire"
        variants={{
          hidden: { opacity: 0, letterSpacing: "0.8em" },
          show: { opacity: 1, letterSpacing: "0.32em", transition: { duration: 0.9, ease: EASE } },
        }}
      >
        Developed by
      </motion.p>

      <div className="mt-3 flex items-center gap-4 sm:gap-6">
        <motion.span
          className="relative block size-14 shrink-0 overflow-hidden rounded-full ring-2 ring-fire/70 ring-offset-2 ring-offset-obsidian sm:size-20 lg:size-24"
          variants={{
            hidden: { opacity: 0, scale: 0.6 },
            show: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.1, ease: EASE } },
          }}
        >
          <Image
            src={EVENT.developerPhoto}
            alt={`Portrait of ${EVENT.developer}`}
            fill
            sizes="96px"
            className="object-cover"
          />
        </motion.span>

        <p className="display text-[clamp(2.25rem,7vw,5.5rem)]" aria-label={EVENT.developer}>
          <span className="anim-sheen block overflow-hidden pb-[0.05em] pt-[0.08em]" aria-hidden="true">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { y: "115%", rotate: 8 },
                  show: { y: "0%", rotate: 0, transition: { duration: 0.8, delay: 0.15 + i * 0.06, ease: EASE } },
                }}
              >
                {letter === " " ? " " : letter}
              </motion.span>
            ))}
          </span>
        </p>
      </div>

      <motion.span
        className="mt-4 block h-[3px] w-full max-w-sm origin-left bg-gradient-to-r from-fire via-racing to-transparent"
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 1.1, delay: 0.5, ease: EASE } },
        }}
        aria-hidden="true"
      />

      <motion.ul
        className="mt-6 flex flex-wrap gap-3"
        variants={{
          hidden: { opacity: 0, y: 12 },
          show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.9, ease: EASE } },
        }}
      >
        {SOCIALS.map((social) => (
          <li key={social.label}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="label-tech inline-flex items-center gap-2.5 border border-silver/15 px-4 py-3 text-silver/80 transition-colors hover:border-fire hover:text-fire"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                <path d={social.icon} />
              </svg>
              {social.label}
              <span className="sr-only"> profile of {EVENT.developer} (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
