import { createHash } from "node:crypto";

export function normalizeAudienceEmails(emails: string[]) {
  return [...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))].sort();
}

export function audienceFingerprint(emails: string[]) {
  return createHash("sha256").update(normalizeAudienceEmails(emails).join("\n")).digest("hex");
}

export function audienceMatchesPreparedSnapshot(
  preparedFingerprint: string | null | undefined,
  currentEmails: string[],
) {
  if (!preparedFingerprint) return false;
  return audienceFingerprint(currentEmails) === preparedFingerprint;
}
