import Image from "next/image";

type LogoProps = {
  className?: string;
  /** Load eagerly when the logo is above the fold. */
  priority?: boolean;
  /** Rendered width hint for the image optimizer, e.g. "140px". */
  sizes?: string;
};

/** Official "Destroy The Decibel" wordmark (white lettering, red "THE"). */
export function Logo({ className = "", priority = false, sizes = "160px" }: LogoProps) {
  return (
    <Image
      src="/brand/dtd-logo.png"
      alt="Destroy The Decibel"
      width={943}
      height={322}
      priority={priority}
      sizes={sizes}
      className={`h-auto ${className}`}
    />
  );
}

/** Department of CSE mark (the organizers), with its red glow on transparent. */
export function CseLogo({ className = "", priority = false, sizes = "80px" }: LogoProps) {
  return (
    <Image
      src="/brand/cse-logo.png"
      alt="Department of Computer Science & Engineering"
      width={575}
      height={526}
      priority={priority}
      sizes={sizes}
      className={`h-auto ${className}`}
    />
  );
}
