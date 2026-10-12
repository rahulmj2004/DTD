type DecibelBarsProps = {
  bars?: number;
  className?: string;
};

/** Decorative sound-level bars. Pure CSS, so it costs no client JavaScript. */
export function DecibelBars({ bars = 28, className = "" }: DecibelBarsProps) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => {
        const hot = i >= bars * 0.72;
        return (
          <span
            key={i}
            className={`anim-bar block h-full w-[3px] ${hot ? "bg-racing" : i >= bars * 0.5 ? "bg-fire" : "bg-silver/70"}`}
            style={{
              animationDelay: `${-((i * 137) % 1100)}ms`,
              animationDuration: `${800 + ((i * 53) % 700)}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
