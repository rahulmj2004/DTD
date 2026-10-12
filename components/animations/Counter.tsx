"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type CounterProps = {
  to: number;
  duration?: number;
  className?: string;
};

const format = (value: number) => Math.round(value).toLocaleString("en-IN");

/**
 * Counts up to `to` when scrolled into view. The final value is rendered on
 * the server, so it is correct without JavaScript and for screen readers.
 */
export function Counter({ to, duration = 1.6, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (value) => {
        node.textContent = format(value);
      },
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {format(to)}
    </span>
  );
}
