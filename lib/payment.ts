import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getRazorpayConfig, type RazorpayConfig } from "@/lib/env";
import { EVENT } from "@/lib/event";

export const REGISTRATION_FEE_PAISE = EVENT.entryFee * 100;
export const CURRENCY = "INR";

// Overridable only so integration tests can point at a mock; leave unset in production.
const API = process.env.RAZORPAY_API_BASE || "https://api.razorpay.com/v1";
// No 0/O or 1/I, so references survive being read out over the phone.
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export type RazorpayOrder = {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  receipt: string | null;
  status: "created" | "attempted" | "paid";
};

export type RazorpayPayment = {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
};

export const isPaymentConfigured = () => getRazorpayConfig() !== null;

export function generateReference(): string {
  const bytes = randomBytes(8);
  let code = "";
  for (const byte of bytes) code += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  return `DTD-${code}`;
}

function requireConfig(): RazorpayConfig {
  const config = getRazorpayConfig();
  if (!config) throw new Error("Razorpay is not configured.");
  return config;
}

async function razorpay<T>(path: string, init?: { method: "POST"; body: unknown }): Promise<T> {
  const { keyId, keySecret } = requireConfig();
  const response = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: init ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Razorpay ${path} responded ${response.status}`);
  }
  return (await response.json()) as T;
}

/** Creates the server-side order the browser checkout must pay against. */
export function createOrder(reference: string): Promise<RazorpayOrder> {
  return razorpay<RazorpayOrder>("/orders", {
    method: "POST",
    body: {
      amount: REGISTRATION_FEE_PAISE,
      currency: CURRENCY,
      receipt: reference,
      payment_capture: 1,
      notes: { reference, event: EVENT.name },
    },
  });
}

export const fetchOrder = (orderId: string) =>
  razorpay<RazorpayOrder>(`/orders/${encodeURIComponent(orderId)}`);

export const fetchPayment = (paymentId: string) =>
  razorpay<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);

export async function fetchOrderPayments(orderId: string): Promise<RazorpayPayment[]> {
  const result = await razorpay<{ items: RazorpayPayment[] }>(
    `/orders/${encodeURIComponent(orderId)}/payments`,
  );
  return result.items;
}

function safeEqualHex(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}

/** Checkout callback signature: HMAC-SHA256(order_id|payment_id, key secret). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac("sha256", requireConfig().keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

/** Webhook signature: HMAC-SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = getRazorpayConfig()?.webhookSecret;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/** A payment counts only if it is captured, for this order, for the full fee. */
export function isSettledPayment(payment: RazorpayPayment, orderId: string, amountPaise: number): boolean {
  return (
    payment.status === "captured" &&
    payment.order_id === orderId &&
    payment.amount === amountPaise &&
    payment.currency === CURRENCY
  );
}
