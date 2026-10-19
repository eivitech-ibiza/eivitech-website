/**
 * The CRM currently admits only these two verified owner accounts through
 * Clerk + requireCrmUser. Their destructive access must not depend on an
 * outdated role value in a pre-existing crm_users row.
 *
 * For future CRM users, the admin role still grants this capability.
 */
const deletionOwnerEmails = new Set([
  "lncoachmrc@gmail.com",
  "info@eivitech.com",
]);

export function canDeleteCrmLead(user: {
  email?: string | null;
  role?: string | null;
  active?: boolean;
} | null | undefined): boolean {
  if (!user || user.active === false) return false;
  return user.role === "admin"
    || deletionOwnerEmails.has(user.email?.trim().toLowerCase() || "");
}
