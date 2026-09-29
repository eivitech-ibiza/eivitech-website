import { query } from "../db.js";
export { normalizeMetaWebConfigInput, validateMetaPixelId } from "./configValidation.js";

type MetaSettingsRow = {
  pixel_id: string | null;
  enabled: boolean;
  updated_at: string;
};

export type MetaWebConfig = {
  configured: boolean;
  pixelId: string | null;
  enabled: boolean;
  updatedAt: string | null;
};

export async function getMetaWebConfig(): Promise<MetaWebConfig> {
  const result = await query<MetaSettingsRow>(
    `SELECT pixel_id, enabled, updated_at
     FROM crm_meta_settings
     WHERE scope = 'web'
     LIMIT 1`
  );
  const row = result.rows[0];
  if (!row) {
    return { configured: false, pixelId: null, enabled: false, updatedAt: null };
  }
  return {
    configured: true,
    pixelId: row.pixel_id,
    enabled: row.enabled,
    updatedAt: row.updated_at,
  };
}
