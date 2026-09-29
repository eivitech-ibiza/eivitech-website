import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { pool } from "../db.js";
import { buildCrmMetaEvent, buildWebMetaEvent } from "./events.js";
import { META_GRAPH_API_VERSION } from "./crmConfig.js";

type OutboxRow = {
  id: string;
  destination_dataset_id: string;
  lead_id: string | null;
  event_name: string;
  event_id: string;
  event_time: string;
  event_kind: "web" | "crm";
  source_snapshot: Record<string, unknown>;
  mode: "disabled" | "test" | "production";
  test_event_code: string | null;
  status: string;
  attempts: number;
};

type LeadRow = {
  email: string | null;
  telefono: string | null;
  meta_consent: boolean;
  meta_lead_id: string | null;
  meta_fbp: string | null;
  meta_fbc: string | null;
  landing_page: string | null;
};

export async function enqueueWebsiteLeadEvent(
  client: PoolClient,
  input: {
    leadId: string;
    eventId: string;
    eventTime: string;
    eventSourceUrl: string;
    metaConsent: boolean;
    clientUserAgent?: string | null;
  }
) {
  if (!input.metaConsent) return false;
  const cfg = await client.query<{
    pixel_id: string | null;
    enabled: boolean;
    capi_mode: "disabled" | "test" | "production";
    test_event_code: string | null;
  }>(
    `SELECT pixel_id, enabled, capi_mode, test_event_code
     FROM crm_meta_settings
     WHERE scope = 'web'
     LIMIT 1`
  );
  const row = cfg.rows[0];
  if (!row?.enabled || !row.pixel_id || row.capi_mode === "disabled") return false;

  await client.query(
    `INSERT INTO crm_meta_outbox (
       destination_dataset_id, lead_id, event_name, event_id, event_time, event_kind,
       source_snapshot, mode, test_event_code, status
     ) VALUES ($1, $2, 'Lead', $3, $4, 'web', $5::jsonb, $6, $7, 'queued')
     ON CONFLICT (destination_dataset_id, event_id) DO NOTHING`,
    [
      row.pixel_id,
      input.leadId,
      input.eventId,
      input.eventTime,
      JSON.stringify({
        eventSourceUrl: input.eventSourceUrl,
        clientUserAgent: input.clientUserAgent || null,
      }),
      row.capi_mode,
      row.test_event_code,
    ]
  );
  return true;
}

export async function enqueueCrmEvent(
  client: PoolClient,
  input: {
    datasetId: string;
    leadId: string;
    eventName: string;
    eventId?: string;
    eventTime: string;
    mode: "test" | "production";
    testEventCode?: string | null;
    sourceSnapshot?: Record<string, unknown>;
  }
) {
  const eventId = input.eventId || randomUUID();
  await client.query(
    `INSERT INTO crm_meta_outbox (
       destination_dataset_id, lead_id, event_name, event_id, event_time, event_kind,
       source_snapshot, mode, test_event_code, status
     ) VALUES ($1, $2, $3, $4, $5, 'crm', $6::jsonb, $7, $8, 'queued')
     ON CONFLICT (destination_dataset_id, event_id) DO NOTHING`,
    [
      input.datasetId,
      input.leadId,
      input.eventName,
      eventId,
      input.eventTime,
      JSON.stringify(input.sourceSnapshot || {}),
      input.mode,
      input.testEventCode || null,
    ]
  );
  return eventId;
}

async function claimNext(): Promise<OutboxRow | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE crm_meta_outbox
       SET status = 'retry', locked_at = NULL, lock_token = NULL,
           next_attempt_at = LEAST(next_attempt_at, now()),
           last_error_code = COALESCE(last_error_code, 'LEASE_EXPIRED'),
           updated_at = now()
       WHERE status = 'processing'
         AND locked_at < now() - interval '5 minutes'`
    );

    const selected = await client.query<OutboxRow>(
      `SELECT id, destination_dataset_id, lead_id, event_name, event_id, event_time,
              event_kind, source_snapshot, mode, test_event_code, status, attempts
       FROM crm_meta_outbox
       WHERE status IN ('queued', 'retry')
         AND next_attempt_at <= now()
       ORDER BY created_at
       FOR UPDATE SKIP LOCKED
       LIMIT 1`
    );
    const row = selected.rows[0];
    if (!row) {
      await client.query("COMMIT");
      return null;
    }
    await client.query(
      `UPDATE crm_meta_outbox
       SET status = 'processing', locked_at = now(), lock_token = $2, updated_at = now()
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

async function pause(row: OutboxRow, code: string, message: string) {
  await pool.query(
    `UPDATE crm_meta_outbox
     SET status = 'retry', next_attempt_at = now() + interval '15 minutes',
         locked_at = NULL, lock_token = NULL, last_error_code = $2,
         last_error_message = $3, updated_at = now()
     WHERE id = $1`,
    [row.id, code, message.slice(0, 500)]
  );
}

async function skip(row: OutboxRow, code: string, message: string) {
  await pool.query(
    `UPDATE crm_meta_outbox
     SET status = 'skipped', locked_at = NULL, lock_token = NULL,
         last_error_code = $2, last_error_message = $3, updated_at = now()
     WHERE id = $1`,
    [row.id, code, message.slice(0, 500)]
  );
}

async function currentMode(row: OutboxRow) {
  if (row.event_kind === "web") {
    const result = await pool.query<{ enabled: boolean; capi_mode: string }>(
      `SELECT enabled, capi_mode FROM crm_meta_settings WHERE scope = 'web' LIMIT 1`
    );
    const cfg = result.rows[0];
    return Boolean(cfg?.enabled && cfg.capi_mode !== "disabled");
  }
  const result = await pool.query<{ mode: string }>(
    `SELECT mode FROM crm_meta_crm_settings WHERE id = 1 LIMIT 1`
  );
  return Boolean(result.rows[0] && result.rows[0].mode !== "disabled");
}

async function processRow(row: OutboxRow) {
  if (!(await currentMode(row))) {
    await pause(row, "INTEGRATION_PAUSED", "Meta integration is currently disabled");
    return;
  }

  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) {
    await pause(row, "MISSING_TOKEN", "META_CAPI_ACCESS_TOKEN is not configured");
    return;
  }

  if (!row.lead_id) {
    await skip(row, "MISSING_LEAD", "Outbox item no longer references a lead");
    return;
  }

  const leadResult = await pool.query<LeadRow>(
    `SELECT email, telefono, meta_consent, meta_lead_id, meta_fbp, meta_fbc, landing_page
     FROM crm_leads WHERE id = $1 LIMIT 1`,
    [row.lead_id]
  );
  const lead = leadResult.rows[0];
  if (!lead) {
    await skip(row, "LEAD_NOT_FOUND", "Referenced lead no longer exists");
    return;
  }

  let event: Record<string, unknown>;
  if (row.event_kind === "web") {
    if (!lead.meta_consent) {
      await skip(row, "CONSENT_REVOKED", "Advertising sharing consent is not active");
      return;
    }
    const sourceUrl = typeof row.source_snapshot?.eventSourceUrl === "string"
      ? row.source_snapshot.eventSourceUrl
      : "https://eivitech.com/";
    const clientUserAgent = typeof row.source_snapshot?.clientUserAgent === "string"
      ? row.source_snapshot.clientUserAgent
      : null;
    event = buildWebMetaEvent({
      eventName: row.event_name,
      eventId: row.event_id,
      eventTime: row.event_time,
      eventSourceUrl: sourceUrl,
      email: lead.email,
      phone: lead.telefono,
      fbp: lead.meta_fbp,
      fbc: lead.meta_fbc,
      clientUserAgent,
    });
  } else {
    if (!lead.meta_lead_id && !lead.meta_consent) {
      await skip(row, "SHARING_NOT_ALLOWED", "Lead has neither native Meta identity nor active Meta sharing consent");
      return;
    }
    event = buildCrmMetaEvent({
      eventName: row.event_name,
      eventId: row.event_id,
      eventTime: row.event_time,
      metaLeadId: lead.meta_lead_id,
      leadEventSource: "Eivitech CRM",
      email: lead.email,
      phone: lead.telefono,
    });
  }

  const body: Record<string, unknown> = { data: [event] };
  if (row.mode === "test" && row.test_event_code) body.test_event_code = row.test_event_code;

  const attempts = row.attempts + 1;
  let response: Response;
  try {
    response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(row.destination_dataset_id)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      }
    );
  } catch (error) {
    const exhausted = attempts >= 5;
    await pool.query(
      `UPDATE crm_meta_outbox
       SET status = $2, attempts = $3,
           next_attempt_at = CASE WHEN $2 = 'retry' THEN now() + (($3 * $3) || ' minutes')::interval ELSE next_attempt_at END,
           locked_at = NULL, lock_token = NULL,
           last_error_code = 'NETWORK_ERROR', last_error_message = $4, updated_at = now()
       WHERE id = $1`,
      [row.id, exhausted ? "failed" : "retry", attempts, error instanceof Error ? error.message.slice(0, 500) : "Network error"]
    );
    return;
  }

  const responseText = await response.text();
  let responseBody: { error?: { code?: number; message?: string }; fbtrace_id?: string } = {};
  try {
    responseBody = responseText ? JSON.parse(responseText) : {};
  } catch {
    responseBody = {};
  }

  if (response.ok) {
    await pool.query(
      `UPDATE crm_meta_outbox
       SET status = 'sent', attempts = $2, sent_at = now(),
           locked_at = NULL, lock_token = NULL, last_error_code = NULL,
           last_error_message = NULL, meta_request_id = $3, updated_at = now()
       WHERE id = $1`,
      [row.id, attempts, response.headers.get("x-fb-trace-id") || responseBody.fbtrace_id || null]
    );
    await pool.query(`UPDATE crm_leads SET last_meta_sync_at = now() WHERE id = $1`, [row.lead_id]);
    return;
  }

  const temporary = response.status === 429 || response.status >= 500;
  const exhausted = attempts >= 5;
  const nextStatus = temporary && !exhausted ? "retry" : "failed";
  await pool.query(
    `UPDATE crm_meta_outbox
     SET status = $2, attempts = $3,
         next_attempt_at = CASE WHEN $2 = 'retry' THEN now() + (($3 * $3) || ' minutes')::interval ELSE next_attempt_at END,
         locked_at = NULL, lock_token = NULL,
         last_error_code = $4, last_error_message = $5, updated_at = now()
     WHERE id = $1`,
    [
      row.id,
      nextStatus,
      attempts,
      String(responseBody.error?.code ?? response.status),
      (responseBody.error?.message || `HTTP ${response.status}`).slice(0, 500),
    ]
  );
}

export async function processMetaOutboxBatch(limit = 10) {
  let processed = 0;
  while (processed < limit) {
    const row = await claimNext();
    if (!row) break;
    await processRow(row);
    processed += 1;
  }
  return processed;
}

export function startMetaOutboxWorker() {
  const run = () => {
    void processMetaOutboxBatch().catch((error) => {
      console.error("[meta] outbox worker failed", error instanceof Error ? error.message : "unknown error");
    });
  };
  run();
  const timer = setInterval(run, 30_000);
  timer.unref();
  return timer;
}
