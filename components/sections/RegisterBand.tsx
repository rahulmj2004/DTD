import { ArrowRight, Phone } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { SoundWave } from "@/components/animations/SoundWave";
import { CtaLink } from "@/components/ui/CtaLink";
import { RegistrationSteps } from "@/components/ui/RegistrationSteps";
import { EVENT, formatInr } from "@/lib/event";

/** Home-page registration call-to-action: the fee, the three steps and the way in. */
export function RegisterBand() {
  return (
    <section
      id="register"
      aria-labelledby="register-title"
      className="relative scroll-mt-20 overflow-hidden border-t border-silver/10 bg-obsidian py-24 lg:py-36"
    >
      <div
        className="absolute left-1/2 top-0 h-[30rem] w-[min(90rem,150%)] -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-[radial-gradient(closest-side,rgb(240_24_36/0.28),transparent)]"
        aria-hidden="true"
      />
      <SoundWave className="absolute inset-x-0 top-10 h-32 opacity-30" tone="text-racing" />

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <p className="label-tech flex items-center gap-4 text-silver/70">
              <span className="h-px w-10 bg-fire" aria-hidden="true" />
              Registration
            </p>
            <h2 id="register-title" className="display mt-6 text-[clamp(3.25rem,11vw,10rem)] text-paper">
              Claim <span className="text-ember">your lot.</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-silver">
              Registration is handled directly by the event coordinators and has to be done in
              advance — there is no registration at the venue.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="border border-silver/15 bg-carbon/80 p-6 sm:p-8 lg:min-w-[22rem]">
            <p className="label-tech text-silver/60">Registration fee</p>
            <p className="display mt-3 text-7xl text-paper">{formatInr(EVENT.entryFee)}</p>
            <p className="label-tech mt-2 text-[0.625rem] text-silver/50">Per vehicle · {EVENT.dateShort}</p>
            <div className="mt-6 flex flex-col gap-3">
              <CtaLink href="/register" sweep>
                Register your vehicle
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </CtaLink>
              <CtaLink href="/#contact" variant="ghost">
                <Phone className="size-4" aria-hidden="true" />
                Call a coordinator
              </CtaLink>
            </div>
          </Reveal>
        </div>

        <RegistrationSteps className="mt-14" />
      </div>
    </section>
  );
}
