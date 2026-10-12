"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/animations/Reveal";

export type Build = {
  lot: string;
  name: string;
  src: string;
  alt: string;
  /** Aspect-ratio class when the poster is not 3:4. */
  shape?: string;
};

/** Poster grid with a full-screen viewer. Arrow keys, the buttons or a tap move between builds. */
export function BuildsGallery({ builds }: { builds: readonly Build[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const total = builds.length;

  const open = (index: number) => {
    setActive(index);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = (by: number) => setActive((index) => (index === null ? index : (index + by + total) % total));

  // The page behind a modal dialog can still scroll, so hold it while the viewer is open.
  useEffect(() => {
    if (active === null) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  const current = active === null ? null : builds[active];

  return (
    <>
      {/* Phones: swipeable row. Tablets: two across. Desktop: three across, with a staggered column for rhythm. */}
      <ul className="-mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-12 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3 xl:gap-x-10">
        {builds.map((build, i) => (
          <li
            key={build.lot}
            className="w-[78vw] shrink-0 snap-center md:w-auto md:max-xl:[&:nth-child(even)]:mt-16 xl:[&:nth-child(3n+2)]:mt-16"
          >
            <Reveal delay={(i % 3) * 0.1}>
              <figure>
                <button
                  type="button"
                  onClick={() => open(i)}
                  aria-label={`View ${build.name} (${build.lot}) full screen`}
                  className={`group relative block w-full overflow-hidden bg-carbon ${build.shape ?? "aspect-[3/4]"}`}
                >
                  <Image
                    src={`/images/builds/${build.src}.jpg`}
                    alt={build.alt}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 78vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06]"
                  />
                  {/* Hover dressing: darkened foot, lot plate, and a redline that draws across the base */}
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/85 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
                  <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgb(201_208_214/0.18)] transition-shadow duration-500 group-hover:shadow-[inset_0_0_0_1px_rgb(255_90_31/0.9)]" />
                  <span className="label-tech pointer-events-none absolute bottom-5 left-5 flex translate-y-3 items-center gap-3 text-paper opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                    <Expand className="size-4 text-fire" aria-hidden="true" />
                    View build
                  </span>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-fire to-racing transition-transform duration-700 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                </button>
                <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-b border-silver/15 pb-4">
                  <span className="display text-3xl text-paper xl:text-4xl">{build.name}</span>
                  <span className="label-tech shrink-0 text-fire">{build.lot}</span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="label-tech mt-2 flex items-center gap-3 text-[0.625rem] text-silver/50 md:hidden" aria-hidden="true">
        Swipe
        <span className="h-px w-10 bg-fire" />
        Tap a build to open it
      </p>

      <dialog
        ref={dialog}
        aria-label={current ? `${current.name}, ${current.lot}` : "Build viewer"}
        onClose={() => setActive(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
        className="dtd-lightbox m-0 h-dvh w-screen bg-obsidian p-0 text-paper"
      >
        {current && active !== null && (
          <div className="flex h-full flex-col px-4 pb-5 pt-4 sm:px-8 sm:pb-8 sm:pt-6">
            <div className="flex items-center justify-between gap-4">
              <p className="label-tech text-silver/70" aria-live="polite">
                <span className="text-fire">{String(active + 1).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
              </p>
              <button
                type="button"
                onClick={close}
                className="label-tech flex items-center gap-2 border border-silver/30 px-4 py-3 text-[0.625rem] transition-colors hover:border-fire hover:text-fire"
              >
                Close
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="relative mt-4 min-h-0 flex-1">
              <Image
                key={current.src}
                src={`/images/builds/${current.src}.jpg`}
                alt={current.alt}
                fill
                sizes="100vw"
                className="anim-stage object-contain"
              />
            </div>

            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="label-tech text-fire">{current.lot}</p>
                <p className="display mt-2 truncate text-4xl sm:text-6xl">{current.name}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous build"
                  className="grid size-12 place-items-center border border-silver/30 transition-colors hover:border-fire hover:text-fire sm:size-14"
                >
                  <ChevronLeft className="size-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next build"
                  className="grid size-12 place-items-center bg-fire text-obsidian transition-colors hover:bg-paper sm:size-14"
                >
                  <ChevronRight className="size-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
