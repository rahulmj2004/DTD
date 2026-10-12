import type { ReactNode } from "react";

type PageHeaderProps = {
  label: string;
  title: ReactNode;
  children?: ReactNode;
};

/** Shared masthead for the inner pages (rules, registration, status). */
export function PageHeader({ label, title, children }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-silver/10 bg-carbon">
      <div className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
      <div
        className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(255_90_31/0.2),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1600px] px-5 pb-14 pt-36 sm:px-8 lg:px-12 lg:pb-20 lg:pt-44">
        <p className="label-tech flex items-center gap-4 text-silver/70">
          <span className="h-px w-10 bg-fire" aria-hidden="true" />
          {label}
        </p>
        <h1 className="display mt-6 text-[clamp(3.25rem,11vw,10rem)] text-paper">{title}</h1>
        {children && <div className="mt-8 max-w-2xl text-lg leading-relaxed text-silver">{children}</div>}
      </div>
    </header>
  );
}
