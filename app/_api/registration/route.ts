import type { StatusResponse } from "@/lib/api-types";
import { findByReference, isDatabaseConfigured } from "@/lib/database";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { jsonError, reconcile, toSummary } from "@/lib/registration";
import { referenceSchema } from "@/lib/validation";

/** Status lookup by reference. Returns no contact details. */
export async function GET(request: Request) {
  if (!rateLimit(`status:${clientKey(request)}`, 30, 10 * 60_000)) {
    return jsonError(429, "rate_limited", "Too many lookups. Please wait a few minutes.");
  }

  const parsed = referenceSchema.safeParse(new URL(request.url).searchParams.get("ref") ?? "");
  if (!parsed.success) {
    return jsonError(400, "invalid_reference", "Enter a reference in the form DTD-XXXXXXXX.");
  }
  if (!isDatabaseConfigured()) {
    return jsonError(503, "registration_unavailable", "Online registration is not activated yet.");
  }

  try {
    const row = await findByReference(parsed.data);
    if (!row) return jsonError(404, "not_found", "No registration found for that reference.");
    const current = await reconcile(row);
    return Response.json({ state: "found", registration: toSummary(current) } satisfies StatusResponse, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[registration]", error);
    return jsonError(500, "server_error", "Could not look up that registration right now.");
  }
}
