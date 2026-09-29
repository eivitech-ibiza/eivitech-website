import { createHash } from "node:crypto";

function canonicalize(value: unknown, key = ""): unknown {
  if (key === "timestamp" || key === "ts") return undefined;
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([childKey]) => childKey !== "timestamp" && childKey !== "ts")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([childKey, childValue]) => [childKey, canonicalize(childValue, childKey)])
    );
  }
  if (key === "email" && typeof value === "string") return value.trim().toLowerCase();
  if (typeof value === "string") return value.trim();
  return value;
}

export function buildLeadSubmissionFingerprint(input: Record<string, unknown>) {
  const canonical = canonicalize(input);
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function isPgUniqueViolation(error: unknown): error is { code: string } {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "23505");
}

export function sanitizeAttributionValue(value: string | undefined, maxLength: number) {
  if (!value) return null;
  const trimmed = value.trim().slice(0, maxLength);
  if (!trimmed) return null;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  if (/^\+?[\d\s().-]{9,}$/.test(trimmed)) return null;
  return trimmed;
}

export function sanitizeLandingPage(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, "https://eivitech.com");
    const language = url.searchParams.get("lang");
    const safeLanguage = language && ["es", "it", "en", "nl"].includes(language) ? `?lang=${language}` : "";
    return `${url.pathname.slice(0, 260)}${safeLanguage}`;
  } catch {
    return null;
  }
}

export function sanitizeReferrer(value: string | undefined) {
  if (!value) return null;
  if (value === "direct") return "direct";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return null;
  }
}
