import { createHash, randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { pool } from "../db.js";
import { getMetaCrmConfig, META_GRAPH_API_VERSION } from "./crmConfig.js";
import { verifyMetaWebhookSignature } from "./webhookSignature.js";
import { mapMetaLeadFields } from "./leadMapping.js";

type LeadgenChange = {
  field?: string;
  value?: {
    leadgen_id?: string | number;
    page_id?: string | number;
    form_id?: string | number;
    ad_id?: string | number;
    adgroup_id?: string | number;
    created_time?: number;
  };
};

type MetaWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string | number;
    time?: number;
    changes?: LeadgenChange[];
  }>;
};

function asId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return null;
}

function deliveryKey(value: Record<string, unknown>) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export async function handleMetaWebhookVerification(req: Request, res: Response) {
  const mode = String(req.query["hub.mode"] || "");
  const token = String(req.query["hub.verify_token"] || "");
  const challenge = String(req.query["hub.challenge"] || "");
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && expected && token === expected && challenge) {
    return res.status(200).send(challenge);
  }
  return res.status(403).send("Webhook verification failed");
}

export async function handleMetaWebhookDelivery(req: Request, res: Response) {
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
  if (!verifyMetaWebhookSignature(rawBody, req.header("x-hub-signature-256"), process.env.META_APP_SECRET)) {
    return res.status(401).json({ error: "Invalid Meta webhook signature" });
  }

  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBody.toString("utf8")) as MetaWebhookPayload;
  } catch {
    return res.status(400).json({ error: "Invalid webhook JSON" });
  }

  if (payload.object !== "page") return res.status(200).json({ ok: true, ignored: true });

  const config = await getMetaCrmConfig();
  if (!config.configured || !config.pageId) {
    return res.status(200).json({ ok: true, ignored: true, reason: "meta_crm_not_configured" });
  }

  const accepted: Array<{
    deliveryKey: string;
    leadgenId: string;
    pageId: string;
    formId: string;
    payload: Record<string, unknown>;
  }> = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "leadgen") continue;
      const leadgenId = asId(change.value?.leadgen_id);
      const pageId = asId(change.value?.page_id) || asId(entry.id);
      const formId = asId(change.value?.form_id);
      if (!leadgenId || !pageId || !formId) continue;
      if (pageId !== config.pageId) continue;
      if (config.allowedFormIds.length > 0 && !config.allowedFormIds.includes(formId)) continue;

      const compact = {
        leadgen_id: leadgenId,
        page_id: pageId,
        form_id: formId,
        ad_id: asId(change.value?.ad_id),
        adset_id: asId(change.value?.adgroup_id),
        created_time: change.value?.created_time || null,
        webhook_entry_time: entry.time || null,
      };
      accepted.push({
        deliveryKey: deliveryKey(compact),
        leadgenId,
        pageId,
        formId,
        payload: compact,
      });
    }
  }

  if (accepted.length === 0) {
    return res.status(200).json({ ok: true, accepted: 0 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const item of accepted) {
      await client.query(
        `INSERT INTO crm_meta_webhook_events (
           delivery_key, leadgen_id, page_id, form_id, payload, status
         ) VALUES ($1, $2, $3, $4, $5::jsonb, 'received')
         ON CONFLICT (delivery_key) DO NOTHING`,
        [item.deliveryKey, item.leadgenId, item.pageId, item.formId, JSON.stringify(item.payload)]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return res.status(200).json({ ok: true, accepted: accepted.length });
}

type WebhookRow = {
  id: string;
  leadgen_id: string;
  form_id: string | null;
  page_id: string | null;
  payload: Record<string, unknown>;
  attempts: number;
};

type GraphLead = {
  id?: string | number;
  created_time?: string;
  form_id?: string | number;
  ad_id?: string | number;
  adset_id?: string | number;
  campaign_id?: string | number;
  field_data?: Array<{ name?: string; values?: unknown[] }>;
};

function normalizeFieldData(fieldData: GraphLead["field_data"]) {
  return (fieldData || [])
    .filter((field) => typeof field?.name === "string")
    .map((field) => ({
      name: String(field.name),
      values: Array.isArray(field.values)
        ? field.values.filter((value) => ["string", "number", "boolean"].includes(typeof value)).map(String)
        : [],
    }));
}


function missingOperationalFields(mapped: Record<string, string>) {
  const required = [
    "nombre", "email", "telefono", "tipoCliente", "tipoPropiedad",
    "intervencion", "tieneFotos", "tieneProyecto", "plazo",
  ];
  return required.filter((key) => !mapped[key]);
}

async function claimWebhook(): Promise<WebhookRow | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE crm_meta_webhook_events
       SET status = 'retry', locked_at = NULL, lock_token = NULL,
           next_attempt_at = LEAST(next_attempt_at, now())
       WHERE status = 'processing'
         AND locked_at < now() - interval '5 minutes'`
    );
    const selected = await client.query<WebhookRow>(
      `SELECT id, leadgen_id, form_id, page_id, payload, attempts
       FROM crm_meta_webhook_events
       WHERE status IN ('received', 'retry')
         AND next_attempt_at <= now()
       ORDER BY received_at
       FOR UPDATE SKIP LOCKED
       LIMIT 1`
    );
    const row = selected.rows[0];
    if (!row) {
      await client.query("COMMIT");
      return null;
    }
    await client.query(
      `UPDATE crm_meta_webhook_events
       SET status = 'processing', locked_at = now(), lock_token = $2
       WHERE id = $1`,
      [row.id, randomUUID()]
    );
    await client.query("COMMIT");
    return row;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function processWebhookRow(row: WebhookRow) {
  const config = await getMetaCrmConfig();
  if (!config.pageId || config.mode === "disabled") {
    await pool.query(
      `UPDATE crm_meta_webhook_events
       SET status = 'retry', next_attempt_at = now() + interval '15 minutes',
           locked_at = NULL, lock_token = NULL, last_error_code = 'INTEGRATION_PAUSED'
       WHERE id = $1`,
      [row.id]
    );
    return;
  }
  if (row.page_id !== config.pageId || (row.form_id && config.allowedFormIds.length > 0 && !config.allowedFormIds.includes(row.form_id))) {
    await pool.query(
      `UPDATE crm_meta_webhook_events
       SET status = 'ignored', processed_at = now(), locked_at = NULL, lock_token = NULL,
           last_error_code = 'ASSET_NOT_ALLOWED'
       WHERE id = $1`,
      [row.id]
    );
    return;
  }

  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) {
    await pool.query(
      `UPDATE crm_meta_webhook_events
       SET status = 'retry', next_attempt_at = now() + interval '15 minutes',
           locked_at = NULL, lock_token = NULL, last_error_code = 'MISSING_PAGE_TOKEN'
       WHERE id = $1`,
      [row.id]
    );
    return;
  }

  const fields = "id,created_time,form_id,ad_id,adset_id,campaign_id,field_data";
  let response: globalThis.Response;
  try {
    response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(row.leadgen_id)}?fields=${encodeURIComponent(fields)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch (error) {
    const attempts = row.attempts + 1;
    await pool.query(
      `UPDATE crm_meta_webhook_events
       SET status = $2, attempts = $3,
           next_attempt_at = CASE WHEN $2 = 'retry' THEN now() + (($3 * $3) || ' minutes')::interval ELSE next_attempt_at END,
           locked_at = NULL, lock_token = NULL, last_error_code = 'NETWORK_ERROR',
           last_error_message = $4
       WHERE id = $1`,
      [row.id, attempts >= 5 ? "failed" : "retry", attempts, error instanceof Error ? error.message.slice(0, 500) : "Network error"]
    );
    return;
  }

  if (!response.ok) {
    const attempts = row.attempts + 1;
    const temporary = response.status === 429 || response.status >= 500;
    const body = await response.text().catch(() => "");
    await pool.query(
      `UPDATE crm_meta_webhook_events
       SET status = $2, attempts = $3,
           next_attempt_at = CASE WHEN $2 = 'retry' THEN now() + (($3 * $3) || ' minutes')::interval ELSE next_attempt_at END,
           locked_at = NULL, lock_token = NULL, last_error_code = $4,
           last_error_message = $5
       WHERE id = $1`,
      [row.id, temporary && attempts < 5 ? "retry" : "failed", attempts, String(response.status), body.slice(0, 500)]
    );
    return;
  }

  const lead = await response.json() as GraphLead;
  const leadId = asId(lead.id);
  if (!leadId || leadId !== row.leadgen_id) {
    await pool.query(
      `UPDATE crm_meta_webhook_events
       SET status = 'failed', locked_at = NULL, lock_token = NULL,
           last_error_code = 'LEAD_ID_MISMATCH', last_error_message = 'Graph response did not match webhook lead ID'
       WHERE id = $1`,
      [row.id]
    );
    return;
  }

  const fieldData = normalizeFieldData(lead.field_data);
  const mapping = config.formMappings[row.form_id || ""] || {};
  const mapped = mapMetaLeadFields(fieldData, mapping);
  const missing = missingOperationalFields(mapped);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO crm_meta_lead_inbox (
         meta_lead_id, page_id, form_id, ad_id, adset_id, campaign_id,
         meta_created_time, field_data, mapped_data, missing_fields, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11)
       ON CONFLICT (meta_lead_id) DO UPDATE
       SET page_id = EXCLUDED.page_id,
           form_id = EXCLUDED.form_id,
           ad_id = EXCLUDED.ad_id,
           adset_id = EXCLUDED.adset_id,
           campaign_id = EXCLUDED.campaign_id,
           meta_created_time = EXCLUDED.meta_created_time,
           field_data = EXCLUDED.field_data,
           mapped_data = EXCLUDED.mapped_data,
           missing_fields = EXCLUDED.missing_fields,
           status = CASE WHEN crm_meta_lead_inbox.status = 'promoted' THEN 'promoted' ELSE EXCLUDED.status END,
           last_error = NULL,
           updated_at = now()`,
      [
        leadId,
        row.page_id,
        asId(lead.form_id) || row.form_id,
        asId(lead.ad_id) || asId(row.payload?.ad_id),
        asId(lead.adset_id) || asId(row.payload?.adset_id),
        asId(lead.campaign_id),
        lead.created_time || null,
        JSON.stringify(fieldData),
        JSON.stringify(mapped),
        JSON.stringify(missing),
        missing.length === 0 ? "ready" : "to_complete",
      ]
    );
    await client.query(
      `UPDATE crm_meta_webhook_events
       SET status = 'processed', attempts = attempts + 1, processed_at = now(),
           locked_at = NULL, lock_token = NULL, last_error_code = NULL, last_error_message = NULL
       WHERE id = $1`,
      [row.id]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function syncMetaLeadForms(limitPerForm = 20) {
  const config = await getMetaCrmConfig();
  if (!config.pageId || config.mode === "disabled") {
    return { forms: 0, fetched: 0, synced: 0 };
  }
  if (config.allowedFormIds.length === 0) {
    return { forms: 0, fetched: 0, synced: 0 };
  }

  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) throw new Error("META_PAGE_ACCESS_TOKEN is required for Lead Ads fallback sync");

  const limit = Math.max(1, Math.min(100, Math.trunc(limitPerForm) || 20));
  const fields = "id,created_time,form_id,ad_id,adset_id,campaign_id,field_data";
  let fetched = 0;
  let synced = 0;

  for (const formId of config.allowedFormIds) {
    const url = new URL(`https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(formId)}/leads`);
    url.searchParams.set("fields", fields);
    url.searchParams.set("limit", String(limit));

    let response: globalThis.Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      throw new Error(
        `Meta Lead Ads fallback network error for form ${formId}: ${error instanceof Error ? error.message : "Network error"}`
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Meta Lead Ads fallback failed for form ${formId}: HTTP ${response.status} ${body.slice(0, 500)}`);
    }

    const payload = await response.json() as { data?: GraphLead[] };
    for (const lead of payload.data || []) {
      fetched += 1;
      const leadId = asId(lead.id);
      const resolvedFormId = asId(lead.form_id) || formId;
      if (!leadId || resolvedFormId !== formId) continue;

      const fieldData = normalizeFieldData(lead.field_data);
      const mapping = config.formMappings[resolvedFormId] || {};
      const mapped = mapMetaLeadFields(fieldData, mapping);
      const missing = missingOperationalFields(mapped);

      await pool.query(
        `INSERT INTO crm_meta_lead_inbox (
           meta_lead_id, page_id, form_id, ad_id, adset_id, campaign_id,
           meta_created_time, field_data, mapped_data, missing_fields, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11)
         ON CONFLICT (meta_lead_id) DO UPDATE
         SET page_id = EXCLUDED.page_id,
             form_id = EXCLUDED.form_id,
             ad_id = EXCLUDED.ad_id,
             adset_id = EXCLUDED.adset_id,
             campaign_id = EXCLUDED.campaign_id,
             meta_created_time = EXCLUDED.meta_created_time,
             field_data = EXCLUDED.field_data,
             mapped_data = EXCLUDED.mapped_data,
             missing_fields = EXCLUDED.missing_fields,
             status = CASE WHEN crm_meta_lead_inbox.status = 'promoted' THEN 'promoted' ELSE EXCLUDED.status END,
             last_error = NULL,
             updated_at = now()`,
        [
          leadId,
          config.pageId,
          resolvedFormId,
          asId(lead.ad_id),
          asId(lead.adset_id),
          asId(lead.campaign_id),
          lead.created_time || null,
          JSON.stringify(fieldData),
          JSON.stringify(mapped),
          JSON.stringify(missing),
          missing.length === 0 ? "ready" : "to_complete",
        ]
      );
      synced += 1;
    }
  }

  return { forms: config.allowedFormIds.length, fetched, synced };
}

export async function processMetaLeadWebhookBatch(limit = 10) {
  let processed = 0;
  while (processed < limit) {
    const row = await claimWebhook();
    if (!row) break;
    await processWebhookRow(row);
    processed += 1;
  }
  return processed;
}

export function startMetaLeadAdsWorker() {
  const run = () => {
    void processMetaLeadWebhookBatch().catch((error) => {
      console.error("[meta] Lead Ads worker failed", error instanceof Error ? error.message : "unknown error");
    });
  };
  run();
  const timer = setInterval(run, 30_000);
  timer.unref();
  return timer;
}
