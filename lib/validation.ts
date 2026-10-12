import { z } from "zod";
import { EVENT } from "@/lib/event";

/** Strips spaces, dashes and a leading +91/0 so "+91 98470 12345" → "9847012345". */
export const normalizePhone = (value: string) =>
  value.replace(/[\s()-]/g, "").replace(/^(\+91|0091|91(?=\d{10}$)|0(?=\d{10}$))/, "");

/** "kl 08 ab 1234" → "KL08AB1234". */
export const normalizeVehicleNumber = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

// State series (KL08AB1234) and Bharat series (22BH1234AA).
const VEHICLE_NUMBER = /^(?:[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}|\d{2}BH\d{4}[A-Z]{1,2})$/;

const text = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, min === 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

/**
 * Shared by the browser form and the API route. Inputs are the raw strings an
 * HTML form produces; outputs are normalized, typed values.
 */
export const registrationSchema = z.object({
  fullName: text("Full name", 2, 80),
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number.")),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.").max(254)),
  organization: z.string().trim().max(120, "Keep this under 120 characters.").optional().default(""),
  vehicleMake: text("Vehicle make", 1, 40),
  vehicleModel: text("Vehicle model", 1, 60),
  manufacturingYear: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((value) => {
      if (value === "") return true;
      const year = Number(value);
      return /^\d{4}$/.test(value) && year >= 1950 && year <= new Date().getFullYear() + 1;
    }, "Enter a valid four-digit year.")
    .transform((value) => (value === "" ? null : Number(value))),
  engineCc: z
    .string()
    .trim()
    .min(1, "Engine capacity is required.")
    .regex(/^\d{2,4}$/, "Enter the engine capacity in cc, numbers only.")
    .transform(Number)
    .pipe(
      z
        .number()
        .min(50, "Enter a valid engine capacity.")
        .max(EVENT.maxEngineCc, `Only cars up to ${EVENT.maxEngineCc} cc are allowed.`),
    ),
  vehicleNumber: z
    .string()
    .transform(normalizeVehicleNumber)
    .pipe(z.string().regex(VEHICLE_NUMBER, "Enter a valid registration number, e.g. KL 08 AB 1234.")),
  acceptRules: z.boolean().refine((value) => value, "You must read and accept the rules to register."),
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;

export const referenceSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^DTD-[A-Z0-9]{8}$/, "References look like DTD-XXXXXXXX.");

export const paymentVerificationSchema = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

export const paymentAbandonSchema = z.object({
  reference: referenceSchema,
  orderId: z.string().min(1).max(64),
  outcome: z.enum(["cancelled", "failed"]),
});

export type RegistrationStatus = "pending" | "paid" | "failed" | "cancelled";

/** Shape returned by GET /api/registration. Deliberately free of contact details. */
export type RegistrationSummary = {
  reference: string;
  status: RegistrationStatus;
  vehicle: string;
  amount: number;
  paidAt: string | null;
};
