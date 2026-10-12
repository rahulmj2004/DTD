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
import { RulesTeaser } from "@/components/sections/RulesTeaser";

export default function HomePage() {
  return (
    <>
      <Loader />
      <Hero />
      <Machine />
      <Trailer />
      <InfoStrip />
      <Guest />
      <About />
      <HowItWorks />
      <Builds />
      <Prizes />
      <RulesTeaser />
      <Faq />
      <Venue />
      <Contact />
    </>
  );
}
