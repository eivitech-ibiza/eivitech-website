import { z } from "zod";

const contactStatus = z.enum(["pending", "subscribed", "unsubscribed", "suppressed"]);
const language = z.enum(["es", "it", "en", "nl"]);

export const contactDirectoryQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
  status: contactStatus.optional(),
  language: language.optional(),
  contact_type: z.string().trim().max(80).optional(),
  tag: z.string().trim().max(80).optional(),
  priority: z.enum(["A", "A1", "A2", "B", "C"]).optional(),
  consent: z.enum(["true", "false"]).optional(),
  membership: z.enum(["all", "assigned", "unassigned"]).default("all"),
  segment_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).max(1000000).default(0),
});

export type ContactDirectoryQuery = z.infer<typeof contactDirectoryQuerySchema>;

export function buildContactDirectoryWhere(filters: ContactDirectoryQuery) {
  const conditions: string[] = [];
  const params: unknown[] = [];
  const param = (value: unknown) => {
    params.push(value);
    return "$" + params.length;
  };

  if (filters.search) {
    conditions.push("concat_ws(' ', c.email, c.first_name, c.last_name, c.phone, c.contact_type) ILIKE " + param("%" + filters.search + "%"));
  }
  if (filters.status) conditions.push("c.status = " + param(filters.status));
  if (filters.language) conditions.push("c.language = " + param(filters.language));
  if (filters.contact_type) conditions.push("c.contact_type ILIKE " + param("%" + filters.contact_type + "%"));
  if (filters.tag) conditions.push("c.tags ? " + param(filters.tag));
  if (filters.priority) conditions.push("c.tags ? " + param(filters.priority === "A1" || filters.priority === "A2" ? "subpriorita:" + filters.priority : "priorita:" + filters.priority));
  if (filters.consent) conditions.push("c.marketing_consent = " + param(filters.consent === "true"));
  if (filters.segment_id) {
    conditions.push("EXISTS (SELECT 1 FROM crm_marketing_segment_members m WHERE m.contact_id = c.id AND m.segment_id = " + param(filters.segment_id) + ")");
  }
  if (filters.membership === "assigned") {
    conditions.push("EXISTS (SELECT 1 FROM crm_marketing_segment_members m WHERE m.contact_id = c.id)");
  } else if (filters.membership === "unassigned") {
    conditions.push("NOT EXISTS (SELECT 1 FROM crm_marketing_segment_members m WHERE m.contact_id = c.id)");
  }

  return { where: conditions.length ? "WHERE " + conditions.join(" AND ") : "", params };
}
