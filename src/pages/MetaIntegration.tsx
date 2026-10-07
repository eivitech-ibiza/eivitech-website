import { useEffect, useMemo, useState } from "react";
import { ClerkProvider, SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { AlertTriangle, CheckCircle2, Database, Inbox, Lock, RefreshCw, Save, Settings2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { ALLOWED_ADMIN_EMAILS, CLERK_ENABLED, CLERK_PUBLISHABLE_KEY, hasClientAdminAccess } from "@/lib/config";
import {
  fetchMetaAdminConfig,
  fetchMetaLeadInbox,
  fetchMetaOperationalStatus,
  fetchPublicMetaConfig,
  processMetaLeadInbox,
  processMetaOutbox,
  retryFailedMetaEvents,
  updateMetaAdminConfig,
  updateMetaCrmConfig,
  type MetaAdminConfig,
  type MetaLeadInboxItem,
  type MetaOperationalStatus,
} from "@/lib/metaIntegration";
import { tr } from "@/lib/i18n";

const LOGOUT_REDIRECT_URL = "/dashboard/meta";

function parseObject(value: string, label: string) {
  if (!value.trim()) return {};
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${label}: JSON object required`);
  return parsed as Record<string, unknown>;
}

function statusCount(rows: Array<{ status: string; total: number }> | undefined, status: string) {
  return rows?.find((row) => row.status === status)?.total ?? 0;
}

function CredentialPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs ${ok ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "border-amber-500/30 bg-amber-500/10 text-amber-700"}`}>
      {label}: {ok ? "OK" : "missing"}
    </span>
  );
}

function MetaPanel() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const allowed = hasClientAdminAccess(email);

  const [config, setConfig] = useState<MetaAdminConfig | null>(null);
  const [status, setStatus] = useState<MetaOperationalStatus | null>(null);
  const [inbox, setInbox] = useState<MetaLeadInboxItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pixelId, setPixelId] = useState("");
  const [pixelEnabled, setPixelEnabled] = useState(false);
  const [webCapiMode, setWebCapiMode] = useState<"disabled" | "test" | "production">("disabled");
  const [webTestCode, setWebTestCode] = useState("");

  const [datasetId, setDatasetId] = useState("");
  const [pageId, setPageId] = useState("");
  const [formIds, setFormIds] = useState("");
  const [crmMode, setCrmMode] = useState<"disabled" | "test" | "production">("disabled");
  const [crmTestCode, setCrmTestCode] = useState("");
  const [formMappings, setFormMappings] = useState("{}");
  const [eventMappings, setEventMappings] = useState(JSON.stringify({
    qualified: "LeadQualified",
    visit_confirmed: "AppointmentScheduled",
    proposal_sent: "ProposalSent",
    deal_won: "Purchase",
  }, null, 2));

  const applyConfig = (next: MetaAdminConfig) => {
    setConfig(next);
    setPixelId(next.web.pixelId || "");
    setPixelEnabled(next.web.enabled);
    setWebCapiMode(next.web.capiMode || "disabled");
    setWebTestCode(next.web.testEventCode || "");
    setDatasetId(next.crm.datasetId || "");
    setPageId(next.crm.pageId || "");
    setFormIds(next.crm.allowedFormIds.join(", "));
    setCrmMode(next.crm.mode);
    setCrmTestCode(next.crm.testEventCode || "");
    setFormMappings(JSON.stringify(next.crm.formMappings || {}, null, 2));
    setEventMappings(JSON.stringify(next.crm.eventMappings || {}, null, 2));
  };

  const load = async () => {
    if (!allowed) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing CRM authentication token");

      // Configuration is the source of truth for the form and must load
      // independently from optional operational diagnostics.
      const nextConfig = await fetchMetaAdminConfig(token);
      applyConfig(nextConfig);

      const [statusResult, inboxResult] = await Promise.allSettled([
        fetchMetaOperationalStatus(token),
        fetchMetaLeadInbox(token),
      ]);

      if (statusResult.status === "fulfilled") {
        setStatus(statusResult.value);
      }
      if (inboxResult.status === "fulfilled") {
        setInbox(inboxResult.value.leads);
      }

      const secondaryErrors: string[] = [];
      if (statusResult.status === "rejected") {
        secondaryErrors.push("diagnostica operativa");
      }
      if (inboxResult.status === "rejected") {
        secondaryErrors.push("inbox Lead Ads");
      }
      if (secondaryErrors.length > 0) {
        setError(`Configurazione Meta caricata correttamente, ma non è stato possibile aggiornare: ${secondaryErrors.join(", ")}.`);
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? `Impossibile caricare la configurazione Meta: ${loadError.message}`
          : "Impossibile caricare la configurazione Meta"
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  const credentialState = config?.credentials ?? status?.credentials;
  const incomplete = useMemo(() => inbox.filter((item) => item.status === "to_complete" || item.status === "ready"), [inbox]);

  if (!allowed) {
    return (
      <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-6">
        <div className="flex items-center gap-2 font-medium"><Lock className="h-4 w-4" /> {tr("Accesso non autorizzato", "Accesso non autorizzato", "Access not authorised", "Geen toegang")}</div>
      </div>
    );
  }

  const saveWeb = async () => {
    setBusy(true); setError(null); setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing CRM authentication token");
      const next = await updateMetaAdminConfig(token, {
        pixelId: pixelId.trim() || null,
        enabled: pixelEnabled,
        capiMode: webCapiMode,
        testEventCode: webTestCode.trim() || null,
      });
      applyConfig(next);
      setMessage("Configurazione Pixel/CAPI web salvata.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Meta web config update failed");
    } finally { setBusy(false); }
  };

  const saveCrm = async () => {
    setBusy(true); setError(null); setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing CRM authentication token");
      const next = await updateMetaCrmConfig(token, {
        datasetId: datasetId.trim() || null,
        pageId: pageId.trim() || null,
        allowedFormIds: formIds.split(",").map((value) => value.trim()).filter(Boolean),
        formMappings: parseObject(formMappings, "Form mappings") as Record<string, Record<string, string>>,
        eventMappings: parseObject(eventMappings, "Event mappings") as Record<string, string>,
        mode: crmMode,
        testEventCode: crmTestCode.trim() || null,
      });
      applyConfig(next);
      setMessage("Configurazione CRM–Meta salvata.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Meta CRM config update failed");
    } finally { setBusy(false); }
  };

  const verifyPublic = async () => {
    setBusy(true); setError(null); setMessage(null);
    try {
      const response = await fetchPublicMetaConfig();
      setMessage(`Runtime pubblico: ${response.web.enabled ? "enabled" : "disabled"} · Pixel ${response.web.pixelId || "—"}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Meta public config unavailable");
    } finally { setBusy(false); }
  };

  const processInbox = async () => {
    setBusy(true); setError(null); setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing CRM authentication token");
      const result = await processMetaLeadInbox(token, 20);
      setMessage(`Lead Ads elaborati: webhook ${result.processed} · Graph ${result.fallback.synced}/${result.fallback.fetched}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Meta lead processing failed");
    } finally { setBusy(false); }
  };

  const processCapi = async () => {
    setBusy(true); setError(null); setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing CRM authentication token");
      const result = await processMetaOutbox(token, 20);
      setMessage(`Eventi CAPI elaborati: ${result.processed}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Meta CAPI processing failed");
    } finally { setBusy(false); }
  };

  const retryFailed = async () => {
    setBusy(true); setError(null); setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing CRM authentication token");
      const result = await retryFailedMetaEvents(token);
      setMessage(`Eventi rimessi in coda: ${result.retried}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Meta retry failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold"><Settings2 className="h-4 w-4" /> Meta · stato integrazione</div>
            <p className="mt-2 text-sm text-muted-foreground">Le credenziali restano su Railway: qui è visibile solo la loro presenza.</p>
          </div>
          <button type="button" disabled={busy} onClick={() => void load()} className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm">
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Aggiorna
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <CredentialPill ok={Boolean(credentialState?.capiAccessToken)} label="CAPI token" />
          <CredentialPill ok={Boolean(credentialState?.pageAccessToken)} label="Page token" />
          <CredentialPill ok={Boolean(credentialState?.appSecret)} label="App Secret" />
          <CredentialPill ok={Boolean(credentialState?.webhookVerifyToken)} label="Verify token" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 font-semibold"><Settings2 className="h-4 w-4" /> Pixel + CAPI web</div>
          <div className="mt-5 grid gap-4">
            <label className="text-sm">Pixel / dataset web
              <input value={pixelId} onChange={(e) => setPixelId(e.target.value.replace(/\D/g, "").slice(0, 40))} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2" />
            </label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={pixelEnabled} onChange={(e) => setPixelEnabled(e.target.checked)} /> Pixel attivo</label>
            <label className="text-sm">CAPI web
              <select value={webCapiMode} onChange={(e) => setWebCapiMode(e.target.value as typeof webCapiMode)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2">
                <option value="disabled">Disattivata</option><option value="test">Test</option><option value="production">Produzione</option>
              </select>
            </label>
            <label className="text-sm">Test Event Code
              <input value={webTestCode} onChange={(e) => setWebTestCode(e.target.value)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2" />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="button" disabled={busy} onClick={() => void saveWeb()} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground"><Save className="h-4 w-4" /> Salva web</button>
            <button type="button" disabled={busy} onClick={() => void verifyPublic()} className="rounded-sm border border-border px-4 py-2 text-sm">Verifica runtime</button>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 font-semibold"><Database className="h-4 w-4" /> CRM + Lead Ads + CAPI</div>
          <div className="mt-5 grid gap-4">
            <label className="text-sm">Dataset CRM<input value={datasetId} onChange={(e) => setDatasetId(e.target.value.replace(/\D/g, "").slice(0, 40))} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2" /></label>
            <label className="text-sm">Page ID<input value={pageId} onChange={(e) => setPageId(e.target.value.replace(/\D/g, "").slice(0, 40))} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2" /></label>
            <label className="text-sm">Form ID autorizzati, separati da virgola<input value={formIds} onChange={(e) => setFormIds(e.target.value)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2" /></label>
            <label className="text-sm">Modalità
              <select value={crmMode} onChange={(e) => setCrmMode(e.target.value as typeof crmMode)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2">
                <option value="disabled">Disattivata</option><option value="test">Test</option><option value="production">Produzione</option>
              </select>
            </label>
            <label className="text-sm">Test Event Code<input value={crmTestCode} onChange={(e) => setCrmTestCode(e.target.value)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2" /></label>
            <label className="text-sm">Mapping campi modulo (JSON)<textarea rows={6} value={formMappings} onChange={(e) => setFormMappings(e.target.value)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 font-mono text-xs" /></label>
            <label className="text-sm">Mapping esiti CRM → eventi Meta (JSON)<textarea rows={6} value={eventMappings} onChange={(e) => setEventMappings(e.target.value)} className="mt-1 w-full rounded-sm border border-input bg-background px-3 py-2 font-mono text-xs" /></label>
          </div>
          <button type="button" disabled={busy} onClick={() => void saveCrm()} className="mt-5 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground"><Save className="h-4 w-4" /> Salva CRM–Meta</button>
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold"><Inbox className="h-4 w-4" /> Operatività</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => void processCapi()} className="rounded-sm border border-border px-3 py-2 text-sm">Elabora CAPI ora</button>
            <button type="button" disabled={busy} onClick={() => void processInbox()} className="rounded-sm border border-border px-3 py-2 text-sm">Elabora Lead Ads</button>
            <button type="button" disabled={busy} onClick={() => void retryFailed()} className="rounded-sm border border-border px-3 py-2 text-sm">Riprova eventi falliti</button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-sm border border-border p-4"><div className="text-xs text-muted-foreground">Outbox queued</div><div className="mt-1 text-2xl">{statusCount(status?.outbox, "queued")}</div></div>
          <div className="rounded-sm border border-border p-4"><div className="text-xs text-muted-foreground">Outbox processing / retry</div><div className="mt-1 text-2xl">{statusCount(status?.outbox, "processing") + statusCount(status?.outbox, "retry")}</div></div>
          <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/5 p-4"><div className="text-xs text-muted-foreground">Outbox sent</div><div className="mt-1 text-2xl">{statusCount(status?.outbox, "sent")}</div></div>
          <div className="rounded-sm border border-border p-4"><div className="text-xs text-muted-foreground">Outbox failed</div><div className="mt-1 text-2xl">{statusCount(status?.outbox, "failed")}</div></div>
          <div className="rounded-sm border border-border p-4"><div className="text-xs text-muted-foreground">Outbox skipped</div><div className="mt-1 text-2xl">{statusCount(status?.outbox, "skipped")}</div></div>
          <div className="rounded-sm border border-border p-4"><div className="text-xs text-muted-foreground">Lead da completare</div><div className="mt-1 text-2xl">{statusCount(status?.inbox, "to_complete")}</div></div>
          <div className="rounded-sm border border-border p-4"><div className="text-xs text-muted-foreground">Lead promossi</div><div className="mt-1 text-2xl">{statusCount(status?.inbox, "promoted")}</div></div>
        </div>

        {status?.lastSuccess && (
          <div className="mt-4 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-4 w-4" /> Ultimo evento CAPI inviato</div>
            <div className="mt-1 text-muted-foreground">
              {status.lastSuccess.event_name || "—"} · event_id {status.lastSuccess.event_id || "—"} · {status.lastSuccess.sent_at || "ora non disponibile"}
            </div>
          </div>
        )}

        {status?.lastPendingError && (
          <div className="mt-4 rounded-sm border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Ultimo evento CAPI in attesa / retry</div>
            <div className="mt-1 text-muted-foreground">
              {status.lastPendingError.event_name || "—"} · event_id {status.lastPendingError.event_id || "—"} ·
              stato {status.lastPendingError.status || "—"} · tentativi {status.lastPendingError.attempts ?? 0}
            </div>
            <div className="mt-1 text-muted-foreground">
              {status.lastPendingError.last_error_code || "—"}: {status.lastPendingError.last_error_message || "Dettaglio non disponibile"}
              {status.lastPendingError.next_attempt_at ? ` · Prossimo tentativo: ${status.lastPendingError.next_attempt_at}` : ""}
            </div>
          </div>
        )}

        {status?.lastError && (
          <div className="mt-4 rounded-sm border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Ultimo errore Meta</div>
            <div className="mt-1 text-muted-foreground">{status.lastError.last_error_code}: {status.lastError.last_error_message}</div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          {incomplete.slice(0, 20).map((item) => (
            <div key={item.id} className="rounded-sm border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">Meta lead {item.meta_lead_id}</div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs">{item.status}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Form: {item.form_id || "—"} · Campaign: {item.campaign_id || "—"}</div>
              <div className="mt-2 text-sm">Ricevuto: {Object.entries(item.mapped_data || {}).map(([k, v]) => `${k}: ${v}`).join(" · ") || "nessun campo mappato"}</div>
              <div className="mt-1 text-xs text-amber-700">Campi mancanti: {(item.missing_fields || []).join(", ") || "nessuno"}</div>
            </div>
          ))}
          {incomplete.length === 0 && <div className="text-sm text-muted-foreground">Nessun lead Meta in attesa di completamento.</div>}
        </div>
      </div>

      {message && <p className="flex items-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {message}</p>}
      {error && <p className="rounded-sm border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function MetaWorkspace() {
  return (
    <>
      <SEO title="Meta Integration | Eivitech CRM" description="Private Eivitech CRM Meta integration settings." path="/dashboard/meta" noIndex />
      <section className="container-x py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><div className="eyebrow">CRM · Meta</div><h1 className="display-sm mt-3">Integrazione Meta</h1></div>
          <div className="flex items-center gap-3"><SignedIn><UserButton /></SignedIn><SignedIn><SignOutButton redirectUrl={LOGOUT_REDIRECT_URL}><button className="text-sm text-muted-foreground hover:text-foreground">Logout</button></SignOutButton></SignedIn></div>
        </div>
        <SignedOut>
          <div className="rounded-sm border border-border bg-card p-8">
            <p className="text-sm text-muted-foreground">Accedi al CRM per gestire Meta.</p>
            <SignInButton mode="modal"><button className="mt-4 rounded-sm bg-primary px-5 py-3 text-sm text-primary-foreground">Login</button></SignInButton>
          </div>
        </SignedOut>
        <SignedIn><MetaPanel /></SignedIn>
      </section>
    </>
  );
}

export default function MetaIntegration() {
  if (!CLERK_ENABLED) {
    return (
      <>
        <SEO title="Meta Integration | Eivitech CRM" description="Private Eivitech CRM Meta integration settings." path="/dashboard/meta" noIndex />
        <section className="container-x py-10">
          <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-6 text-sm">
            Clerk non configurato. Admin consentiti: {ALLOWED_ADMIN_EMAILS.join(", ")}
          </div>
        </section>
      </>
    );
  }
  return <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl={LOGOUT_REDIRECT_URL}><MetaWorkspace /></ClerkProvider>;
}
