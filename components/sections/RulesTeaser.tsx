import { ArrowRight, TriangleAlert } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { CtaLink } from "@/components/ui/CtaLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RULES } from "@/lib/event";

const KEY_RULES = [4, 6, 7, 11, 14, 20] as const;

export function RulesTeaser() {
  const rules = RULES.filter((rule) => (KEY_RULES as readonly number[]).includes(rule.n));

  return (
    <section id="rules" className="relative scroll-mt-20 border-t border-silver/10 bg-carbon py-24 lg:py-40">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading index="05" label="Rules and regulations">
              Know the
              <br />
              <span className="text-metal">rulebook.</span>
            </SectionHeading>
            <Reveal delay={0.1}>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-silver">
                Twenty-six rules govern DTD. These are six that shape your build — read all of them
                before you register.
              </p>
              <p className="mt-8 flex max-w-md gap-4 border border-racing/50 bg-racing/10 p-5 text-paper">
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-racing" aria-hidden="true" />
                <span>
                  Violation of any rule results in direct disqualification. Vehicles absent at the
                  entry time are disqualified immediately.
                </span>
              </p>
              <CtaLink href="/rules" variant="ghost" className="mt-8">
                Read all 26 rules
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </CtaLink>
            </Reveal>
          </div>

          <ol className="border-t border-silver/15">
            {rules.map((rule, i) => (
              <li key={rule.n} className="border-b border-silver/15">
                <Reveal delay={i * 0.05} y={14} className="grid grid-cols-[3.5rem_1fr] items-baseline gap-2 py-5 sm:grid-cols-[5rem_1fr]">
                  <span className="display text-3xl text-fire sm:text-4xl">
                    {String(rule.n).padStart(2, "0")}
                  </span>
                  <span className="text-lg leading-snug text-paper">{rule.text}</span>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
