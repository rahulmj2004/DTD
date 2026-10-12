"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TIMELINE } from "@/lib/event";

/**
 * Event-day timeline. GSAP ScrollTrigger owns every animation in this section:
 * the redline scrubs with scroll and each step lights up as it passes.
 * Nothing is pinned, so native scrolling is never interrupted.
 * The section clips horizontally because steps slide in from the right, which
 * would otherwise widen the page on phones (clip, unlike hidden, keeps the
 * sticky heading working).
 */
export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        "[data-redline]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-track]", start: "top 70%", end: "bottom 60%", scrub: 0.6 },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: step, start: "top 78%", toggleActions: "play none none reverse" },
        });
        timeline
          .fromTo(step.querySelector("[data-node]"), { scale: 0.4, backgroundColor: "#111820" }, { scale: 1, backgroundColor: "#FF5A1F", duration: 0.35 })
          .fromTo(step.querySelector("[data-body]"), { opacity: 0.25, x: 28 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 0);
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="competition" className="relative scroll-mt-20 overflow-x-clip border-t border-silver/10 bg-carbon py-24 lg:py-40">
      <div className="bg-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div ref={root} className="relative mx-auto grid max-w-[1600px] gap-16 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading index="02" label="The competition">
            Six stages.
            <br />
            <span className="text-metal">Sixty seconds.</span>
          </SectionHeading>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-silver">
            From the reporting gate to the final reading — this is how event day runs.
          </p>
          <p className="label-tech mt-8 max-w-md border-l-2 border-fire pl-4 text-[0.625rem] leading-relaxed text-silver/70">
            Schedule and participation rules are subject to the official event organizers&rsquo;
            instructions.
          </p>
        </div>

        <div data-track className="relative">
          <div className="absolute bottom-3 left-[11px] top-3 w-px bg-silver/15" aria-hidden="true">
            <div data-redline className="h-full w-full origin-top bg-gradient-to-b from-fire to-racing" />
          </div>

          <ol>
            {TIMELINE.map((step) => (
              <li key={step.n} data-step className="relative pb-14 pl-12 last:pb-0 sm:pl-16">
                <span
                  data-node
                  className="absolute left-0 top-2 block size-[23px] rotate-45 border border-silver/30 bg-fire"
                  aria-hidden="true"
                />
                <div data-body>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="label-tech text-fire">{step.n}</p>
                    <p className="label-tech text-[0.625rem] text-cyan/80">{step.marker}</p>
                  </div>
                  <h3 className="display mt-2 text-4xl text-paper sm:text-6xl">{step.title}</h3>
                  <p className="mt-3 max-w-lg text-lg leading-relaxed text-silver">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
