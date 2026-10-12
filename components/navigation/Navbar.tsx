"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CtaLink } from "@/components/ui/CtaLink";
import { CseLogo, Logo } from "@/components/ui/Logo";
import { EVENT, NAV_LINKS } from "@/lib/event";

/** Home-page sections that light up a nav link while they are on screen. */
const SPY_SECTIONS = ["about", "competition", "prizes", "rules", "faq"] as const;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Redline along the header's lower edge: how far down the page you are.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
      // A section is "current" while it covers the line 40% down the viewport.
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const id of SPY_SECTIONS) {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        if (rect && rect.top <= line && rect.bottom > line) current = id;
      }
      setSection(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const isActive = (href: string) => {
    if (!href.startsWith("/#")) return pathname === href || (href === "/rules" && section === "rules");
    return pathname === "/" && href === `/#${section}`;
  };
  /** A whole page is "page"; a section of the page you are on is "location". */
  const current = (href: string) => (isActive(href) ? (pathname === href ? "page" : "location") : undefined);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-500 ${
        solid
          ? "border-b border-silver/10 bg-obsidian/95 py-3"
          : "border-b border-transparent bg-transparent py-5"
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 transition-opacity hover:opacity-80 sm:gap-4"
          aria-label="Destroy The Decibel — home"
        >
          <CseLogo priority sizes="60px" className={`transition-[width] duration-500 ${solid ? "w-10 sm:w-11" : "w-11 sm:w-14"}`} />
          <span className="h-7 w-px bg-silver/25" aria-hidden="true" />
          <Logo priority sizes="130px" className={`transition-[width] duration-500 ${solid ? "w-24 sm:w-28" : "w-24 sm:w-32"}`} />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={current(link.href)}
                className="label-tech group relative py-2 text-silver/80 transition-colors hover:text-paper aria-[current]:text-paper"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-fire transition-transform duration-300 group-hover:scale-x-100 group-aria-[current]:scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <CtaLink href="/register" size="sm" aria-current={current("/register")} onClick={() => setOpen(false)}>
            Register
          </CtaLink>
          <button
            type="button"
            className="grid size-10 place-items-center text-paper lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {!open && (
        <motion.span
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-gradient-to-r from-fire to-racing"
          style={{ scaleX: progress }}
          aria-hidden="true"
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[4.05rem] overflow-y-auto bg-obsidian lg:hidden"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="bg-grid flex min-h-full flex-col px-5 pb-10 pt-8 sm:px-8">
              <ul>
                {[...NAV_LINKS, { label: "Register", href: "/register" }].map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.05, duration: 0.4 }}
                    className="border-b border-silver/10"
                  >
                    <Link
                      href={link.href}
                      aria-current={current(link.href)}
                      onClick={() => setOpen(false)}
                      className="display flex items-baseline gap-4 py-4 text-5xl text-paper active:text-fire aria-[current]:text-fire"
                    >
                      <span className="label-tech text-fire">0{i + 1}</span>
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <p className="label-tech mt-auto pt-10 text-silver/50">
                {EVENT.dateShort} · {EVENT.location}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
