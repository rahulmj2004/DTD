import type { Metadata } from "next";
import { RulesExplorer } from "@/components/rules/RulesExplorer";
import { CtaLink } from "@/components/ui/CtaLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { RULES } from "@/lib/event";

export const metadata: Metadata = {
  title: "Rules and Regulations",
  description:
    "All 26 official rules of Destroy The Decibel: vehicle eligibility, reporting times, decibel measurement, rounds and disqualification.",
  alternates: { canonical: "/rules" },
};

export default function RulesPage() {
  return (
    <>
      <PageHeader
        label="Rules and regulations"
        title={
          <>
            The <span className="text-metal">rulebook.</span>
          </>
        }
      >
        <p>
          {RULES.length} rules, exactly as issued by the organizers. Read every one before you
          register — violation of any rule results in direct disqualification.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <RulesExplorer />

        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-silver/15 pt-10 sm:flex-row sm:items-center">
          <p className="max-w-xl text-silver">
            All decisions taken by the event authority are final. Questions about eligibility go to
            the event coordinators.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CtaLink href="/#contact" variant="ghost">
              Contact coordinators
            </CtaLink>
            <CtaLink href="/register">Register your vehicle</CtaLink>
          </div>
        </div>
      </div>
    </>
  );
}
