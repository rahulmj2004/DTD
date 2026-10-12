import type { Metadata } from "next";
import { CtaLink } from "@/components/ui/CtaLink";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="bg-grid flex min-h-[80svh] flex-col items-start justify-center px-5 pt-24 sm:px-8 lg:px-12">
      <p className="label-tech text-fire">Error 404 · Signal lost</p>
      <h1 className="display mt-6 text-[clamp(4rem,16vw,14rem)] text-paper">
        Engine <span className="text-metal">cut off.</span>
      </h1>
      <p className="mt-6 max-w-md text-lg text-silver">That page doesn&rsquo;t exist. Restart from the grid.</p>
      <CtaLink href="/" className="mt-10">
        Back to start
      </CtaLink>
    </div>
  );
}
