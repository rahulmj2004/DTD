"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, TriangleAlert, X } from "lucide-react";
import { useMemo, useState } from "react";
import { RULES, RULE_CATEGORIES, type Rule, type RuleCategoryId } from "@/lib/event";

const ALL_OPEN = new Set<RuleCategoryId>(RULE_CATEGORIES.map((category) => category.id));
const DISQUALIFICATION_RULES = RULES.filter((rule) => rule.disqualification);

const pad = (n: number) => String(n).padStart(2, "0");

export function RulesExplorer() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<RuleCategoryId>>(ALL_OPEN);

  const term = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!term) return RULES;
    return RULES.filter(
      (rule) => rule.text.toLowerCase().includes(term) || String(rule.n) === term || pad(rule.n) === term,
    );
  }, [term]);

  const toggle = (id: RuleCategoryId) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="grid gap-12 lg:grid-cols-[22rem_1fr] lg:gap-20">
      {/* ---------- Left rail ---------- */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative">
          <label htmlFor="rule-search" className="sr-only">
            Search the rules
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-silver/50" aria-hidden="true" />
          <input
            id="rule-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search rules — e.g. flame, 2000, final"
            className="w-full border border-silver/20 bg-carbon py-4 pl-12 pr-12 text-base text-paper outline-none transition-colors placeholder:text-silver/40 focus:border-cyan [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center text-silver/60 hover:text-paper"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <p className="label-tech mt-3 text-[0.625rem] text-silver/50" role="status" aria-live="polite">
          {term ? `${matches.length} of ${RULES.length} rules match` : `${RULES.length} rules`}
        </p>

        <div className="mt-8 border border-racing/60 bg-racing/10 p-5">
          <p className="label-tech flex items-center gap-3 text-racing">
            <TriangleAlert className="size-5" aria-hidden="true" />
            Disqualification
          </p>
          <ul className="mt-4 space-y-3">
            {DISQUALIFICATION_RULES.map((rule) => (
              <li key={rule.n} className="grid grid-cols-[2rem_1fr] text-sm leading-snug text-paper">
                <a href={`#rule-${rule.n}`} className="font-mono font-semibold text-racing hover:underline">
                  {pad(rule.n)}
                </a>
                {rule.text}
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Rule sections" className="mt-8 hidden lg:block">
          <ul className="space-y-1 border-l border-silver/15">
            {RULE_CATEGORIES.map((category) => (
              <li key={category.id}>
                <a
                  href={`#rules-${category.id}`}
                  className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-silver/70 transition-colors hover:border-fire hover:text-paper"
                >
                  {category.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* ---------- Rules ---------- */}
      <div>
        {matches.length === 0 && (
          <p className="border border-silver/15 p-8 text-lg text-silver">
            No rule mentions &ldquo;{query.trim()}&rdquo;.{" "}
            <button type="button" onClick={() => setQuery("")} className="text-fire underline underline-offset-4">
              Show all rules
            </button>
          </p>
        )}

        {RULE_CATEGORIES.map((category) => {
          const rules = matches.filter((rule) => rule.category === category.id);
          if (rules.length === 0) return null;
          // While searching, every section with a match is forced open.
          const expanded = term !== "" || open.has(category.id);
          return (
            <section key={category.id} id={`rules-${category.id}`} className="scroll-mt-28 border-t border-silver/15 last:border-b">
              <h2>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`panel-${category.id}`}
                  disabled={term !== ""}
                  onClick={() => toggle(category.id)}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span>
                    <span className="label-tech block text-[0.625rem] text-silver/50">
                      {category.caption} · {rules.length} {rules.length === 1 ? "rule" : "rules"}
                    </span>
                    <span className="display mt-2 block text-3xl text-paper transition-colors group-hover:text-fire sm:text-5xl">
                      {category.title}
                    </span>
                  </span>
                  <ChevronDown
                    className={`size-6 shrink-0 text-silver/60 transition-transform duration-300 ${expanded ? "rotate-180" : ""} ${term ? "opacity-0" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </h2>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    id={`panel-${category.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <ol className="pb-6">
                      {rules.map((rule) => (
                        <RuleItem key={rule.n} rule={rule} />
                      ))}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function RuleItem({ rule }: { rule: Rule }) {
  return (
    <li
      id={`rule-${rule.n}`}
      value={rule.n}
      className={`grid scroll-mt-28 grid-cols-[3.25rem_1fr] items-baseline gap-2 border-t border-silver/10 py-5 target:bg-fire/10 sm:grid-cols-[5rem_1fr] ${
        rule.disqualification ? "border-l-2 border-l-racing bg-racing/[0.07] pl-3 sm:pl-4" : ""
      }`}
    >
      <span className={`display text-3xl sm:text-4xl ${rule.disqualification ? "text-racing" : "text-fire"}`} aria-hidden="true">
        {pad(rule.n)}
      </span>
      <div>
        <span className="sr-only">Rule {rule.n}: </span>
        <span className="text-lg leading-relaxed text-paper">{rule.text}</span>
        {rule.disqualification && (
          <span className="label-tech mt-2 flex items-center gap-2 text-[0.625rem] text-racing">
            <TriangleAlert className="size-4" aria-hidden="true" />
            Disqualification
          </span>
        )}
      </div>
    </li>
  );
}
