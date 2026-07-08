import { z } from "zod";

export const emailSchema = z.email();
export const optionalEmailSchema = z.union([z.literal(""), emailSchema]);

/** Adds a default https:// scheme to bare domains; leaves any already-schemed value (http://, javascript:, data:, ...) untouched so the downstream protocol check can reject it. */
function withDefaultScheme(v: string): string {
  if (v === "") return v;
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(v);
  return hasScheme ? v : `https://${v}`;
}

const httpUrl = z.url({ protocol: /^https?$/ });

/** http(s)-only URL; empty string passes since these fields are optional. Bare domains (no scheme) are coerced to https://. */
export const httpUrlSchema = z
  .string()
  .trim()
  .transform(withDefaultScheme)
  .pipe(z.union([z.literal(""), httpUrl]));

export function isValidEmail(v: string): boolean {
  return emailSchema.safeParse(v).success;
}

export function isValidOptionalEmail(v: string): boolean {
  return optionalEmailSchema.safeParse(v).success;
}

export function isValidHttpUrl(v: string): boolean {
  return httpUrlSchema.safeParse(v).success;
}

const httpsUrl = z.url({ protocol: /^https$/ });

/** https-only URL (for fields like logoUrl that the backend requires HTTPS for); empty string passes since optional. */
export const httpsUrlSchema = z
  .string()
  .trim()
  .transform(withDefaultScheme)
  .pipe(z.union([z.literal(""), httpsUrl]));

export function isValidHttpsUrl(v: string): boolean {
  return httpsUrlSchema.safeParse(v).success;
}

/** Render-time guard for href/src sinks — returns null (render plain text, not a link) unless the value is a real http(s) URL. */
export function toSafeHref(v: string | null | undefined): string | null {
  if (!v) return null;
  const r = httpUrlSchema.safeParse(v);
  return r.success && r.data !== "" ? r.data : null;
}

/** Render-time guard for img src sinks that must be HTTPS (e.g. logoUrl) — returns null unless the value is a real https:// URL. */
export function toSafeHttpsSrc(v: string | null | undefined): string | null {
  if (!v) return null;
  const r = httpsUrlSchema.safeParse(v);
  return r.success && r.data !== "" ? r.data : null;
}
