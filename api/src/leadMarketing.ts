import type { PoolClient } from "pg";

export type LeadMarketingInput = {
  nombre: string;
  email: string;
  telefono: string;
  tipoCliente: "propietario" | "comprador" | "inversor" | "agencia" | "empresa" | "otro";
  tipoPropiedad: "villa" | "apartamento" | "casa" | "local-comercial" | "otro";
  zona?: string | null;
  intervencion: "reforma-integral" | "bano" | "cocina" | "instalaciones" | "exterior" | "local-comercial" | "otro";
  tieneFotos: "si" | "no";
  tieneProyecto: "si" | "no" | "en-proceso";
  plazo: "urgente" | "1-3-meses" | "3-6-meses" | "sin-fecha";
  presupuesto?: string | null;
  mensaje?: string | null;
  source?: string | null;
  landing_page?: string | null;
  utm_source?: string | null;
};

type MarketingLanguage = "es" | "it" | "en" | "nl";

export type LeadMarketingProfile = {
  email: string;
  firstName: string;
  phone: string;
  region: string | null;
  language: MarketingLanguage;
  contactType: string;
  source: string;
  tags: string[];
  formMode: "cliente" | "colaborador";
};

function tagValue(value?: string | null) {
  if (!value) return null;
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return normalized || null;
}

function structuredLine(message: string | null | undefined, label: string) {
  if (!message) return null;
  const line = message
    .split(/\r?\n/)
    .find((candidate) => candidate.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line?.slice(line.indexOf(":") + 1).trim() || null;
}

function inferLanguage(landingPage?: string | null): MarketingLanguage {
  if (!landingPage) return "es";

  try {
    const url = new URL(landingPage, "https://eivitech.com");
    const queryLanguage = url.searchParams.get("lang")?.toLowerCase();
    if (queryLanguage === "es" || queryLanguage === "it" || queryLanguage === "en" || queryLanguage === "nl") {
      return queryLanguage;
    }

    const pathLanguage = url.pathname.match(/^\/(es|it|en|nl)(?:\/|$)/i)?.[1]?.toLowerCase();
    if (pathLanguage === "es" || pathLanguage === "it" || pathLanguage === "en" || pathLanguage === "nl") {
      return pathLanguage;
    }
  } catch {
    // Public forms default to Spanish when no reliable locale is available.
  }

  return "es";
}

function pushTag(tags: Set<string>, prefix: string, value?: string | null) {
  const normalized = tagValue(value);
  if (normalized) tags.add(`${prefix}:${normalized}`);
}

export function deriveLeadMarketingProfile(input: LeadMarketingInput): LeadMarketingProfile {
  const source = input.source?.trim() || "web";
  const partnerMessage = input.mensaje?.includes("[PARTNER_COLLABORATOR_APPLICATION]") || false;
  const isPartner = source.toLowerCase().endsWith("-partner") || partnerMessage;
  const tags = new Set<string>(["web-form"]);

  pushTag(tags, "source", source);

  let region = input.zona?.trim() || null;
  let contactType = input.tipoCliente;
  let formMode: LeadMarketingProfile["formMode"] = "cliente";

  if (isPartner) {
    formMode = "colaborador";
    contactType = "colaborador-profesional";
    tags.add("form:colaborador");
    tags.add("colaborador-profesional");

    const categoria = structuredLine(input.mensaje, "Categoría");
    const zona = structuredLine(input.mensaje, "Zona cubierta");
    const experiencia = structuredLine(input.mensaje, "Experiencia");
    const disponibilidad = structuredLine(input.mensaje, "Disponibilidad");

    if (zona && zona.toLowerCase() !== "ibiza") region = zona;
    pushTag(tags, "categoria", categoria);
    pushTag(tags, "experiencia", experiencia);
    pushTag(tags, "disponibilidad", disponibilidad);
  } else {
    tags.add("form:cliente");
    pushTag(tags, "cliente", input.tipoCliente);
    pushTag(tags, "propiedad", input.tipoPropiedad);
    pushTag(tags, "intervencion", input.intervencion);
    pushTag(tags, "plazo", input.plazo);
    pushTag(tags, "fotos", input.tieneFotos);
    pushTag(tags, "proyecto", input.tieneProyecto);
  }

  if (input.utm_source) pushTag(tags, "utm-source", input.utm_source);

  return {
    email: input.email.trim().toLowerCase(),
    firstName: input.nombre.trim(),
    phone: input.telefono.trim(),
    region,
    language: inferLanguage(input.landing_page),
    contactType,
    source,
    tags: [...tags].sort(),
    formMode,
  };
}

export async function upsertLeadMarketingContact(
  client: PoolClient,
  input: LeadMarketingInput,
  leadId: string,
) {
  const profile = deriveLeadMarketingProfile(input);
  const existing = await client.query<{ id: string }>(
    `SELECT id FROM crm_marketing_contacts WHERE email = $1`,
    [profile.email],
  );

  const result = await client.query<{
    id: string;
    status: "pending" | "subscribed" | "unsubscribed" | "suppressed";
    marketing_consent: boolean;
  }>(
    `INSERT INTO crm_marketing_contacts (
       email, first_name, phone, region, language, contact_type, source,
       status, tags, marketing_consent
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8::jsonb, false)
     ON CONFLICT (email) DO UPDATE SET
       first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), crm_marketing_contacts.first_name),
       phone = COALESCE(NULLIF(EXCLUDED.phone, ''), crm_marketing_contacts.phone),
       region = COALESCE(NULLIF(EXCLUDED.region, ''), crm_marketing_contacts.region),
       language = COALESCE(EXCLUDED.language, crm_marketing_contacts.language),
       contact_type = COALESCE(NULLIF(EXCLUDED.contact_type, ''), crm_marketing_contacts.contact_type),
       source = COALESCE(NULLIF(EXCLUDED.source, ''), crm_marketing_contacts.source),
       tags = (
         SELECT COALESCE(jsonb_agg(value ORDER BY value), '[]'::jsonb)
         FROM (
           SELECT DISTINCT value
           FROM jsonb_array_elements_text(
             COALESCE(crm_marketing_contacts.tags, '[]'::jsonb) || EXCLUDED.tags
           ) AS merged(value)
         ) AS unique_tags
       ),
       updated_at = now()
     RETURNING id, status, marketing_consent`,
    [
      profile.email,
      profile.firstName,
      profile.phone,
      profile.region,
      profile.language,
      profile.contactType,
      profile.source,
      JSON.stringify(profile.tags),
    ],
  );

  const contact = result.rows[0];
  const eventType = existing.rows.length > 0 ? "updated" : "created";

  await client.query(
    `INSERT INTO crm_marketing_consent_events (
       contact_id, event_type, source, metadata
     ) VALUES ($1, $2, 'web-form', $3::jsonb)`,
    [
      contact.id,
      eventType,
      JSON.stringify({
        method: "lead-form-auto-registration",
        leadId,
        formMode: profile.formMode,
        privacyConsent: true,
        marketingConsent: contact.marketing_consent,
        resultingStatus: contact.status,
        tagsAdded: profile.tags,
        source: profile.source,
      }),
    ],
  );

  return { ...contact, profile };
}
