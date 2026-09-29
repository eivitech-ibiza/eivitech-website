import { CRM_ENDPOINT } from "@/lib/crm";

export type MetaPublicWebConfig = {
  configured: boolean;
  enabled: boolean;
  pixelId: string | null;
  updatedAt: string | null;
  source?: "runtime" | "vite_fallback";
};

export type MetaAdminConfig = {
  web: MetaPublicWebConfig;
};

async function readError(response: Response, fallback: string) {
  const body = await response.text().catch(() => "");
  if (!body) return fallback;
  try {
    const parsed = JSON.parse(body) as { error?: string };
    return parsed.error || fallback;
  } catch {
    return body;
  }
}

export async function fetchPublicMetaConfig(): Promise<MetaAdminConfig> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/public-config`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response, "Meta public config unavailable"));
  return response.json() as Promise<MetaAdminConfig>;
}

export async function fetchMetaAdminConfig(token: string): Promise<MetaAdminConfig> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/config`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await readError(response, "Meta config unavailable"));
  return response.json() as Promise<MetaAdminConfig>;
}

export async function updateMetaAdminConfig(
  token: string,
  payload: { pixelId: string | null; enabled: boolean },
): Promise<MetaAdminConfig> {
  const response = await fetch(`${CRM_ENDPOINT}/api/meta/config`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await readError(response, "Meta config update failed"));
  return response.json() as Promise<MetaAdminConfig>;
}
