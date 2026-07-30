import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { ArrowLeft, FileText, Layers3, Lock, Mail, Plus, RefreshCw, ShieldCheck, Upload, Users, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CLERK_ENABLED, CLERK_PUBLISHABLE_KEY, hasClientAdminAccess } from "@/lib/config";
import {
  createMarketingCampaign,
  createMarketingContact,
  createMarketingSegment,
  fetchMarketingCampaigns,
  fetchMarketingContacts,
  fetchMarketingSegments,
  fetchMarketingStats,
  importMarketingContacts,
  updateMarketingContact,
  updateMarketingSegmentMembers,
  type MarketingCampaign,
  type MarketingCampaignInput,
  type MarketingContact,
  type MarketingContactInput,
  type MarketingContactStatus,
  type MarketingLanguage,
  type MarketingSegment,
  type MarketingStats,
} from "@/lib/marketing";
import { parseMarketingContactsCsv } from "@/lib/marketingCsv";
import { tr } from "@/lib/i18n";

type WorkspaceTab = "contacts" | "campaigns" | "segments";

const EMPTY_CONTACT: MarketingContactInput = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  language: "it",
  contact_type: "lead",
  source: "manual",
  tags: [],
  status: "pending",
  marketing_consent: false,
  consent_source: "manual-crm",
};

const EMPTY_CAMPAIGN: MarketingCampaignInput = {
  name: "",
  subject: "",
  preview_text: "",
  from_name: "Eivitech",
  from_email: "newsletter@notifications.eivitech.com",
  reply_to: "info@eivitech.com",
  language: "it",
  status: "draft",
  segment_id: null,
  topic: "",
  html: "<p>Ciao {{first_name}},</p><p>scrivi qui il contenuto della campagna Eivitech.</p>",
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

function displayName(contact: MarketingContact) {
  return [contact.first_name, contact.last_name].filter(Boolean).join(" ") || "—";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function EmailMarketingShell() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || null;
  const hasAccess = hasClientAdminAccess(email);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("contacts");
  const [contacts, setContacts] = useState<MarketingContact[]>([]);
  const [segments, setSegments] = useState<MarketingSegment[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MarketingContactStatus | "">("");
  const [contactForm, setContactForm] = useState<MarketingContactInput>(EMPTY_CONTACT);
  const [campaignForm, setCampaignForm] = useState<MarketingCampaignInput>(EMPTY_CAMPAIGN);
  const [segmentForm, setSegmentForm] = useState({ name: "", description: "" });

  async function tokenOrThrow() {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");
    return token;
  }

  async function loadWorkspace() {
    setLoading(true);
    setError(null);
    try {
      const token = await tokenOrThrow();
      const [contactsData, segmentsData, campaignsData, statsData] = await Promise.all([
        fetchMarketingContacts(token, { search, status: statusFilter }),
        fetchMarketingSegments(token),
        fetchMarketingCampaigns(token),
        fetchMarketingStats(token),
      ]);
      setContacts(contactsData.contacts);
      setSegments(segmentsData.segments);
      setCampaigns(campaignsData.campaigns);
      setStats(statsData);
    } catch (err) {
      console.error("[email-marketing] load failed", err);
      setError(tr(
        "No se ha podido cargar el módulo de email marketing.",
        "Non è stato possibile caricare il modulo email marketing.",
        "Could not load the email marketing workspace.",
        "De e-mailmarketingmodule kon niet worden geladen.",
      ));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasAccess) void loadWorkspace();
  }, [hasAccess]);

  const filteredContacts = useMemo(() => contacts, [contacts]);

  async function saveContact(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const token = await tokenOrThrow();
      const payload: MarketingContactInput = {
        ...contactForm,
        email: contactForm.email.trim().toLowerCase(),
        tags: contactForm.tags,
        status: contactForm.marketing_consent ? "subscribed" : contactForm.status || "pending",
        consent_at: contactForm.marketing_consent ? new Date().toISOString() : null,
      };
      const result = await createMarketingContact(token, payload);
      setContacts((current) => [result.contact, ...current.filter((item) => item.id !== result.contact.id)]);
      setContactForm(EMPTY_CONTACT);
      setNotice(tr("Contacto guardado.", "Contatto salvato.", "Contact saved.", "Contact opgeslagen."));
      setStats(await fetchMarketingStats(token));
    } catch (err) {
      console.error("[email-marketing] contact save failed", err);
      setError(tr("No se ha podido guardar el contacto.", "Non è stato possibile salvare il contatto.", "Could not save the contact.", "Het contact kon niet worden opgeslagen."));
    } finally {
      setSaving(false);
    }
  }

  async function importCsv(file: File) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const parsed = parseMarketingContactsCsv(await file.text());
      if (parsed.totalRows === 0) {
        throw new Error(parsed.issues.map((issue) => issue.message).join("; ") || "No data rows");
      }
      if (parsed.totalRows > 1000) {
        throw new Error(parsed.issues.map((issue) => issue.message).join("; ") || "Maximum 1000 rows");
      }
      const token = await tokenOrThrow();
      const result = await importMarketingContacts(token, file.name, parsed.contacts, {
        contactRows: parsed.contactRows,
        clientIssues: parsed.issues,
        totalRows: parsed.totalRows,
      });
      const issueDetails = result.errors
        .slice(0, 5)
        .map((issue) => `${tr("Fila", "Riga", "Row", "Rij")} ${issue.row}: ${issue.message}`)
        .join(" · ");
      const summary = tr(
        `Importados: ${result.inserted}; actualizados: ${result.updated}; omitidos: ${result.skipped}.`,
        `Importati: ${result.inserted}; aggiornati: ${result.updated}; saltati: ${result.skipped}.`,
        `Imported: ${result.inserted}; updated: ${result.updated}; skipped: ${result.skipped}.`,
        `Geïmporteerd: ${result.inserted}; bijgewerkt: ${result.updated}; overgeslagen: ${result.skipped}.`,
      );
      setNotice(issueDetails ? `${summary} ${issueDetails}` : summary);
      await loadWorkspace();
    } catch (err) {
      console.error("[email-marketing] CSV import failed", err);
      setError(err instanceof Error ? err.message : tr("Importación fallida.", "Importazione non riuscita.", "Import failed.", "Importeren mislukt."));
    } finally {
      setSaving(false);
    }
  }

  async function changeContactStatus(contact: MarketingContact, status: MarketingContactStatus) {
    setError(null);
    const terminal = contact.status === "unsubscribed" || contact.status === "suppressed";
    const allowResubscribe = terminal && status === "subscribed";

    if (allowResubscribe) {
      const confirmed = window.confirm(tr(
        "Este contacto se había dado de baja o estaba suprimido. Confirma que existe un nuevo consentimiento explícito y documentado.",
        "Questo contatto era disiscritto o soppresso. Conferma che esiste un nuovo consenso esplicito e documentato.",
        "This contact was unsubscribed or suppressed. Confirm that new explicit and documented consent exists.",
        "Dit contact was uitgeschreven of geblokkeerd. Bevestig dat er nieuwe, expliciete en gedocumenteerde toestemming is.",
      ));
      if (!confirmed) return;
    }

    try {
      const token = await tokenOrThrow();
      const result = await updateMarketingContact(token, contact.id, {
        status,
        marketing_consent: status === "subscribed",
        consent_source: status === "subscribed" ? "manual-crm" : contact.consent_source,
        consent_at: status === "subscribed" ? new Date().toISOString() : contact.consent_at,
        allow_resubscribe: allowResubscribe,
      });
      setContacts((current) => current.map((item) => (item.id === contact.id ? result.contact : item)));
      setStats(await fetchMarketingStats(token));
      setNotice(allowResubscribe
        ? tr("Reinscripción registrada en el historial de consentimiento.", "Reiscrizione registrata nello storico del consenso.", "Resubscription recorded in the consent history.", "Herinschrijving vastgelegd in de toestemmingsgeschiedenis.")
        : null);
    } catch (err) {
      console.error("[email-marketing] status update failed", err);
      setError(tr("No se ha podido actualizar el estado.", "Non è stato possibile aggiornare lo stato.", "Could not update the status.", "De status kon niet worden bijgewerkt."));
    }
  }

  async function addContactToSegment(contactId: string, segmentId: string) {
    if (!segmentId) return;
    setError(null);
    try {
      const token = await tokenOrThrow();
      await updateMarketingSegmentMembers(token, segmentId, { add: [contactId] });
      setNotice(tr("Contacto añadido al segmento.", "Contatto aggiunto al segmento.", "Contact added to segment.", "Contact aan segment toegevoegd."));
      await loadWorkspace();
    } catch (err) {
      console.error("[email-marketing] segment membership failed", err);
      setError(tr("No se ha podido añadir el contacto al segmento.", "Non è stato possibile aggiungere il contatto al segmento.", "Could not add the contact to the segment.", "Het contact kon niet aan het segment worden toegevoegd."));
    }
  }

  async function saveSegment(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = await tokenOrThrow();
      const result = await createMarketingSegment(token, segmentForm);
      setSegments((current) => [...current, result.segment].sort((a, b) => a.name.localeCompare(b.name)));
      setSegmentForm({ name: "", description: "" });
      setNotice(tr("Segmento creado.", "Segmento creato.", "Segment created.", "Segment aangemaakt."));
      setStats(await fetchMarketingStats(token));
    } catch (err) {
      console.error("[email-marketing] segment save failed", err);
      setError(tr("No se ha podido crear el segmento.", "Non è stato possibile creare il segmento.", "Could not create the segment.", "Het segment kon niet worden aangemaakt."));
    } finally {
      setSaving(false);
    }
  }

  async function saveCampaign(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = await tokenOrThrow();
      const result = await createMarketingCampaign(token, campaignForm);
      setCampaigns((current) => [result.campaign, ...current]);
      setCampaignForm(EMPTY_CAMPAIGN);
      setNotice(tr("Borrador guardado.", "Bozza salvata.", "Draft saved.", "Concept opgeslagen."));
      setStats(await fetchMarketingStats(token));
    } catch (err) {
      console.error("[email-marketing] campaign save failed", err);
      setError(tr("No se ha podido guardar la campaña.", "Non è stato possibile salvare la campagna.", "Could not save the campaign.", "De campagne kon niet worden opgeslagen."));
    } finally {
      setSaving(false);
    }
  }

  if (!hasAccess) {
    return (
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <Lock className="text-destructive" />
          <h1 className="display-md mt-5">{tr("Acceso no autorizado", "Accesso non autorizzato", "Unauthorized access", "Geen toegang")}</h1>
          <p className="mt-4 text-muted-foreground">{email}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container-x py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft size={15} /> {tr("Volver al CRM", "Torna al CRM", "Back to CRM", "Terug naar CRM")}
          </Link>
          <div className="eyebrow mt-5">Eivitech CRM</div>
          <h1 className="display-lg mt-3">Email Marketing</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground leading-relaxed">
            {tr(
              "Contactos, segmentos y borradores de campaña en una única área protegida.",
              "Contatti, segmenti e bozze di campagna in un’unica area protetta.",
              "Contacts, segments and campaign drafts in one protected workspace.",
              "Contacten, segmenten en campagneconcepten in één beveiligde werkruimte.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 shadow-soft">
          <UserButton />
          <div className="text-sm text-muted-foreground">{email}</div>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">{tr("Fase 1 gratuita y segura", "Fase 1 gratuita e sicura", "Free and safe Phase 1", "Gratis en veilige fase 1")}</div>
        <p className="mt-1">
          {tr(
            "La base de datos, la importación CSV y los borradores están activos. El envío masivo permanece desactivado hasta integrar baja, sincronización Resend y confirmación final.",
            "Database, importazione CSV e bozze sono attive. L’invio massivo resta disattivato finché non integriamo disiscrizione, sincronizzazione Resend e conferma finale.",
            "Database, CSV import and drafts are active. Bulk sending stays disabled until unsubscribe, Resend sync and final confirmation are integrated.",
            "Database, CSV-import en concepten zijn actief. Bulkverzending blijft uitgeschakeld totdat uitschrijving, Resend-synchronisatie en definitieve bevestiging zijn geïntegreerd.",
          )}
        </p>
      </div>

      {error && <div className="mt-5 rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {notice && <div className="mt-5 rounded-sm border border-secondary/30 bg-secondary/10 p-4 text-sm text-foreground">{notice}</div>}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Metric icon={Users} label={tr("Contactos", "Contatti", "Contacts", "Contacten")} value={stats?.contacts.total || 0} />
        <Metric icon={ShieldCheck} label={tr("Suscritos", "Iscritti", "Subscribed", "Ingeschreven")} value={stats?.contacts.subscribed || 0} />
        <Metric icon={Layers3} label={tr("Segmentos", "Segmenti", "Segments", "Segmenten")} value={stats?.segments.total || 0} />
        <Metric icon={FileText} label={tr("Borradores", "Bozze", "Drafts", "Concepten")} value={stats?.campaigns.drafts || 0} />
        <Metric icon={Mail} label={tr("Enviadas", "Inviate", "Sent", "Verzonden")} value={stats?.campaigns.sent || 0} />
      </div>

      <div className="mt-7 flex flex-wrap gap-2 rounded-sm border border-border bg-card p-2 shadow-soft">
        <Tab active={activeTab === "contacts"} icon={Users} label={tr("Contactos", "Contatti", "Contacts", "Contacten")} onClick={() => setActiveTab("contacts")} />
        <Tab active={activeTab === "segments"} icon={Layers3} label={tr("Segmentos", "Segmenti", "Segments", "Segmenten")} onClick={() => setActiveTab("segments")} />
        <Tab active={activeTab === "campaigns"} icon={FileText} label={tr("Campañas", "Campagne", "Campaigns", "Campagnes")} onClick={() => setActiveTab("campaigns")} />
        <button onClick={() => void loadWorkspace()} disabled={loading} className="ml-auto inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm text-primary hover:bg-accent disabled:opacity-60">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> {tr("Actualizar", "Aggiorna", "Refresh", "Vernieuwen")}
        </button>
      </div>

      {activeTab === "contacts" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
          <form onSubmit={saveContact} className="rounded-sm border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2 font-medium"><Plus size={17} className="text-primary" /> {tr("Nuevo contacto", "Nuovo contatto", "New contact", "Nieuw contact")}</div>
            <div className="mt-4 space-y-3">
              <Input label="Email *" type="email" required value={contactForm.email} onChange={(value) => setContactForm((current) => ({ ...current, email: value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label={tr("Nombre", "Nome", "First name", "Voornaam")} value={contactForm.first_name || ""} onChange={(value) => setContactForm((current) => ({ ...current, first_name: value }))} />
                <Input label={tr("Apellido", "Cognome", "Last name", "Achternaam")} value={contactForm.last_name || ""} onChange={(value) => setContactForm((current) => ({ ...current, last_name: value }))} />
              </div>
              <Input label={tr("Teléfono", "Telefono", "Phone", "Telefoon")} value={contactForm.phone || ""} onChange={(value) => setContactForm((current) => ({ ...current, phone: value }))} />
              <Select label={tr("Idioma", "Lingua", "Language", "Taal")} value={contactForm.language || "it"} options={LANGUAGE_OPTIONS} onChange={(value) => setContactForm((current) => ({ ...current, language: value as MarketingLanguage }))} />
              <Input label={tr("Tipo de contacto", "Tipo contatto", "Contact type", "Contacttype")} value={contactForm.contact_type || ""} onChange={(value) => setContactForm((current) => ({ ...current, contact_type: value }))} />
              <Input label="Tag (separati da virgola)" value={(contactForm.tags || []).join(", ")} onChange={(value) => setContactForm((current) => ({ ...current, tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) }))} />
              <label className="flex items-start gap-3 rounded-sm border border-border p-3 text-sm">
                <input type="checkbox" className="mt-1" checked={Boolean(contactForm.marketing_consent)} onChange={(event) => setContactForm((current) => ({ ...current, marketing_consent: event.target.checked, status: event.target.checked ? "subscribed" : "pending" }))} />
                <span>{tr("Consentimiento marketing documentado", "Consenso marketing documentato", "Documented marketing consent", "Gedocumenteerde marketingtoestemming")}</span>
              </label>
              <button disabled={saving} className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">{tr("Guardar contacto", "Salva contatto", "Save contact", "Contact opslaan")}</button>
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-center gap-2 font-medium"><Upload size={17} className="text-primary" /> Import CSV</div>
              <p className="mt-2 text-xs text-muted-foreground">Mailchimp, Digitalempower o CSV standard. Nessun servizio esterno.</p>
              <input
                className="mt-3 block w-full text-xs"
                type="file"
                accept=".csv,text/csv"
                disabled={saving}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importCsv(file);
                  event.currentTarget.value = "";
                }}
              />
            </div>
          </form>

          <div className="min-w-0 rounded-sm border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-end gap-3">
              <Input label={tr("Buscar", "Cerca", "Search", "Zoeken")} value={search} onChange={setSearch} />
              <Select label={tr("Estado", "Stato", "Status", "Status")} value={statusFilter} options={[{ value: "", label: tr("Todos", "Tutti", "All", "Alle") }, ...STATUS_OPTIONS]} onChange={(value) => setStatusFilter(value as MarketingContactStatus | "")} />
              <button onClick={() => void loadWorkspace()} className="rounded-sm border border-border px-4 py-2.5 text-sm hover:bg-accent">{tr("Aplicar filtros", "Applica filtri", "Apply filters", "Filters toepassen")}</button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">{tr("Contacto", "Contatto", "Contact", "Contact")}</th>
                    <th className="px-3 py-3">{tr("Idioma", "Lingua", "Language", "Taal")}</th>
                    <th className="px-3 py-3">{tr("Tipo", "Tipo", "Type", "Type")}</th>
                    <th className="px-3 py-3">{tr("Estado", "Stato", "Status", "Status")}</th>
                    <th className="px-3 py-3">Tag</th>
                    <th className="px-3 py-3">{tr("Segmento", "Segmento", "Segment", "Segment")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-border/70 align-top">
                      <td className="px-3 py-4">
                        <div className="font-medium">{displayName(contact)}</div>
                        <div className="text-muted-foreground">{contact.email}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatDate(contact.created_at)}</div>
                      </td>
                      <td className="px-3 py-4 uppercase">{contact.language || "—"}</td>
                      <td className="px-3 py-4">{contact.contact_type || "—"}</td>
                      <td className="px-3 py-4">
                        <select value={contact.status || "pending"} onChange={(event) => void changeContactStatus(contact, event.target.value as MarketingContactStatus)} className="rounded-sm border border-border bg-background px-2 py-2 text-xs">
                          {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                        <div className="mt-1 text-xs text-muted-foreground">{contact.marketing_consent ? "consenso: sì" : "consenso: no"}</div>
                      </td>
                      <td className="px-3 py-4">{(contact.tags || []).join(", ") || "—"}</td>
                      <td className="px-3 py-4">
                        <div className="text-xs text-muted-foreground">{contact.segments?.map((segment) => segment.name).join(", ") || "—"}</div>
                        {segments.length > 0 && (
                          <select defaultValue="" onChange={(event) => { void addContactToSegment(contact.id, event.target.value); event.currentTarget.value = ""; }} className="mt-2 rounded-sm border border-border bg-background px-2 py-2 text-xs">
                            <option value="">+ {tr("Añadir", "Aggiungi", "Add", "Toevoegen")}</option>
                            {segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name}</option>)}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && filteredContacts.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">{tr("No hay contactos.", "Nessun contatto.", "No contacts.", "Geen contacten.")}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "segments" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
          <form onSubmit={saveSegment} className="rounded-sm border border-border bg-card p-5 shadow-soft">
            <div className="font-medium">{tr("Nuevo segmento", "Nuovo segmento", "New segment", "Nieuw segment")}</div>
            <div className="mt-4 space-y-3">
              <Input label={tr("Nombre", "Nome", "Name", "Naam")} required value={segmentForm.name} onChange={(value) => setSegmentForm((current) => ({ ...current, name: value }))} />
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Descripción", "Descrizione", "Description", "Beschrijving")}</span>
                <textarea className="mt-1 min-h-28 w-full rounded-sm border border-border bg-background px-3 py-2" value={segmentForm.description} onChange={(event) => setSegmentForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <button disabled={saving} className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">{tr("Crear segmento", "Crea segmento", "Create segment", "Segment aanmaken")}</button>
            </div>
          </form>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {segments.map((segment) => (
              <div key={segment.id} className="rounded-sm border border-border bg-card p-5 shadow-soft">
                <div className="font-medium">{segment.name}</div>
                <div className="mt-2 text-sm text-muted-foreground">{segment.description || tr("Sin descripción", "Senza descrizione", "No description", "Geen beschrijving")}</div>
                <div className="mt-5 text-3xl font-medium">{segment.member_count || 0}</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{tr("Contactos", "Contatti", "Contacts", "Contacten")}</div>
              </div>
            ))}
            {segments.length === 0 && <div className="rounded-sm border border-dashed border-border p-8 text-sm text-muted-foreground">{tr("Crea el primer segmento.", "Crea il primo segmento.", "Create the first segment.", "Maak het eerste segment.")}</div>}
          </div>
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[480px_1fr]">
          <form onSubmit={saveCampaign} className="rounded-sm border border-border bg-card p-5 shadow-soft">
            <div className="font-medium">{tr("Nueva campaña", "Nuova campagna", "New campaign", "Nieuwe campagne")}</div>
            <div className="mt-4 space-y-3">
              <Input label={tr("Nombre interno", "Nome interno", "Internal name", "Interne naam")} required value={campaignForm.name} onChange={(value) => setCampaignForm((current) => ({ ...current, name: value }))} />
              <Input label={tr("Asunto", "Oggetto", "Subject", "Onderwerp")} required value={campaignForm.subject} onChange={(value) => setCampaignForm((current) => ({ ...current, subject: value }))} />
              <Input label="Preview text" value={campaignForm.preview_text || ""} onChange={(value) => setCampaignForm((current) => ({ ...current, preview_text: value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Select label={tr("Idioma", "Lingua", "Language", "Taal")} value={campaignForm.language || "it"} options={LANGUAGE_OPTIONS} onChange={(value) => setCampaignForm((current) => ({ ...current, language: value as MarketingLanguage }))} />
                <Select label={tr("Segmento", "Segmento", "Segment", "Segment")} value={campaignForm.segment_id || ""} options={[{ value: "", label: tr("Sin segmento", "Nessun segmento", "No segment", "Geen segment") }, ...segments.map((segment) => ({ value: segment.id, label: segment.name }))]} onChange={(value) => setCampaignForm((current) => ({ ...current, segment_id: value || null }))} />
              </div>
              <Input label="Topic" value={campaignForm.topic || ""} onChange={(value) => setCampaignForm((current) => ({ ...current, topic: value }))} />
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">HTML</span>
                <textarea className="mt-1 min-h-72 w-full rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs" value={campaignForm.html || ""} onChange={(event) => setCampaignForm((current) => ({ ...current, html: event.target.value }))} />
              </label>
              <button disabled={saving} className="w-full rounded-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">{tr("Guardar borrador", "Salva bozza", "Save draft", "Concept opslaan")}</button>
            </div>
          </form>

          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-sm border border-border bg-card p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{campaign.name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{campaign.subject}</div>
                  </div>
                  <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide">{campaign.status}</span>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <Info label={tr("Idioma", "Lingua", "Language", "Taal")} value={(campaign.language || "it").toUpperCase()} />
                  <Info label={tr("Segmento", "Segmento", "Segment", "Segment")} value={campaign.segment_name || "—"} />
                  <Info label={tr("Creada", "Creata", "Created", "Aangemaakt")} value={formatDate(campaign.created_at)} />
                </div>
              </div>
            ))}
            {campaigns.length === 0 && <div className="rounded-sm border border-dashed border-border p-8 text-sm text-muted-foreground">{tr("Aún no hay campañas.", "Non ci sono ancora campagne.", "No campaigns yet.", "Nog geen campagnes.")}</div>}
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-sm border border-border bg-card p-5 shadow-soft">
      <Icon size={19} className="text-primary" />
      <div className="mt-3 text-3xl font-medium">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Tab({ active, icon: Icon, label, onClick }: { active: boolean; icon: LucideIcon; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}><Icon size={15} />{label}</button>;
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <input className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <select className="mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-1 font-medium">{value}</div></div>;
}

const EmailMarketingAuth = () => (
  <ClerkProvider
    publishableKey={CLERK_PUBLISHABLE_KEY}
    afterSignOutUrl={`${import.meta.env.BASE_URL}`}
    signInFallbackRedirectUrl={`${import.meta.env.BASE_URL}dashboard/email-marketing`}
    signUpFallbackRedirectUrl={`${import.meta.env.BASE_URL}dashboard/email-marketing`}
  >
    <SignedOut>
      <section className="container-x py-20">
        <div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card">
          <Lock className="text-primary" />
          <h1 className="display-md mt-5">{tr("Acceso privado", "Accesso privato", "Private access", "Privétoegang")}</h1>
          <p className="mt-4 text-muted-foreground">{tr("Inicia sesión para acceder al email marketing.", "Accedi per entrare nell’email marketing.", "Sign in to access email marketing.", "Log in voor toegang tot e-mailmarketing.")}</p>
          <SignInButton mode="modal"><button className="mt-6 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">{tr("Iniciar sesión", "Accedi", "Sign in", "Inloggen")}</button></SignInButton>
        </div>
      </section>
    </SignedOut>
    <SignedIn><EmailMarketingShell /></SignedIn>
  </ClerkProvider>
);

const EmailMarketing = () => (
  <>
    <SEO title="Email Marketing CRM | Eivitech Ibiza" description="Area privata Eivitech per contatti, segmenti e campagne email." path="/dashboard/email-marketing" noIndex />
    {!CLERK_ENABLED ? (
      <section className="container-x py-20"><div className="max-w-2xl rounded-sm border border-border bg-card p-8 shadow-card"><Lock className="text-primary" /><h1 className="display-md mt-5">Clerk non configurato</h1></div></section>
    ) : <EmailMarketingAuth />}
  </>
);

export default EmailMarketing;
