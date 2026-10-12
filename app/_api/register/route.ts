import { connection } from "next/server";
import type { RegisterResponse, RegistrationConfig } from "@/lib/api-types";
import {
  attachOrder,
  findByVehicleNumber,
  insertRegistration,
  isDatabaseConfigured,
  reopenRegistration,
  type RegistrationRow,
} from "@/lib/database";
import { getRazorpayConfig } from "@/lib/env";
import { CURRENCY, REGISTRATION_FEE_PAISE, createOrder, generateReference } from "@/lib/payment";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { jsonError, reconcile, toSummary } from "@/lib/registration";
import { registrationSchema } from "@/lib/validation";

/** Tells the form which parts of the flow are switched on. No secrets. */
export async function GET() {
  await connection();
  const config: RegistrationConfig = {
    registration: isDatabaseConfigured(),
    payments: getRazorpayConfig() !== null,
  };
  return Response.json(config, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!rateLimit(`register:${clientKey(request)}`, 8, 10 * 60_000)) {
    return jsonError(429, "rate_limited", "Too many attempts. Please wait a few minutes and try again.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "The request could not be read.");
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    return jsonError(422, "validation_failed", "Some details need attention.", { fieldErrors });
  }
  const data = parsed.data;

  if (!isDatabaseConfigured()) {
    return jsonError(
      503,
      "registration_unavailable",
      "Online registration is not activated yet. Nothing was saved and no payment was taken — please contact the event coordinators.",
    );
  }

  try {
    // One registration per vehicle. The unique constraint settles races:
    // a losing concurrent insert returns null and we re-read the winner.
    let row: RegistrationRow | null = await findByVehicleNumber(data.vehicleNumber);
    if (!row) {
      row =
        (await insertRegistration(generateReference(), data, REGISTRATION_FEE_PAISE)) ??
        (await findByVehicleNumber(data.vehicleNumber));
      if (!row) throw new Error("Registration vanished after a unique-constraint conflict.");
    }

    if (row.status !== "paid") row = await reconcile(row);

    if (row.status === "paid") {
      // Only the original registrant learns the reference.
      if (row.phone !== data.phone) {
        return jsonError(409, "vehicle_registered", "This vehicle is already registered for DTD.");
      }
      return Response.json({ state: "paid", registration: toSummary(row) } satisfies RegisterResponse);
    }

    if (row.phone !== data.phone) {
      return jsonError(
        409,
        "vehicle_in_progress",
        "A registration for this vehicle was already started with a different phone number. Please contact the event coordinators.",
      );
    }

    // Same person retrying: refresh details and reuse the same unpaid row.
    row = (await reopenRegistration(row.id, data)) ?? row;

    const razorpay = getRazorpayConfig();
    if (!razorpay) {
      return Response.json(
        { state: "payment_unavailable", reference: row.reference } satisfies RegisterResponse,
        { status: 202 },
      );
    }

    // Reuse the existing unpaid order so a retry can never create a second charge path.
    let orderId = row.razorpay_order_id;
    if (!orderId) {
      const order = await createOrder(row.reference);
      await attachOrder(row.id, order.id);
      orderId = order.id;
    }

    return Response.json({
      state: "checkout",
      reference: row.reference,
      orderId,
      keyId: razorpay.keyId,
      amount: row.amount_paise,
      currency: CURRENCY,
      prefill: { name: row.full_name, email: row.email, contact: `+91${row.phone}` },
    } satisfies RegisterResponse);
  } catch (error) {
    console.error("[register]", error);
    return jsonError(500, "server_error", "We couldn't start your registration. No payment was taken — please try again.");
  }
}
