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
            `Última actualización: ${LEGAL.lastUpdated}. Esta política integra la documentación legal de ${LEGAL.legalName} y explica el uso real de cookies, almacenamiento local y tecnologías similares en ${LEGAL.domain}.`,
            `Ultimo aggiornamento: ${LEGAL.lastUpdatedIt}. Questa policy integra la documentazione legale di ${LEGAL.legalName} e descrive l'uso effettivo di cookie, archiviazione locale e tecnologie simili su ${LEGAL.domain}.`,
            `Last updated: ${LEGAL.lastUpdatedEn}. This policy incorporates ${LEGAL.legalName}'s legal documentation and explains the actual use of cookies, local storage and similar technologies on ${LEGAL.domain}.`
          )}
        </p>

        <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
          <PolicySection title={tr("1. Responsable", "1. Titolare", "1. Controller")}> 
            <p className="font-medium text-foreground">{LEGAL.legalName}</p>
            <p>{tr("NIF:", "NIF:", "Tax ID:")} {LEGAL.taxId}</p>
            <p>{LEGAL.address}</p>
            <p><a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a></p>
            <p>{tr("Sitio web:", "Sito web:", "Website:")} {LEGAL.domain}</p>
          </PolicySection>

          <PolicySection title={tr("2. Qué son las cookies y tecnologías similares", "2. Cosa sono i cookie e le tecnologie simili", "2. What cookies and similar technologies are")}> 
            <p>{tr(
              "Las cookies son pequeños archivos que un sitio o un tercero guarda o consulta en el dispositivo del usuario. Esta política también cubre tecnologías equivalentes, como localStorage, sessionStorage y píxeles, utilizadas para recordar elecciones, mantener funciones técnicas, medir campañas o mostrar publicidad.",
              "I cookie sono piccoli file che un sito o un terzo salva o consulta sul dispositivo dell'utente. Questa policy comprende anche tecnologie equivalenti, come localStorage, sessionStorage e pixel, utilizzate per ricordare scelte, mantenere funzioni tecniche, misurare campagne o mostrare pubblicità.",
              "Cookies are small files stored or accessed by a website or third party on a user's device. This policy also covers equivalent technologies such as localStorage, sessionStorage and pixels, used to remember choices, support technical functions, measure campaigns or display advertising."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("3. Base jurídica y consentimiento", "3. Base giuridica e consenso", "3. Legal basis and consent")}> 
            <p>{tr(
              "Las cookies técnicas o estrictamente necesarias pueden utilizarse sin consentimiento cuando son imprescindibles para la navegación, seguridad, gestión del consentimiento o prestación de un servicio solicitado. Las cookies analíticas, publicitarias y de afiliación solo se activan después de una decisión afirmativa del usuario.",
              "I cookie tecnici o strettamente necessari possono essere utilizzati senza consenso quando indispensabili per navigazione, sicurezza, gestione del consenso o fornitura di un servizio richiesto. I cookie analitici, pubblicitari e di affiliazione si attivano solo dopo una scelta positiva dell'utente.",
              "Technical or strictly necessary cookies may be used without consent where essential for navigation, security, consent management or delivery of a requested service. Analytics, advertising and affiliate cookies are activated only after an affirmative user choice."
            )}</p>
            <p>{tr(
              "En la primera capa del banner puedes aceptar todo, rechazar todo o configurar las categorías. La negativa no impide utilizar las funciones principales del sitio.",
              "Nel primo livello del banner puoi accettare tutto, rifiutare tutto o configurare le categorie. Il rifiuto non impedisce l'uso delle funzioni principali del sito.",
              "On the first banner layer you can accept all, reject all or configure categories. Refusal does not prevent use of the website's main functions."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("4. Categorías", "4. Categorie", "4. Categories")}> 
            <div className="grid gap-4 md:grid-cols-2">
              <CookieCategory title={tr("Necesarias", "Necessari", "Necessary")} text={tr(
                "Imprescindibles para seguridad, formularios, navegación, gestión del consentimiento, redirecciones técnicas y acceso al área privada. No se utilizan con fines publicitarios.",
                "Indispensabili per sicurezza, moduli, navigazione, gestione del consenso, reindirizzamenti tecnici e accesso all'area privata. Non sono utilizzati per finalità pubblicitarie.",
                "Essential for security, forms, navigation, consent management, technical redirects and private-area access. They are not used for advertising."
              )} />
              <CookieCategory title={tr("Preferencias", "Preferenze", "Preferences")} text={tr(
                "Permiten recordar elecciones realizadas por el usuario, como el idioma. Cuando responden a una solicitud expresa pueden considerarse funcionales.",
                "Permettono di ricordare le scelte dell'utente, come la lingua. Quando derivano da una richiesta espressa possono essere considerate funzionali.",
                "They remember user choices such as language. Where they result from an explicit request, they may be treated as functional."
              )} />
              <CookieCategory title={tr("Analítica", "Analitici", "Analytics")} text={tr(
                "Permiten medir visitas, páginas vistas, navegación y rendimiento mediante herramientas como Google Analytics 4. Solo se activan con consentimiento.",
                "Permettono di misurare visite, pagine viste, navigazione e rendimento tramite strumenti come Google Analytics 4. Si attivano solo con consenso.",
                "They measure visits, page views, navigation and performance through tools such as Google Analytics 4. They are activated only with consent."
              )} />
              <CookieCategory title="Marketing" text={tr(
                "Permiten medir conversiones, atribuir campañas, hacer remarketing y optimizar publicidad en Google y Meta. Solo se activan con consentimiento.",
                "Permettono di misurare conversioni, attribuire campagne, fare remarketing e ottimizzare pubblicità su Google e Meta. Si attivano solo con consenso.",
                "They measure conversions, attribute campaigns, enable remarketing and optimise advertising on Google and Meta. They are activated only with consent."
              )} />
            </div>
          </PolicySection>

          <PolicySection title={tr("5. Inventario de tecnologías", "5. Inventario delle tecnologie", "5. Technology inventory")}> 
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
              "El inventario refleja la configuración actual del sitio y se actualizará cuando se añadan, retiren o modifiquen herramientas, finalidades o terceros. No se incorporan al inventario cookies de servicios que no estén realmente instalados.",
              "L'inventario riflette la configurazione attuale del sito e sarà aggiornato quando verranno aggiunti, rimossi o modificati strumenti, finalità o terze parti. Non vengono elencati cookie di servizi non realmente installati.",
              "The inventory reflects the website's current configuration and will be updated when tools, purposes or third parties are added, removed or changed. Cookies from services not actually installed are not included."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("6. Herramientas de Google y Meta", "6. Strumenti Google e Meta", "6. Google and Meta tools")}> 
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-foreground">Google Tag Manager:</strong> {tr("gestiona la activación de etiquetas; no activa analítica o marketing antes del consentimiento correspondiente.", "gestisce l'attivazione dei tag; non attiva analitica o marketing prima del relativo consenso.", "manages tag activation; it does not activate analytics or marketing before the relevant consent.")}</li>
              <li><strong className="text-foreground">Google Analytics 4:</strong> {tr("mide el uso del sitio cuando se acepta analítica.", "misura l'uso del sito quando viene accettata l'analitica.", "measures website usage when analytics is accepted.")}</li>
              <li><strong className="text-foreground">Google Ads:</strong> {tr("mide conversiones, atribuye campañas y permite remarketing cuando se acepta marketing.", "misura conversioni, attribuisce campagne e consente remarketing quando viene accettato il marketing.", "measures conversions, attributes campaigns and enables remarketing when marketing is accepted.")}</li>
              <li><strong className="text-foreground">Meta Pixel:</strong> {tr("mide visitas y conversiones de campañas Meta y permite crear audiencias cuando se acepta marketing.", "misura visite e conversioni delle campagne Meta e consente di creare pubblici quando viene accettato il marketing.", "measures visits and conversions from Meta campaigns and enables audience creation when marketing is accepted.")}</li>
              <li><strong className="text-foreground">Meta Conversions API:</strong> {tr("puede utilizarse desde el backend para enviar conversiones consentidas, aplicando seguridad y minimización.", "può essere utilizzata dal backend per inviare conversioni consentite, applicando sicurezza e minimizzazione.", "may be used from the backend to send consented conversions, applying security and minimisation.")}</li>
            </ul>
          </PolicySection>

          <PolicySection title={tr("7. Gestión, retirada y renovación del consentimiento", "7. Gestione, revoca e rinnovo del consenso", "7. Managing, withdrawing and renewing consent")}> 
            <p>{tr(
              `La selección se conserva durante un máximo de ${LEGAL.consentValidityMonths} meses y puede retirarse o modificarse en cualquier momento mediante el botón disponible en esta página y en el footer. Si cambian significativamente las finalidades o los terceros, podrá solicitarse una nueva decisión.`,
              `La scelta viene conservata per un massimo di ${LEGAL.consentValidityMonths} mesi e può essere revocata o modificata in qualsiasi momento tramite il pulsante disponibile in questa pagina e nel footer. Se finalità o terze parti cambiano in modo significativo, potrà essere richiesta una nuova decisione.`,
              `The selection is retained for no longer than ${LEGAL.consentValidityMonths} months and may be withdrawn or changed at any time through the button on this page and in the footer. If purposes or third parties change significantly, a new decision may be requested.`
            )}</p>
            <button type="button" onClick={openCookiePreferences} className="mt-5 rounded-sm border border-border px-5 py-3 text-sm text-foreground hover:bg-accent">
              {tr("Gestionar preferencias de cookies", "Gestisci preferenze cookie", "Manage cookie preferences")}
            </button>
          </PolicySection>

          <PolicySection title={tr("8. Configuración del navegador", "8. Impostazioni del browser", "8. Browser settings")}> 
            <p>{tr(
              "También puedes bloquear o eliminar cookies desde la configuración del navegador. La eliminación de cookies de terceros debe realizarse desde el navegador o mediante las herramientas facilitadas por el proveedor correspondiente. El bloqueo de cookies necesarias puede afectar al funcionamiento de algunas características.",
              "Puoi inoltre bloccare o eliminare i cookie dalle impostazioni del browser. I cookie di terze parti devono essere eliminati dal browser o tramite gli strumenti del relativo fornitore. Il blocco dei cookie necessari può influire sul funzionamento di alcune funzionalità.",
              "You may also block or delete cookies through browser settings. Third-party cookies must be deleted through the browser or tools provided by the relevant provider. Blocking necessary cookies may affect some features."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("9. Proveedores externos y contacto", "9. Fornitori esterni e contatti", "9. External providers and contact")}> 
            <p>{tr("Los proveedores externos pueden modificar sus condiciones, finalidades o duraciones. Puedes consultar la", "I fornitori esterni possono modificare condizioni, finalità o durate. Puoi consultare la", "External providers may change their terms, purposes or retention periods. You may read the")} <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-foreground">{tr("política de privacidad de Google", "privacy policy di Google", "Google Privacy Policy")}</a> {tr("y la", "e la", "and the")} <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">{tr("política de privacidad de Meta", "privacy policy di Meta", "Meta Privacy Policy")}</a>.</p>
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