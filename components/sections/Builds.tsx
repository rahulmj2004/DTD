import { Reveal } from "@/components/animations/Reveal";
import { BuildsGallery, type Build } from "@/components/sections/BuildsGallery";
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
] as const satisfies readonly Build[];

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
              Every car gets a lot number. These are six of the builds wearing one — open any poster to
              see it full screen.
            </p>
          </Reveal>
        </div>

        <BuildsGallery builds={BUILDS} />
      </div>
    </section>
  );
}
