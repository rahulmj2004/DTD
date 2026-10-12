type SoundWaveProps = {
  className?: string;
  /** Tailwind text colour; the lines use currentColor. */
  tone?: string;
};

const WIDTH = 1200;

/** One waveform, two tiles wide, so sliding it left by half loops seamlessly. */
function wavePath(amplitude: number, cycles: number, swell: number, phase: number) {
  let d = "";
  for (let x = 0; x <= WIDTH * 2; x += 8) {
    const t = (x / WIDTH) * Math.PI * 2;
    const envelope = 0.55 + 0.45 * Math.sin(t * swell + phase);
    const y = 50 + amplitude * envelope * Math.sin(t * cycles + phase);
    d += `${x === 0 ? "M" : "L"}${x} ${y.toFixed(1)}`;
  }
  return d;
}

const LINES = [
  { d: wavePath(34, 9, 2, 0), seconds: 13, opacity: 0.9, width: 1.5 },
  { d: wavePath(24, 14, 3, 1.3), seconds: 19, opacity: 0.45, width: 1 },
  { d: wavePath(16, 22, 1, 2.6), seconds: 9, opacity: 0.25, width: 1 },
] as const;

/** Decorative scrolling sound wave. Pure SVG and CSS, so it costs no client JavaScript. */
export function SoundWave({ className = "", tone = "text-fire" }: SoundWaveProps) {
  return (
    <div
      className={`pointer-events-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] ${tone} ${className}`}
      aria-hidden="true"
    >
      <div className="relative size-full">
        {LINES.map((line, i) => (
          <svg
            key={i}
            viewBox={`0 0 ${WIDTH * 2} 100`}
            preserveAspectRatio="none"
            className={`anim-wave h-full w-[200%] max-w-none ${i === 0 ? "" : "absolute inset-y-0 left-0"}`}
            style={{ animationDuration: `${line.seconds}s`, opacity: line.opacity }}
          >
            <path d={line.d} fill="none" stroke="currentColor" strokeWidth={line.width} vectorEffect="non-scaling-stroke" />
          </svg>
        ))}
      </div>
    </div>
  );
}
