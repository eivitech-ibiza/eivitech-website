import { query } from "../db.js";
export { normalizeMetaWebConfigInput, validateMetaPixelId } from "./configValidation.js";

type MetaSettingsRow = {
  pixel_id: string | null;
  enabled: boolean;
  capi_mode: "disabled" | "test" | "production";
  test_event_code: string | null;
  updated_at: string;
};

export type MetaWebConfig = {
  configured: boolean;
  pixelId: string | null;
  enabled: boolean;
  capiMode: "disabled" | "test" | "production";
  testEventCode: string | null;
  updatedAt: string | null;
};

export type MetaPublicWebConfig = Omit<MetaWebConfig, "capiMode" | "testEventCode">;

export async function getMetaWebConfig(): Promise<MetaWebConfig> {
  const result = await query<MetaSettingsRow>(
    `SELECT pixel_id, enabled, capi_mode, test_event_code, updated_at
     FROM crm_meta_settings
     WHERE scope = 'web'
     LIMIT 1`
  );
  const row = result.rows[0];
  if (!row) {
    return {
      configured: false,
      pixelId: null,
      enabled: false,
      capiMode: "disabled",
      testEventCode: null,
      updatedAt: null,
    };
  }
  return {
    configured: true,
    pixelId: row.pixel_id,
    enabled: row.enabled,
    capiMode: row.capi_mode,
    testEventCode: row.test_event_code,
    updatedAt: row.updated_at,
  };
}

export function toPublicMetaWebConfig(config: MetaWebConfig): MetaPublicWebConfig {
  return {
    configured: config.configured,
    pixelId: config.pixelId,
    enabled: config.enabled,
    updatedAt: config.updatedAt,
  };
}
