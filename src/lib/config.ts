export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

export const CLERK_ENABLED = CLERK_PUBLISHABLE_KEY.startsWith("pk_");

const APPROVED_ADMIN_EMAILS = new Set([
  "lncoachmrc@gmail.com",
  "info@eivitech.com",
]);

const configuredAdminEmails = (import.meta.env.VITE_ALLOWED_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const ALLOWED_ADMIN_EMAILS = configuredAdminEmails.length > 0
  ? configuredAdminEmails.filter((email) => APPROVED_ADMIN_EMAILS.has(email))
  : [...APPROVED_ADMIN_EMAILS];

export const hasClientAdminAccess = (email?: string | null) => {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase());
};
