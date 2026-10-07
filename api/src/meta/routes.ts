import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireCrmUser, requireRole } from "../auth.js";
import { pool } from "../db.js";
import { getMetaWebConfig, toPublicMetaWebConfig } from "./config.js";
import { normalizeMetaWebConfigInput } from "./configValidation.js";
import { revokeMetaConsentByToken } from "./consent.js";
import {
  getMetaCredentialsStatus,
  getMetaCrmConfig,
  normalizeMetaCrmConfigInput,
} from "./crmConfig.js";
import { listMetaLeadInbox, promoteMetaLeadInbox } from "./leadInbox.js";
import { processMetaLeadWebhookBatch, syncMetaLeadForms } from "./leadAds.js";
import { processMetaOutboxBatch } from "./outbox.js";

export const metaRouter = Router();

const publicMetaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const metaModeSchema = z.enum(["disabled", "test", "production"]);

const promoteSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  telefono: z.string().trim().min(6).max(40),
  tipoCliente: z.enum(["propietario", "comprador", "inversor", "agencia", "empresa", "otro"]),
  tipoPropiedad: z.enum(["villa", "apartamento", "casa", "local-comercial", "otro"]),
  zona: z.string().trim().max(80).optional().nullable(),
  intervencion: z.enum(["reforma-integral", "bano", "cocina", "instalaciones", "exterior", "local-comercial", "otro"]),
  tieneFotos: z.enum(["si", "no"]),
  tieneProyecto: z.enum(["si", "no", "en-proceso"]),
  plazo: z.enum(["urgente", "1-3-meses", "3-6-meses", "sin-fecha"]),
  presupuesto: z.string().trim().max(120).optional().nullable(),
  mensaje: z.string().trim().max(1500).optional().nullable(),
  consentPrivacy: z.literal(true),
  consentMarketing: z.boolean().optional().default(false),
});

metaRouter.get("/public-config", publicMetaLimiter, async (_req, res, next) => {
  try {
    const web = toPublicMetaWebConfig(await getMetaWebConfig());
    res.setHeader("Cache-Control", "no-store");
    return res.json({ web });
  } catch (error) {
    return next(error);
  }
});

metaRouter.post("/revoke", publicMetaLimiter, async (req, res, next) => {
  try {
    const parsed = z.object({ token: z.string().min(32).max(160) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid revocation token" });
    await revokeMetaConsentByToken(parsed.data.token);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

metaRouter.get("/config", requireCrmUser, requireRole(["admin"]), async (_req, res, next) => {
  try {
    return res.json({
      web: await getMetaWebConfig(),
      crm: await getMetaCrmConfig(),
      credentials: getMetaCredentialsStatus(),
    });
  } catch (error) {
    return next(error);
  }
});

metaRouter.patch("/config", requireCrmUser, requireRole(["admin"]), async (req, res, next) => {
  let nextConfig: {
    pixelId: string | null;
    enabled: boolean;
    capiMode: "disabled" | "test" | "production";
    testEventCode: string | null;
  };
  try {
    const web = normalizeMetaWebConfigInput(req.body ?? {});
    const capiMode = metaModeSchema.parse(req.body?.capiMode ?? "disabled");
    const testEventCode = typeof req.body?.testEventCode === "string" && req.body.testEventCode.trim()
      ? req.body.testEventCode.trim().slice(0, 120)
      : null;
    if (capiMode !== "disabled" && (!web.pixelId || !web.enabled)) {
      throw new Error("Pixel ID and Pixel enabled are required before enabling web CAPI");
    }
    nextConfig = { ...web, capiMode, testEventCode };
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid Meta config" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const beforeResult = await client.query(
      `SELECT pixel_id, enabled, capi_mode, test_event_code
       FROM crm_meta_settings
       WHERE scope = 'web'
       FOR UPDATE`
    );
    const before = beforeResult.rows[0] ?? {
      pixel_id: null,
      enabled: false,
      capi_mode: "disabled",
      test_event_code: null,
    };

    await client.query(
      `INSERT INTO crm_meta_settings (scope, pixel_id, enabled, capi_mode, test_event_code, updated_by)
       VALUES ('web', $1, $2, $3, $4, $5)
       ON CONFLICT (scope) DO UPDATE
       SET pixel_id = EXCLUDED.pixel_id,
           enabled = EXCLUDED.enabled,
           capi_mode = EXCLUDED.capi_mode,
           test_event_code = EXCLUDED.test_event_code,
           updated_by = EXCLUDED.updated_by,
           updated_at = now()`,
      [nextConfig.pixelId, nextConfig.enabled, nextConfig.capiMode, nextConfig.testEventCode, req.crmUser?.id ?? null]
    );

    await client.query(
      `INSERT INTO crm_meta_config_audit (scope, changed_by, before_value, after_value)
       VALUES ('web', $1, $2::jsonb, $3::jsonb)`,
      [
        req.crmUser?.id ?? null,
        JSON.stringify({
          pixelId: before.pixel_id,
          enabled: before.enabled,
          capiMode: before.capi_mode,
          testEventCode: before.test_event_code,
        }),
        JSON.stringify(nextConfig),
      ]
    );

    await client.query("COMMIT");
    return res.json({
      web: await getMetaWebConfig(),
      crm: await getMetaCrmConfig(),
      credentials: getMetaCredentialsStatus(),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

metaRouter.patch("/crm-config", requireCrmUser, requireRole(["admin"]), async (req, res, next) => {
  let nextConfig: ReturnType<typeof normalizeMetaCrmConfigInput>;
  try {
    nextConfig = normalizeMetaCrmConfigInput(req.body ?? {});
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid Meta CRM config" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const beforeResult = await client.query(
      `SELECT dataset_id, page_id, allowed_form_ids, form_mappings, event_mappings,
              mode, test_event_code, graph_api_version
       FROM crm_meta_crm_settings
       WHERE id = 1
       FOR UPDATE`
    );
    const before = beforeResult.rows[0] ?? {};

    await client.query(
      `INSERT INTO crm_meta_crm_settings (
         id, dataset_id, page_id, allowed_form_ids, form_mappings, event_mappings,
         mode, test_event_code, graph_api_version, updated_by
       ) VALUES (1, $1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE
       SET dataset_id = EXCLUDED.dataset_id,
           page_id = EXCLUDED.page_id,
           allowed_form_ids = EXCLUDED.allowed_form_ids,
           form_mappings = EXCLUDED.form_mappings,
           event_mappings = EXCLUDED.event_mappings,
           mode = EXCLUDED.mode,
           test_event_code = EXCLUDED.test_event_code,
           graph_api_version = EXCLUDED.graph_api_version,
           updated_by = EXCLUDED.updated_by,
           updated_at = now()`,
      [
        nextConfig.datasetId,
        nextConfig.pageId,
        JSON.stringify(nextConfig.allowedFormIds),
        JSON.stringify(nextConfig.formMappings),
        JSON.stringify(nextConfig.eventMappings),
        nextConfig.mode,
        nextConfig.testEventCode,
        nextConfig.graphApiVersion,
        req.crmUser?.id ?? null,
      ]
    );

    await client.query(
      `INSERT INTO crm_meta_config_audit (scope, changed_by, before_value, after_value)
       VALUES ('crm', $1, $2::jsonb, $3::jsonb)`,
      [req.crmUser?.id ?? null, JSON.stringify(before), JSON.stringify(nextConfig)]
    );

    await client.query("COMMIT");
    return res.json({
      web: await getMetaWebConfig(),
      crm: await getMetaCrmConfig(),
      credentials: getMetaCredentialsStatus(),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});

metaRouter.get(
  "/lead-inbox",
  requireCrmUser,
  requireRole(["admin", "manager", "operator"]),
  async (req, res, next) => {
    try {
      const limit = Number(req.query.limit || 100);
      return res.json({ leads: await listMetaLeadInbox(Number.isFinite(limit) ? limit : 100) });
    } catch (error) {
      return next(error);
    }
  }
);

metaRouter.post(
  "/lead-inbox/:id/promote",
  requireCrmUser,
  requireRole(["admin", "manager", "operator"]),
  async (req, res, next) => {
    const parsed = promoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid Meta lead completion payload", details: parsed.error.flatten() });
    }
    try {
      const result = await promoteMetaLeadInbox(req.params.id, parsed.data, req.crmUser?.id ?? null);
      if (result.status === "not_found") return res.status(404).json({ error: "Meta lead inbox record not found" });
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
);

metaRouter.post(
  "/lead-inbox/process",
  requireCrmUser,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const parsed = z.object({ limit: z.number().int().min(1).max(100).optional() }).safeParse(req.body ?? {});
      if (!parsed.success) return res.status(400).json({ error: "Invalid process request" });
      const limit = parsed.data.limit ?? 20;
      const processed = await processMetaLeadWebhookBatch(limit);
      const fallback = await syncMetaLeadForms(limit);
      return res.json({ ok: true, processed, fallback });
    } catch (error) {
      return next(error);
    }
  }
);

metaRouter.post(
  "/outbox/process",
  requireCrmUser,
  requireRole(["admin"]),
  async (req, res, next) => {
    try {
      const parsed = z.object({ limit: z.number().int().min(1).max(100).optional() }).safeParse(req.body ?? {});
      if (!parsed.success) return res.status(400).json({ error: "Invalid process request" });
      const processed = await processMetaOutboxBatch(parsed.data.limit ?? 20);
      return res.json({ ok: true, processed });
    } catch (error) {
      return next(error);
    }
  }
);

metaRouter.post(
  "/outbox/retry-failed",
  requireCrmUser,
  requireRole(["admin"]),
  async (_req, res, next) => {
    try {
      const result = await pool.query(
        `UPDATE crm_meta_outbox
         SET status = 'retry', next_attempt_at = now(), locked_at = NULL, lock_token = NULL, updated_at = now()
         WHERE status = 'failed'
         RETURNING id`
      );
      return res.json({ ok: true, retried: result.rowCount ?? 0 });
    } catch (error) {
      return next(error);
    }
  }
);

metaRouter.get(
  "/status",
  requireCrmUser,
  requireRole(["admin", "manager"]),
  async (_req, res, next) => {
    try {
      const [outbox, inbox, lastSent, lastError, lastPendingError, audit] = await Promise.all([
        pool.query(
          `SELECT status, count(*)::int AS total
           FROM crm_meta_outbox
           GROUP BY status
           ORDER BY status`
        ),
        pool.query(
          `SELECT status, count(*)::int AS total
           FROM crm_meta_lead_inbox
           GROUP BY status
           ORDER BY status`
        ),
        pool.query(
          `SELECT sent_at, event_name, event_id
           FROM crm_meta_outbox
           WHERE status = 'sent'
           ORDER BY sent_at DESC NULLS LAST
           LIMIT 1`
        ),
        pool.query(
          `SELECT updated_at, event_name, event_id, last_error_code, last_error_message
           FROM crm_meta_outbox
           WHERE status = 'failed'
           ORDER BY updated_at DESC
           LIMIT 1`
        ),
        pool.query(
          `SELECT updated_at, event_name, event_id, status, attempts,
                  next_attempt_at, last_error_code, last_error_message
           FROM crm_meta_outbox
           WHERE status IN ('retry', 'processing')
             AND last_error_code IS NOT NULL
           ORDER BY updated_at DESC
           LIMIT 1`
        ),
        pool.query(
          `SELECT scope, created_at, changed_by
           FROM crm_meta_config_audit
           ORDER BY created_at DESC
           LIMIT 20`
        ),
      ]);

      return res.json({
        credentials: getMetaCredentialsStatus(),
        outbox: outbox.rows,
        inbox: inbox.rows,
        lastSuccess: lastSent.rows[0] ?? null,
        lastError: lastError.rows[0] ?? null,
        lastPendingError: lastPendingError.rows[0] ?? null,
        audit: audit.rows,
      });
    } catch (error) {
      return next(error);
    }
  }
);
