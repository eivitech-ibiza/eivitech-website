import { useEffect, useState } from "react";
import { ClerkProvider, SignInButton, SignOutButton, SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/clerk-react";
import { CheckCircle2, Lock, RefreshCw, Save, Settings2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { ALLOWED_ADMIN_EMAILS, CLERK_ENABLED, CLERK_PUBLISHABLE_KEY, hasClientAdminAccess } from "@/lib/config";
import { fetchMetaAdminConfig, fetchPublicMetaConfig, updateMetaAdminConfig, type MetaPublicWebConfig } from "@/lib/metaIntegration";
import { tr } from "@/lib/i18n";

const LOGOUT_REDIRECT_URL = "/dashboard/meta";

function MetaPanel() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const allowed = hasClientAdminAccess(email);
  const [config, setConfig] = useState<MetaPublicWebConfig | null>(null);
  const [pixelId, setPixelId] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!allowed) return;
    setChecking(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing CRM authentication token");
      const response = await fetchMetaAdminConfig(token);
      setConfig(response.web);
      setPixelId(response.web.pixelId || "");
      setEnabled(response.web.enabled);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Meta config unavailable");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void load();
    // getToken is stable for the authenticated Clerk session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed]);

  if (!allowed) {
    return (
      <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-6">
        <div className="flex items-center gap-2 font-medium"><Lock className="h-4 w-4" /> {tr("Accesso non autorizzato", "Accesso non autorizzato", "Access not authorised", "Geen toegang")}</div>
        <p className="mt-2 text-sm text-muted-foreground">
          {tr("Questa integrazione è riservata agli amministratori CRM autorizzati.", "Questa integrazione è riservata agli amministratori CRM autorizzati.", "This integration is restricted to authorised CRM administrators.", "Deze integratie is alleen voor geautoriseerde CRM-beheerders.")}
        </p>
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing CRM authentication token");
      const response = await updateMetaAdminConfig(token, { pixelId: pixelId.trim() || null, enabled });
      setConfig(response.web);
      setPixelId(response.web.pixelId || "");
      setEnabled(response.web.enabled);
      setMessage(tr("Configurazione salvata.", "Configurazione salvata.", "Configuration saved.", "Configuratie opgeslagen."));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Meta config update failed");
    } finally {
      setSaving(false);
    }
  };

  const verifyPublic = async () => {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetchPublicMetaConfig();
      setMessage(
        response.web.configured
          ? `Runtime: ${response.web.enabled ? "enabled" : "disabled"} · Pixel ${response.web.pixelId || "—"}`
          : tr("Configurazione runtime non ancora impostata; resta disponibile solo il fallback di transizione.", "Configurazione runtime non ancora impostata; resta disponibile solo il fallback di transizione.", "Runtime config is not set yet; only the transition fallback remains available.", "Runtimeconfiguratie is nog niet ingesteld; alleen de tijdelijke fallback blijft beschikbaar.")
      );
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Meta public config unavailable");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border bg-card p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Settings2 className="h-4 w-4" />
              Meta Pixel
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {tr(
                "L'ID viene letto a runtime dal CRM. Disattivando l'interruttore, il backend prevale sul fallback VITE e il Pixel non viene caricato.",
                "L'ID viene letto a runtime dal CRM. Disattivando l'interruttore, il backend prevale sul fallback VITE e il Pixel non viene caricato.",
                "The ID is read at runtime from the CRM. When disabled here, the backend overrides the VITE fallback and the Pixel is not loaded.",
                "De ID wordt runtime uit het CRM gelezen. Als je dit hier uitschakelt, overschrijft de backend de VITE-fallback en wordt de Pixel niet geladen."
              )}
            </p>
          </div>
          {config?.configured && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.enabled ? "bg-emerald-500/10 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
              {config.enabled ? "Enabled" : "Disabled"}
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Pixel ID</span>
            <input
              value={pixelId}
              onChange={(event) => setPixelId(event.target.value.replace(/\D/g, "").slice(0, 32))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="123456789012345"
              className="w-full rounded-sm border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex min-h-12 items-center gap-3 rounded-sm border border-border px-4 py-3 text-sm">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="h-4 w-4 accent-primary" />
            {tr("Pixel attivo", "Pixel attivo", "Pixel enabled", "Pixel actief")}
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? tr("Salvataggio…", "Salvataggio…", "Saving…", "Opslaan…") : tr("Salva", "Salva", "Save", "Opslaan")}
          </button>
          <button type="button" disabled={checking} onClick={verifyPublic} className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} /> {tr("Verifica runtime", "Verifica runtime", "Verify runtime", "Runtime controleren")}
          </button>
        </div>

        {message && <p className="mt-4 flex items-start gap-2 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {message}</p>}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>

      <div className="rounded-sm border border-border bg-accent/20 p-5 text-sm text-muted-foreground">
        {tr(
          "In questa prima fase il pannello gestisce solo la configurazione pubblica del Pixel. Token, App Secret e credenziali CAPI resteranno esclusivamente server-side nella fase CRM–Meta.",
          "In questa prima fase il pannello gestisce solo la configurazione pubblica del Pixel. Token, App Secret e credenziali CAPI resteranno esclusivamente server-side nella fase CRM–Meta.",
          "In this first phase the panel manages only public Pixel configuration. Tokens, App Secret and CAPI credentials remain server-side only in the CRM–Meta phase.",
          "In deze eerste fase beheert het paneel alleen de openbare Pixel-configuratie. Tokens, App Secret en CAPI-referenties blijven uitsluitend server-side in de CRM–Meta-fase."
        )}
      </div>
    </div>
  );
}

function MetaWorkspace() {
  return (
    <>
      <SEO
        title="Meta Integration | Eivitech CRM"
        description="Private Eivitech CRM Meta integration settings."
        path="/dashboard/meta"
        noIndex
      />
      <section className="container-x py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="eyebrow">CRM · Meta</div>
            <h1 className="display-sm mt-3">{tr("Integrazione Meta", "Integrazione Meta", "Meta integration", "Meta-integratie")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <SignedIn><UserButton /></SignedIn>
            <SignedIn><SignOutButton redirectUrl={LOGOUT_REDIRECT_URL}><button className="text-sm text-muted-foreground hover:text-foreground">Logout</button></SignOutButton></SignedIn>
          </div>
        </div>

        <SignedOut>
          <div className="rounded-sm border border-border bg-card p-8">
            <p className="text-sm text-muted-foreground">{tr("Accedi al CRM per gestire Meta.", "Accedi al CRM per gestire Meta.", "Sign in to the CRM to manage Meta.", "Meld je aan bij het CRM om Meta te beheren.")}</p>
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

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl={LOGOUT_REDIRECT_URL}>
      <MetaWorkspace />
    </ClerkProvider>
  );
}
