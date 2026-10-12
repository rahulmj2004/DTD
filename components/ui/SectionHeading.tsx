import type { ReactNode } from "react";
import { Reveal } from "@/components/animations/Reveal";

type SectionHeadingProps = {
  index: string;
  label: string;
  children: ReactNode;
  className?: string;
};

/** Numbered technical caption above an oversized display headline. */
export function SectionHeading({ index, label, children, className = "" }: SectionHeadingProps) {
  return (
    <Reveal className={className}>
      <p className="label-tech flex items-center gap-4 text-silver/70">
        <span className="text-fire">{index}</span>
        <span className="h-px w-10 bg-silver/30" aria-hidden="true" />
        {label}
      </p>
      <h2 className="display mt-6 text-[clamp(2.75rem,8vw,7rem)] text-paper">{children}</h2>
    </Reveal>
  );
}
