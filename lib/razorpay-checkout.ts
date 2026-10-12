/** Minimal browser-side typing and loader for Razorpay Standard Checkout. */

export type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = { error?: { description?: string; reason?: string } };

export type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: RazorpayFailure) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SRC = "https://checkout.razorpay.com/v1/checkout.js";
let loading: Promise<void> | null = null;

/** Loads checkout.js once, on demand, so it never weighs on the landing page. */
export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("Could not load the payment window."));
    };
    document.head.appendChild(script);
  });
  return loading;
}
