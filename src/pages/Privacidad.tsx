import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { LEGAL, TRACKING_PROVIDERS } from "@/data/legal";
import { tr } from "@/lib/i18n";

const Privacidad = () => (
  <>
    <SEO
      title={tr("Política de privacidad | Eivitech Ibiza", "Privacy Policy | Eivitech Ibiza", "Privacy Policy | Eivitech Ibiza")}
      description={tr("Información sobre cómo Eivitech trata los datos personales recibidos a través del sitio, formularios, CRM y campañas publicitarias.", "Informazioni su come Eivitech tratta i dati personali ricevuti tramite sito, moduli, CRM e campagne pubblicitarie.", "Information about how Eivitech processes personal data received through the website, forms, CRM and advertising campaigns.")}
      path="/privacy-policy"
    />

    <section className="container-x py-20">
      <div className="max-w-3xl">
        <div className="eyebrow">{tr("Privacidad", "Privacy", "Privacy")}</div>
        <h1 className="display-lg mt-4">{tr("Política de privacidad", "Privacy Policy", "Privacy Policy")}</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          {tr(
            `Última actualización: ${LEGAL.lastUpdated}. Esta política explica cómo ${LEGAL.companyName} trata los datos personales recibidos a través de este sitio web, formularios, CRM y campañas publicitarias.`,
            `Ultimo aggiornamento: ${LEGAL.lastUpdated}. Questa policy spiega come ${LEGAL.companyName} tratta i dati personali ricevuti tramite questo sito web, moduli, CRM e campagne pubblicitarie.`,
            `Last updated: ${LEGAL.lastUpdated}. This policy explains how ${LEGAL.companyName} processes personal data received through this website, forms, CRM and advertising campaigns.`
          )}
        </p>

        <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
          <PolicySection title={tr("Responsable del tratamiento", "Titolare del trattamento", "Data controller")}>
            <p>{LEGAL.legalName}</p>
            <p>{LEGAL.address}</p>
            <p>{LEGAL.taxId}</p>
            <p>{tr("Email de contacto privacy:", "Email di contatto privacy:", "Privacy contact email:")} <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a></p>
          </PolicySection>

          <PolicySection title={tr("Datos que podemos tratar", "Dati che possiamo trattare", "Data we may process")}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{tr("Datos identificativos y de contacto: nombre, email, teléfono o WhatsApp.", "Dati identificativi e di contatto: nome, email, telefono o WhatsApp.", "Identification and contact data: name, email, phone or WhatsApp.")}</li>
              <li>{tr("Información del proyecto: tipo de cliente, tipo de propiedad, zona, intervención, plazo, presupuesto orientativo, fotos/proyecto disponible y mensaje enviado.", "Informazioni sul progetto: tipo di cliente, tipo di proprietà, zona, intervento, tempi, budget orientativo, foto/progetto disponibile e messaggio inviato.", "Project information: client type, property type, area, work requested, timing, indicative budget, photos/project availability and message sent.")}</li>
              <li>{tr("Datos de colaboradores profesionales: empresa, categoría, experiencia, disponibilidad, zona cubierta, web/portfolio y mensaje profesional.", "Dati di collaboratori professionali: impresa, categoria, esperienza, disponibilità, zona coperta, sito/portfolio e messaggio professionale.", "Professional partner data: company, category, experience, availability, covered area, website/portfolio and professional message.")}</li>
              <li>{tr("Datos técnicos y de atribución: landing page, referrer, fecha/hora, UTM, eventos de navegación, cookies y, si se activa, identificadores de campañas de Google o Meta.", "Dati tecnici e di attribuzione: landing page, referrer, data/ora, UTM, eventi di navigazione, cookie e, se attivati, identificatori campagne Google o Meta.", "Technical and attribution data: landing page, referrer, date/time, UTM, navigation events, cookies and, if activated, Google or Meta campaign identifiers.")}</li>
            </ul>
          </PolicySection>

          <PolicySection title={tr("Finalidades", "Finalità", "Purposes")}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{tr("Responder a solicitudes enviadas por formulario, teléfono, WhatsApp o email.", "Rispondere alle richieste inviate tramite modulo, telefono, WhatsApp o email.", "Respond to requests sent by form, phone, WhatsApp or email.")}</li>
              <li>{tr("Valorar proyectos de reforma, instalación, acabados, interiores, exteriores o colaboración profesional.", "Valutare progetti di ristrutturazione, impianti, finiture, interni, esterni o collaborazione professionale.", "Assess renovation, installation, finishes, interior, exterior or professional collaboration projects.")}</li>
              <li>{tr("Gestionar leads en el CRM, hacer seguimiento comercial y preparar propuestas.", "Gestire lead nel CRM, fare follow-up commerciale e preparare proposte.", "Manage leads in the CRM, follow up commercially and prepare proposals.")}</li>
              <li>{tr("Medir campañas publicitarias, conversiones, rendimiento de landing pages y remarketing, solo cuando exista consentimiento para analítica o marketing.", "Misurare campagne pubblicitarie, conversioni, rendimento landing page e remarketing, solo quando esiste consenso per analitica o marketing.", "Measure advertising campaigns, conversions, landing page performance and remarketing, only where analytics or marketing consent exists.")}</li>
            </ul>
          </PolicySection>

          <PolicySection title={tr("Base jurídica", "Base giuridica", "Legal basis")}>
            <p>{tr("La respuesta a solicitudes y la gestión precontractual se basan en la aplicación de medidas precontractuales solicitadas por el interesado. El envío de comunicaciones de seguimiento puede basarse en interés legítimo o consentimiento, según el caso. La analítica, publicidad, remarketing y píxeles se basan en el consentimiento del usuario.", "La risposta alle richieste e la gestione precontrattuale si basano sull'esecuzione di misure precontrattuali richieste dall'interessato. L'invio di comunicazioni di follow-up può basarsi su interesse legittimo o consenso, a seconda del caso. Analitica, pubblicità, remarketing e pixel si basano sul consenso dell'utente.", "Responding to requests and pre-contractual management are based on pre-contractual measures requested by the data subject. Follow-up communications may rely on legitimate interest or consent depending on the case. Analytics, advertising, remarketing and pixels rely on user consent.")}</p>
          </PolicySection>

          <PolicySection title={tr("Destinatarios y proveedores", "Destinatari e fornitori", "Recipients and providers")}>
            <p>{tr("Podemos utilizar proveedores técnicos para alojar el sitio, gestionar el CRM, enviar notificaciones, proteger el acceso privado y medir campañas.", "Possiamo utilizzare fornitori tecnici per ospitare il sito, gestire il CRM, inviare notifiche, proteggere l'accesso privato e misurare campagne.", "We may use technical providers to host the website, manage the CRM, send notifications, protect private access and measure campaigns.")}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {TRACKING_PROVIDERS.map((provider) => <li key={provider}>{provider}</li>)}
            </ul>
          </PolicySection>

          <PolicySection title={tr("Conservación", "Conservazione", "Retention")}>
            <p>{tr("Los leads y solicitudes se conservarán durante", "I lead e le richieste saranno conservati per", "Leads and requests will be retained for")} {LEGAL.leadRetention}.</p>
          </PolicySection>

          <PolicySection title={tr("Derechos", "Diritti", "Rights")}>
            <p>{tr("Puedes solicitar acceso, rectificación, supresión, oposición, limitación, portabilidad y retirada del consentimiento escribiendo a", "Puoi richiedere accesso, rettifica, cancellazione, opposizione, limitazione, portabilità e revoca del consenso scrivendo a", "You may request access, rectification, erasure, objection, restriction, portability and withdrawal of consent by writing to")} <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a>.</p>
          </PolicySection>

          <PolicySection title={tr("Cookies y campañas", "Cookie e campagne", "Cookies and campaigns")}>
            <p>{tr("La información completa sobre cookies, Google Tag Manager, Google Analytics, Google Ads, Meta Pixel y gestión del consentimiento está disponible en la", "Le informazioni complete su cookie, Google Tag Manager, Google Analytics, Google Ads, Meta Pixel e gestione del consenso sono disponibili nella", "Full information about cookies, Google Tag Manager, Google Analytics, Google Ads, Meta Pixel and consent management is available in the")} <Link to="/cookie-policy" className="underline hover:text-foreground">Cookie Policy</Link>.</p>
          </PolicySection>
        </div>
      </div>
    </section>
  </>
);

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="display-sm text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default Privacidad;
