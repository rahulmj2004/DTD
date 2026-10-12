import "server-only";

import { markPaid, type RegistrationRow } from "@/lib/database";
import { fetchOrderPayments, isPaymentConfigured, isSettledPayment } from "@/lib/payment";
import type { RegistrationSummary } from "@/lib/validation";

/**
 * Asks Razorpay whether an unpaid registration's order has since been paid
 * (e.g. the buyer closed the tab before the browser could call /verify) and
 * records it if so. Razorpay stays the source of truth; nothing is assumed.
 */
export async function reconcile(row: RegistrationRow): Promise<RegistrationRow> {
  if (row.status === "paid" || !row.razorpay_order_id || !isPaymentConfigured()) return row;
  const orderId = row.razorpay_order_id;
  const payments = await fetchOrderPayments(orderId);
  const settled = payments.find((payment) => isSettledPayment(payment, orderId, row.amount_paise));
  if (!settled) return row;
  return (await markPaid(orderId, settled.id)) ?? row;
}

export const toSummary = (row: RegistrationRow): RegistrationSummary => ({
  reference: row.reference,
  status: row.status,
  vehicle: `${row.vehicle_make} ${row.vehicle_model}`,
  amount: row.amount_paise / 100,
  paidAt: row.paid_at,
});

export function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return Response.json({ state: "error", code, message, ...extra }, { status });
}
