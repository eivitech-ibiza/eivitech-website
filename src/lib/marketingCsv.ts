import type { MarketingContactInput, MarketingContactStatus, MarketingLanguage } from "@/lib/marketing";

export type MarketingCsvIssue = {
  row: number;
  message: string;
};

export type MarketingCsvResult = {
  contacts: MarketingContactInput[];
  issues: MarketingCsvIssue[];
};

const HEADER_ALIASES: Record<string, keyof MarketingContactInput | "consent"> = {
  email: "email",
  emailaddress: "email",
  indirizzoemail: "email",
  mail: "email",
  firstname: "first_name",
  nome: "first_name",
  name: "first_name",
  lastname: "last_name",
  cognome: "last_name",
  surname: "last_name",
  phone: "phone",
  phonenumber: "phone",
  numeroditelefono: "phone",
  telefono: "phone",
  address: "address",
  indirizzo: "address",
  region: "region",
  regione: "region",
  country: "country_code",
  countrycode: "country_code",
  cc: "country_code",
  lingua: "language",
  language: "language",
  tags: "tags",
  tag: "tags",
  contacttype: "contact_type",
  tipocontatto: "contact_type",
  type: "contact_type",
  status: "status",
  mcstatus: "status",
  source: "source",
  sourcefile: "source_file",
  consensomarketing: "consent",
  marketingconsent: "consent",
  consent: "consent",
  optin: "consent",
};

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^_+/, "")
    .replace(/[^a-z0-9]/g, "");
}

function delimiterScore(line: string, delimiter: string) {
  let score = 0;
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') quoted = !quoted;
    else if (!quoted && character === delimiter) score += 1;
  }
  return score;
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delimiters = [",", ";", "\t"];
  return delimiters.sort((a, b) => delimiterScore(firstLine, b) - delimiterScore(firstLine, a))[0] || ",";
}

function parseRows(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && character === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function normalizeLanguage(value?: string): MarketingLanguage | undefined {
  const normalized = value?.trim().toLowerCase().split(/[-_]/)[0];
  if (normalized === "es" || normalized === "it" || normalized === "en" || normalized === "nl") return normalized;
  return undefined;
}

function normalizeStatus(value?: string): MarketingContactStatus | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["subscribed", "iscritto", "iscritta", "attivo", "active"].includes(normalized)) return "subscribed";
  if (["unsubscribed", "disiscritto", "disiscritta", "optedout", "opted-out"].includes(normalized)) return "unsubscribed";
  if (["suppressed", "bounced", "cleaned", "complained", "bloccato"].includes(normalized)) return "suppressed";
  if (["pending", "inattesa", "in attesa"].includes(normalized)) return "pending";
  return undefined;
}

function normalizeBoolean(value?: string) {
  return ["1", "true", "yes", "si", "sì", "y", "subscribed", "optin", "opt-in"].includes(value?.trim().toLowerCase() || "");
}

function splitTags(value?: string) {
  if (!value) return [];
  const unique = new Map<string, string>();
  for (const tag of value.split(/[|,;]/)) {
    const trimmed = tag.trim();
    if (trimmed) unique.set(trimmed.toLowerCase(), trimmed);
  }
  return [...unique.values()];
}

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function parseMarketingContactsCsv(text: string): MarketingCsvResult {
  const normalizedText = text.replace(/^\uFEFF/, "");
  const rows = parseRows(normalizedText, detectDelimiter(normalizedText));
  if (rows.length === 0) return { contacts: [], issues: [{ row: 1, message: "CSV vuoto" }] };

  const headers = rows[0].map((header) => HEADER_ALIASES[normalizeHeader(header)]);
  const emailIndex = headers.findIndex((header) => header === "email");
  if (emailIndex < 0) {
    return { contacts: [], issues: [{ row: 1, message: "Colonna email non trovata" }] };
  }

  const contacts: MarketingContactInput[] = [];
  const issues: MarketingCsvIssue[] = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const values = rows[rowIndex];
    const raw: Record<string, string> = {};

    headers.forEach((header, index) => {
      if (header) raw[header] = values[index] || "";
    });

    const email = clean(raw.email)?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      issues.push({ row: rowIndex + 1, message: `Email non valida: ${raw.email || "vuota"}` });
      continue;
    }

    const status = normalizeStatus(raw.status);
    const explicitConsent = normalizeBoolean(raw.consent);
    const marketingConsent = explicitConsent || status === "subscribed";

    contacts.push({
      email,
      first_name: clean(raw.first_name),
      last_name: clean(raw.last_name),
      phone: clean(raw.phone),
      address: clean(raw.address),
      region: clean(raw.region),
      country_code: clean(raw.country_code)?.toLowerCase(),
      language: normalizeLanguage(raw.language) || normalizeLanguage(raw.country_code),
      contact_type: clean(raw.contact_type),
      source: clean(raw.source) || "csv-import",
      source_file: clean(raw.source_file),
      status,
      tags: splitTags(raw.tags),
      marketing_consent: marketingConsent,
      consent_source: marketingConsent ? "csv-import" : undefined,
      consent_at: marketingConsent ? new Date().toISOString() : undefined,
      suppression_reason: status === "suppressed" ? "Imported suppression status" : undefined,
    });
  }

  return { contacts, issues };
}
