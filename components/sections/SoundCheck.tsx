import { Check, X } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { SoundWave } from "@/components/animations/SoundWave";
import { EVENT, RULES } from "@/lib/event";

/** Rule text is quoted from the official list, never reworded here. */
const rule = (n: number) => RULES.find((item) => item.n === n)!.text;

const FIGURES = [
  { value: "1 m", label: "Meter to exhaust outlet" },
  { value: "60 s", label: "Maximum on the meter" },
  { value: `Top ${EVENT.finalists}`, label: "Qualify for the final" },
] as const;

const COUNTS = [12, 20, 11] as const;
const DOES_NOT_COUNT = [14, 15, 13] as const;

const ENTRY = [
  { label: "Engine capacity", value: `Up to ${EVENT.maxEngineCc} cc`, note: rule(4) },
  { label: "Exhaust", value: "Rear exit only", note: rule(6) },
  { label: "End can", value: "Compulsory", note: rule(7) },
] as const;

const RINGS = [34, 62, 90, 118, 146] as const;

/** How a reading is taken: exhaust, one metre of air, decibel meter. */
export function SoundCheck() {
  return (
    <section
      id="measurement"
      aria-labelledby="measurement-title"
      className="relative scroll-mt-20 overflow-hidden border-t border-silver/10 bg-obsidian py-24 lg:py-40"
    >
      <div
        className="absolute -right-40 top-10 size-[44rem] rounded-full bg-[radial-gradient(closest-side,rgb(240_24_36/0.14),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <p className="label-tech flex items-center gap-4 text-silver/70">
              <span className="h-px w-10 bg-fire" aria-hidden="true" />
              The sound check
            </p>
            <h2 id="measurement-title" className="display mt-6 text-[clamp(2.75rem,8vw,7rem)] text-paper">
              One metre.
              <br />
              <span className="text-metal">One reading.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-md text-lg leading-relaxed text-silver">
              No judges&rsquo; opinions and no crowd vote. A decibel meter sits one metre from your
              exhaust outlet and reads the revving — that number is your score.
            </p>
          </Reveal>
        </div>

        {/* ---------- Diagram ---------- */}
        <Reveal delay={0.1} className="mt-14">
          <figure className="relative overflow-hidden border border-silver/15 bg-carbon">
            <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
            <SoundWave className="absolute inset-x-0 top-6 hidden h-16 opacity-30 sm:block" />

            {/* The labels inside the drawing are too small to read on a phone, so they are repeated here. */}
            <p className="label-tech relative flex justify-between px-4 pt-4 text-[0.5625rem] text-silver/60 sm:hidden" aria-hidden="true">
              <span>Exhaust outlet</span>
              <span>Decibel meter</span>
            </p>
            <svg
              viewBox="0 0 800 300"
              className="relative block h-auto w-full"
              role="img"
              aria-label="Diagram: sound leaves the exhaust outlet and reaches a decibel meter placed one metre away"
            >
              {/* Exhaust outlet */}
              <g>
                <rect x="40" y="118" width="96" height="26" rx="13" fill="#1c2630" stroke="#c9d0d6" strokeOpacity="0.5" />
                <rect x="40" y="156" width="96" height="26" rx="13" fill="#1c2630" stroke="#c9d0d6" strokeOpacity="0.5" />
                <ellipse cx="136" cy="131" rx="6" ry="13" fill="#05070a" stroke="#ff5a1f" strokeWidth="2" />
                <ellipse cx="136" cy="169" rx="6" ry="13" fill="#05070a" stroke="#ff5a1f" strokeWidth="2" />
                <text x="40" y="100" className="fill-silver/60 font-mono max-sm:hidden text-[11px] uppercase tracking-[0.3em]">
                  Exhaust outlet
                </text>
              </g>

              {/* Sound leaving the outlet */}
              <g fill="none" strokeLinecap="round">
                {RINGS.map((r, i) => (
                  <path
                    key={r}
                    d={`M ${150 + r * 0.55} ${150 - r * 0.62} A ${r} ${r} 0 0 1 ${150 + r * 0.55} ${150 + r * 0.62}`}
                    stroke={i > 2 ? "#f01824" : "#ff5a1f"}
                    strokeWidth={3 - i * 0.35}
                    className="anim-ripple"
                    style={{ animationDelay: `${i * 0.22}s` }}
                  />
                ))}
              </g>

              {/* One-metre rule */}
              <g>
                <line x1="142" y1="238" x2="610" y2="238" stroke="#c9d0d6" strokeOpacity="0.55" strokeDasharray="4 6" />
                <line x1="142" y1="228" x2="142" y2="248" stroke="#c9d0d6" strokeOpacity="0.8" />
                <line x1="610" y1="228" x2="610" y2="248" stroke="#c9d0d6" strokeOpacity="0.8" />
                <rect x="296" y="222" width="160" height="32" fill="#111820" />
                <text x="376" y="243" textAnchor="middle" className="fill-paper font-mono text-[13px] uppercase tracking-[0.3em] max-sm:text-[22px]">
                  1 metre
                </text>
              </g>

              {/* Decibel meter */}
              <g>
                <circle cx="610" cy="150" r="13" fill="#05070a" stroke="#c9d0d6" strokeOpacity="0.8" strokeWidth="2" />
                <circle cx="610" cy="150" r="5" fill="#69f5f2" fillOpacity="0.8" />
                <rect x="623" y="143" width="34" height="14" fill="#1c2630" stroke="#c9d0d6" strokeOpacity="0.5" />
                <rect x="657" y="104" width="104" height="92" rx="6" fill="#1c2630" stroke="#c9d0d6" strokeOpacity="0.6" />
                <rect x="669" y="116" width="80" height="44" fill="#05070a" stroke="#69f5f2" strokeOpacity="0.4" />
                <text x="709" y="146" textAnchor="middle" className="fill-cyan font-display text-[26px]">
                  dB
                </text>
                <circle cx="681" cy="178" r="5" fill="#f01824" />
                <rect x="697" y="174" width="52" height="8" rx="4" fill="#c9d0d6" fillOpacity="0.25" />
                <text x="657" y="92" className="fill-silver/60 font-mono max-sm:hidden text-[11px] uppercase tracking-[0.3em]">
                  Decibel meter
                </text>
              </g>
            </svg>

            <figcaption className="relative grid grid-cols-3 border-t border-silver/15 bg-obsidian">
              {FIGURES.map((figure) => (
                <div key={figure.label} className="border-r border-silver/15 px-3 py-5 last:border-r-0 sm:px-8 sm:py-7">
                  <p className="display text-[clamp(1.75rem,6vw,4.5rem)] text-paper">{figure.value}</p>
                  <p className="label-tech mt-2 text-[0.5625rem] text-silver/60 sm:text-[0.625rem]">{figure.label}</p>
                </div>
              ))}
            </figcaption>
          </figure>
        </Reveal>

        {/* ---------- What the meter reads ---------- */}
        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h3 className="label-tech flex items-center gap-3 text-cyan">
              <Check className="size-4" aria-hidden="true" />
              How the reading is taken
            </h3>
            <ul className="mt-5 border-t border-silver/15">
              {COUNTS.map((n) => (
                <RuleLine key={n} n={n} />
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="label-tech flex items-center gap-3 text-racing">
              <X className="size-4" aria-hidden="true" />
              What won&rsquo;t help you
            </h3>
            <ul className="mt-5 border-t border-silver/15">
              {DOES_NOT_COUNT.map((n) => (
                <RuleLine key={n} n={n} />
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ---------- Who can enter ---------- */}
        <Reveal className="mt-16">
          <h3 className="label-tech flex items-center gap-4 text-silver/70">
            <span className="h-px w-10 bg-fire" aria-hidden="true" />
            Who can enter
          </h3>
          <dl className="mt-6 grid border-l border-t border-silver/15 sm:grid-cols-2 xl:grid-cols-4">
            {ENTRY.map((item) => (
              <div key={item.label} className="border-b border-r border-silver/15 p-6 sm:p-8">
                <dt className="label-tech text-[0.625rem] text-silver/50">{item.label}</dt>
                <dd className="mt-4">
                  <span className="display block text-4xl text-paper sm:text-5xl">{item.value}</span>
                  <span className="mt-4 block leading-snug text-silver">{item.note}</span>
                </dd>
              </div>
            ))}
            {/* Placeholder: the organizers have not published any category split. */}
            <div className="border-b border-r border-dashed border-silver/25 bg-carbon/60 p-6 sm:p-8">
              <dt className="label-tech text-[0.625rem] text-silver/50">Participant categories</dt>
              <dd className="mt-4">
                <span className="display block text-4xl text-silver/50 sm:text-5xl">Not announced</span>
                <span className="mt-4 block leading-snug text-silver/80">
                  No categories have been published yet. Any class split will be confirmed by the
                  organizers.
                </span>
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function RuleLine({ n }: { n: number }) {
  return (
    <li className="grid grid-cols-[3.5rem_1fr] items-baseline gap-2 border-b border-silver/15 py-5 sm:grid-cols-[5rem_1fr]">
      <span className="display text-3xl text-fire sm:text-4xl">
        <span className="sr-only">Rule </span>
        {String(n).padStart(2, "0")}
      </span>
      <span className="text-lg leading-snug text-paper">{rule(n)}</span>
    </li>
  );
}
