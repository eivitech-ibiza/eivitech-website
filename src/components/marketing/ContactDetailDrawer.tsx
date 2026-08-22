import { useEffect, useMemo, useState } from "react";
import { Layers3, Mail, MapPin, Phone, Save, ShieldCheck, Tag, UserRound, X } from "lucide-react";
import {
  type MarketingContact,
  type MarketingContactInput,
  type MarketingContactStatus,
  type MarketingLanguage,
  type MarketingSegment,
} from "@/lib/marketing";
import { tr } from "@/lib/i18n";

type ContactDetailDrawerProps = {
  contact: MarketingContact | null;
  segments: MarketingSegment[];
  saving: boolean;
  onClose: () => void;
  onSave: (contact: MarketingContact, payload: Partial<MarketingContactInput>) => Promise<void>;
  onSegmentChange: (contactId: string, segmentId: string, action: "add" | "remove") => Promise<void>;
};

type ContactDraft = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  region: string;
  country_code: string;
  language: MarketingLanguage;
  contact_type: string;
  source: string;
  tags: string;
  status: MarketingContactStatus;
  marketing_consent: boolean;
  suppression_reason: string;
};

const LANGUAGE_OPTIONS: { value: MarketingLanguage; label: string }[] = [
  { value: "it", label: "Italiano" },
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "nl", label: "Nederlands" },
];

const STATUS_OPTIONS: { value: MarketingContactStatus; label: string }[] = [
  { value: "pending", label: tr("Pendiente", "In attesa", "Pending", "In afwachting") },
  { value: "subscribed", label: tr("Suscrito", "Iscritto", "Subscribed", "Ingeschreven") },
  { value: "unsubscribed", label: tr("Dado de baja", "Disiscritto", "Unsubscribed", "Uitgeschreven") },
  { value: "suppressed", label: tr("Suprimido", "Soppresso", "Suppressed", "Geblokkeerd") },
];

function draftFromContact(contact: MarketingContact): ContactDraft {
  return {
    email: contact.email || "",
    first_name: contact.first_name || "",
    last_name: contact.last_name || "",
    phone: contact.phone || "",
    address: contact.address || "",
    region: contact.region || "",
    country_code: contact.country_code || "",
    language: contact.language || "it",
    contact_type: contact.contact_type || "",
    source: contact.source || "",
    tags: (contact.tags || []).join(", "),
    status: contact.status || "pending",
    marketing_consent: Boolean(contact.marketing_consent),
    suppression_reason: contact.suppression_reason || "",
  };
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function displayName(contact: MarketingContact) {
  return [contact.first_name, contact.last_name].filter(Boolean).join(" ") || contact.email;
}

export function ContactDetailDrawer({ contact, segments, saving, onClose, onSave, onSegmentChange }: ContactDetailDrawerProps) {
  const [draft, setDraft] = useState<ContactDraft | null>(contact ? draftFromContact(contact) : null);
  const [segmentSaving, setSegmentSaving] = useState<string | null>(null);

  useEffect(() => {
    setDraft(contact ? draftFromContact(contact) : null);
  }, [contact]);

  useEffect(() => {
    if (!contact) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [contact, onClose]);

  const memberIds = useMemo(() => new Set(contact?.segments?.map((segment) => segment.id) || []), [contact]);
  const availableSegments = useMemo(() => segments.filter((segment) => !memberIds.has(segment.id)), [segments, memberIds]);

  if (!contact || !draft) return null;

  async function submit() {
    const tags = draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    await onSave(contact, {
      email: draft.email.trim().toLowerCase(),
      first_name: draft.first_name.trim() || null,
      last_name: draft.last_name.trim() || null,
      phone: draft.phone.trim() || null,
      address: draft.address.trim() || null,
      region: draft.region.trim() || null,
      country_code: draft.country_code.trim().toLowerCase() || null,
      language: draft.language,
      contact_type: draft.contact_type.trim() || null,
      source: draft.source.trim() || null,
      tags,
      status: draft.status,
      marketing_consent: draft.status === "subscribed" && draft.marketing_consent,
      suppression_reason: draft.status === "suppressed" ? draft.suppression_reason.trim() || "Manual suppression" : null,
    });
  }

  async function changeSegment(segmentId: string, action: "add" | "remove") {
    setSegmentSaving(segmentId);
    try {
      await onSegmentChange(contact.id, segmentId, action);
    } finally {
      setSegmentSaving(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label={tr("Detalle del contacto", "Dettaglio contatto", "Contact details", "Contactdetails")}>
      <button type="button" aria-label={tr("Cerrar", "Chiudi", "Close", "Sluiten")} className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-5 md:px-7">
          <div className="min-w-0">
            <div className="eyebrow">{tr("Contacto", "Contatto", "Contact", "Contact")}</div>
            <h2 className="mt-2 truncate text-2xl font-medium text-foreground">{displayName(contact)}</h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">{contact.email}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-sm border border-border p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label={tr("Cerrar", "Chiudi", "Close", "Sluiten")}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 md:px-7">
          <div className="space-y-7">
            <section>
              <SectionTitle icon={UserRound} title={tr("Datos del contacto", "Dati contatto", "Contact data", "Contactgegevens")} />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DrawerInput label={tr("Nombre", "Nome", "First name", "Voornaam")} value={draft.first_name} onChange={(value) => setDraft((current) => current ? { ...current, first_name: value } : current)} />
                <DrawerInput label={tr("Apellido", "Cognome", "Last name", "Achternaam")} value={draft.last_name} onChange={(value) => setDraft((current) => current ? { ...current, last_name: value } : current)} />
                <DrawerInput icon={Mail} label="Email" type="email" value={draft.email} disabled={Boolean(contact.resend_contact_id)} onChange={(value) => setDraft((current) => current ? { ...current, email: value } : current)} />
                <DrawerInput icon={Phone} label={tr("Teléfono", "Telefono", "Phone", "Telefoon")} value={draft.phone} onChange={(value) => setDraft((current) => current ? { ...current, phone: value } : current)} />
              </div>
              {contact.resend_contact_id && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {tr(
                    "El email está bloqueado porque este contacto ya está sincronizado con Resend. Así evitamos desalinear el identificador remoto.",
                    "L’email è bloccata perché questo contatto è già sincronizzato con Resend. In questo modo evitiamo di disallineare l’identificatore remoto.",
                    "Email is locked because this contact is already synced with Resend, preventing remote identity mismatches.",
                    "Het e-mailadres is vergrendeld omdat dit contact al met Resend is gesynchroniseerd.",
                  )}
                </p>
              )}
            </section>

            <section>
              <SectionTitle icon={MapPin} title={tr("Clasificación", "Classificazione", "Classification", "Classificatie")} />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DrawerInput label={tr("Dirección", "Indirizzo", "Address", "Adres")} value={draft.address} onChange={(value) => setDraft((current) => current ? { ...current, address: value } : current)} />
                <DrawerInput label={tr("Zona / región", "Zona / regione", "Area / region", "Regio")} value={draft.region} onChange={(value) => setDraft((current) => current ? { ...current, region: value } : current)} />
                <DrawerInput label={tr("País (código)", "Paese (codice)", "Country code", "Landcode")} value={draft.country_code} placeholder="ES" onChange={(value) => setDraft((current) => current ? { ...current, country_code: value } : current)} />
                <DrawerSelect label={tr("Idioma", "Lingua", "Language", "Taal")} value={draft.language} options={LANGUAGE_OPTIONS} onChange={(value) => setDraft((current) => current ? { ...current, language: value as MarketingLanguage } : current)} />
                <DrawerInput label={tr("Tipo de contacto", "Tipo contatto", "Contact type", "Contacttype")} value={draft.contact_type} onChange={(value) => setDraft((current) => current ? { ...current, contact_type: value } : current)} />
                <DrawerInput label={tr("Origen", "Provenienza", "Source", "Bron")} value={draft.source} onChange={(value) => setDraft((current) => current ? { ...current, source: value } : current)} />
              </div>
            </section>

            <section>
              <SectionTitle icon={Tag} title="Tag" />
              <div className="mt-4">
                <label className="block text-sm">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Separados por coma", "Separati da virgola", "Comma separated", "Gescheiden door komma's")}</span>
                  <textarea className="mt-1 min-h-24 w-full rounded-sm border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" value={draft.tags} onChange={(event) => setDraft((current) => current ? { ...current, tags: event.target.value } : current)} />
                </label>
              </div>
            </section>

            <section>
              <SectionTitle icon={ShieldCheck} title={tr("Estado y consentimiento", "Stato e consenso", "Status and consent", "Status en toestemming")} />
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DrawerSelect
                  label={tr("Estado", "Stato", "Status", "Status")}
                  value={draft.status}
                  options={STATUS_OPTIONS}
                  onChange={(value) => {
                    const status = value as MarketingContactStatus;
                    setDraft((current) => current ? { ...current, status, marketing_consent: status === "subscribed" } : current);
                  }}
                />
                <label className="flex min-h-[70px] items-center gap-3 rounded-sm border border-border bg-card px-3 py-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={draft.marketing_consent}
                    disabled={draft.status === "unsubscribed" || draft.status === "suppressed"}
                    onChange={(event) => setDraft((current) => current ? {
                      ...current,
                      marketing_consent: event.target.checked,
                      status: event.target.checked ? "subscribed" : current.status === "subscribed" ? "pending" : current.status,
                    } : current)}
                  />
                  <span>{tr("Consentimiento marketing documentado", "Consenso marketing documentato", "Documented marketing consent", "Gedocumenteerde marketingtoestemming")}</span>
                </label>
              </div>
              {draft.status === "suppressed" && (
                <div className="mt-4">
                  <DrawerInput label={tr("Motivo de supresión", "Motivo soppressione", "Suppression reason", "Reden blokkering")} value={draft.suppression_reason} onChange={(value) => setDraft((current) => current ? { ...current, suppression_reason: value } : current)} />
                </div>
              )}
            </section>

            <section>
              <SectionTitle icon={Layers3} title={tr("Segmentos", "Segmenti", "Segments", "Segmenten")} />
              <div className="mt-4 space-y-3">
                {(contact.segments || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(contact.segments || []).map((segment) => (
                      <span key={segment.id} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
                        {segment.name}
                        <button type="button" disabled={segmentSaving === segment.id} onClick={() => void changeSegment(segment.id, "remove")} className="text-muted-foreground hover:text-destructive disabled:opacity-50" aria-label={`${tr("Quitar", "Rimuovi", "Remove", "Verwijderen")} ${segment.name}`}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">{tr("Sin segmentos asignados.", "Nessun segmento assegnato.", "No segments assigned.", "Geen segmenten toegewezen.")}</p>}

                {availableSegments.length > 0 && (
                  <select
                    defaultValue=""
                    disabled={Boolean(segmentSaving)}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value) void changeSegment(value, "add");
                      event.currentTarget.value = "";
                    }}
                    className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm"
                  >
                    <option value="">+ {tr("Añadir a un segmento", "Aggiungi a un segmento", "Add to a segment", "Aan segment toevoegen")}</option>
                    {availableSegments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name}</option>)}
                  </select>
                )}
              </div>
            </section>

            <section className="rounded-sm border border-border bg-card p-4">
              <SectionTitle icon={ShieldCheck} title={tr("Auditoría", "Audit", "Audit", "Audit")} />
              <div className="mt-4 grid gap-x-5 gap-y-4 text-sm md:grid-cols-2">
                <AuditItem label={tr("Creado", "Creato", "Created", "Aangemaakt")} value={formatDate(contact.created_at)} />
                <AuditItem label={tr("Actualizado", "Aggiornato", "Updated", "Bijgewerkt")} value={formatDate(contact.updated_at)} />
                <AuditItem label={tr("Origen del consentimiento", "Origine consenso", "Consent source", "Toestemmingsbron")} value={contact.consent_source || "—"} />
                <AuditItem label={tr("Fecha del consentimiento", "Data consenso", "Consent date", "Toestemmingsdatum")} value={formatDate(contact.consent_at)} />
                <AuditItem label={tr("Baja", "Disiscrizione", "Unsubscribed", "Uitgeschreven")} value={formatDate(contact.unsubscribed_at)} />
                <AuditItem label={tr("Supresión", "Soppressione", "Suppressed", "Geblokkeerd")} value={formatDate(contact.suppressed_at)} />
                <AuditItem label={tr("Archivo de origen", "File origine", "Source file", "Bronbestand")} value={contact.source_file || "—"} />
                <AuditItem label="Resend ID" value={contact.resend_contact_id || "—"} mono />
              </div>
            </section>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-background px-5 py-4 md:px-7">
          <button type="button" onClick={onClose} className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-accent">
            {tr("Cancelar", "Annulla", "Cancel", "Annuleren")}
          </button>
          <button type="button" disabled={saving} onClick={() => void submit()} className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
            <Save size={16} /> {saving ? tr("Guardando…", "Salvataggio…", "Saving…", "Opslaan…") : tr("Guardar cambios", "Salva modifiche", "Save changes", "Wijzigingen opslaan")}
          </button>
        </div>
      </aside>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof UserRound; title: string }) {
  return <div className="flex items-center gap-2 text-sm font-medium text-foreground"><Icon size={16} className="text-primary" />{title}</div>;
}

function DrawerInput({ label, value, onChange, type = "text", disabled = false, placeholder = "", icon: Icon }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  icon?: typeof Mail;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="relative mt-1">
        {Icon && <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
        <input
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-sm border border-border bg-background py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground ${Icon ? "pl-9 pr-3" : "px-3"}`}
        />
      </div>
    </label>
  );
}

function DrawerSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function AuditItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className={`mt-1 break-all text-foreground ${mono ? "font-mono text-xs" : ""}`}>{value}</div></div>;
}
