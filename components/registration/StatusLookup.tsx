"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Field } from "@/components/registration/Field";
import {
  Receipt,
  ReferenceTag,
  StatusPanel,
  btnGhost,
  btnPrimary,
  toneForStatus,
} from "@/components/registration/StatusPanel";
import type { StatusResponse } from "@/lib/api-types";
import type { RegistrationStatus, RegistrationSummary } from "@/lib/validation";

type Result =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "found"; registration: RegistrationSummary }
  | { state: "error"; message: string };

const COPY: Record<Exclude<RegistrationStatus, "paid">, { title: string; body: string }> = {
  pending: {
    title: "Awaiting payment",
    body: "No verified payment is recorded for this registration, so the entry is not confirmed. If you just paid, check again in a few minutes.",
  },
  failed: {
    title: "Payment failed",
    body: "The last payment attempt failed and the entry is not confirmed. Submit the registration form again with the same vehicle and phone number to retry.",
  },
  cancelled: {
    title: "Payment cancelled",
    body: "The checkout was closed before paying and the entry is not confirmed. Submit the registration form again with the same vehicle and phone number to resume.",
  },
};

export function StatusLookup() {
  const router = useRouter();
  const ref = useSearchParams().get("ref")?.trim().toUpperCase() ?? "";
  const [input, setInput] = useState(ref);
  const [result, setResult] = useState<Result>({ state: ref ? "loading" : "idle" });

  useEffect(() => {
    if (!ref) return;
    const controller = new AbortController();
    fetch(`/api/registration?ref=${encodeURIComponent(ref)}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<StatusResponse>)
      .then((data) =>
        setResult(
          data.state === "found"
            ? { state: "found", registration: data.registration }
            : { state: "error", message: data.message },
        ),
      )
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResult({ state: "error", message: "Network error. Please try again." });
      });
    return () => controller.abort();
  }, [ref]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = input.trim().toUpperCase();
    if (!next) return;
    if (next === ref) return;
    setResult({ state: "loading" });
    router.replace(`/register/status?ref=${encodeURIComponent(next)}`);
  };

  return (
    <div className="space-y-10">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end print:hidden">
        <div className="flex-1">
          <Field
            id="reference"
            label="Registration reference"
            placeholder="DTD-XXXXXXXX"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </div>
        <button type="submit" disabled={result.state === "loading"} className={btnPrimary}>
          {result.state === "loading" && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          Check status
        </button>
      </form>

      {result.state === "error" && (
        <p role="alert" className="border border-racing/60 bg-racing/10 p-4 text-paper">
          {result.message}
        </p>
      )}

      {result.state === "found" &&
        (result.registration.status === "paid" ? (
          <StatusPanel
            tone="success"
            title="Entry paid"
            actions={
              <button type="button" onClick={() => window.print()} className={btnPrimary}>
                Print receipt
              </button>
            }
          >
            <p>The registration fee for this vehicle has been verified.</p>
            <Receipt registration={result.registration} />
            <p className="text-base text-silver/70">
              Final eligibility is subject to official vehicle inspection and organizer approval.
            </p>
          </StatusPanel>
        ) : (
          <StatusPanel
            tone={toneForStatus(result.registration.status)}
            title={COPY[result.registration.status].title}
            actions={
              <>
                <Link href="/register" className={btnPrimary}>
                  Go to registration
                </Link>
                <Link href="/#contact" className={btnGhost}>
                  Contact coordinators
                </Link>
              </>
            }
          >
            <p>{COPY[result.registration.status].body}</p>
            <ReferenceTag reference={result.registration.reference} />
            <p className="text-base text-silver/70">Vehicle: {result.registration.vehicle}</p>
          </StatusPanel>
        ))}
    </div>
  );
}
