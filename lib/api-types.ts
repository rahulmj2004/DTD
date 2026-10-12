import type { RegistrationSummary } from "@/lib/validation";

/** Wire types shared by the API routes and the registration UI. */

export type ApiError = {
  state: "error";
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type RegistrationConfig = { registration: boolean; payments: boolean };

export type RegisterResponse =
  | {
      state: "checkout";
      reference: string;
      orderId: string;
      keyId: string;
      amount: number;
      currency: string;
      prefill: { name: string; email: string; contact: string };
    }
  /** Saved, but online payment is not switched on. Not a confirmed entry. */
  | { state: "payment_unavailable"; reference: string }
  /** This vehicle's fee was already verified earlier. */
  | { state: "paid"; registration: RegistrationSummary }
  | ApiError;

export type VerifyResponse =
  | { state: "paid"; registration: RegistrationSummary }
  /** Signature is valid but Razorpay has not captured the money yet. */
  | { state: "processing"; reference: string }
  | ApiError;

export type StatusResponse = { state: "found"; registration: RegistrationSummary } | ApiError;
