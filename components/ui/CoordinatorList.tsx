import { MessageCircle, Phone } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { COORDINATORS } from "@/lib/event";

/** The three event coordinators with tap-to-call numbers. */
export function CoordinatorList({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid border-l border-t border-silver/15 md:grid-cols-3 ${className}`}>
      {COORDINATORS.map((person, i) => (
        <li key={person.tel} className="border-b border-r border-silver/15">
          <Reveal delay={i * 0.08} className="flex h-full flex-col p-6 sm:p-8">
            <p className="label-tech text-[0.625rem] text-silver/50">Coordinator 0{i + 1}</p>
            <p className="display mt-4 text-4xl text-paper sm:text-5xl">{person.name}</p>
            <a
              href={`tel:${person.tel}`}
              className="group mt-8 flex items-center gap-3 font-mono text-xl tracking-wide text-paper transition-colors hover:text-fire sm:text-2xl"
            >
              <Phone className="size-5 text-fire" aria-hidden="true" />
              <span>{person.display}</span>
              <span className="sr-only">— call {person.name}</span>
            </a>
            {person.whatsappVerified && (
              <a
                href={`https://wa.me/${person.tel.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="label-tech mt-4 flex w-fit items-center gap-2 text-[0.625rem] text-cyan hover:text-paper"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp {person.name.split(" ")[0]}
              </a>
            )}
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
