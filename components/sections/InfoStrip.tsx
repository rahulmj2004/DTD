import { Counter } from "@/components/animations/Counter";
import { Reveal } from "@/components/animations/Reveal";
import { EVENT } from "@/lib/event";

const TICKER = `${EVENT.name} · ${EVENT.tagline} · ${EVENT.dateShort} · ${EVENT.location} · `;

export function InfoStrip() {
  return (
    <section id="event" aria-label="Event at a glance" className="relative border-y border-silver/10 bg-carbon">
      <dl className="mx-auto grid max-w-[1600px] grid-cols-2 lg:grid-cols-4">
        <Stat label="Total prize pool" index="A1">
          ₹<Counter to={EVENT.prizePool} />
        </Stat>
        <Stat label="Entry fee" index="A2" delay={0.08}>
          ₹<Counter to={EVENT.entryFee} duration={1.2} />
        </Stat>
        <Stat label="Event date" index="A3" delay={0.16}>
          17 <span className="text-fire">Oct</span> 2026
        </Stat>
        <Stat label="Maximum participation time" index="A4" delay={0.24}>
          1 <span className="text-[0.55em] text-silver">Minute</span>
        </Stat>
      </dl>

      <div className="overflow-hidden border-t border-silver/10 py-3" aria-hidden="true">
        <div className="anim-marquee label-tech flex w-max whitespace-nowrap text-[0.625rem] text-silver/40">
          <span className="pr-2">{TICKER.repeat(4)}</span>
          <span className="pr-2">{TICKER.repeat(4)}</span>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  index,
  delay = 0,
  children,
}: {
  label: string;
  index: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-r border-silver/10 px-5 py-8 last:border-r-0 even:border-r-0 sm:px-8 lg:border-b-0 lg:py-12 lg:even:border-r lg:last:border-r-0">
      <Reveal delay={delay} y={16} className="flex flex-col-reverse">
        <dt className="label-tech mt-3 flex items-start gap-3 text-[0.625rem] text-silver/60">
          <span className="text-fire/80">{index}</span>
          {label}
        </dt>
        <dd className="display text-[clamp(2.25rem,6.5vw,5.5rem)] text-paper">{children}</dd>
      </Reveal>
    </div>
  );
}
