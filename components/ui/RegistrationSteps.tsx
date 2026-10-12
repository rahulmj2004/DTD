import Link from "next/link";
import { Reveal } from "@/components/animations/Reveal";
import { EVENT, RULES } from "@/lib/event";

const STEPS = [
  {
    title: "Read the rulebook",
    text: (
      <>
        All {RULES.length}{" "}
        <Link href="/rules" className="text-paper underline underline-offset-4 hover:text-fire">
          rules and regulations
        </Link>{" "}
        apply. Violation of any rule results in direct disqualification.
      </>
    ),
  },
  {
    title: "Check your car",
    text: (
      <>
        Engine capacity up to {EVENT.maxEngineCc} cc, exhaust at the rear only, and an end can
        fitted. Every vehicle is checked before the competition.
      </>
    ),
  },
  {
    title: "Call a coordinator",
    text: (
      <>
        Book your vehicle with any of the event coordinators before event day. Spot registration
        is not allowed.
      </>
    ),
  },
] as const;

/** The three things to do to get a lot number. Registration itself happens by phone. */
export function RegistrationSteps({ className = "" }: { className?: string }) {
  return (
    <ol className={`grid border-l border-t border-silver/15 md:grid-cols-3 ${className}`}>
      {STEPS.map((step, i) => (
        <li key={step.title} className="border-b border-r border-silver/15">
          <Reveal delay={i * 0.08} className="relative h-full overflow-hidden p-6 sm:p-8">
            <span
              className="display pointer-events-none absolute -right-2 -top-4 text-[7rem] leading-none text-paper/[0.05]"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <p className="label-tech text-fire">Step 0{i + 1}</p>
            <h3 className="display mt-4 text-3xl text-paper sm:text-4xl">{step.title}</h3>
            <p className="mt-4 leading-relaxed text-silver">{step.text}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
