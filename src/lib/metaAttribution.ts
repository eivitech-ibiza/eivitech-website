import { CRM_ENDPOINT } from "@/lib/crm";

const REVOCATION_STORAGE_KEY = "eivitech_meta_revocation_tokens_v1";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const found = document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : null;
}

function safeIdentifier(value: string | null, maxLength: number) {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, maxLength);
  if (!trimmed || /\s/.test(trimmed) || trimmed.includes("@")) return undefined;
  return trimmed;
}

export function captureMetaAttribution(enabled: boolean) {
  if (!enabled || typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    fbclid: safeIdentifier(params.get("fbclid"), 512),
    fbp: safeIdentifier(readCookie("_fbp"), 255),
    fbc: safeIdentifier(readCookie("_fbc"), 255),
  };
}

function expireCookie(name: string, domain?: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ""}`;
}

export function clearMetaAttributionCookies() {
  if (typeof window === "undefined") return;
  const host = window.location.hostname;
  const root = host.split(".").slice(-2).join(".");
  for (const name of ["_fbp", "_fbc"]) {
    expireCookie(name);
    expireCookie(name, host);
    if (root && root !== host) expireCookie(name, `.${root}`);
  }
}

function getStoredTokens() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REVOCATION_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function storeMetaRevocationToken(token?: string | null) {
  if (!token || typeof window === "undefined") return;
  const tokens = new Set(getStoredTokens());
  tokens.add(token);
  window.localStorage.setItem(REVOCATION_STORAGE_KEY, JSON.stringify([...tokens].slice(-50)));
}

export async function revokeStoredMetaConsents() {
  if (typeof window === "undefined") return;
  const tokens = getStoredTokens();
  if (tokens.length === 0) return;

  const keep: string[] = [];
  for (const token of tokens) {
    try {
      const response = await fetch(`${CRM_ENDPOINT}/api/meta/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) keep.push(token);
    } catch {
      keep.push(token);
    }
  }

  if (keep.length > 0) {
    window.localStorage.setItem(REVOCATION_STORAGE_KEY, JSON.stringify(keep));
  } else {
    window.localStorage.removeItem(REVOCATION_STORAGE_KEY);
  }
}
