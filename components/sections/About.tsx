import { Reveal } from "@/components/animations/Reveal";
import { DecibelBars } from "@/components/animations/DecibelBars";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevMeter } from "@/components/sections/RevMeter";

const SPECS = [
  { label: "Measured", value: "Engine revving only" },
  { label: "Instrument", value: "Decibel meter" },
  { label: "Meter distance", value: "1 metre from exhaust outlet" },
  { label: "Time on the meter", value: "Maximum 1 minute" },
  { label: "Format", value: "Qualifying round → Final" },
  { label: "Engine capacity", value: "Up to 2000 cc" },
] as const;

export function About() {
  return (
    <section id="about" className="relative scroll-mt-20 overflow-hidden py-24 lg:py-40">
      <p
        className="display pointer-events-none absolute -left-4 bottom-0 text-[clamp(10rem,32vw,30rem)] leading-[0.75] text-paper/[0.035]"
        aria-hidden="true"
      >
        dB
      </p>

      <div className="relative mx-auto grid max-w-[1600px] gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:px-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading index="01" label="About the competition">
            Not a race.
            <br />
            <span className="text-ember">A war of sound.</span>
          </SectionHeading>
          <Reveal delay={0.1} className="mt-10 hidden lg:block">
            <DecibelBars className="h-24" bars={44} />
            <p className="label-tech mt-3 text-[0.625rem] text-silver/50">Meter @ 1 m · Revving only</p>
          </Reveal>
        </div>

        <div>
          <Reveal className="max-w-xl space-y-5 text-lg leading-relaxed text-silver">
            <p>
              Destroy The Decibel puts eligible cars on the line with nothing to prove but their
              voice. No lap times, no drag strip — vehicles compete through engine revving, and the
              exhaust note is measured using a decibel meter.
            </p>
            <p>
              Every participant gets a maximum of one minute. The competition runs as a qualifying
              round followed by a final, and readings are taken strictly according to the official
              rules — pops, bangs and flame kits don&rsquo;t count.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="mt-12 grid border-t border-silver/15 sm:grid-cols-2">
              {SPECS.map((spec) => (
                <div key={spec.label} className="border-b border-silver/15 py-4 sm:odd:pr-6 sm:even:border-l sm:even:pl-6">
                  <dt className="label-tech text-[0.625rem] text-silver/50">{spec.label}</dt>
                  <dd className="mt-1.5 font-medium text-paper">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15} className="mt-12">
            <RevMeter />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
