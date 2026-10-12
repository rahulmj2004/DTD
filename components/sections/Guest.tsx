import { Reveal } from "@/components/animations/Reveal";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { EVENT } from "@/lib/event";

/** The DTD guest announcement. The reveal itself happens in the video. */
export function Guest() {
  return (
    <section id="guest" aria-labelledby="guest-title" className="relative scroll-mt-20 overflow-hidden border-b border-silver/10 bg-obsidian py-24 lg:py-36">
      <div
        className="absolute -left-40 top-1/2 size-[40rem] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(240_24_36/0.16),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1600px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-20 lg:px-12">
        <Reveal>
          <p className="label-tech flex items-center gap-4 text-silver/70">
            <span className="h-px w-10 bg-racing" aria-hidden="true" />
            DTD guest
          </p>
          <h2 id="guest-title" className="display mt-6 text-[clamp(3.25rem,10vw,9rem)] text-paper">
            Guest
            <br />
            <span className="text-racing">reveal.</span>
          </h2>
          {EVENT.guestName && (
            <p className="display mt-6 text-4xl text-metal sm:text-6xl">{EVENT.guestName}</p>
          )}
          <p className="mt-8 max-w-md text-lg leading-relaxed text-silver">
            The grid has company this year. Press play to meet the guest joining Destroy The
            Decibel on {EVENT.dateLabel}.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <VideoPlayer
            src="/video/guest-reveal.mp4"
            poster="/video/guest-reveal-poster.jpg"
            posterAlt="Title card reading Guest Reveal — Department of Computer Science & Engineering"
            name="guest reveal"
            playLabel="Play guest reveal · 19 sec · with sound"
            aspect="square"
            sizes="(min-width: 1024px) 34rem, 100vw"
            caption={
              <span>
                <span className="text-racing">Guest reveal</span> — Destroy The Decibel
              </span>
            }
          />
        </Reveal>
      </div>
    </section>
  );
}
