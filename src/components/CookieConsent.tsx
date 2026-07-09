import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { acceptAllConsent, getStoredConsent, rejectOptionalConsent, saveConsent } from "@/lib/tracking";
import { tr } from "@/lib/i18n";

type Preferences = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: Preferences = {
  preferences: false,
  analytics: false,
  marketing: false,
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setPrefs({ preferences: stored.preferences, analytics: stored.analytics, marketing: stored.marketing });
    } else {
      setVisible(true);
    }

    const openPreferences = () => {
      const current = getStoredConsent();
      setPrefs(current ? { preferences: current.preferences, analytics: current.analytics, marketing: current.marketing } : defaultPreferences);
      setShowDetails(true);
      setVisible(true);
    };

    window.addEventListener("eivitech:open-cookie-preferences", openPreferences);
    return () => window.removeEventListener("eivitech:open-cookie-preferences", openPreferences);
  }, []);

  const acceptAll = () => {
    acceptAllConsent();
    setPrefs({ preferences: true, analytics: true, marketing: true });
    setVisible(false);
  };

  const rejectAll = () => {
    rejectOptionalConsent();
    setPrefs(defaultPreferences);
    setVisible(false);
  };

  const saveCustom = () => {
    saveConsent(prefs);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-2xl backdrop-blur md:p-5">
      <div className="container-x grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div>
          <div className="text-sm font-semibold text-foreground">
            {tr("Privacidad y cookies", "Privacy e cookie", "Privacy and cookies")}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {tr(
              "Usamos cookies técnicas necesarias para que el sitio funcione. Solo con tu consentimiento activamos analítica, publicidad, remarketing, Meta Pixel y medición de campañas de Google.",
              "Usiamo cookie tecnici necessari al funzionamento del sito. Solo con il tuo consenso attiviamo analitica, pubblicità, remarketing, Meta Pixel e misurazione campagne Google.",
              "We use strictly necessary cookies for the website to work. Analytics, advertising, remarketing, Meta Pixel and Google campaign measurement are activated only with your consent."
            )}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <Link to="/privacy-policy" className="underline hover:text-foreground">
              {tr("Política de privacidad", "Privacy Policy", "Privacy Policy")}
            </Link>
            <Link to="/cookie-policy" className="underline hover:text-foreground">
              {tr("Política de cookies", "Cookie Policy", "Cookie Policy")}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {showDetails && (
            <div className="rounded-sm border border-border bg-card p-4 text-sm">
              <label className="flex items-start justify-between gap-4 border-b border-border pb-3">
                <span>
                  <span className="block font-medium">{tr("Necesarias", "Necessari", "Necessary")}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {tr("Siempre activas: seguridad, formularios y funcionamiento básico.", "Sempre attivi: sicurezza, moduli e funzionamento di base.", "Always active: security, forms and basic website functionality.")}
                  </span>
                </span>
                <input type="checkbox" checked disabled className="mt-1 h-4 w-4 accent-primary" />
              </label>

              <ConsentToggle
                label={tr("Preferencias", "Preferenze", "Preferences")}
                description={tr("Idioma elegido y ajustes de experiencia.", "Lingua scelta e preferenze di esperienza.", "Selected language and experience settings.")}
                checked={prefs.preferences}
                onChange={(checked) => setPrefs((current) => ({ ...current, preferences: checked }))}
              />
              <ConsentToggle
                label={tr("Analítica", "Analitici", "Analytics")}
                description={tr("Medición de visitas, páginas y rendimiento de campañas.", "Misurazione di visite, pagine e rendimento campagne.", "Measurement of visits, pages and campaign performance.")}
                checked={prefs.analytics}
                onChange={(checked) => setPrefs((current) => ({ ...current, analytics: checked }))}
              />
              <ConsentToggle
                label={tr("Marketing", "Marketing", "Marketing")}
                description={tr("Google Ads, Meta Pixel, remarketing y conversiones publicitarias.", "Google Ads, Meta Pixel, remarketing e conversioni pubblicitarie.", "Google Ads, Meta Pixel, remarketing and advertising conversions.")}
                checked={prefs.marketing}
                onChange={(checked) => setPrefs((current) => ({ ...current, marketing: checked }))}
              />
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={rejectAll} className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent">
              {tr("Rechazar todo", "Rifiuta tutto", "Reject all")}
            </button>
            <button type="button" onClick={() => setShowDetails((value) => !value)} className="rounded-sm border border-border px-4 py-2 text-sm hover:bg-accent">
              {showDetails ? tr("Ocultar opciones", "Nascondi opzioni", "Hide options") : tr("Personalizar", "Personalizza", "Customise")}
            </button>
            {showDetails && (
              <button type="button" onClick={saveCustom} className="rounded-sm border border-primary px-4 py-2 text-sm text-primary hover:bg-primary/10">
                {tr("Guardar preferencias", "Salva preferenze", "Save preferences")}
              </button>
            )}
            <button type="button" onClick={acceptAll} className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
              {tr("Aceptar todo", "Accetta tutto", "Accept all")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0 last:pb-0">
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
    </label>
  );
}
