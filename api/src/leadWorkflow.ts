import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { pool } from "./db.js";
import { enqueueCrmEvent } from "./meta/outbox.js";

const actionKeys = [
  "first-contact",
  "qualify",
  "high-priority",
  "visit",
  "proposal",
  "follow-up",
  "won",
  "lost",
  "partner-contact",
  "partner-evaluate",
  "partner-approved",
  "partner-reserve",
  "partner-rejected",
] as const;

const activityTypes = ["note", "call", "whatsapp", "email", "visit", "proposal", "follow_up", "status_change"] as const;

export const leadWorkflowSchema = z.object({
  action_key: z.enum(actionKeys),
  outcome: z.string().trim().max(120).optional().or(z.literal("")),
  next_action: z.string().trim().max(500).nullable().optional(),
  next_follow_up_at: z.string().datetime().nullable().optional(),
  visit_date: z.string().datetime().nullable().optional(),
  budget: z.string().trim().max(120).optional().or(z.literal("")),
  amount: z.string().trim().max(120).optional().or(z.literal("")),
  activity: z.object({
    type: z.enum(activityTypes),
    title: z.string().trim().min(2).max(160),
    notes: z.string().trim().max(3000).optional().or(z.literal("")),
    due_at: z.string().datetime().nullable().optional(),
  }),
});

type WorkflowInput = z.infer<typeof leadWorkflowSchema>;

type ActionRule = {
  status?: "new" | "first_contact" | "visit_review" | "proposal" | "follow_up" | "won" | "lost" | "review_portfolio";
  priority?: "alta" | "media" | "baja";
};

const ACTION_RULES: Record<WorkflowInput["action_key"], ActionRule> = {
  "first-contact": { status: "first_contact" },
  qualify: { status: "first_contact", priority: "media" },
  "high-priority": { priority: "alta" },
  visit: { status: "visit_review" },
  proposal: { status: "proposal" },
  "follow-up": { status: "follow_up" },
  won: { status: "won", priority: "media" },
  lost: { status: "lost", priority: "baja" },
  "partner-contact": { status: "first_contact" },
  "partner-evaluate": { status: "proposal", priority: "media" },
  "partner-approved": { status: "won", priority: "alta" },
  "partner-reserve": { status: "review_portfolio", priority: "media" },
  "partner-rejected": { status: "lost", priority: "baja" },
};

function qualificationOutcome(input: WorkflowInput) {
  if (input.action_key !== "qualify") return null;
  if (input.outcome === "qualificato") return "qualified";
  if (input.outcome === "da-completare") return "incomplete";
  if (input.outcome === "non-qualificato") return "unqualified";
  return null;
}

function milestoneFor(input: WorkflowInput) {
  if (input.action_key === "qualify" && input.outcome === "qualificato") return "qualified";
  if (input.action_key === "visit" && input.visit_date) return "visit_confirmed";
  if (input.action_key === "proposal" && input.outcome === "inviato") return "proposal_sent";
  if (input.action_key === "won") return "deal_won";
  return null;
}

export async function runLeadWorkflow(
  leadId: string,
  input: WorkflowInput,
  userId: string | null
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const currentResult = await client.query<{
      id: string;
      status: string;
      priority: string;
      lead_kind: string;
      meta_consent: boolean;
      meta_lead_id: string | null;
    }>(
      `SELECT id, status, priority, lead_kind, meta_consent, meta_lead_id
       FROM crm_leads
       WHERE id = $1
       FOR UPDATE`,
      [leadId]
    );
    const current = currentResult.rows[0];
    if (!current) {
      await client.query("ROLLBACK");
      return { status: "not_found" as const };
    }

    const rule = ACTION_RULES[input.action_key];
    const qOutcome = qualificationOutcome(input);
    const milestone = current.lead_kind === "customer" ? milestoneFor(input) : null;
    const now = new Date().toISOString();

    const updatedResult = await client.query(
      `UPDATE crm_leads
       SET status = COALESCE($2, status),
           priority = COALESCE($3, priority),
           next_action = CASE WHEN $4::boolean THEN $5 ELSE next_action END,
           next_follow_up_at = CASE WHEN $6::boolean THEN $7::timestamptz ELSE next_follow_up_at END,
           qualification_outcome = CASE WHEN $8::boolean THEN $9 ELSE qualification_outcome END,
           qualified_at = CASE WHEN $9 = 'qualified' AND qualified_at IS NULL THEN $10::timestamptz ELSE qualified_at END,
           visit_confirmed_at = CASE WHEN $11::boolean AND visit_confirmed_at IS NULL THEN $12::timestamptz ELSE visit_confirmed_at END,
           proposal_sent_at = CASE WHEN $13::boolean AND proposal_sent_at IS NULL THEN $10::timestamptz ELSE proposal_sent_at END,
           deal_closed_at = CASE WHEN $14::boolean AND deal_closed_at IS NULL THEN $10::timestamptz ELSE deal_closed_at END,
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [
        leadId,
        rule.status || null,
        rule.priority || null,
        input.next_action !== undefined,
        input.next_action ?? null,
        input.next_follow_up_at !== undefined,
        input.next_follow_up_at ?? null,
        input.action_key === "qualify",
        qOutcome,
        now,
        input.action_key === "visit" && Boolean(input.visit_date),
        input.visit_date || null,
        input.action_key === "proposal" && input.outcome === "inviato",
        input.action_key === "won",
      ]
    );

    const outcomeResult = await client.query<{ id: string }>(
      `INSERT INTO crm_lead_outcomes (
         lead_id, action_key, outcome, milestone_key, metadata, created_by, occurred_at
       ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
       ON CONFLICT (lead_id, milestone_key) WHERE milestone_key IS NOT NULL DO NOTHING
       RETURNING id`,
      [
        leadId,
        input.action_key,
        input.outcome || null,
        milestone,
        JSON.stringify({
          budget: input.budget || null,
          amount: input.amount || null,
          visitDate: input.visit_date || null,
        }),
        userId,
        now,
      ]
    );
    const milestoneInserted = milestone ? outcomeResult.rows.length > 0 : false;

    const activityResult = await client.query(
      `INSERT INTO crm_activities (
         lead_id, created_by, type, title, notes, due_at
       ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        leadId,
        userId,
        input.activity.type,
        input.activity.title,
        input.activity.notes || null,
        input.activity.due_at || null,
      ]
    );

    let metaEventId: string | null = null;
    let metaQueued = false;
    if (milestone && milestoneInserted && current.lead_kind === "customer" && (current.meta_lead_id || current.meta_consent)) {
      const configResult = await client.query<{
        dataset_id: string | null;
        mode: "disabled" | "test" | "production";
        test_event_code: string | null;
        event_mappings: Record<string, unknown>;
      }>(
        `SELECT dataset_id, mode, test_event_code, event_mappings
         FROM crm_meta_crm_settings WHERE id = 1 LIMIT 1`
      );
      const config = configResult.rows[0];
      const mappedName = config?.event_mappings && typeof config.event_mappings[milestone] === "string"
        ? String(config.event_mappings[milestone]).trim()
        : "";

      if (config?.dataset_id && config.mode !== "disabled" && mappedName) {
        metaEventId = randomUUID();
        await enqueueCrmEvent(client, {
          datasetId: config.dataset_id,
          leadId,
          eventName: mappedName,
          eventId: metaEventId,
          eventTime: now,
          mode: config.mode,
          testEventCode: config.test_event_code,
          sourceSnapshot: { milestone },
        });
        metaQueued = true;
      }
    }

    await client.query("COMMIT");
    return {
      status: "saved" as const,
      lead: updatedResult.rows[0],
      activity: activityResult.rows[0],
      milestone,
      milestoneInserted,
      metaQueued,
      metaEventId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function handleLeadWorkflow(req: Request, res: Response, next: NextFunction) {
  const parsed = leadWorkflowSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid workflow payload", details: parsed.error.flatten() });
  }

  try {
    const result = await runLeadWorkflow(req.params.id, parsed.data, req.crmUser?.id ?? null);
    if (result.status === "not_found") return res.status(404).json({ error: "Lead not found" });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}
