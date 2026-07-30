import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { pool, query } from "./db.js";

const languageSchema = z.enum(["es", "it", "en", "nl"]);
const contactStatusSchema = z.enum(["pending", "subscribed", "unsubscribed", "suppressed"]);
const campaignStatusSchema = z.enum(["draft", "scheduled", "sending", "sent", "paused", "cancelled", "failed"]);

const optionalText = (max: number) => z.string().trim().max(max).optional().nullable().or(z.literal(""));

const contactSchema = z.object({
  email: z.string().trim().email().max(254),
  first_name: optionalText(120),
  last_name: optionalText(120),
  phone: optionalText(60),
  address: optionalText(500),
  region: optionalText(120),
  country_code: optionalText(10),
  language: languageSchema.optional().nullable(),
  contact_type: optionalText(80),
  source: optionalText(120),
  source_file: optionalText(255),
  status: contactStatusSchema.optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  marketing_consent: z.boolean().optional(),
  consent_source: optionalText(160),
  consent_at: z.string().datetime().optional().nullable(),
  suppression_reason: optionalText(300),
});

const contactUpdateSchema = contactSchema.partial();

const importSchema = z.object({
  file_name: optionalText(255),
  contacts: z.array(z.unknown()).min(1).max(1000),
});

const segmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: optionalText(500),
  filters: z.record(z.unknown()).optional(),
});

const segmentMembersSchema = z.object({
  add: z.array(z.string().uuid()).max(1000).optional(),
  remove: z.array(z.string().uuid()).max(1000).optional(),
});

const campaignSchema = z.object({
  name: z.string().trim().min(2).max(160),
  subject: z.string().trim().min(2).max(255),
  preview_text: optionalText(255),
  from_name: optionalText(160),
  from_email: optionalText(254),
  reply_to: optionalText(254),
  language: languageSchema.optional(),
  status: campaignStatusSchema.optional(),
  segment_id: z.string().uuid().optional().nullable(),
  topic: optionalText(160),
  editor_json: z.record(z.unknown()).optional(),
  html: z.string().max(500_000).optional(),
  scheduled_at: z.string().datetime().optional().nullable(),
});

const campaignUpdateSchema = campaignSchema.partial();

function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => unknown): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function cleanText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function normalizeTags(tags?: string[]) {
  const unique = new Map<string, string>();
  for (const tag of tags || []) {
    const value = tag.trim();
    if (value) unique.set(value.toLowerCase(), value);
  }
  return [...unique.values()];
}

function normalizeContact(data: z.infer<typeof contactSchema>) {
  const marketingConsent = Boolean(data.marketing_consent);
  const explicitStatus = data.status;
  const status = explicitStatus === "unsubscribed" || explicitStatus === "suppressed"
    ? explicitStatus
    : marketingConsent
      ? "subscribed"
      : "pending";
  const now = new Date().toISOString();

  return {
    email: data.email.toLowerCase(),
    firstName: cleanText(data.first_name),
    lastName: cleanText(data.last_name),
    phone: cleanText(data.phone),
    address: cleanText(data.address),
    region: cleanText(data.region),
    countryCode: cleanText(data.country_code)?.toLowerCase() || null,
    language: data.language || null,
    contactType: cleanText(data.contact_type),
    source: cleanText(data.source),
    sourceFile: cleanText(data.source_file),
    status,
    tags: normalizeTags(data.tags),
    marketingConsent,
    consentSource: cleanText(data.consent_source),
    consentAt: marketingConsent ? data.consent_at || now : null,
    unsubscribedAt: status === "unsubscribed" ? now : null,
    suppressedAt: status === "suppressed" ? now : null,
    suppressionReason: status === "suppressed" ? cleanText(data.suppression_reason) : null,
  };
}

async function upsertContact(
  data: z.infer<typeof contactSchema>,
  createdBy: string | null,
  eventType: "created" | "updated" | "subscribed" | "unsubscribed" | "suppressed" | "restored" | "imported",
  sourceMetadata: Record<string, unknown> = {},
  client = pool
) {
  const contact = normalizeContact(data);
  const result = await client.query(
    `INSERT INTO crm_marketing_contacts (
       email, first_name, last_name, phone, address, region, country_code, language,
       contact_type, source, source_file, status, tags, marketing_consent, consent_source,
       consent_at, unsubscribed_at, suppressed_at, suppression_reason, created_by
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8,
       $9, $10, $11, $12, $13::jsonb, $14, $15,
       $16, $17, $18, $19, $20
     )
     ON CONFLICT (email) DO UPDATE SET
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       phone = EXCLUDED.phone,
       address = EXCLUDED.address,
       region = EXCLUDED.region,
       country_code = EXCLUDED.country_code,
       language = EXCLUDED.language,
       contact_type = EXCLUDED.contact_type,
       source = COALESCE(EXCLUDED.source, crm_marketing_contacts.source),
       source_file = COALESCE(EXCLUDED.source_file, crm_marketing_contacts.source_file),
       status = EXCLUDED.status,
       tags = EXCLUDED.tags,
       marketing_consent = EXCLUDED.marketing_consent,
       consent_source = EXCLUDED.consent_source,
       consent_at = EXCLUDED.consent_at,
       unsubscribed_at = EXCLUDED.unsubscribed_at,
       suppressed_at = EXCLUDED.suppressed_at,
       suppression_reason = EXCLUDED.suppression_reason,
       updated_at = now()
     RETURNING *, (xmax = 0) AS inserted`,
    [
      contact.email,
      contact.firstName,
      contact.lastName,
      contact.phone,
      contact.address,
      contact.region,
      contact.countryCode,
      contact.language,
      contact.contactType,
      contact.source,
      contact.sourceFile,
      contact.status,
      JSON.stringify(contact.tags),
      contact.marketingConsent,
      contact.consentSource,
      contact.consentAt,
      contact.unsubscribedAt,
      contact.suppressedAt,
      contact.suppressionReason,
      createdBy,
    ]
  );

  const saved = result.rows[0] as { id: string; inserted: boolean };
  await client.query(
    `INSERT INTO crm_marketing_consent_events (contact_id, event_type, source, metadata, created_by)
     VALUES ($1, $2, $3, $4::jsonb, $5)`,
    [saved.id, eventType, contact.consentSource || contact.source, JSON.stringify(sourceMetadata), createdBy]
  );

  return saved;
}

export const marketingRouter = Router();

marketingRouter.get("/stats", asyncRoute(async (_req, res) => {
  const contacts = await query(
    `SELECT
       count(*)::int AS total,
       count(*) FILTER (WHERE status = 'subscribed')::int AS subscribed,
       count(*) FILTER (WHERE status = 'pending')::int AS pending,
       count(*) FILTER (WHERE status = 'unsubscribed')::int AS unsubscribed,
       count(*) FILTER (WHERE status = 'suppressed')::int AS suppressed
     FROM crm_marketing_contacts`
  );
  const campaigns = await query(
    `SELECT
       count(*)::int AS total,
       count(*) FILTER (WHERE status = 'draft')::int AS drafts,
       count(*) FILTER (WHERE status = 'scheduled')::int AS scheduled,
       count(*) FILTER (WHERE status = 'sent')::int AS sent
     FROM crm_marketing_campaigns`
  );
  const segments = await query(`SELECT count(*)::int AS total FROM crm_marketing_segments`);

  res.json({ contacts: contacts.rows[0], campaigns: campaigns.rows[0], segments: segments.rows[0] });
}));

marketingRouter.get("/contacts", asyncRoute(async (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status = contactStatusSchema.safeParse(req.query.status);
  const language = languageSchema.safeParse(req.query.language);
  const segmentId = typeof req.query.segment_id === "string" && z.string().uuid().safeParse(req.query.segment_id).success
    ? req.query.segment_id
    : null;
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`concat_ws(' ', c.email, c.first_name, c.last_name, c.phone, c.contact_type) ILIKE $${params.length}`);
  }
  if (status.success) {
    params.push(status.data);
    conditions.push(`c.status = $${params.length}`);
  }
  if (language.success) {
    params.push(language.data);
    conditions.push(`c.language = $${params.length}`);
  }
  if (segmentId) {
    params.push(segmentId);
    conditions.push(`EXISTS (
      SELECT 1 FROM crm_marketing_segment_members sm
      WHERE sm.contact_id = c.id AND sm.segment_id = $${params.length}
    )`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await query(`SELECT count(*)::int AS total FROM crm_marketing_contacts c ${where}`, params);
  params.push(limit, offset);
  const contacts = await query(
    `SELECT c.*,
       COALESCE(
         jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.id IS NOT NULL),
         '[]'::jsonb
       ) AS segments
     FROM crm_marketing_contacts c
     LEFT JOIN crm_marketing_segment_members sm ON sm.contact_id = c.id
     LEFT JOIN crm_marketing_segments s ON s.id = sm.segment_id
     ${where}
     GROUP BY c.id
     ORDER BY c.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({ contacts: contacts.rows, total: countResult.rows[0]?.total || 0, limit, offset });
}));

marketingRouter.post("/contacts", asyncRoute(async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid marketing contact", details: parsed.error.flatten() });

  const eventType = parsed.data.status === "unsubscribed"
    ? "unsubscribed"
    : parsed.data.status === "suppressed"
      ? "suppressed"
      : parsed.data.marketing_consent
        ? "subscribed"
        : "created";
  const contact = await upsertContact(parsed.data, req.crmUser?.id || null, eventType, { method: "manual" });
  return res.status(201).json({ contact });
}));

marketingRouter.patch("/contacts/:id", asyncRoute(async (req, res) => {
  const parsed = contactUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid marketing contact update", details: parsed.error.flatten() });

  const current = await query(`SELECT * FROM crm_marketing_contacts WHERE id = $1`, [req.params.id]);
  if (current.rows.length === 0) return res.status(404).json({ error: "Marketing contact not found" });

  const existing = current.rows[0] as Record<string, unknown>;
  const merged = contactSchema.parse({
    email: parsed.data.email ?? existing.email,
    first_name: parsed.data.first_name ?? existing.first_name,
    last_name: parsed.data.last_name ?? existing.last_name,
    phone: parsed.data.phone ?? existing.phone,
    address: parsed.data.address ?? existing.address,
    region: parsed.data.region ?? existing.region,
    country_code: parsed.data.country_code ?? existing.country_code,
    language: parsed.data.language ?? existing.language,
    contact_type: parsed.data.contact_type ?? existing.contact_type,
    source: parsed.data.source ?? existing.source,
    source_file: parsed.data.source_file ?? existing.source_file,
    status: parsed.data.status ?? existing.status,
    tags: parsed.data.tags ?? existing.tags,
    marketing_consent: parsed.data.marketing_consent ?? existing.marketing_consent,
    consent_source: parsed.data.consent_source ?? existing.consent_source,
    consent_at: parsed.data.consent_at ?? existing.consent_at,
    suppression_reason: parsed.data.suppression_reason ?? existing.suppression_reason,
  });

  const eventType = merged.status === "unsubscribed"
    ? "unsubscribed"
    : merged.status === "suppressed"
      ? "suppressed"
      : existing.status === "unsubscribed" || existing.status === "suppressed"
        ? "restored"
        : merged.marketing_consent
          ? "subscribed"
          : "updated";
  const contact = await upsertContact(merged, req.crmUser?.id || null, eventType, { method: "manual-update", contactId: req.params.id });
  return res.json({ contact });
}));

marketingRouter.post("/contacts/import", asyncRoute(async (req, res) => {
  const parsed = importSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid contact import", details: parsed.error.flatten() });

  const client = await pool.connect();
  const errors: { row: number; email?: string; message: string }[] = [];
  let inserted = 0;
  let updated = 0;

  try {
    await client.query("BEGIN");

    for (let index = 0; index < parsed.data.contacts.length; index += 1) {
      const row = contactSchema.safeParse(parsed.data.contacts[index]);
      if (!row.success) {
        const candidate = parsed.data.contacts[index] as { email?: unknown } | null;
        errors.push({
          row: index + 2,
          email: typeof candidate?.email === "string" ? candidate.email : undefined,
          message: row.error.issues.map((issue) => issue.message).join("; "),
        });
        continue;
      }

      const saved = await upsertContact(
        { ...row.data, source_file: row.data.source_file || parsed.data.file_name || undefined },
        req.crmUser?.id || null,
        "imported",
        { method: "csv-import", row: index + 2, fileName: parsed.data.file_name || null },
        client
      );
      if (saved.inserted) inserted += 1;
      else updated += 1;
    }

    const job = await client.query(
      `INSERT INTO crm_marketing_import_jobs (
         file_name, total_rows, inserted_rows, updated_rows, skipped_rows, errors, imported_by
       ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       RETURNING *`,
      [
        cleanText(parsed.data.file_name),
        parsed.data.contacts.length,
        inserted,
        updated,
        errors.length,
        JSON.stringify(errors.slice(0, 200)),
        req.crmUser?.id || null,
      ]
    );

    await client.query("COMMIT");
    return res.status(201).json({ importJob: job.rows[0], inserted, updated, skipped: errors.length, errors });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}));

marketingRouter.get("/segments", asyncRoute(async (_req, res) => {
  const result = await query(
    `SELECT s.*, count(sm.contact_id)::int AS member_count
     FROM crm_marketing_segments s
     LEFT JOIN crm_marketing_segment_members sm ON sm.segment_id = s.id
     GROUP BY s.id
     ORDER BY s.name ASC`
  );
  res.json({ segments: result.rows });
}));

marketingRouter.post("/segments", asyncRoute(async (req, res) => {
  const parsed = segmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid segment", details: parsed.error.flatten() });

  const result = await query(
    `INSERT INTO crm_marketing_segments (name, description, filters, created_by)
     VALUES ($1, $2, $3::jsonb, $4)
     RETURNING *`,
    [parsed.data.name, cleanText(parsed.data.description), JSON.stringify(parsed.data.filters || {}), req.crmUser?.id || null]
  );
  return res.status(201).json({ segment: result.rows[0] });
}));

marketingRouter.patch("/segments/:id", asyncRoute(async (req, res) => {
  const parsed = segmentSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid segment update", details: parsed.error.flatten() });

  const current = await query(`SELECT * FROM crm_marketing_segments WHERE id = $1`, [req.params.id]);
  if (current.rows.length === 0) return res.status(404).json({ error: "Segment not found" });
  const existing = current.rows[0] as Record<string, unknown>;
  const result = await query(
    `UPDATE crm_marketing_segments
     SET name = $1, description = $2, filters = $3::jsonb, updated_at = now()
     WHERE id = $4
     RETURNING *`,
    [
      parsed.data.name ?? existing.name,
      parsed.data.description === undefined ? existing.description : cleanText(parsed.data.description),
      JSON.stringify(parsed.data.filters ?? existing.filters ?? {}),
      req.params.id,
    ]
  );
  return res.json({ segment: result.rows[0] });
}));

marketingRouter.post("/segments/:id/members", asyncRoute(async (req, res) => {
  const parsed = segmentMembersSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid segment membership update", details: parsed.error.flatten() });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const contactId of parsed.data.add || []) {
      await client.query(
        `INSERT INTO crm_marketing_segment_members (segment_id, contact_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [req.params.id, contactId]
      );
    }
    if ((parsed.data.remove || []).length > 0) {
      await client.query(
        `DELETE FROM crm_marketing_segment_members
         WHERE segment_id = $1 AND contact_id = ANY($2::uuid[])`,
        [req.params.id, parsed.data.remove]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const count = await query(
    `SELECT count(*)::int AS member_count FROM crm_marketing_segment_members WHERE segment_id = $1`,
    [req.params.id]
  );
  return res.json({ ok: true, memberCount: count.rows[0]?.member_count || 0 });
}));

marketingRouter.get("/campaigns", asyncRoute(async (_req, res) => {
  const result = await query(
    `SELECT c.*, s.name AS segment_name
     FROM crm_marketing_campaigns c
     LEFT JOIN crm_marketing_segments s ON s.id = c.segment_id
     ORDER BY c.created_at DESC
     LIMIT 200`
  );
  res.json({ campaigns: result.rows });
}));

marketingRouter.post("/campaigns", asyncRoute(async (req, res) => {
  const parsed = campaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid campaign", details: parsed.error.flatten() });

  const data = parsed.data;
  const result = await query(
    `INSERT INTO crm_marketing_campaigns (
       name, subject, preview_text, from_name, from_email, reply_to, language,
       status, segment_id, topic, editor_json, html, scheduled_at, created_by
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11::jsonb, $12, $13, $14
     ) RETURNING *`,
    [
      data.name,
      data.subject,
      cleanText(data.preview_text),
      cleanText(data.from_name) || "Eivitech",
      cleanText(data.from_email) || "newsletter@notifications.eivitech.com",
      cleanText(data.reply_to) || "info@eivitech.com",
      data.language || "it",
      data.status || "draft",
      data.segment_id || null,
      cleanText(data.topic),
      JSON.stringify(data.editor_json || {}),
      data.html || "",
      data.scheduled_at || null,
      req.crmUser?.id || null,
    ]
  );
  return res.status(201).json({ campaign: result.rows[0] });
}));

marketingRouter.patch("/campaigns/:id", asyncRoute(async (req, res) => {
  const parsed = campaignUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid campaign update", details: parsed.error.flatten() });

  const current = await query(`SELECT * FROM crm_marketing_campaigns WHERE id = $1`, [req.params.id]);
  if (current.rows.length === 0) return res.status(404).json({ error: "Campaign not found" });
  const existing = current.rows[0] as Record<string, unknown>;
  const data = parsed.data;
  const result = await query(
    `UPDATE crm_marketing_campaigns SET
       name = $1,
       subject = $2,
       preview_text = $3,
       from_name = $4,
       from_email = $5,
       reply_to = $6,
       language = $7,
       status = $8,
       segment_id = $9,
       topic = $10,
       editor_json = $11::jsonb,
       html = $12,
       scheduled_at = $13,
       updated_at = now()
     WHERE id = $14
     RETURNING *`,
    [
      data.name ?? existing.name,
      data.subject ?? existing.subject,
      data.preview_text === undefined ? existing.preview_text : cleanText(data.preview_text),
      data.from_name === undefined ? existing.from_name : cleanText(data.from_name),
      data.from_email === undefined ? existing.from_email : cleanText(data.from_email),
      data.reply_to === undefined ? existing.reply_to : cleanText(data.reply_to),
      data.language ?? existing.language,
      data.status ?? existing.status,
      data.segment_id === undefined ? existing.segment_id : data.segment_id,
      data.topic === undefined ? existing.topic : cleanText(data.topic),
      JSON.stringify(data.editor_json ?? existing.editor_json ?? {}),
      data.html ?? existing.html,
      data.scheduled_at === undefined ? existing.scheduled_at : data.scheduled_at,
      req.params.id,
    ]
  );
  return res.json({ campaign: result.rows[0] });
}));

marketingRouter.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[marketing] request failed", error);
  if (error instanceof Error && "code" in error && error.code === "23505") {
    return res.status(409).json({ error: "A record with the same unique value already exists" });
  }
  return res.status(500).json({ error: "Email marketing request failed" });
});
