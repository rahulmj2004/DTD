"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EVENT } from "@/lib/event";

const EASE = [0.2, 0.7, 0.2, 1] as const;

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

      <p className="display mt-3 text-[clamp(2.25rem,7vw,5.5rem)]" aria-label={EVENT.developer}>
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

      <motion.span
        className="mt-4 block h-[3px] w-full max-w-sm origin-left bg-gradient-to-r from-fire via-racing to-transparent"
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 1.1, delay: 0.5, ease: EASE } },
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
