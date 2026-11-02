import { site } from "@/lib/site";

/**
 * The few values the launcher and the WhatsApp button need. Kept apart from
 * `engine.ts` so the always-loaded launchers never pull in the site content
 * the assistant answers from.
 */

export const ASSISTANT_NAME = "Setuware Assistant";

export const WHATSAPP_MESSAGE =
  "Hello Setuware Technologies, I'd like to discuss a project.";

export const whatsappHref = `${site.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

/** Mon–Sat, 10:00–19:00 IST, matching `site.hours`. */
export function isWithinHours(now: Date = new Date()): boolean {
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60_000);
  const day = ist.getDay();
  const hour = ist.getHours();
  return day !== 0 && hour >= 10 && hour < 19;
}
