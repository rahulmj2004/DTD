import { Loader } from "@/components/animations/Loader";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Builds } from "@/components/sections/Builds";
import { Machine } from "@/components/sections/Machine";
import { Faq } from "@/components/sections/Faq";
import { Guest } from "@/components/sections/Guest";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { InfoStrip } from "@/components/sections/InfoStrip";
import { Venue } from "@/components/sections/Venue";
import { Trailer } from "@/components/sections/Trailer";
import { Prizes } from "@/components/sections/Prizes";
import { RegisterBand } from "@/components/sections/RegisterBand";
import { RulesTeaser } from "@/components/sections/RulesTeaser";
import { SoundCheck } from "@/components/sections/SoundCheck";
import { EVENT } from "@/lib/event";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Structured data for search engines. Only facts already stated on the page. */
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${EVENT.name} — ${EVENT.tagline}`,
  description: `A car exhaust sound competition organized by the ${EVENT.department}, ${EVENT.college}.`,
  startDate: EVENT.dateIso,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: siteUrl,
  image: `${siteUrl}/opengraph-image`,
  location: {
    "@type": "Place",
    name: EVENT.venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: EVENT.venue.address[0],
      addressLocality: "Thrissur",
      addressRegion: "Kerala",
      postalCode: "680601",
      addressCountry: "IN",
    },
  },
  organizer: { "@type": "Organization", name: `${EVENT.department}, ${EVENT.college}` },
  offers: {
    "@type": "Offer",
    name: "Vehicle registration",
    price: EVENT.entryFee,
    priceCurrency: "INR",
    url: `${siteUrl}/register`,
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so the JSON can never close the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }}
      />
      <Loader />
      <Hero />
      <Machine />
      <Trailer />
      <InfoStrip />
      <Guest />
      <About />
      <SoundCheck />
      <HowItWorks />
      <Builds />
      <Prizes />
      <RulesTeaser />
      <RegisterBand />
      <Faq />
      <Venue />
      <Contact />
    </>
  );
}
