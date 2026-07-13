const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

export const SITE_URL = (configuredSiteUrl || "https://eivitech.com").replace(/\/$/, "");

export function absoluteUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${SITE_URL}${path}`;
}

export function canonicalUrl(pathname: string) {
  if (pathname === "/") return `${SITE_URL}/`;
  const cleanPath = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return `${SITE_URL}${cleanPath}/`;
}
