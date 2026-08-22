import "dotenv/config";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import { z } from "zod";
import { pool, query } from "./db.js";
import { listCampaignsWithDerivedUnsubscribes } from "./campaignMetrics.js";
import { listCampaignMetricRecipients, type CampaignMetricKey } from "./campaignEventDetails.js";
import { runMigrations } from "./migrations.js";
import { initialStatusForLead, nextActionForLead, priorityFromScore, scoreLead } from "./leadScoring.js";
import { upsertLeadMarketingContact } from "./leadMarketing.js";
import { requireCrmUser, requireRole } from "./auth.js";
import { notifyLeadByEmail } from "./email.js";
import { handleResendOwnerWebhook } from "./resendWebhook.js";
import { marketingRouter } from "./marketing.js";
import { marketingPublicRouter } from "./marketingPublic.js";

const PORT = Number(process.env.PORT || 3000);

const allowedOrigins = (process.env.ALLOWED_ORIGIN ?? "https://lncoachmrc.github.io,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.post(
  "/api/webhooks/resend/owner",
  express.raw({ type: "application/json", limit: "256kb" }),
  handleResendOwnerWebhook
);
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin not allowed: ${origin}`));
  },
}));
const publicJsonParser = express.json({ limit: "100kb" });
const crmJsonParser = express.json({ limit: "100kb" });
const marketingJsonParser = express.json({ limit: "12mb" });

const publicLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const publicMarketingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(
  "/api/marketing-public",
  publicMarketingLimiter,
  express.json({ limit: "10kb" }),
  marketingPublicRouter
);
app.use(clerkMiddleware());

const leadSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  telefono: z.string().trim().min(6).max(40),
  tipoCliente: z.enum(["propietario", "comprador", "inversor", "agencia", "empresa", "otro"]),
  tipoPropiedad: z.enum(["villa", "apartamento", "casa", "local-comercial", "otro"]),
  zona: z.string().trim().max(80).optional().or(z.literal("")),
  intervencion: z.enum(["reforma-integral", "bano", "cocina", "instalaciones", "exterior", "local-comercial", "otro"]),
  tieneFotos: z.enum(["si", "no"]),
  tieneProyecto: z.enum(["si", "no", "en-proceso"]),
  plazo: z.enum(["urgente", "1-3-meses", "3-6-meses", "sin-fecha"]),
  presupuesto: z.string().trim().max(60).optional().or(z.literal("")),
  mensaje: z.string().trim().max(1500).optional().or(z.literal("")),
  consentimiento: z.literal(true),
  marketingConsent: z.boolean().optional().default(false),
  source: z.string().trim().max(120).optional(),
  landing_page: z.string().trim().max(300).optional(),
  referrer: z.string().trim().max(500).optional(),
  timestamp: z.string().trim().max(80).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(160).optional(),
  utm_content: z.string().trim().max(160).optional(),
  utm_term: z.string().trim().max(160).optional(),
});

const updateLeadSchema = z.object({
  status: z.enum(["new", "first_contact", "visit_review", "proposal", "follow_up", "won", "lost", "review_portfolio"]).optional(),
  priority: z.enum(["alta", "media", "baja"]).optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  next_action: z.string().trim().max(500).nullable().optional(),
  next_follow_up_at: z.string().datetime().nullable().optional(),
});

const activitySchema = z.object({
  type: z.enum(["note", "call", "whatsapp", "email", "visit", "proposal", "follow_up", "status_change", "automation"]).default("note"),
  title: z.string().trim().min(2).max(160),
  notes: z.string().trim().max(1500).optional().or(z.literal("")),
  due_at: z.string().datetime().optional().nullable(),
  completed_at: z.string().datetime().optional().nullable(),
});

const campaignMetricSchema = z.enum(["delivered", "opened", "clicked", "bounced", "unsubscribed"]);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "eivitech-crm-api" });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "eivitech-crm-api" });
});

app.delete(
  "/api/marketing/campaigns/:id",
  requireCrmUser,
  requireRole(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const campaign = await query<{ id: string; status: string }>(
        `SELECT id, status FROM crm_marketing_campaigns WHERE id = $1`,
        [req.params.id]
      );

      if (campaign.rows.length === 0) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      if (campaign.rows[0].status !== "sent") {
        return next();
      }

      await query(`DELETE FROM crm_marketing_campaigns WHERE id = $1`, [req.params.id]);
      return res.json({
        ok: true,
        deleted: true,
        deleted_from_postgres: true,
        resend_history_retained: true,
      });
    } catch (error) {
      return next(error);
    }
  }
);

app.get(
  "/api/marketing/campaigns",
  requireCrmUser,
  requireRole(["admin", "manager"]),
  async (_req, res, next) => {
    try {
      const result = await listCampaignsWithDerivedUnsubscribes();
      return res.json({ campaigns: result.rows });
    } catch (error) {
      return next(error);
    }
  }
);

app.get(
  "/api/marketing/campaigns/:id/metric-details",
  requireCrmUser,
  requireRole(["admin", "manager"]),
  async (req, res, next) => {
    try {
      const parsedMetric = campaignMetricSchema.safeParse(req.query.metric);
      if (!parsedMetric.success) {
        return res.status(400).json({ error: "Invalid campaign metric" });
      }

      const campaign = await query<{ id: string }>(
        `SELECT id FROM crm_marketing_campaigns WHERE id = $1`,
        [req.params.id],
      );
      if (campaign.rows.length === 0) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const metric = parsedMetric.data as CampaignMetricKey;
      const result = await listCampaignMetricRecipients(req.params.id, metric);
      return res.json({
        metric,
        total: result.rows.length,
        recipients: result.rows,
      });
    } catch (error) {
      return next(error);
    }
  }
);

app.use(
  "/api/marketing",
  requireCrmUser,
  requireRole(["admin", "manager"]),
  marketingJsonParser,
  marketingRouter
);

app.post("/api/leads", publicLeadLimiter, publicJsonParser, async (req, res) => {
  const parsed = leadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid lead payload", details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const scoringInput = {
    plazo: data.plazo,
    intervencion: data.intervencion,
    tipo_propiedad: data.tipoPropiedad,
    tiene_fotos: data.tieneFotos,
    tiene_proyecto: data.tieneProyecto,
    presupuesto: data.presupuesto || null,
    source: data.source || null,
    utm_source: data.utm_source || null,
  };
  const score = scoreLead(scoringInput);
  const priority = priorityFromScore(score);
  const nextAction = nextActionForLead(scoringInput);
  const status = initialStatusForLead(scoringInput);
  const client = await pool.connect();
  let leadId = "";

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO crm_leads (
        status, priority, score, nombre, email, telefono, tipo_cliente, tipo_propiedad, zona,
        intervencion, tiene_fotos, tiene_proyecto, plazo, presupuesto, mensaje, source,
        landing_page, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term,
        consent_privacy, consent_marketing, next_action
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23,
        $24, $25, $26
      ) RETURNING *`,
      [
        status,
        priority,
        score,
        data.nombre,
        data.email.toLowerCase(),
        data.telefono,
        data.tipoCliente,
        data.tipoPropiedad,
        data.zona || null,
        data.intervencion,
        data.tieneFotos,
        data.tieneProyecto,
        data.plazo,
        data.presupuesto || null,
        data.mensaje || null,
        data.source || "web",
        data.landing_page || null,
        data.referrer || null,
        data.utm_source || null,
        data.utm_medium || null,
        data.utm_campaign || null,
        data.utm_content || null,
        data.utm_term || null,
        data.consentimiento,
        data.marketingConsent,
        nextAction,
      ]
    );

    const lead = result.rows[0] as { id: string };
    leadId = lead.id;

    await client.query(
      `INSERT INTO crm_activities (lead_id, type, title, notes)
       VALUES ($1, 'automation', 'Nueva solicitud recibida', $2)`,
      [lead.id, nextAction]
    );

    await upsertLeadMarketingContact(client, data, lead.id);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[api] failed to create lead and marketing contact", error);
    return res.status(500).json({ error: "Failed to create lead" });
  } finally {
    client.release();
  }

  try {
    await notifyN8n("lead.created", leadId, { leadId, source: data.source || "web", score, priority });
    await notifyLeadByEmail({ leadId, ...data, email: data.email.toLowerCase(), score, priority });
  } catch (error) {
    console.error("[api] lead saved but post-create notification failed", error);
  }

  return res.status(201).json({ ok: true, leadId, score, priority, nextAction });
});

app.use("/api/leads", crmJsonParser);

app.get("/api/leads", requireCrmUser, async (_req, res) => {
  const result = await query(
    `SELECT * FROM crm_leads ORDER BY created_at DESC LIMIT 200`
  );
  res.json({ leads: result.rows });
});

app.get("/api/leads/:id", requireCrmUser, async (req, res) => {
  const lead = await query(`SELECT * FROM crm_leads WHERE id = $1`, [req.params.id]);
  if (lead.rows.length === 0) return res.status(404).json({ error: "Lead not found" });

  const activities = await query(
    `SELECT * FROM crm_activities WHERE lead_id = $1 ORDER BY created_at DESC`,
    [req.params.id]
  );

  res.json({ lead: lead.rows[0], activities: activities.rows });
});

app.patch("/api/leads/:id", requireCrmUser, async (req, res) => {
  const parsed = updateLeadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid update payload", details: parsed.error.flatten() });

  const current = await query(`SELECT * FROM crm_leads WHERE id = $1`, [req.params.id]);
  if (current.rows.length === 0) return res.status(404).json({ error: "Lead not found" });

  const next = { ...current.rows[0], ...parsed.data };

  const result = await query(
    `UPDATE crm_leads
     SET status = $1, priority = $2, assigned_to = $3, next_action = $4,
         next_follow_up_at = $5, updated_at = now()
     WHERE id = $6
     RETURNING *`,
    [
      next.status,
      next.priority,
      next.assigned_to,
      next.next_action,
      next.next_follow_up_at,
      req.params.id,
    ]
  );

  await query(
    `INSERT INTO crm_activities (lead_id, created_by, type, title, notes)
     VALUES ($1, $2, 'status_change', 'Lead actualizado', $3)`,
    [req.params.id, req.crmUser?.id ?? null, JSON.stringify(parsed.data)]
  );

  res.json({ lead: result.rows[0] });
});

app.post("/api/leads/:id/activities", requireCrmUser, async (req, res) => {
  const parsed = activitySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid activity payload", details: parsed.error.flatten() });

  const lead = await query(`SELECT id FROM crm_leads WHERE id = $1`, [req.params.id]);
  if (lead.rows.length === 0) return res.status(404).json({ error: "Lead not found" });

  const data = parsed.data;
  const result = await query(
    `INSERT INTO crm_activities (lead_id, created_by, type, title, notes, due_at, completed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      req.params.id,
      req.crmUser?.id ?? null,
      data.type,
      data.title,
      data.notes || null,
      data.due_at || null,
      data.completed_at || null,
    ]
  );

  res.status(201).json({ activity: result.rows[0] });
});

app.get("/api/dashboard/stats", requireCrmUser, async (_req, res) => {
  const result = await query(
    `SELECT
       count(*)::int AS total,
       count(*) FILTER (WHERE priority = 'alta')::int AS high_priority,
       count(*) FILTER (WHERE plazo = 'urgente')::int AS urgent,
       count(*) FILTER (WHERE tiene_fotos <> 'si')::int AS missing_assets,
       count(*) FILTER (WHERE status = 'visit_review')::int AS visit_ready
     FROM crm_leads`
  );

  const origins = await query(
    `SELECT COALESCE(utm_source, source, 'web') AS origin, count(*)::int AS total
     FROM crm_leads
     GROUP BY COALESCE(utm_source, source, 'web')
     ORDER BY total DESC`
  );

  res.json({ stats: result.rows[0], origins: origins.rows });
});

async function notifyN8n(eventType: string, leadId: string, payload: Record<string, unknown>) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "x-eivitech-secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({ eventType, leadId, payload, createdAt: new Date().toISOString() }),
    });

    await query(
      `INSERT INTO crm_automation_events (lead_id, event_type, provider, payload, status, error_message)
       VALUES ($1, $2, 'n8n', $3, $4, $5)`,
      [leadId, eventType, JSON.stringify(payload), response.ok ? "sent" : "failed", response.ok ? null : `HTTP ${response.status}`]
    );
  } catch (error) {
    await query(
      `INSERT INTO crm_automation_events (lead_id, event_type, provider, payload, status, error_message)
       VALUES ($1, $2, 'n8n', $3, 'failed', $4)`,
      [leadId, eventType, JSON.stringify(payload), error instanceof Error ? error.message : "Unknown n8n error"]
    );
  }
}

async function start() {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`[api] Eivitech CRM API listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("[api] failed to start", error);
  process.exit(1);
});