import "server-only";

/** Server-side configuration. Secrets never leave this module's callers. */

export type SupabaseConfig = { url: string; serviceRoleKey: string };
export type RazorpayConfig = { keyId: string; keySecret: string; webhookSecret: string | null };

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceRoleKey ? { url, serviceRoleKey } : null;
}

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret, webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || null };
}
