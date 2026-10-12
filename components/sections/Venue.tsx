import { ArrowUpRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EVENT } from "@/lib/event";

export function Venue() {
  const { venue } = EVENT;
  return (
    <section id="venue" className="relative scroll-mt-20 overflow-hidden border-t border-silver/10 py-24 lg:py-40">
      <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_70%_50%,black,transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-20 lg:px-12">
        <div>
          <SectionHeading index="07" label="Venue">
            Find
            <br />
            <span className="text-ember">the grid.</span>
          </SectionHeading>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-silver">
              DTD takes place on our own campus. Contestants report at 7:30 AM on{" "}
              {EVENT.dateLabel}, and vehicles may park only at the designated competition venue.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="relative border border-silver/15 bg-carbon p-6 sm:p-10">
            {/* Map-pin marker with a slow radar pulse */}
            <span className="absolute right-6 top-6 grid size-12 place-items-center sm:right-10 sm:top-10" aria-hidden="true">
              <span className="absolute inset-0 animate-ping rounded-full bg-fire/25 [animation-duration:2.4s] motion-reduce:hidden" />
              <span className="relative grid size-12 place-items-center rounded-full bg-fire text-obsidian">
                <MapPin className="size-6" />
              </span>
            </span>

            <p className="label-tech text-[0.625rem] text-silver/50">Event venue</p>
            <h3 className="display mt-4 max-w-[14ch] text-4xl text-paper sm:text-6xl">{venue.name}</h3>
            <address className="mt-6 text-lg not-italic leading-relaxed text-silver">
              {venue.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <a
              href={venue.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="label-tech group mt-10 inline-flex items-center gap-3 bg-fire px-6 py-4 font-semibold text-obsidian transition-colors hover:bg-paper"
            >
              Get directions
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              <span className="sr-only">(opens Google Maps in a new tab)</span>
            </a>
            <p className="label-tech mt-4 text-[0.5625rem] text-silver/40">Opens Google Maps</p>
          </div>

          {/* Recoloured to sit in the dark page; the map itself stays fully interactive. */}
          <div className="relative mt-3 aspect-[16/10] overflow-hidden border border-silver/15 bg-carbon">
            <iframe
              src={venue.mapEmbedUrl}
              title={`Map showing ${venue.name}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              className="absolute inset-0 size-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.6)_contrast(0.9)]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
