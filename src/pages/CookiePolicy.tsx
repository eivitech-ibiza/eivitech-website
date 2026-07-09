import { SEO } from "@/components/SEO";
import { LEGAL } from "@/data/legal";
import { tr } from "@/lib/i18n";

const openCookiePreferences = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("eivitech:open-cookie-preferences"));
};

const CookiePolicy = () => (
  <>
    <SEO
      title={tr("Política de cookies | Eivitech Ibiza", "Cookie Policy | Eivitech Ibiza", "Cookie Policy | Eivitech Ibiza")}
      description={tr("Información sobre cookies, Meta Pixel, Google Tag Manager, Google Analytics y Google Ads en el sitio de Eivitech.", "Informazioni su cookie, Meta Pixel, Google Tag Manager, Google Analytics e Google Ads nel sito Eivitech.", "Information about cookies, Meta Pixel, Google Tag Manager, Google Analytics and Google Ads on the Eivitech website.")}
      path="/cookie-policy"
    />

    <section className="container-x py-20">
      <div className="max-w-3xl">
        <div className="eyebrow">{tr("Cookies", "Cookie", "Cookies")}</div>
        <h1 className="display-lg mt-4">{tr("Política de cookies", "Cookie Policy", "Cookie Policy")}</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          {tr(
            `Última actualización: ${LEGAL.lastUpdated}. Esta política explica cómo ${LEGAL.companyName} utiliza cookies y tecnologías similares en este sitio web.`,
            `Ultimo aggiornamento: ${LEGAL.lastUpdated}. Questa policy spiega come ${LEGAL.companyName} utilizza cookie e tecnologie simili su questo sito web.`,
            `Last updated: ${LEGAL.lastUpdated}. This policy explains how ${LEGAL.companyName} uses cookies and similar technologies on this website.`
          )}
        </p>

        <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="display-sm text-foreground">{tr("Qué son las cookies", "Cosa sono i cookie", "What cookies are")}</h2>
            <p className="mt-3">
              {tr(
                "Las cookies y tecnologías similares permiten que un sitio recuerde información técnica, preferencias, datos de medición o identificadores publicitarios, según el consentimiento otorgado.",
                "I cookie e tecnologie simili permettono a un sito di ricordare informazioni tecniche, preferenze, dati di misurazione o identificatori pubblicitari, in base al consenso prestato.",
                "Cookies and similar technologies allow a website to remember technical information, preferences, measurement data or advertising identifiers, depending on the consent granted."
              )}
            </p>
          </section>

          <section>
            <h2 className="display-sm text-foreground">{tr("Categorías utilizadas", "Categorie utilizzate", "Categories used")}</h2>
            <div className="mt-4 grid gap-4">
              <CookieCategory title={tr("Necesarias", "Necessari", "Necessary")} text={tr("Imprescindibles para seguridad, carga del sitio, formularios, sesión técnica y funcionamiento básico. No se pueden desactivar desde el banner.", "Indispensabili per sicurezza, caricamento del sito, moduli, sessione tecnica e funzionamento di base. Non possono essere disattivati dal banner.", "Essential for security, website loading, forms, technical session and basic functionality. They cannot be disabled from the banner.")} />
              <CookieCategory title={tr("Preferencias", "Preferenze", "Preferences")} text={tr("Permiten recordar idioma seleccionado y ajustes de experiencia.", "Permettono di ricordare la lingua selezionata e preferenze di esperienza.", "They allow the website to remember the selected language and experience settings.")} />
              <CookieCategory title={tr("Analítica", "Analitici", "Analytics")} text={tr("Permiten medir visitas, páginas vistas, eventos de navegación y rendimiento de campañas mediante herramientas como Google Analytics 4.", "Permettono di misurare visite, pagine viste, eventi di navigazione e rendimento delle campagne tramite strumenti come Google Analytics 4.", "They measure visits, page views, navigation events and campaign performance using tools such as Google Analytics 4.")} />
              <CookieCategory title="Marketing" text={tr("Permiten medir conversiones publicitarias, hacer remarketing y optimizar campañas en Google Ads y Meta mediante Google Tag Manager, Google Ads y Meta Pixel.", "Permettono di misurare conversioni pubblicitarie, fare remarketing e ottimizzare campagne su Google Ads e Meta tramite Google Tag Manager, Google Ads e Meta Pixel.", "They measure advertising conversions, enable remarketing and optimise campaigns on Google Ads and Meta through Google Tag Manager, Google Ads and Meta Pixel.")} />
            </div>
          </section>

          <section>
            <h2 className="display-sm text-foreground">{tr("Herramientas previstas", "Strumenti previsti", "Planned tools")}</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Google Tag Manager</li>
              <li>Google Analytics 4</li>
              <li>Google Ads conversion tracking / remarketing</li>
              <li>Meta Pixel</li>
              <li>{tr("Meta Conversions API, si se activa en el backend", "Meta Conversions API, se attivata nel backend", "Meta Conversions API, if activated in the backend")}</li>
            </ul>
            <p className="mt-3">
              {tr(
                "Estas herramientas solo se activan cuando el usuario acepta las categorías correspondientes. Las cookies necesarias pueden funcionar sin consentimiento porque son imprescindibles para prestar el servicio solicitado.",
                "Questi strumenti vengono attivati solo quando l'utente accetta le categorie corrispondenti. I cookie necessari possono funzionare senza consenso perché indispensabili per fornire il servizio richiesto.",
                "These tools are activated only when the user accepts the corresponding categories. Necessary cookies may work without consent because they are essential to provide the requested service."
              )}
            </p>
          </section>

          <section>
            <h2 className="display-sm text-foreground">{tr("Gestión del consentimiento", "Gestione del consenso", "Consent management")}</h2>
            <p className="mt-3">
              {tr(
                "Puedes aceptar, rechazar o personalizar las cookies desde el banner. También puedes cambiar tu decisión en cualquier momento desde este botón.",
                "Puoi accettare, rifiutare o personalizzare i cookie dal banner. Puoi anche modificare la tua decisione in qualsiasi momento da questo pulsante.",
                "You can accept, reject or customise cookies from the banner. You can also change your decision at any time from this button."
              )}
            </p>
            <button type="button" onClick={openCookiePreferences} className="mt-5 rounded-sm border border-border px-5 py-3 text-sm text-foreground hover:bg-accent">
              {tr("Gestionar preferencias de cookies", "Gestisci preferenze cookie", "Manage cookie preferences")}
            </button>
          </section>

          <section>
            <h2 className="display-sm text-foreground">{tr("Contacto", "Contatto", "Contact")}</h2>
            <p className="mt-3">
              {tr("Para consultas sobre cookies o privacidad, escribe a", "Per domande su cookie o privacy, scrivi a", "For cookie or privacy questions, contact")} <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a>.
            </p>
          </section>
        </div>
      </div>
    </section>
  </>
);

function CookieCategory({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-5">
      <h3 className="font-display text-2xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default CookiePolicy;
