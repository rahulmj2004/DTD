import type { Metadata } from "next";
import Link from "next/link";
import { CoordinatorList } from "@/components/ui/CoordinatorList";
import { PageHeader } from "@/components/ui/PageHeader";
import { EVENT, RULES, formatInr } from "@/lib/event";

export const metadata: Metadata = {
  title: "Register Your Vehicle",
  description: EVENT.registrationOpen
    ? "Register your car for Destroy The Decibel by contacting the event coordinators. Entry fee ₹1,000. Spot registration is not allowed."
    : "Registration for Destroy The Decibel is now closed. Spot registration is not allowed.",
  alternates: { canonical: "/register" },
};

const NOTICES = [
  "Spot registration is not allowed.",
  "Vehicle eligibility is subject to official inspection and organizer approval.",
  `Cars with engine capacities up to ${EVENT.maxEngineCc} cc are allowed.`,
  "A rear-exit exhaust and an end can are compulsory.",
] as const;

export default function RegisterPage() {
  if (!EVENT.registrationOpen) return <RegistrationClosed />;

  return (
    <>
      <PageHeader
        label="Registration"
        title={
          <>
            Claim your <span className="text-ember">lot.</span>
          </>
        }
      >
        <p>
          Registration for DTD is handled directly by the event coordinators. Call any of them to
          book your vehicle — there is no registration at the venue.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <h2 className="label-tech flex items-center gap-4 text-silver/70">
          <span className="h-px w-10 bg-fire" aria-hidden="true" />
          Contact the coordinators to register
        </h2>
        <CoordinatorList className="mt-8" />

        <div className="mt-16 grid gap-12 lg:grid-cols-[24rem_1fr] lg:gap-20">
          <div className="border border-silver/15 bg-carbon p-6 sm:p-8">
            <p className="label-tech text-silver/60">Registration fee</p>
            <p className="display mt-3 text-7xl text-paper">{formatInr(EVENT.entryFee)}</p>
            <p className="label-tech mt-2 text-[0.625rem] text-silver/50">Per vehicle · {EVENT.dateShort}</p>
          </div>

          <div>
            <h2 className="label-tech text-fire">Before you call</h2>
            <ul className="mt-4 border-t border-silver/15">
              {NOTICES.map((notice) => (
                <li key={notice} className="flex gap-3 border-b border-silver/15 py-3.5 text-lg leading-snug text-silver">
                  <span className="mt-2.5 block size-1.5 shrink-0 rotate-45 bg-fire" aria-hidden="true" />
                  {notice}
                </li>
              ))}
            </ul>
            <p className="mt-8 leading-relaxed text-silver/70">
              Read all 26{" "}
              <Link href="/rules" className="text-paper underline underline-offset-4 hover:text-fire">
                rules and regulations
              </Link>{" "}
              first — violation of any rule results in direct disqualification.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function RegistrationClosed() {
  return (
    <>
      <PageHeader
        label="Registration"
        title={
          <>
            Registration <span className="text-ember">closed.</span>
          </>
        }
      >
        <p>
          All lots for DTD are booked. Registration is no longer being accepted, and there is no
          spot registration at the venue.
        </p>
      </PageHeader>

      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[24rem_1fr] lg:gap-20">
          <div className="border border-silver/15 bg-carbon p-6 sm:p-8">
            <p className="label-tech text-silver/60">Event day</p>
            <p className="display mt-3 text-6xl text-paper">{EVENT.dateShort}</p>
            <p className="label-tech mt-2 text-[0.625rem] text-silver/50">{EVENT.location}</p>
          </div>

          <div>
            <h2 className="label-tech text-fire">Already registered?</h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-silver">
              Report at 7:30 AM on event day for vehicle inspection, and read all {RULES.length}{" "}
              <Link href="/rules" className="text-paper underline underline-offset-4 hover:text-fire">
                rules and regulations
              </Link>{" "}
              before you arrive. Questions go to the event coordinators.
            </p>
            <CoordinatorList className="mt-8" />
          </div>
        </div>
      </div>
    </>
  );
}
