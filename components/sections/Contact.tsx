import { Reveal } from "@/components/animations/Reveal";
import { CoordinatorList } from "@/components/ui/CoordinatorList";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Contact() {
  return (
    <section id="contact" className="relative scroll-mt-20 border-t border-silver/10 bg-carbon py-24 lg:py-40">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <SectionHeading index="08" label="For booking">
          Talk to the
          <br />
          <span className="text-metal">pit wall.</span>
        </SectionHeading>
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-silver">
            Registrations, eligibility questions and enquiries about results go to the event
            coordinators — and only to them.
          </p>
        </Reveal>

        <CoordinatorList className="mt-14" />
      </div>
    </section>
  );
}
