"use client";

import { useEffect } from "react";
import { CseLogo, Logo } from "@/components/ui/Logo";
import { ignite, useIgnited } from "@/lib/ignition";

const SEQUENCE_MS = 2300;

/**
 * Branded ignition sequence shown once per browser session on the home page.
 * An inline script in the root layout hides it before first paint for
 * returning visitors and reduced-motion users. Any key, click or tap skips it.
 */
export function Loader() {
  const ignited = useIgnited();

  useEffect(() => {
    if (ignited) return;
    const timer = window.setTimeout(ignite, SEQUENCE_MS);
    window.addEventListener("keydown", ignite, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", ignite);
    };
  }, [ignited]);

  return (
    <div
      className="dtd-loader fixed inset-0 z-[90] flex flex-col items-center justify-center bg-obsidian"
      onClick={ignite}
      aria-hidden={ignited}
    >
      <CseLogo priority sizes="110px" className="mb-6 w-20 sm:w-24" />
      <Logo priority sizes="260px" className="w-52 sm:w-64" />
      <p className="label-tech mt-8 text-silver/80" role="status">
        Ignition sequence
      </p>

      <div className="mt-6 w-56">
        <div className="relative h-[3px] overflow-hidden bg-silver/15">
          <div className="anim-redline absolute inset-0 bg-gradient-to-r from-silver via-fire to-racing" />
        </div>
        <div className="label-tech mt-2 flex justify-between text-[0.5625rem] text-silver/40">
          <span>0</span>
          <span>dB</span>
          <span className="text-racing">MAX</span>
        </div>
      </div>

      <button
        type="button"
        onClick={ignite}
        tabIndex={ignited ? -1 : 0}
        className="label-tech absolute bottom-8 right-6 px-3 py-2 text-silver/60 transition-colors hover:text-paper sm:right-10"
      >
        Skip
      </button>
    </div>
  );
}
