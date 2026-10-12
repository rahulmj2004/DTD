"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQS } from "@/lib/event";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-20 border-t border-silver/10 py-24 lg:py-40">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading index="06" label="FAQ">
            Before you
            <br />
            <span className="text-ember">fire it up.</span>
          </SectionHeading>
        </div>

        <ul className="border-t border-silver/15">
          {FAQS.map((item, i) => {
            const expanded = open === i;
            return (
              <li key={item.q} className="border-b border-silver/15">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={expanded}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="group flex w-full items-center gap-5 py-6 text-left"
                  >
                    <span className="label-tech w-7 shrink-0 text-fire">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`flex-1 text-xl font-medium transition-colors sm:text-2xl ${expanded ? "text-paper" : "text-silver group-hover:text-paper"}`}>
                      {item.q}
                    </span>
                    <Plus
                      className={`size-5 shrink-0 transition-transform duration-300 ${expanded ? "rotate-45 text-fire" : "text-silver/60"}`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 pl-12 text-lg leading-relaxed text-silver">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
