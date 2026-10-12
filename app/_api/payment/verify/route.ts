import type { VerifyResponse } from "@/lib/api-types";
import { findByOrderId, isDatabaseConfigured, markPaid } from "@/lib/database";
import { fetchPayment, isPaymentConfigured, isSettledPayment, verifyCheckoutSignature } from "@/lib/payment";
import { jsonError, toSummary } from "@/lib/registration";
import { paymentVerificationSchema } from "@/lib/validation";

/**
 * Confirms a registration. Three independent checks must all pass:
 *   1. the checkout signature (proves Razorpay issued this order/payment pair),
 *   2. the order belongs to a registration we created,
 *   3. Razorpay itself reports the payment captured for the full fee.
 * Nothing the browser claims is trusted on its own.
 */
export async function POST(request: Request) {
  if (!isDatabaseConfigured() || !isPaymentConfigured()) {
    return jsonError(503, "payments_unavailable", "Online payment is not activated.");
  }

  const parsed = paymentVerificationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(400, "invalid_request", "Payment details are missing or malformed.");
  }
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = parsed.data;

  if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
    return jsonError(400, "invalid_signature", "Payment verification failed. Your registration is not confirmed.");
  }

  try {
    const registration = await findByOrderId(orderId);
    if (!registration) {
      return jsonError(404, "unknown_order", "No registration matches this payment.");
    }

    if (registration.status === "paid") {
      return Response.json({ state: "paid", registration: toSummary(registration) } satisfies VerifyResponse);
    }

    const payment = await fetchPayment(paymentId);
    if (payment.order_id !== orderId || payment.status === "failed") {
      return jsonError(402, "payment_not_completed", "The payment was not completed. Your registration is not confirmed.");
    }
    if (!isSettledPayment(payment, orderId, registration.amount_paise)) {
      // Authorized but not captured yet, or an unexpected amount: stay pending.
      return Response.json(
        { state: "processing", reference: registration.reference } satisfies VerifyResponse,
        { status: 202 },
      );
    }

    const paid = await markPaid(orderId, paymentId);
    if (!paid || paid.status !== "paid") throw new Error("Paid update did not persist.");
    return Response.json({ state: "paid", registration: toSummary(paid) } satisfies VerifyResponse);
  } catch (error) {
    console.error("[payment/verify]", error);
    return jsonError(
      500,
      "server_error",
      "We couldn't confirm the payment right now. If money was debited, check your status with your reference — it will update automatically.",
    );
  }
}
