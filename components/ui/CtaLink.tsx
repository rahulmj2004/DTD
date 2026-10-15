import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type CtaLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: "primary" | "ghost";
  size?: "md" | "sm";
  className?: string;
  children: ReactNode;
};

const base =
  "group relative inline-flex items-center justify-center gap-3 font-mono uppercase tracking-[0.22em] transition-colors duration-300 [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]";

const variants = {
  primary: "bg-fire text-obsidian hover:bg-paper",
  ghost:
    "bg-paper/5 text-paper shadow-[inset_0_0_0_1px_rgb(201_208_214/0.35)] hover:bg-paper/10 hover:text-cyan",
} as const;

const sizes = {
  md: "px-7 py-4 text-xs font-semibold",
  sm: "px-4 py-2.5 text-[0.6875rem] font-semibold",
} as const;

/** Angled-corner call-to-action link used across the site. */
export function CtaLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: CtaLinkProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </Link>
  );
}

/** Non-interactive stand-in for the register CTA once registration has closed. */
export function ClosedTag({ size = "md", className = "" }: { size?: "md" | "sm"; className?: string }) {
  return (
    <span
      className={`${base} ${sizes[size]} cursor-not-allowed bg-paper/5 text-silver/70 shadow-[inset_0_0_0_1px_rgb(201_208_214/0.25)] ${className}`}
    >
      <span className="block size-1.5 rotate-45 bg-fire" aria-hidden="true" />
      Registration closed
    </span>
  );
}
