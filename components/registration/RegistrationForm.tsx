"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Lock, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Field } from "@/components/registration/Field";
import {
  Receipt,
  ReferenceTag,
  StatusPanel,
  btnGhost,
  btnPrimary,
} from "@/components/registration/StatusPanel";
import type { RegisterResponse, RegistrationConfig, VerifyResponse } from "@/lib/api-types";
import { EVENT, formatInr } from "@/lib/event";
import { loadRazorpay, type RazorpaySuccess } from "@/lib/razorpay-checkout";
import {
  registrationSchema,
  type RegistrationData,
  type RegistrationInput,
  type RegistrationSummary,
} from "@/lib/validation";

type Checkout = Extract<RegisterResponse, { state: "checkout" }>;

type Flow =
  | { step: "form"; error?: string }
  | { step: "verifying" }
  | { step: "paid"; registration: RegistrationSummary }
  | { step: "processing"; reference: string }
  | { step: "payment_unavailable"; reference: string }
  | { step: "cancelled"; checkout: Checkout }
  | { step: "failed"; checkout: Checkout; reason?: string }
  | { step: "unverified"; reference: string; message: string };

const DEFAULTS: RegistrationInput = {
  fullName: "",
  phone: "",
  email: "",
  organization: "",
  vehicleMake: "",
  vehicleModel: "",
  manufacturingYear: "",
  engineCc: "",
  vehicleNumber: "",
  acceptRules: false,
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as T;
}

export function RegistrationForm() {
  const [flow, setFlow] = useState<Flow>({ step: "form" });
  const [config, setConfig] = useState<RegistrationConfig | null>(null);
  const [opening, setOpening] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
  } = useForm<RegistrationInput, unknown, RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: DEFAULTS,
    mode: "onTouched",
  });

  useEffect(() => {
    let active = true;
    fetch("/api/register")
      .then((response) => response.json() as Promise<RegistrationConfig>)
      .then((value) => {
        if (active) setConfig(value);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  // Bring each new outcome into view; important on phones after the checkout closes.
  useEffect(() => {
    if (flow.step !== "form") panel.current?.scrollIntoView({ block: "start" });
  }, [flow.step]);

  const verify = async (checkout: Checkout, payment: RazorpaySuccess) => {
    setFlow({ step: "verifying" });
    try {
      const result = await postJson<VerifyResponse>("/api/payment/verify", payment);
      if (result.state === "paid") setFlow({ step: "paid", registration: result.registration });
      else if (result.state === "processing") setFlow({ step: "processing", reference: result.reference });
      else setFlow({ step: "unverified", reference: checkout.reference, message: result.message });
    } catch {
      setFlow({
        step: "unverified",
        reference: checkout.reference,
        message: "We lost connection while confirming your payment.",
      });
    }
  };

  const openCheckout = async (checkout: Checkout) => {
    setOpening(true);
    try {
      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Payment window unavailable.");

      let settled = false;
      let failure: string | undefined;

      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        order_id: checkout.orderId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: EVENT.name,
        description: `Registration fee · ${checkout.reference}`,
        prefill: checkout.prefill,
        notes: { reference: checkout.reference },
        theme: { color: "#FF5A1F" },
        handler: (payment) => {
          settled = true;
          void verify(checkout, payment);
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (settled) return;
            const outcome = failure ? "failed" : "cancelled";
            setFlow(failure ? { step: "failed", checkout, reason: failure } : { step: "cancelled", checkout });
            void postJson("/api/payment/cancel", {
              reference: checkout.reference,
              orderId: checkout.orderId,
              outcome,
            }).catch(() => undefined);
          },
        },
      });
      razorpay.on("payment.failed", (response) => {
        failure = response.error?.description ?? "The payment did not go through.";
      });
      razorpay.open();
    } catch {
      setFlow({
        step: "failed",
        checkout,
        reason: "The secure payment window could not be opened. Check your connection and try again.",
      });
    } finally {
      setOpening(false);
    }
  };

  const onSubmit = async (data: RegistrationData) => {
    setFlow({ step: "form" });
    let result: RegisterResponse;
    try {
      // Send normalized values; the server validates them again from scratch.
      result = await postJson<RegisterResponse>("/api/register", {
        ...data,
        manufacturingYear: data.manufacturingYear === null ? "" : String(data.manufacturingYear),
        engineCc: String(data.engineCc),
      });
    } catch {
      setFlow({ step: "form", error: "Network error. Nothing was submitted — please try again." });
      return;
    }

    switch (result.state) {
      case "checkout":
        await openCheckout(result);
        return;
      case "paid":
        setFlow({ step: "paid", registration: result.registration });
        return;
      case "payment_unavailable":
        setFlow({ step: "payment_unavailable", reference: result.reference });
        return;
      case "error":
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          if (field in DEFAULTS) setError(field as keyof RegistrationInput, { message });
        }
        setFlow({ step: "form", error: result.message });
    }
  };

  const field = (name: keyof RegistrationInput) => ({
    error: errors[name]?.message,
    valid: Boolean(touchedFields[name] && dirtyFields[name] && !errors[name]),
    ...register(name),
  });

  const busy = isSubmitting || opening;

  return (
    <div ref={panel} className="scroll-mt-28">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={flow.step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {flow.step === "form" && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-12">
              {config && !config.registration && (
                <Notice>
                  Online registration is not activated yet. You can review the form, but nothing
                  will be saved and no payment will be taken. Please contact the event coordinators
                  to book.
                </Notice>
              )}
              {config?.registration && !config.payments && (
                <Notice>
                  Online payment is not activated yet. Submitting saves your details as{" "}
                  <strong>payment pending</strong> — your entry is not confirmed until the fee is
                  paid through the coordinators.
                </Notice>
              )}

              <fieldset className="space-y-5">
                <legend className="display mb-6 text-3xl text-paper">
                  <span className="label-tech mr-4 align-middle text-fire">01</span>Driver
                </legend>
                <Field id="fullName" label="Participant's full name" autoComplete="name" {...field("fullName")} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="phone"
                    label="Phone number"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="98470 12345"
                    hint="10-digit Indian mobile number."
                    {...field("phone")}
                  />
                  <Field
                    id="email"
                    label="Email address"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    {...field("email")}
                  />
                </div>
                <Field
                  id="organization"
                  label="College or organization"
                  optional
                  autoComplete="organization"
                  {...field("organization")}
                />
              </fieldset>

              <fieldset className="space-y-5">
                <legend className="display mb-6 text-3xl text-paper">
                  <span className="label-tech mr-4 align-middle text-fire">02</span>Vehicle
                </legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="vehicleMake" label="Vehicle make" placeholder="e.g. Volkswagen" {...field("vehicleMake")} />
                  <Field id="vehicleModel" label="Vehicle model" placeholder="e.g. Polo GT" {...field("vehicleModel")} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="engineCc"
                    label="Engine capacity (cc)"
                    inputMode="numeric"
                    placeholder="e.g. 1498"
                    hint={`Cars up to ${EVENT.maxEngineCc} cc are allowed.`}
                    {...field("engineCc")}
                  />
                  <Field
                    id="manufacturingYear"
                    label="Manufacturing year"
                    optional
                    inputMode="numeric"
                    placeholder="e.g. 2019"
                    {...field("manufacturingYear")}
                  />
                </div>
                <Field
                  id="vehicleNumber"
                  label="Vehicle registration number"
                  placeholder="KL 08 AB 1234"
                  autoCapitalize="characters"
                  hint="One registration per vehicle."
                  {...field("vehicleNumber")}
                />
              </fieldset>

              <div>
                <label className="flex cursor-pointer items-start gap-4">
                  <input
                    type="checkbox"
                    aria-invalid={errors.acceptRules ? true : undefined}
                    aria-describedby={errors.acceptRules ? "acceptRules-error" : undefined}
                    className="mt-1 size-5 shrink-0 accent-[#FF5A1F]"
                    {...register("acceptRules")}
                  />
                  <span className="leading-relaxed text-silver">
                    I have read and accept all 26{" "}
                    <Link href="/rules" target="_blank" className="text-paper underline underline-offset-4 hover:text-fire">
                      rules and regulations
                    </Link>
                    , and I understand that paying the fee does not guarantee final eligibility —
                    my vehicle is subject to official inspection and organizer approval.
                  </span>
                </label>
                {errors.acceptRules && (
                  <p id="acceptRules-error" role="alert" className="mt-2 pl-9 text-sm text-[#ff6b73]">
                    {errors.acceptRules.message}
                  </p>
                )}
              </div>

              {flow.error && (
                <p role="alert" className="flex gap-3 border border-racing/60 bg-racing/10 p-4 text-paper">
                  <TriangleAlert className="mt-0.5 size-5 shrink-0 text-racing" aria-hidden="true" />
                  {flow.error}
                </p>
              )}

              <div className="flex flex-col gap-4 border-t border-silver/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm text-silver/60">
                  <Lock className="size-4" aria-hidden="true" />
                  Payment is handled by Razorpay. Card details never touch this site.
                </p>
                <button type="submit" disabled={busy} className={btnPrimary}>
                  {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                  {busy ? "Starting…" : `Continue to pay ${formatInr(EVENT.entryFee)}`}
                </button>
              </div>
            </form>
          )}

          {flow.step === "verifying" && (
            <StatusPanel tone="pending" title="Verifying payment">
              <p className="flex items-center gap-3">
                <LoaderCircle className="size-5 animate-spin text-fire" aria-hidden="true" />
                Confirming with Razorpay. Please keep this page open.
              </p>
            </StatusPanel>
          )}

          {flow.step === "paid" && (
            <StatusPanel
              tone="success"
              title="You're on the grid"
              actions={
                <>
                  <button type="button" onClick={() => window.print()} className={btnPrimary}>
                    Print receipt
                  </button>
                  <Link href="/rules" className={btnGhost}>
                    Review the rules
                  </Link>
                </>
              }
            >
              <p>Your payment has been verified. Save this reference and bring it on event day.</p>
              <Receipt registration={flow.registration} />
              <p className="text-base text-silver/70">
                Final eligibility is subject to official vehicle inspection and organizer approval.
                Reporting time is 7:30 AM at Thalakkottukara, Thrissur.
              </p>
            </StatusPanel>
          )}

          {flow.step === "processing" && (
            <StatusPanel
              tone="pending"
              title="Almost there"
              actions={
                <Link href={`/register/status?ref=${flow.reference}`} className={btnPrimary}>
                  Check status
                </Link>
              }
            >
              <p>
                Your bank authorised the payment but it hasn&rsquo;t been captured yet. Your
                registration is <strong className="text-paper">not confirmed</strong> until it is —
                this usually takes a few minutes. Do not pay again.
              </p>
              <ReferenceTag reference={flow.reference} />
            </StatusPanel>
          )}

          {flow.step === "payment_unavailable" && (
            <StatusPanel
              tone="pending"
              title="Details saved — fee not paid"
              actions={
                <Link href="/#contact" className={btnPrimary}>
                  Contact coordinators
                </Link>
              }
            >
              <p>
                Online payment isn&rsquo;t active, so no money was taken and your entry is{" "}
                <strong className="text-paper">not confirmed</strong>. Contact a coordinator with
                this reference to pay the {formatInr(EVENT.entryFee)} fee.
              </p>
              <ReferenceTag reference={flow.reference} />
            </StatusPanel>
          )}

          {flow.step === "cancelled" && (
            <StatusPanel
              tone="cancelled"
              title="Checkout closed"
              actions={
                <>
                  <button type="button" disabled={opening} onClick={() => void openCheckout(flow.checkout)} className={btnPrimary}>
                    {opening && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    Resume payment
                  </button>
                  <button type="button" onClick={() => setFlow({ step: "form" })} className={btnGhost}>
                    Edit details
                  </button>
                </>
              }
            >
              <p>
                You closed the payment window before paying. No money was taken and your entry is
                not confirmed. Your details are saved — resume whenever you&rsquo;re ready.
              </p>
              <ReferenceTag reference={flow.checkout.reference} />
            </StatusPanel>
          )}

          {flow.step === "failed" && (
            <StatusPanel
              tone="failed"
              title="Payment didn't go through"
              actions={
                <>
                  <button type="button" disabled={opening} onClick={() => void openCheckout(flow.checkout)} className={btnPrimary}>
                    {opening && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    Try again
                  </button>
                  <button type="button" onClick={() => setFlow({ step: "form" })} className={btnGhost}>
                    Edit details
                  </button>
                </>
              }
            >
              <p>{flow.reason ?? "The payment failed."} Your entry is not confirmed.</p>
              <p className="text-base text-silver/70">
                If money was debited, banks usually reverse it automatically. Keep this reference
                for any enquiry.
              </p>
              <ReferenceTag reference={flow.checkout.reference} />
            </StatusPanel>
          )}

          {flow.step === "unverified" && (
            <StatusPanel
              tone="pending"
              title="Not confirmed yet"
              actions={
                <Link href={`/register/status?ref=${flow.reference}`} className={btnPrimary}>
                  Check status
                </Link>
              }
            >
              <p>
                {flow.message} Your registration is{" "}
                <strong className="text-paper">not confirmed</strong> yet. Do not pay again — check
                your status in a few minutes; it updates automatically once Razorpay confirms.
              </p>
              <ReferenceTag reference={flow.reference} />
            </StatusPanel>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-3 border border-fire/50 bg-fire/10 p-4 leading-relaxed text-paper">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-fire" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
