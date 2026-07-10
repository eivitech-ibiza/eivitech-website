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
      description={tr(
        "Información sobre cookies, almacenamiento local, Google Tag Manager, Google Analytics, Google Ads y Meta Pixel en el sitio de Eivitech.",
        "Informazioni su cookie, archiviazione locale, Google Tag Manager, Google Analytics, Google Ads e Meta Pixel nel sito Eivitech.",
        "Information about cookies, local storage, Google Tag Manager, Google Analytics, Google Ads and Meta Pixel on the Eivitech website."
      )}
      path="/cookie-policy"
    />

    <section className="container-x py-20">
      <div className="max-w-4xl">
        <div className="eyebrow">{tr("Cookies", "Cookie", "Cookies")}</div>
        <h1 className="display-lg mt-4">{tr("Política de cookies", "Cookie Policy", "Cookie Policy")}</h1>
        <p className="mt-6 max-w-3xl text-muted-foreground leading-relaxed">
          {tr(
            `Última actualización: ${LEGAL.lastUpdated}. Esta política explica cómo ${LEGAL.legalName} utiliza cookies, almacenamiento local y tecnologías similares en este sitio web.`,
            `Ultimo aggiornamento: ${LEGAL.lastUpdatedIt}. Questa policy spiega come ${LEGAL.legalName} utilizza cookie, archiviazione locale e tecnologie simili su questo sito web.`,
            `Last updated: ${LEGAL.lastUpdatedEn}. This policy explains how ${LEGAL.legalName} uses cookies, local storage and similar technologies on this website.`
          )}
        </p>

        <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
          <PolicySection title={tr("1. Responsable", "1. Titolare", "1. Controller")}>
            <p className="font-medium text-foreground">{LEGAL.legalName}</p>
            <p>{LEGAL.address}</p>
            <p><a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a></p>
          </PolicySection>

          <PolicySection title={tr("2. Qué son las cookies y tecnologías similares", "2. Cosa sono i cookie e le tecnologie simili", "2. What cookies and similar technologies are")}>
            <p>{tr(
              "Las cookies son pequeños archivos que un sitio o un tercero guarda o consulta en el dispositivo del usuario. Esta política también cubre tecnologías equivalentes, como localStorage y sessionStorage, que permiten recordar elecciones, mantener funciones técnicas o medir campañas.",
              "I cookie sono piccoli file che un sito o un terzo salva o consulta sul dispositivo dell'utente. Questa policy comprende anche tecnologie equivalenti, come localStorage e sessionStorage, utilizzate per ricordare scelte, mantenere funzioni tecniche o misurare campagne.",
              "Cookies are small files stored or accessed by a website or third party on a user's device. This policy also covers equivalent technologies such as localStorage and sessionStorage, used to remember choices, support technical functions or measure campaigns."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("3. Categorías", "3. Categorie", "3. Categories")}>
            <div className="grid gap-4 md:grid-cols-2">
              <CookieCategory
                title={tr("Necesarias", "Necessari", "Necessary")}
                text={tr(
                  "Imprescindibles para seguridad, formularios, navegación, gestión del consentimiento, redirecciones técnicas y acceso al área privada. No se utilizan con fines publicitarios.",
                  "Indispensabili per sicurezza, moduli, navigazione, gestione del consenso, reindirizzamenti tecnici e accesso all'area privata. Non sono utilizzati per finalità pubblicitarie.",
                  "Essential for security, forms, navigation, consent management, technical redirects and private-area access. They are not used for advertising."
                )}
              />
              <CookieCategory
                title={tr("Preferencias", "Preferenze", "Preferences")}
                text={tr(
                  "Permiten recordar elecciones realizadas por el usuario, como el idioma. Cuando responden a una solicitud expresa del usuario pueden considerarse funcionales.",
                  "Permettono di ricordare le scelte dell'utente, come la lingua. Quando derivano da una richiesta espressa dell'utente possono essere considerate funzionali.",
                  "They remember user choices such as language. Where they result from an explicit user request, they may be treated as functional."
                )}
              />
              <CookieCategory
                title={tr("Analítica", "Analitici", "Analytics")}
                text={tr(
                  "Permiten medir visitas, páginas vistas, navegación y rendimiento del sitio mediante herramientas como Google Analytics 4. Solo se activan con consentimiento.",
                  "Permettono di misurare visite, pagine viste, navigazione e rendimento del sito tramite strumenti come Google Analytics 4. Si attivano solo con consenso.",
                  "They measure visits, page views, navigation and website performance through tools such as Google Analytics 4. They are activated only with consent."
                )}
              />
              <CookieCategory
                title="Marketing"
                text={tr(
                  "Permiten medir conversiones, atribuir campañas, hacer remarketing y optimizar publicidad en Google y Meta. Solo se activan con consentimiento.",
                  "Permettono di misurare conversioni, attribuire campagne, fare remarketing e ottimizzare pubblicità su Google e Meta. Si attivano solo con consenso.",
                  "They measure conversions, attribute campaigns, enable remarketing and optimise advertising on Google and Meta. They are activated only with consent."
                )}
              />
            </div>
          </PolicySection>

          <PolicySection title={tr("4. Inventario de tecnologías", "4. Inventario delle tecnologie", "4. Technology inventory")}>
            <div className="overflow-x-auto rounded-sm border border-border">
              <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                <thead className="bg-accent/60 text-foreground">
                  <tr>
                    <th className="border-b border-border px-4 py-3">{tr("Nombre", "Nome", "Name")}</th>
                    <th className="border-b border-border px-4 py-3">{tr("Proveedor", "Fornitore", "Provider")}</th>
                    <th className="border-b border-border px-4 py-3">{tr("Finalidad", "Finalità", "Purpose")}</th>
                    <th className="border-b border-border px-4 py-3">{tr("Categoría", "Categoria", "Category")}</th>
                    <th className="border-b border-border px-4 py-3">{tr("Duración", "Durata", "Duration")}</th>
                  </tr>
                </thead>
                <tbody>
                  <CookieRow name="eivitech_cookie_consent_v2" provider="Eivitech" purpose={tr("Guardar la selección de consentimiento.", "Salvare la scelta del consenso.", "Store the consent selection.")} category={tr("Necesaria", "Necessario", "Necessary")} duration={tr(`Máximo ${LEGAL.consentValidityMonths} meses.`, `Massimo ${LEGAL.consentValidityMonths} mesi.`, `Maximum ${LEGAL.consentValidityMonths} months.`)} />
                  <CookieRow name="eivitech_language" provider="Eivitech" purpose={tr("Recordar el idioma elegido expresamente.", "Ricordare la lingua scelta espressamente.", "Remember the language expressly selected.")} category={tr("Preferencia", "Preferenza", "Preference")} duration={tr("Hasta que se cambie o elimine desde el navegador.", "Finché non viene modificata o eliminata dal browser.", "Until changed or deleted through the browser.")} />
                  <CookieRow name="eivitech_github_pages_redirect" provider="Eivitech" purpose={tr("Completar una redirección técnica de navegación.", "Completare un reindirizzamento tecnico di navigazione.", "Complete a technical navigation redirect.")} category={tr("Necesaria", "Necessario", "Necessary")} duration={tr("Sesión; se elimina tras la redirección.", "Sessione; viene eliminato dopo il reindirizzamento.", "Session; removed after the redirect.")} />
                  <CookieRow name="eivitech_utm" provider="Eivitech" purpose={tr("Conservar temporalmente la atribución UTM durante la sesión.", "Conservare temporaneamente l'attribuzione UTM durante la sessione.", "Temporarily retain UTM attribution during the session.")} category={tr("Analítica / marketing", "Analitica / marketing", "Analytics / marketing")} duration={tr("Sesión y solo tras consentimiento.", "Sessione e solo dopo il consenso.", "Session and only after consent.")} />
                  <CookieRow name={tr("Cookies de sesión de Clerk", "Cookie di sessione Clerk", "Clerk session cookies")} provider="Clerk" purpose={tr("Autenticación y seguridad del área privada.", "Autenticazione e sicurezza dell'area privata.", "Authentication and security for the private area.")} category={tr("Necesaria", "Necessario", "Necessary")} duration={tr("Sesión o según configuración del proveedor.", "Sessione o secondo la configurazione del fornitore.", "Session or according to provider configuration.")} />
                  <CookieRow name="_ga, _ga_*" provider="Google Analytics 4" purpose={tr("Distinguir usuarios y medir uso del sitio.", "Distinguere gli utenti e misurare l'uso del sito.", "Distinguish users and measure website usage.")} category={tr("Analítica", "Analitici", "Analytics")} duration={tr("Hasta 24 meses, según configuración.", "Fino a 24 mesi, secondo configurazione.", "Up to 24 months, depending on configuration.")} />
                  <CookieRow name="_gcl_au, _gcl_aw" provider="Google Ads" purpose={tr("Medición de conversiones y atribución publicitaria.", "Misurazione delle conversioni e attribuzione pubblicitaria.", "Conversion measurement and advertising attribution.")} category="Marketing" duration={tr("Hasta 90 días, según configuración.", "Fino a 90 giorni, secondo configurazione.", "Up to 90 days, depending on configuration.")} />
                  <CookieRow name="_fbp, _fbc" provider="Meta" purpose={tr("Atribución, medición de campañas y remarketing.", "Attribuzione, misurazione campagne e remarketing.", "Attribution, campaign measurement and remarketing.")} category="Marketing" duration={tr("Hasta 90 días, según configuración.", "Fino a 90 giorni, secondo configurazione.", "Up to 90 days, depending on configuration.")} />
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">{tr(
              "La lista puede variar si se modifican las herramientas o su configuración. Cuando cambien las finalidades o los terceros, se actualizará esta política y se solicitará una nueva decisión cuando corresponda.",
              "L'elenco può variare in caso di modifica degli strumenti o della loro configurazione. Se cambiano finalità o terze parti, questa policy sarà aggiornata e verrà richiesta una nuova scelta quando necessario.",
              "The list may change if tools or their configuration change. Where purposes or third parties change, this policy will be updated and a new choice requested where required."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("5. Herramientas de Google y Meta", "5. Strumenti Google e Meta", "5. Google and Meta tools")}>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-foreground">Google Tag Manager:</strong> {tr("gestiona la activación de etiquetas; no se usa para activar analítica o marketing antes del consentimiento correspondiente.", "gestisce l'attivazione dei tag; non viene utilizzato per attivare analitica o marketing prima del relativo consenso.", "manages tag activation; it is not used to activate analytics or marketing before the relevant consent.")}</li>
              <li><strong className="text-foreground">Google Analytics 4:</strong> {tr("mide el uso del sitio cuando se acepta la categoría analítica.", "misura l'uso del sito quando viene accettata la categoria analitica.", "measures website usage when the analytics category is accepted.")}</li>
              <li><strong className="text-foreground">Google Ads:</strong> {tr("mide conversiones, atribuye campañas y permite remarketing cuando se acepta marketing.", "misura conversioni, attribuisce campagne e consente remarketing quando viene accettato il marketing.", "measures conversions, attributes campaigns and enables remarketing when marketing is accepted.")}</li>
              <li><strong className="text-foreground">Meta Pixel:</strong> {tr("mide visitas y conversiones procedentes de campañas de Meta y permite crear audiencias cuando se acepta marketing.", "misura visite e conversioni provenienti dalle campagne Meta e consente di creare pubblici quando viene accettato il marketing.", "measures visits and conversions from Meta campaigns and enables audience creation when marketing is accepted.")}</li>
              <li><strong className="text-foreground">Meta Conversions API:</strong> {tr("puede utilizarse desde el backend para enviar conversiones consentidas y mejorar la medición, aplicando controles de seguridad y minimización.", "può essere utilizzata dal backend per inviare conversioni consentite e migliorare la misurazione, applicando controlli di sicurezza e minimizzazione.", "may be used from the backend to send consented conversions and improve measurement, applying security and minimisation controls.")}</li>
            </ul>
          </PolicySection>

          <PolicySection title={tr("6. Cómo gestionamos el consentimiento", "6. Come gestiamo il consenso", "6. How consent is managed")}>
            <p>{tr(
              "En la primera visita puedes aceptar todo, rechazar todo o personalizar por categorías. Las etiquetas analíticas y publicitarias permanecen bloqueadas hasta que exista consentimiento válido. Rechazar las cookies opcionales no impide utilizar las funciones principales del sitio.",
              "Alla prima visita puoi accettare tutto, rifiutare tutto o personalizzare per categoria. I tag analitici e pubblicitari restano bloccati finché non esiste un consenso valido. Il rifiuto dei cookie opzionali non impedisce l'uso delle funzioni principali del sito.",
              "On the first visit you may accept all, reject all or customise by category. Analytics and advertising tags remain blocked until valid consent exists. Rejecting optional cookies does not prevent use of the website's main functions."
            )}</p>
            <p>{tr(
              `La selección se conserva durante un máximo de ${LEGAL.consentValidityMonths} meses y puede retirarse o modificarse en cualquier momento mediante el botón disponible en esta página y en el footer.`,
              `La scelta viene conservata per un massimo di ${LEGAL.consentValidityMonths} mesi e può essere revocata o modificata in qualsiasi momento tramite il pulsante disponibile in questa pagina e nel footer.`,
              `The selection is retained for no longer than ${LEGAL.consentValidityMonths} months and may be withdrawn or changed at any time through the button on this page and in the footer.`
            )}</p>
            <button type="button" onClick={openCookiePreferences} className="mt-5 rounded-sm border border-border px-5 py-3 text-sm text-foreground hover:bg-accent">
              {tr("Gestionar preferencias de cookies", "Gestisci preferenze cookie", "Manage cookie preferences")}
            </button>
          </PolicySection>

          <PolicySection title={tr("7. Configuración del navegador", "7. Impostazioni del browser", "7. Browser settings")}>
            <p>{tr(
              "También puedes bloquear o eliminar cookies desde la configuración del navegador. La eliminación de cookies de terceros debe realizarse desde el navegador o mediante las herramientas facilitadas por el proveedor correspondiente.",
              "Puoi inoltre bloccare o eliminare i cookie dalle impostazioni del browser. L'eliminazione dei cookie di terze parti deve essere effettuata dal browser o tramite gli strumenti messi a disposizione dal relativo fornitore.",
              "You may also block or delete cookies through browser settings. Third-party cookies must be deleted through the browser or tools provided by the relevant provider."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("8. Más información y contacto", "8. Ulteriori informazioni e contatti", "8. Further information and contact")}>
            <p>{tr("Puedes consultar la", "Puoi consultare la", "You may read the")} <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-foreground">{tr("política de privacidad de Google", "privacy policy di Google", "Google Privacy Policy")}</a> {tr("y la", "e la", "and the")} <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">{tr("política de privacidad de Meta", "privacy policy di Meta", "Meta Privacy Policy")}</a>.</p>
            <p>{tr("Para consultas sobre cookies o privacidad, escribe a", "Per domande su cookie o privacy, scrivi a", "For cookie or privacy questions, contact")} <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a>.</p>
          </PolicySection>
        </div>
      </div>
    </section>
  </>
);

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display-sm text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function CookieCategory({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-5">
      <h3 className="font-display text-2xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function CookieRow({ name, provider, purpose, category, duration }: { name: string; provider: string; purpose: string; category: string; duration: string }) {
  return (
    <tr className="align-top">
      <td className="border-b border-border px-4 py-3 font-mono text-xs text-foreground">{name}</td>
      <td className="border-b border-border px-4 py-3">{provider}</td>
      <td className="border-b border-border px-4 py-3">{purpose}</td>
      <td className="border-b border-border px-4 py-3">{category}</td>
      <td className="border-b border-border px-4 py-3">{duration}</td>
    </tr>
  );
}

export default CookiePolicy;
