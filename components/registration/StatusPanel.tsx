import { Ban, CircleCheck, CircleX, Clock, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { formatInr } from "@/lib/event";
import type { RegistrationStatus, RegistrationSummary } from "@/lib/validation";

type Tone = "success" | "pending" | "failed" | "cancelled";

const TONES: Record<Tone, { icon: LucideIcon; label: string; border: string; text: string }> = {
  success: { icon: CircleCheck, label: "Payment successful", border: "border-cyan/50", text: "text-cyan" },
  pending: { icon: Clock, label: "Payment pending", border: "border-fire/60", text: "text-fire" },
  failed: { icon: CircleX, label: "Payment failed", border: "border-racing/70", text: "text-racing" },
  cancelled: { icon: Ban, label: "Payment cancelled", border: "border-silver/40", text: "text-silver" },
};

export const toneForStatus = (status: RegistrationStatus): Tone => (status === "paid" ? "success" : status);

type StatusPanelProps = {
  tone: Tone;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
};

/** One consistent frame for every outcome: pending, successful, failed, cancelled. */
export function StatusPanel({ tone, title, children, actions }: StatusPanelProps) {
  const { icon: Icon, label, border, text } = TONES[tone];
  return (
    <div role="status" aria-live="polite" className={`border ${border} bg-obsidian/80 p-6 sm:p-9`}>
      <p className={`label-tech flex items-center gap-3 ${text}`}>
        <Icon className="size-5" aria-hidden="true" />
        {label}
      </p>
      <h2 className="display mt-5 text-4xl text-paper sm:text-6xl">{title}</h2>
      {children && <div className="mt-5 space-y-4 text-lg leading-relaxed text-silver">{children}</div>}
      {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap print:hidden">{actions}</div>}
    </div>
  );
}

/** Reference block shown wherever a registration reference is handed out. */
export function ReferenceTag({ reference }: { reference: string }) {
  return (
    <p className="border border-silver/20 bg-carbon px-5 py-4">
      <span className="label-tech block text-[0.625rem] text-silver/60">Registration reference</span>
      <span className="mt-1 block select-all font-mono text-2xl font-semibold tracking-[0.12em] text-paper sm:text-3xl">
        {reference}
      </span>
    </p>
  );
}

/** Receipt details for a verified payment. */
export function Receipt({ registration }: { registration: RegistrationSummary }) {
  const rows = [
    { label: "Vehicle", value: registration.vehicle },
    { label: "Registration fee", value: formatInr(registration.amount) },
    {
      label: "Paid on",
      value: registration.paidAt
        ? new Date(registration.paidAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
          }) + " IST"
        : "—",
    },
  ];
  return (
    <>
      <ReferenceTag reference={registration.reference} />
      <dl className="grid border-t border-silver/15 text-base sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="border-b border-silver/15 py-3 sm:border-b-0 sm:pr-4">
            <dt className="label-tech text-[0.625rem] text-silver/50">{row.label}</dt>
            <dd className="mt-1 font-medium text-paper">{row.value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export const btnPrimary =
  "label-tech inline-flex items-center justify-center gap-3 bg-fire px-6 py-4 font-semibold text-obsidian transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost =
  "label-tech inline-flex items-center justify-center gap-3 border border-silver/35 px-6 py-4 font-semibold text-paper transition-colors hover:border-cyan hover:text-cyan";
