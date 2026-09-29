import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireCrmUser, requireRole } from "../auth.js";
import { pool } from "../db.js";
import { getMetaWebConfig } from "./config.js";
import { normalizeMetaWebConfigInput } from "./configValidation.js";
import { revokeMetaConsentByToken } from "./consent.js";

export const metaRouter = Router();

const publicMetaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

metaRouter.get("/public-config", publicMetaLimiter, async (_req, res, next) => {
  try {
    const web = await getMetaWebConfig();
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
    return res.json({ web: await getMetaWebConfig() });
  } catch (error) {
    return next(error);
  }
});

metaRouter.patch("/config", requireCrmUser, requireRole(["admin"]), async (req, res, next) => {
  let nextConfig: { pixelId: string | null; enabled: boolean };
  try {
    nextConfig = normalizeMetaWebConfigInput(req.body ?? {});
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid Meta config" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const beforeResult = await client.query(
      `SELECT pixel_id, enabled
       FROM crm_meta_settings
       WHERE scope = 'web'
       FOR UPDATE`
    );
    const before = beforeResult.rows[0] ?? { pixel_id: null, enabled: false };

    await client.query(
      `INSERT INTO crm_meta_settings (scope, pixel_id, enabled, updated_by)
       VALUES ('web', $1, $2, $3)
       ON CONFLICT (scope) DO UPDATE
       SET pixel_id = EXCLUDED.pixel_id,
           enabled = EXCLUDED.enabled,
           updated_by = EXCLUDED.updated_by,
           updated_at = now()`,
      [nextConfig.pixelId, nextConfig.enabled, req.crmUser?.id ?? null]
    );

    await client.query(
      `INSERT INTO crm_meta_config_audit (scope, changed_by, before_value, after_value)
       VALUES ('web', $1, $2::jsonb, $3::jsonb)`,
      [
        req.crmUser?.id ?? null,
        JSON.stringify({ pixelId: before.pixel_id, enabled: before.enabled }),
        JSON.stringify(nextConfig),
      ]
    );

    await client.query("COMMIT");
    return res.json({ web: await getMetaWebConfig() });
  } catch (error) {
    await client.query("ROLLBACK");
    return next(error);
  } finally {
    client.release();
  }
});
