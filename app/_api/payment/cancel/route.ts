import { isDatabaseConfigured, markUnpaid } from "@/lib/database";
import { jsonError } from "@/lib/registration";
import { paymentAbandonSchema } from "@/lib/validation";

/**
 * Records that the buyer closed the checkout or the attempt failed.
 * It can only move a *pending* row to cancelled/failed — never affect a paid one.
 */
export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return jsonError(503, "registration_unavailable", "Registration is not activated.");

  const parsed = paymentAbandonSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "invalid_request", "Malformed request.");

  try {
    await markUnpaid(parsed.data.orderId, parsed.data.outcome, parsed.data.reference);
    return Response.json({ state: "recorded" });
  } catch (error) {
    console.error("[payment/cancel]", error);
    return jsonError(500, "server_error", "Could not record the payment status.");
  }
}
