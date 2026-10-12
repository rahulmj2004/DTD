import { Reveal } from "@/components/animations/Reveal";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

/** The trailer, first thing after the opening screen. */
export function Trailer() {
  return (
    <section id="trailer" aria-labelledby="trailer-title" className="relative scroll-mt-20 bg-obsidian pb-16 pt-6 lg:pb-24 lg:pt-10">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <Reveal className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="label-tech flex items-center gap-4 text-silver/70">
              <span className="h-px w-10 bg-fire" aria-hidden="true" />
              Official trailer
            </p>
            <h2 id="trailer-title" className="display mt-4 text-[clamp(2.25rem,6vw,5rem)] text-paper">
              Watch it. <span className="text-ember">Then bring it.</span>
            </h2>
          </div>
          <p className="label-tech hidden shrink-0 pb-2 text-[0.625rem] text-silver/50 sm:block">00:18</p>
        </Reveal>
        <Reveal delay={0.1}>
          <VideoPlayer
            src="/video/dtd-film.mp4"
            poster="/video/dtd-film-poster.jpg"
            posterAlt="Opening frame of the trailer: cars lined up under a marquee with the title Destroy The Decibel — The Battle of Exhausts"
            name="trailer"
            playLabel="Play trailer · 18 sec · with sound"
            sideways
            sizes="(min-width: 1600px) 1500px, 100vw"
            caption={
              <>
                <span>
                  <span className="text-fire">Trailer</span> — Destroy The Decibel
                </span>
                <span>Edit @fx.arjuuuhh · Camera @rshh.field</span>
              </>
            }
          />
        </Reveal>
      </div>
    </section>
  );
}
