type EmblemProps = {
  className?: string;
  title?: string;
};

/** DTD monogram: two arrowhead Ds around a T, echoing the poster's spray mark. */
export function Emblem({ className, title }: EmblemProps) {
  return (
    <svg
      viewBox="0 0 120 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinejoin="miter"
      strokeLinecap="square"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d="M5 6 L35 24 L5 42 Z" />
      <path d="M44 6 H76 M60 6 V42" />
      <path d="M85 6 L115 24 L85 42 Z" />
    </svg>
  );
}
