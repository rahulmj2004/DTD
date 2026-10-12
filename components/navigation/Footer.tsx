import Link from "next/link";
import { DeveloperCredit } from "@/components/navigation/DeveloperCredit";
import { Emblem } from "@/components/ui/Emblem";
import { CseLogo, Logo } from "@/components/ui/Logo";
import { EVENT } from "@/lib/event";

const FOOTER_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Sound check", href: "/#measurement" },
  { label: "Competition", href: "/#competition" },
  { label: "Guest", href: "/#guest" },
  { label: "Builds", href: "/#gallery" },
  { label: "Prizes", href: "/#prizes" },
  { label: "Rules", href: "/rules" },
  { label: "Registration", href: "/register" },
  { label: "FAQ", href: "/#faq" },
  { label: "Venue", href: "/#venue" },
  { label: "Contact", href: "/#contact" },
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-silver/10 bg-obsidian">
      <div className="bg-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="absolute -bottom-40 left-1/2 h-80 w-[min(90rem,140%)] -translate-x-1/2 rounded-[100%] bg-racing/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1600px] px-5 pb-10 pt-20 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-5">
              <div className="relative grid size-20 shrink-0 place-items-center">
                <svg viewBox="0 0 80 80" className="anim-spin-slow absolute inset-0 text-silver/40" aria-hidden="true">
                  <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
                  <path d="M40 2 A38 38 0 0 1 78 40" fill="none" stroke="#F01824" strokeWidth="2" />
                </svg>
                <Emblem className="w-11 text-paper" />
              </div>
              <div>
                <Logo sizes="260px" className="w-48 sm:w-64" />
                <p className="label-tech mt-2 text-fire">The Battle of Exhausts</p>
              </div>
            </div>
          </div>

          <address className="text-sm not-italic leading-relaxed text-silver/80">
            <p className="label-tech mb-4 text-silver/50">Organized by</p>
            <CseLogo sizes="120px" className="mb-4 w-24" />
            {EVENT.department}
            <br />
            {EVENT.college}
            <br />
            Thrissur, Kerala
          </address>

          <nav aria-label="Footer">
            <p className="label-tech mb-4 text-silver/50">Navigate</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:max-w-xs">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-silver/80 underline-offset-4 transition-colors hover:text-fire hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="label-tech mt-16 flex flex-col gap-3 border-t border-silver/10 pt-6 text-[0.625rem] text-silver/50 sm:flex-row sm:justify-between">
          <p>{EVENT.dateShort} · {EVENT.location}</p>
          <p>Schedule and rules subject to the official organizers&rsquo; instructions</p>
        </div>
        <DeveloperCredit />
      </div>
    </footer>
  );
}
