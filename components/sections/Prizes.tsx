import { Counter } from "@/components/animations/Counter";
import { Reveal } from "@/components/animations/Reveal";
import { CtaLink } from "@/components/ui/CtaLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EVENT } from "@/lib/event";

export function Prizes() {
  return (
    <section id="prizes" className="relative scroll-mt-20 overflow-hidden border-t border-silver/10 py-24 lg:py-40">
      <div
        className="absolute left-1/2 top-1/2 h-[36rem] w-[min(80rem,130%)] -translate-x-1/2 -translate-y-1/3 rounded-[100%] bg-[radial-gradient(closest-side,rgb(255_90_31/0.22),transparent)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <SectionHeading index="04" label="Prize pool">
          Forty thousand
          <br />
          reasons <span className="text-ember">to be loud.</span>
        </SectionHeading>

        <Reveal delay={0.1} className="mt-10 lg:mt-4">
          <p
            className="display text-metal text-center text-[clamp(7rem,34vw,34rem)] leading-[0.8] drop-shadow-[0_0_60px_rgb(255_90_31/0.35)]"
            aria-hidden="true"
          >
            ₹40K
          </p>
        </Reveal>

        <div className="mt-10 grid gap-10 border-t border-silver/15 pt-8 lg:grid-cols-[auto_1fr_auto] lg:items-end">
          <div>
            <p className="label-tech text-silver/60">Total prize pool</p>
            <p className="display mt-2 text-6xl text-paper sm:text-7xl">
              ₹<Counter to={EVENT.prizePool} duration={2} />
            </p>
          </div>
          <div className="max-w-xl space-y-3 text-silver lg:justify-self-center">
            <p>
              The exact allocation of the prize pool will be announced by the organizers.
            </p>
            <p className="text-sm text-silver/70">
              In the final round, if two vehicles record the same decibel reading, the prize will
              be split equally between them.
            </p>
          </div>
          <CtaLink href="/register">Claim your lot</CtaLink>
        </div>
      </div>
    </section>
  );
}
