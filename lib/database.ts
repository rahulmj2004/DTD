import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/env";
import type { RegistrationData, RegistrationStatus } from "@/lib/validation";

/** Row shape of public.registrations (see supabase/schema.sql). */
export type RegistrationRow = {
  id: string;
  reference: string;
  full_name: string;
  phone: string;
  email: string;
  organization: string | null;
  vehicle_make: string;
  vehicle_model: string;
  manufacturing_year: number | null;
  engine_cc: number;
  vehicle_number: string;
  rules_accepted_at: string;
  status: RegistrationStatus;
  amount_paise: number;
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

const TABLE = "registrations";
const UNIQUE_VIOLATION = "23505";

let client: SupabaseClient | null = null;

export const isDatabaseConfigured = () => getSupabaseConfig() !== null;

/** Service-role client. Server only; RLS denies the anon and authenticated roles. */
function db(): SupabaseClient {
  if (client) return client;
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  client = createClient(config.url, config.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

const detailColumns = (data: RegistrationData) => ({
  full_name: data.fullName,
  phone: data.phone,
  email: data.email,
  organization: data.organization || null,
  vehicle_make: data.vehicleMake,
  vehicle_model: data.vehicleModel,
  manufacturing_year: data.manufacturingYear,
  engine_cc: data.engineCc,
  vehicle_number: data.vehicleNumber,
  rules_accepted_at: new Date().toISOString(),
});

export async function findByVehicleNumber(vehicleNumber: string): Promise<RegistrationRow | null> {
  const { data, error } = await db().from(TABLE).select("*").eq("vehicle_number", vehicleNumber).maybeSingle<RegistrationRow>();
  if (error) throw new Error(`Registration lookup failed: ${error.message}`);
  return data;
}

export async function findByReference(reference: string): Promise<RegistrationRow | null> {
  const { data, error } = await db().from(TABLE).select("*").eq("reference", reference).maybeSingle<RegistrationRow>();
  if (error) throw new Error(`Registration lookup failed: ${error.message}`);
  return data;
}

export async function findByOrderId(orderId: string): Promise<RegistrationRow | null> {
  const { data, error } = await db().from(TABLE).select("*").eq("razorpay_order_id", orderId).maybeSingle<RegistrationRow>();
  if (error) throw new Error(`Registration lookup failed: ${error.message}`);
  return data;
}

/**
 * Inserts a pending registration. Returns null when another request already
 * holds this vehicle number (unique constraint), so the caller can re-read it.
 */
export async function insertRegistration(
  reference: string,
  data: RegistrationData,
  amountPaise: number,
): Promise<RegistrationRow | null> {
  const { data: row, error } = await db()
    .from(TABLE)
    .insert({ reference, ...detailColumns(data), status: "pending", amount_paise: amountPaise, currency: "INR" })
    .select("*")
    .single<RegistrationRow>();
  if (error) {
    if (error.code === UNIQUE_VIOLATION) return null;
    throw new Error(`Could not save registration: ${error.message}`);
  }
  return row;
}

/** Refreshes an unpaid registration for a retry. Never touches a paid row. */
export async function reopenRegistration(id: string, data: RegistrationData): Promise<RegistrationRow | null> {
  const { data: row, error } = await db()
    .from(TABLE)
    .update({ ...detailColumns(data), status: "pending" })
    .eq("id", id)
    .neq("status", "paid")
    .select("*")
    .maybeSingle<RegistrationRow>();
  if (error) throw new Error(`Could not update registration: ${error.message}`);
  return row;
}

export async function attachOrder(id: string, orderId: string): Promise<void> {
  const { error } = await db().from(TABLE).update({ razorpay_order_id: orderId }).eq("id", id).neq("status", "paid");
  if (error) throw new Error(`Could not attach payment order: ${error.message}`);
}

/**
 * Marks the registration for this order as paid. Idempotent: the update only
 * matches unpaid rows, so repeated verify/webhook calls change nothing.
 */
export async function markPaid(orderId: string, paymentId: string): Promise<RegistrationRow | null> {
  const { data, error } = await db()
    .from(TABLE)
    .update({ status: "paid", razorpay_payment_id: paymentId, paid_at: new Date().toISOString() })
    .eq("razorpay_order_id", orderId)
    .neq("status", "paid")
    .select("*")
    .maybeSingle<RegistrationRow>();
  if (error) throw new Error(`Could not record payment: ${error.message}`);
  return data ?? (await findByOrderId(orderId));
}

/** Records a failed or cancelled attempt. Only ever moves a pending row. */
export async function markUnpaid(
  orderId: string,
  status: Extract<RegistrationStatus, "failed" | "cancelled">,
  reference?: string,
): Promise<void> {
  let query = db().from(TABLE).update({ status }).eq("razorpay_order_id", orderId).eq("status", "pending");
  if (reference) query = query.eq("reference", reference);
  const { error } = await query;
  if (error) throw new Error(`Could not update payment status: ${error.message}`);
}
