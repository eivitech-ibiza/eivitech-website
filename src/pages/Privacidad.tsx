import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { LEGAL, TRACKING_PROVIDERS } from "@/data/legal";
import { tr } from "@/lib/i18n";

const Privacidad = () => (
  <>
    <SEO
      title={tr("Política de privacidad | Eivitech Ibiza", "Privacy Policy | Eivitech Ibiza", "Privacy Policy | Eivitech Ibiza")}
      description={tr(
        "Información sobre cómo EIVITECH PLUS SLU trata los datos personales recibidos a través del sitio, formularios, CRM, correo electrónico y campañas publicitarias.",
        "Informazioni su come EIVITECH PLUS SLU tratta i dati personali ricevuti tramite sito, moduli, CRM, email e campagne pubblicitarie.",
        "Information about how EIVITECH PLUS SLU processes personal data received through the website, forms, CRM, email and advertising campaigns."
      )}
      path="/privacy-policy"
    />

    <section className="container-x py-20">
      <div className="max-w-3xl">
        <div className="eyebrow">{tr("Privacidad", "Privacy", "Privacy")}</div>
        <h1 className="display-lg mt-4">{tr("Política de privacidad", "Privacy Policy", "Privacy Policy")}</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          {tr(
            `Última actualización: ${LEGAL.lastUpdated}. Esta política integra la información legal de ${LEGAL.legalName} y explica el tratamiento de datos realizado a través de este sitio web, sus formularios, el CRM, el correo electrónico y las herramientas de medición publicitaria.`,
            `Ultimo aggiornamento: ${LEGAL.lastUpdatedIt}. Questa policy integra l'informativa legale di ${LEGAL.legalName} e descrive il trattamento dei dati effettuato tramite il sito, i moduli, il CRM, le email e gli strumenti di misurazione pubblicitaria.`,
            `Last updated: ${LEGAL.lastUpdatedEn}. This policy incorporates ${LEGAL.legalName}'s legal information and explains the processing carried out through the website, forms, CRM, email and advertising measurement tools.`
          )}
        </p>

        <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
          <PolicySection title={tr("1. Responsable del tratamiento", "1. Titolare del trattamento", "1. Data controller")}>
            <p className="font-medium text-foreground">{LEGAL.legalName}</p>
            <p>{LEGAL.address}</p>
            <p>{tr("Correo electrónico:", "Email:", "Email:")} <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a></p>
            <p>{tr("Sitio web:", "Sito web:", "Website:")} <a href={LEGAL.website} className="underline hover:text-foreground">eivitech.com</a></p>
          </PolicySection>

          <PolicySection title={tr("2. Normativa aplicable", "2. Normativa applicabile", "2. Applicable law")}>
            <p>{tr(
              "Los datos serán tratados de conformidad con el Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 (LOPDGDD), la Ley 34/2002 de servicios de la sociedad de la información y demás normativa aplicable.",
              "I dati sono trattati in conformità al Regolamento (UE) 2016/679 (GDPR), alla Ley Orgánica 3/2018 (LOPDGDD), alla Ley 34/2002 sui servizi della società dell'informazione e alla normativa applicabile.",
              "Data is processed in accordance with Regulation (EU) 2016/679 (GDPR), Spanish Organic Law 3/2018 (LOPDGDD), Law 34/2002 on information society services and other applicable law."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("3. Datos que podemos tratar", "3. Dati che possiamo trattare", "3. Data we may process")}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{tr("Datos identificativos y de contacto: nombre, email, teléfono o WhatsApp.", "Dati identificativi e di contatto: nome, email, telefono o WhatsApp.", "Identification and contact data: name, email, phone or WhatsApp.")}</li>
              <li>{tr("Información del proyecto: tipo de cliente, propiedad, zona, intervención, plazo, presupuesto orientativo, disponibilidad de fotos o proyecto y mensaje enviado.", "Informazioni sul progetto: tipo di cliente, proprietà, zona, intervento, tempi, budget indicativo, disponibilità di foto o progetto e messaggio inviato.", "Project information: client type, property, area, requested work, timing, indicative budget, availability of photos or plans and submitted message.")}</li>
              <li>{tr("Datos de colaboradores profesionales: empresa, categoría, experiencia, disponibilidad, zona cubierta, web o portfolio y mensaje profesional.", "Dati dei collaboratori professionali: impresa, categoria, esperienza, disponibilità, zona coperta, sito o portfolio e messaggio professionale.", "Professional partner data: company, category, experience, availability, covered area, website or portfolio and professional message.")}</li>
              <li>{tr("Datos contractuales, contables y de facturación incluidos en presupuestos, contratos y facturas.", "Dati contrattuali, contabili e di fatturazione inclusi in preventivi, contratti e fatture.", "Contractual, accounting and billing data included in quotations, contracts and invoices.")}</li>
              <li>{tr("Datos técnicos y de atribución: dirección IP, navegador, dispositivo, landing page, referrer, fecha y hora, parámetros UTM, eventos de navegación y, si se activan, identificadores publicitarios de Google o Meta.", "Dati tecnici e di attribuzione: indirizzo IP, browser, dispositivo, landing page, referrer, data e ora, parametri UTM, eventi di navigazione e, se attivati, identificatori pubblicitari Google o Meta.", "Technical and attribution data: IP address, browser, device, landing page, referrer, date and time, UTM parameters, navigation events and, where enabled, Google or Meta advertising identifiers.")}</li>
            </ul>
          </PolicySection>

          <PolicySection title={tr("4. Finalidades y bases jurídicas", "4. Finalità e basi giuridiche", "4. Purposes and legal bases")}>
            <div className="space-y-5">
              <LegalPurpose
                title={tr("Solicitudes, presupuestos y proyectos", "Richieste, preventivi e progetti", "Enquiries, quotations and projects")}
                text={tr(
                  "Responder a solicitudes, valorar proyectos, preparar presupuestos y adoptar medidas precontractuales solicitadas por el interesado. Base jurídica: medidas precontractuales, relación contractual e interés legítimo en atender y gestionar la solicitud.",
                  "Rispondere alle richieste, valutare progetti, preparare preventivi e adottare misure precontrattuali richieste dall'interessato. Base giuridica: misure precontrattuali, rapporto contrattuale e legittimo interesse alla gestione della richiesta.",
                  "Responding to enquiries, assessing projects, preparing quotations and taking pre-contractual steps requested by the data subject. Legal basis: pre-contractual measures, contractual relationship and legitimate interest in handling the request."
                )}
              />
              <LegalPurpose
                title={tr("Relación comercial, contratos y facturación", "Rapporto commerciale, contratti e fatturazione", "Commercial relationship, contracts and billing")}
                text={tr(
                  "Mantener la relación comercial, ejecutar contratos, emitir presupuestos y facturas, cumplir obligaciones legales y conservar documentación durante los plazos legalmente exigibles. Base jurídica: contrato, obligación legal e interés legítimo.",
                  "Gestire il rapporto commerciale, eseguire contratti, emettere preventivi e fatture, adempiere agli obblighi di legge e conservare la documentazione per i periodi legalmente richiesti. Base giuridica: contratto, obbligo legale e legittimo interesse.",
                  "Maintaining the commercial relationship, performing contracts, issuing quotations and invoices, complying with legal obligations and retaining documents for legally required periods. Legal basis: contract, legal obligation and legitimate interest."
                )}
              />
              <LegalPurpose
                title={tr("Comunicaciones por correo electrónico", "Comunicazioni email", "Email communications")}
                text={tr(
                  "Gestionar comunicaciones profesionales y, cuando exista una relación previa o un contexto comercial legítimo, enviar información sobre productos y servicios propios. Base jurídica: interés legítimo o consentimiento, según el caso. El destinatario puede oponerse en cualquier momento.",
                  "Gestire comunicazioni professionali e, in presenza di un rapporto precedente o di un contesto commerciale legittimo, inviare informazioni su prodotti e servizi propri. Base giuridica: legittimo interesse o consenso, a seconda dei casi. Il destinatario può opporsi in qualsiasi momento.",
                  "Managing professional communications and, where there is a prior relationship or legitimate commercial context, sending information about our own products and services. Legal basis: legitimate interest or consent, as applicable. The recipient may object at any time."
                )}
              />
              <LegalPurpose
                title={tr("CRM y seguimiento comercial", "CRM e follow-up commerciale", "CRM and commercial follow-up")}
                text={tr(
                  "Registrar solicitudes en el CRM, organizar el seguimiento, asignar prioridades internas y preparar propuestas. Base jurídica: medidas precontractuales e interés legítimo en gestionar de forma ordenada las oportunidades comerciales.",
                  "Registrare le richieste nel CRM, organizzare il follow-up, assegnare priorità interne e preparare proposte. Base giuridica: misure precontrattuali e legittimo interesse a gestire in modo ordinato le opportunità commerciali.",
                  "Recording requests in the CRM, organising follow-up, assigning internal priorities and preparing proposals. Legal basis: pre-contractual measures and legitimate interest in managing commercial opportunities efficiently."
                )}
              />
              <LegalPurpose
                title={tr("Analítica y publicidad", "Analitica e pubblicità", "Analytics and advertising")}
                text={tr(
                  "Medir visitas, conversiones, rendimiento de landing pages, campañas de Google y Meta y realizar remarketing. Base jurídica: consentimiento del usuario, que puede retirarse en cualquier momento desde la configuración de cookies.",
                  "Misurare visite, conversioni, rendimento delle landing page, campagne Google e Meta ed effettuare remarketing. Base giuridica: consenso dell'utente, revocabile in qualsiasi momento dalle preferenze cookie.",
                  "Measuring visits, conversions, landing-page performance, Google and Meta campaigns and carrying out remarketing. Legal basis: user consent, which may be withdrawn at any time through cookie settings."
                )}
              />
            </div>
          </PolicySection>

          <PolicySection title={tr("5. Destinatarios y encargados", "5. Destinatari e responsabili del trattamento", "5. Recipients and processors")}>
            <p>{tr(
              "Los datos no se comunicarán a terceros independientes salvo obligación legal. No obstante, podrán acceder a ellos proveedores que actúan como encargados del tratamiento para prestar servicios técnicos, de alojamiento, CRM, autenticación, correo electrónico, analítica o publicidad.",
              "I dati non saranno comunicati a terzi indipendenti salvo obbligo di legge. Potranno tuttavia accedervi fornitori che agiscono come responsabili del trattamento per servizi tecnici, hosting, CRM, autenticazione, email, analitica o pubblicità.",
              "Data will not be disclosed to independent third parties unless legally required. However, service providers acting as processors may access it to provide technical, hosting, CRM, authentication, email, analytics or advertising services."
            )}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {TRACKING_PROVIDERS.map((provider) => (
                <li key={provider.en}>{tr(provider.es, provider.it, provider.en)}</li>
              ))}
            </ul>
          </PolicySection>

          <PolicySection title={tr("6. Transferencias internacionales", "6. Trasferimenti internazionali", "6. International transfers")}>
            <p>{tr(
              "Algunos proveedores tecnológicos pueden tratar datos fuera del Espacio Económico Europeo. Cuando corresponda, estas transferencias se realizarán mediante mecanismos reconocidos por la normativa aplicable, como decisiones de adecuación o cláusulas contractuales tipo.",
              "Alcuni fornitori tecnologici possono trattare dati al di fuori dello Spazio Economico Europeo. Quando applicabile, tali trasferimenti avverranno tramite meccanismi riconosciuti dalla normativa, come decisioni di adeguatezza o clausole contrattuali standard.",
              "Some technology providers may process data outside the European Economic Area. Where applicable, such transfers will rely on recognised safeguards such as adequacy decisions or standard contractual clauses."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("7. Plazos de conservación", "7. Periodi di conservazione", "7. Retention periods")}>
            <ul className="list-disc space-y-2 pl-5">
              <li>{tr(
                `Solicitudes y leads sin relación contractual: hasta ${LEGAL.leadRetentionMonths} meses desde el último contacto, salvo que sea necesario conservarlos para atender obligaciones legales o reclamaciones.`,
                `Richieste e lead senza rapporto contrattuale: fino a ${LEGAL.leadRetentionMonths} mesi dall'ultimo contatto, salvo necessità di conservazione per obblighi legali o reclami.`,
                `Enquiries and leads without a contractual relationship: up to ${LEGAL.leadRetentionMonths} months from the last contact, unless longer retention is required for legal obligations or claims.`
              )}</li>
              <li>{tr("Datos contractuales, contables y de facturación: durante la relación y los plazos de prescripción legal aplicables.", "Dati contrattuali, contabili e di fatturazione: per la durata del rapporto e per i periodi di prescrizione previsti dalla legge.", "Contractual, accounting and billing data: for the duration of the relationship and applicable statutory limitation periods.")}</li>
              <li>{tr("Comunicaciones comerciales por email: mientras ninguna de las partes se oponga o hasta la retirada del consentimiento, según la base jurídica aplicable.", "Comunicazioni commerciali via email: finché nessuna delle parti si oppone o fino alla revoca del consenso, secondo la base giuridica applicabile.", "Commercial email communications: until either party objects or consent is withdrawn, depending on the applicable legal basis.")}</li>
              <li>{tr(`Preferencias de cookies: hasta ${LEGAL.consentValidityMonths} meses como máximo, salvo retirada anterior.`, `Preferenze cookie: fino a un massimo di ${LEGAL.consentValidityMonths} mesi, salvo revoca precedente.`, `Cookie preferences: for no longer than ${LEGAL.consentValidityMonths} months, unless withdrawn earlier.`)}</li>
            </ul>
          </PolicySection>

          <PolicySection title={tr("8. Derechos", "8. Diritti", "8. Rights")}>
            <p>{tr(
              "Puedes ejercer los derechos de acceso, rectificación, portabilidad, supresión, limitación y oposición al tratamiento, así como retirar el consentimiento cuando sea la base jurídica aplicable.",
              "Puoi esercitare i diritti di accesso, rettifica, portabilità, cancellazione, limitazione e opposizione al trattamento, nonché revocare il consenso quando costituisce la base giuridica.",
              "You may exercise your rights of access, rectification, portability, erasure, restriction and objection, and withdraw consent where consent is the applicable legal basis."
            )}</p>
            <p>{tr("Para ejercerlos, escribe a", "Per esercitarli, scrivi a", "To exercise them, contact")} <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a> {tr("o dirígete a", "oppure scrivi a", "or write to")} {LEGAL.address}.</p>
            <p>{tr("Si consideras que el tratamiento no se ajusta a la normativa, puedes presentar una reclamación ante la", "Se ritieni che il trattamento non sia conforme alla normativa, puoi presentare un reclamo alla", "If you believe processing does not comply with applicable law, you may lodge a complaint with the")} <a href={LEGAL.aepdUrl} target="_blank" rel="noreferrer" className="underline hover:text-foreground">Agencia Española de Protección de Datos (AEPD)</a>.</p>
          </PolicySection>

          <PolicySection title={tr("9. Formularios y comunicaciones comerciales", "9. Moduli e comunicazioni commerciali", "9. Forms and marketing communications")}>
            <p>{tr(
              "La aceptación de la política de privacidad en los formularios permite tratar los datos para responder y gestionar la solicitud enviada. No equivale por sí sola a una suscripción general a comunicaciones promocionales.",
              "L'accettazione della privacy policy nei moduli consente di trattare i dati per rispondere e gestire la richiesta inviata. Non equivale di per sé a un'iscrizione generale a comunicazioni promozionali.",
              "Accepting the privacy policy in a form allows us to process data to respond to and manage that request. It does not by itself amount to a general subscription to promotional communications."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("10. Confidencialidad del correo electrónico", "10. Riservatezza delle email", "10. Email confidentiality")}>
            <p>{tr(
              "Los mensajes enviados por EIVITECH PLUS SLU y sus archivos adjuntos se dirigen exclusivamente a sus destinatarios y pueden contener información confidencial o sometida a secreto profesional. Si recibes un mensaje por error, debes eliminarlo e informar al remitente.",
              "I messaggi inviati da EIVITECH PLUS SLU e i relativi allegati sono destinati esclusivamente ai destinatari e possono contenere informazioni riservate o soggette a segreto professionale. Se ricevi un messaggio per errore, eliminalo e informa il mittente.",
              "Messages sent by EIVITECH PLUS SLU and their attachments are intended exclusively for their recipients and may contain confidential or professionally privileged information. If you receive a message in error, delete it and notify the sender."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("11. Cookies y medición de campañas", "11. Cookie e misurazione delle campagne", "11. Cookies and campaign measurement")}>
            <p>{tr("La información completa sobre cookies, Google Tag Manager, Google Analytics, Google Ads, Meta Pixel y la gestión del consentimiento está disponible en la", "Le informazioni complete su cookie, Google Tag Manager, Google Analytics, Google Ads, Meta Pixel e gestione del consenso sono disponibili nella", "Full information about cookies, Google Tag Manager, Google Analytics, Google Ads, Meta Pixel and consent management is available in the")} <Link to="/cookie-policy" className="underline hover:text-foreground">Cookie Policy</Link>.</p>
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

function LegalPurpose({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-5">
      <h3 className="font-display text-xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default Privacidad;
