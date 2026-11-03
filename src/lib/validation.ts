import { z } from "zod";

import { isBookableSlot } from "./booking";
import {
  FEATURE_RATES,
  SCOPE_LIMITS,
  SERVICE_RATES,
  type FeatureKey,
  type ServiceKey,
} from "./pricing";

/**
 * Schemas are shared by the client forms and the route handlers so a field can
 * never be validated in one place and trusted in the other.
 */

const trimmed = (max: number) => z.string().trim().max(max);

/** Catches the most common copy-paste mistakes before a real send attempt. */
export const emailSchema = trimmed(254)
  .min(5, "Enter your email address")
  .email("That email address looks incomplete")
  .transform((value) => value.toLowerCase())
  .refine((value) => !value.endsWith(".con"), {
    message: "Did you mean .com?",
  });

/** Optional, but if present must look like a dialable number. */
export const phoneSchema = trimmed(24)
  .regex(/^[+]?[\d\s()-]{7,}$/, "Enter a valid phone number")
  .optional()
  .or(z.literal(""));

export const contactSchema = z.object({
  name: trimmed(80).min(2, "Tell us your name"),
  email: emailSchema,
  company: trimmed(120).optional().or(z.literal("")),
  phone: phoneSchema,
  budget: z
    .enum(["under-1l", "1l-5l", "5l-15l", "15l-plus", "not-sure"])
    .optional(),
  service: z.string().trim().max(60).optional(),
  message: trimmed(4000).min(10, "A sentence or two about the project helps"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please accept the privacy policy" }),
  }),
  /** Hidden field: bots fill it, humans never see it. */
  honeypot: z.string().max(0).optional().or(z.literal("")),
  /** Milliseconds between form mount and submit; sub-second submits are bots. */
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: emailSchema,
  source: z.string().trim().max(60).optional(),
  honeypot: z.string().max(0).optional().or(z.literal("")),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// Cast to a non-empty tuple of the literal union so `z.infer` yields
// `ServiceKey`/`FeatureKey` rather than a widened `string`.
const serviceKeys = Object.keys(SERVICE_RATES) as [ServiceKey, ...ServiceKey[]];
const featureKeys = Object.keys(FEATURE_RATES) as [FeatureKey, ...FeatureKey[]];

export const estimateInputSchema = z.object({
  service: z.enum(serviceKeys),
  scope: z.coerce.number().int().min(SCOPE_LIMITS.min).max(SCOPE_LIMITS.max),
  design: z.enum(["starter", "custom", "premium"]),
  features: z.array(z.enum(featureKeys)).max(featureKeys.length).default([]),
  timeline: z.enum(["relaxed", "standard", "accelerated"]),
  platforms: z.array(z.enum(["web", "ios", "android"])).max(3).default(["web"]),
  retainer: z.boolean().default(false),
});

export const estimateRequestSchema = z.object({
  input: estimateInputSchema,
  email: emailSchema,
  name: trimmed(80).min(2, "Tell us your name"),
  phone: phoneSchema,
  notes: trimmed(2000).optional().or(z.literal("")),
  honeypot: z.string().max(0).optional().or(z.literal("")),
});

export type EstimateRequestInput = z.infer<typeof estimateRequestSchema>;

export const bookingSchema = z.object({
  slot: z.string().refine((value) => isBookableSlot(value), {
    message: "That time is no longer available. Please pick another slot.",
  }),
  mode: z.enum(["video", "phone"]),
  name: trimmed(80).min(2, "Tell us your name"),
  email: emailSchema,
  phone: trimmed(24).regex(/^[+]?[\d\s()-]{7,}$/, "Enter a phone number we can call"),
  topic: z.string().trim().max(60).optional().or(z.literal("")),
  notes: trimmed(1000).optional().or(z.literal("")),
  honeypot: z.string().max(0).optional().or(z.literal("")),
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/** Flattens a ZodError into `{ field: message }` for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!(key in result)) result[key] = issue.message;
  }
  return result;
}
