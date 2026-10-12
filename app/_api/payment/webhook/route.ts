import { findByOrderId, isDatabaseConfigured, markPaid, markUnpaid } from "@/lib/database";
import { isSettledPayment, verifyWebhookSignature, type RazorpayPayment } from "@/lib/payment";

type WebhookEvent = {
  event?: string;
  payload?: { payment?: { entity?: RazorpayPayment } };
};

/**
 * Razorpay → server confirmation, independent of the buyer's browser.
 * Configure in the Razorpay dashboard for payment.captured and payment.failed.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!isDatabaseConfigured() || !verifyWebhookSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return new Response("Malformed payload", { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  if (!payment || !orderId) return Response.json({ received: true });

  try {
    const registration = await findByOrderId(orderId);
    if (!registration) return Response.json({ received: true });

    if (event.event === "payment.captured" && isSettledPayment(payment, orderId, registration.amount_paise)) {
      await markPaid(orderId, payment.id);
    } else if (event.event === "payment.failed") {
      await markUnpaid(orderId, "failed");
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error("[payment/webhook]", error);
    // Non-2xx makes Razorpay retry the delivery.
    return new Response("Temporary failure", { status: 500 });
  }
}
