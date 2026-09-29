import { query } from "../db.js";

export const META_GRAPH_API_VERSION = "v26.0";

export type MetaCrmMode = "disabled" | "test" | "production";

export type MetaCrmConfig = {
  configured: boolean;
  datasetId: string | null;
  pageId: string | null;
  allowedFormIds: string[];
  formMappings: Record<string, Record<string, string>>;
  eventMappings: Record<string, string>;
  mode: MetaCrmMode;
  testEventCode: string | null;
  graphApiVersion: string;
  updatedAt: string | null;
};

type MetaCrmRow = {
  dataset_id: string | null;
  page_id: string | null;
  allowed_form_ids: unknown;
  form_mappings: unknown;
  event_mappings: unknown;
  mode: MetaCrmMode;
  test_event_code: string | null;
  graph_api_version: string;
  updated_at: string;
};

function objectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringRecord(value: unknown): Record<string, string> {
  return Object.fromEntries(
    Object.entries(objectRecord(value))
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, item]) => [key.slice(0, 80), item.slice(0, 80)])
  );
}

function formMappingRecord(value: unknown) {
  return Object.fromEntries(
    Object.entries(objectRecord(value))
      .map(([formId, mapping]) => [formId, stringRecord(mapping)])
  );
}

export function validateMetaAssetId(value: string) {
  return /^\d{5,40}$/.test(value.trim());
}

export function getMetaCredentialsStatus() {
  return {
    capiAccessToken: Boolean(process.env.META_CAPI_ACCESS_TOKEN),
    pageAccessToken: Boolean(process.env.META_PAGE_ACCESS_TOKEN),
    appSecret: Boolean(process.env.META_APP_SECRET),
    webhookVerifyToken: Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN),
  };
}

export async function getMetaCrmConfig(): Promise<MetaCrmConfig> {
  const result = await query<MetaCrmRow>(
    `SELECT dataset_id, page_id, allowed_form_ids, form_mappings, event_mappings,
            mode, test_event_code, graph_api_version, updated_at
     FROM crm_meta_crm_settings
     WHERE id = 1
     LIMIT 1`
  );
  const row = result.rows[0];
  if (!row) {
    return {
      configured: false,
      datasetId: null,
      pageId: null,
      allowedFormIds: [],
      formMappings: {},
      eventMappings: {},
      mode: "disabled",
      testEventCode: null,
      graphApiVersion: META_GRAPH_API_VERSION,
      updatedAt: null,
    };
  }
  return {
    configured: true,
    datasetId: row.dataset_id,
    pageId: row.page_id,
    allowedFormIds: Array.isArray(row.allowed_form_ids) ? row.allowed_form_ids.filter((value): value is string => typeof value === "string") : [],
    formMappings: formMappingRecord(row.form_mappings),
    eventMappings: stringRecord(row.event_mappings),
    mode: row.mode,
    testEventCode: row.test_event_code,
    graphApiVersion: row.graph_api_version || META_GRAPH_API_VERSION,
    updatedAt: row.updated_at,
  };
}

export function normalizeMetaCrmConfigInput(input: Record<string, unknown>) {
  const datasetId = typeof input.datasetId === "string" && input.datasetId.trim() ? input.datasetId.trim() : null;
  const pageId = typeof input.pageId === "string" && input.pageId.trim() ? input.pageId.trim() : null;
  if (datasetId && !validateMetaAssetId(datasetId)) throw new Error("Invalid Meta CRM dataset ID");
  if (pageId && !validateMetaAssetId(pageId)) throw new Error("Invalid Meta Page ID");

  const allowedFormIds = Array.isArray(input.allowedFormIds)
    ? [...new Set(input.allowedFormIds.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(validateMetaAssetId))]
    : [];

  const mode: MetaCrmMode = input.mode === "test" || input.mode === "production" ? input.mode : "disabled";
  if (mode !== "disabled" && (!datasetId || !pageId)) {
    throw new Error("Dataset ID and Page ID are required before enabling Meta CRM");
  }

  const testEventCode = typeof input.testEventCode === "string" && input.testEventCode.trim()
    ? input.testEventCode.trim().slice(0, 120)
    : null;

  return {
    datasetId,
    pageId,
    allowedFormIds,
    formMappings: formMappingRecord(input.formMappings),
    eventMappings: stringRecord(input.eventMappings),
    mode,
    testEventCode,
    graphApiVersion: META_GRAPH_API_VERSION,
  };
}
