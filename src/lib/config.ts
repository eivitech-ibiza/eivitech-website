export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() ?? "";

export const CLERK_ENABLED = CLERK_PUBLISHABLE_KEY.startsWith("pk_");

export const ALLOWED_ADMIN_EMAILS = [
  "lncoachmrc@gmail.com",
  "info@eivitech.com",
];

export const hasClientAdminAccess = (email?: string | null) => {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase());
};
