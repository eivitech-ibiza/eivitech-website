export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

export const CLERK_ENABLED = CLERK_PUBLISHABLE_KEY.startsWith("pk_");

export const ALLOWED_ADMIN_EMAILS = (import.meta.env.VITE_ALLOWED_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const hasClientAdminAccess = (email?: string | null) => {
  if (!email) return false;
  if (ALLOWED_ADMIN_EMAILS.length === 0) return true;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase());
};
