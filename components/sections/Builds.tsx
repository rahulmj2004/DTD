import Image from "next/image";
import { Reveal } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Official DTD build posters, supplied by the organizing team. */
const BUILDS = [
  {
    lot: "DTD 006",
    name: "Liberty Walk Civic",
    src: "dtd-006-liberty-walk-civic",
    alt: "DTD 006 poster: a teal Honda Civic with a carbon bonnet on a roadside, titled Liberty Walk Civic",
  },
  {
    lot: "DTD 007",
    name: "Red Eye City",
    src: "dtd-007-red-eye-city",
    alt: "DTD 007 poster: a lowered deep-blue Honda City with red-glowing headlights in a basement car park, titled Red Eye City",
  },
  {
    lot: "DTD 009",
    name: "Civic",
    src: "dtd-009-civic",
    alt: "DTD 009 poster: a purple wide-body Honda Civic with both scissor doors raised, titled Civic",
  },
  {
    lot: "DTD 011",
    name: "Bang1 City",
    src: "dtd-011-bang1-city",
    alt: "DTD 011 poster: a dark-green Honda City with Bang1 Performance side graphics on silver wheels, titled City Bang1",
  },
  {
    lot: "DTD 012",
    name: "Polo GT",
    src: "dtd-012-polo-gt",
    // This poster is 4:5; the others are 3:4. Its frame matches so nothing is cropped.
    shape: "aspect-[1170/1462]",
    alt: "DTD 012 poster: a red Volkswagen Polo GT facing the camera on a grassy shore, titled Polo GT",
  },
  {
    lot: "DTD 017",
    name: "Samurai Civic",
    src: "dtd-017-samurai-civic",
    alt: "DTD 017 poster: a lowered bright-blue Honda Civic on polished deep-dish wheels, titled Samurai Civic",
  },
] as const;

export function Builds() {
  return (
    <section id="gallery" className="relative scroll-mt-20 border-t border-silver/10 py-24 lg:py-40">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading index="03" label="The builds">
            Meet
            <br />
            <span className="text-ember">the grid.</span>
          </SectionHeading>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-lg leading-relaxed text-silver">
              Every car gets a lot number. These are six of the builds wearing one.
            </p>
          </Reveal>
        </div>

        {/* Phones: swipeable row. Tablets: two across. Desktop: three across, with a staggered column for rhythm. */}
        <ul className="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-12 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3 xl:gap-x-10">
          {BUILDS.map((build, i) => (
            <li
              key={build.lot}
              className="w-[78vw] shrink-0 snap-center md:w-auto md:max-xl:[&:nth-child(even)]:mt-16 xl:[&:nth-child(3n+2)]:mt-16"
            >
              <Reveal delay={(i % 3) * 0.1}>
                <figure>
                  <div className={`group relative overflow-hidden bg-carbon ${"shape" in build ? build.shape : "aspect-[3/4]"}`}>
                    <Image
                      src={`/images/builds/${build.src}.jpg`}
                      alt={build.alt}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 78vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgb(201_208_214/0.18)]" />
                  </div>
                  <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-b border-silver/15 pb-4">
                    <span className="display text-3xl text-paper xl:text-4xl">{build.name}</span>
                    <span className="label-tech shrink-0 text-fire">{build.lot}</span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
