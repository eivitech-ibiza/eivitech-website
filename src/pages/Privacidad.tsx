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
        `Información sobre cómo ${LEGAL.legalName} trata los datos personales recibidos a través del sitio, formularios, CRM, correo electrónico, redes sociales y campañas publicitarias.`,
        `Informazioni su come ${LEGAL.legalName} tratta i dati personali ricevuti tramite sito, moduli, CRM, email, social network e campagne pubblicitarie.`,
        `Information about how ${LEGAL.legalName} processes personal data received through the website, forms, CRM, email, social networks and advertising campaigns.`
      )}
      path="/privacy-policy"
    />

    <section className="container-x py-20">
      <div className="max-w-3xl">
        <div className="eyebrow">{tr("Privacidad", "Privacy", "Privacy")}</div>
        <h1 className="display-lg mt-4">{tr("Política de privacidad", "Privacy Policy", "Privacy Policy")}</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          {tr(
            `Última actualización: ${LEGAL.lastUpdated}. Esta política integra la documentación legal de ${LEGAL.legalName} y describe el tratamiento realizado mediante el sitio web, formularios, CRM, correo electrónico, redes sociales y herramientas publicitarias.`,
            `Ultimo aggiornamento: ${LEGAL.lastUpdatedIt}. Questa policy integra la documentazione legale di ${LEGAL.legalName} e descrive il trattamento effettuato tramite sito, moduli, CRM, email, social network e strumenti pubblicitari.`,
            `Last updated: ${LEGAL.lastUpdatedEn}. This policy incorporates ${LEGAL.legalName}'s legal documentation and describes processing through the website, forms, CRM, email, social networks and advertising tools.`
          )}
        </p>

        <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
          <PolicySection title={tr("1. Responsable del tratamiento", "1. Titolare del trattamento", "1. Data controller")}> 
            <p className="font-medium text-foreground">{LEGAL.legalName}</p>
            <p>{tr("NIF:", "NIF:", "Tax ID:")} {LEGAL.taxId}</p>
            <p>{tr("Domicilio:", "Sede:", "Address:")} {LEGAL.address}</p>
            <p>{tr("Correo electrónico:", "Email:", "Email:")} <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a></p>
            <p>{tr("Teléfono:", "Telefono:", "Telephone:")} <a href={`tel:${LEGAL.phone.replace(/\s/g, "")}`} className="underline hover:text-foreground">{LEGAL.phone}</a></p>
            <p>{tr("Sitio web:", "Sito web:", "Website:")} <a href={LEGAL.website} className="underline hover:text-foreground">{LEGAL.domain}</a></p>
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
              <li>{tr("Datos identificativos y de contacto: nombre, email, teléfono, WhatsApp y, cuando corresponda, empresa o actividad profesional.", "Dati identificativi e di contatto: nome, email, telefono, WhatsApp e, ove pertinente, impresa o attività professionale.", "Identification and contact data: name, email, phone, WhatsApp and, where applicable, company or professional activity.")}</li>
              <li>{tr("Información del proyecto: tipo de cliente, propiedad, zona, intervención, plazo, presupuesto orientativo, disponibilidad de fotos o proyecto y mensaje enviado.", "Informazioni sul progetto: tipo di cliente, proprietà, zona, intervento, tempi, budget indicativo, disponibilità di foto o progetto e messaggio inviato.", "Project information: client type, property, area, requested work, timing, indicative budget, availability of photos or plans and submitted message.")}</li>
              <li>{tr("Datos de colaboradores profesionales: empresa, categoría, experiencia, disponibilidad, zona cubierta, web o portfolio y mensaje profesional.", "Dati dei collaboratori professionali: impresa, categoria, esperienza, disponibilità, zona coperta, sito o portfolio e messaggio professionale.", "Professional partner data: company, category, experience, availability, covered area, website or portfolio and professional message.")}</li>
              <li>{tr("Datos contractuales, contables y de facturación incluidos en presupuestos, contratos y facturas.", "Dati contrattuali, contabili e di fatturazione inclusi in preventivi, contratti e fatture.", "Contractual, accounting and billing data included in quotations, contracts and invoices.")}</li>
              <li>{tr("Datos técnicos y de atribución: dirección IP, navegador, dispositivo, landing page, referrer, fecha y hora, parámetros UTM, eventos de navegación e identificadores publicitarios cuando exista consentimiento.", "Dati tecnici e di attribuzione: indirizzo IP, browser, dispositivo, landing page, referrer, data e ora, parametri UTM, eventi di navigazione e identificatori pubblicitari previo consenso.", "Technical and attribution data: IP address, browser, device, landing page, referrer, date and time, UTM parameters, navigation events and advertising identifiers where consent has been given.")}</li>
              <li>{tr("Información pública e interacciones realizadas a través de perfiles oficiales de Eivitech en redes sociales.", "Informazioni pubbliche e interazioni effettuate tramite i profili social ufficiali Eivitech.", "Public information and interactions made through Eivitech's official social media profiles.")}</li>
            </ul>
          </PolicySection>

          <PolicySection title={tr("4. Finalidades y bases jurídicas", "4. Finalità e basi giuridiche", "4. Purposes and legal bases")}> 
            <div className="space-y-5">
              <LegalPurpose
                title={tr("Solicitudes, presupuestos y proyectos", "Richieste, preventivi e progetti", "Enquiries, quotations and projects")}
                text={tr(
                  "Responder a consultas, valorar proyectos, preparar presupuestos y adoptar medidas precontractuales solicitadas por el interesado. Base jurídica: medidas precontractuales, relación contractual e interés legítimo en atender y gestionar la solicitud.",
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
                title={tr("Comunicaciones profesionales y comerciales", "Comunicazioni professionali e commerciali", "Professional and commercial communications")}
                text={tr(
                  "Gestionar comunicaciones profesionales y, cuando exista una relación previa, consentimiento o un contexto comercial legítimo, enviar información sobre productos y servicios propios. El destinatario puede oponerse o retirar su consentimiento en cualquier momento.",
                  "Gestire comunicazioni professionali e, in presenza di un rapporto precedente, consenso o contesto commerciale legittimo, inviare informazioni su prodotti e servizi propri. Il destinatario può opporsi o revocare il consenso in qualsiasi momento.",
                  "Managing professional communications and, where there is a prior relationship, consent or legitimate commercial context, sending information about our own products and services. Recipients may object or withdraw consent at any time."
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
                title={tr("Redes sociales", "Social network", "Social media")}
                text={tr(
                  "Atender solicitudes y consultas, informar sobre actividades, servicios o proyectos e interactuar mediante perfiles oficiales. Base jurídica: consentimiento derivado de la interacción voluntaria y, cuando corresponda, interés legítimo en responder.",
                  "Gestire richieste e domande, informare su attività, servizi o progetti e interagire tramite profili ufficiali. Base giuridica: consenso derivante dall'interazione volontaria e, ove applicabile, legittimo interesse a rispondere.",
                  "Handling enquiries, providing information about activities, services or projects and interacting through official profiles. Legal basis: consent arising from voluntary interaction and, where applicable, legitimate interest in responding."
                )}
              />
              <LegalPurpose
                title={tr("Analítica y publicidad", "Analitica e pubblicità", "Analytics and advertising")}
                text={tr(
                  "Medir visitas, conversiones, rendimiento de landing pages, campañas de Google y Meta y realizar remarketing. Base jurídica: consentimiento del usuario, que puede retirarse desde la configuración de cookies.",
                  "Misurare visite, conversioni, rendimento delle landing page, campagne Google e Meta ed effettuare remarketing. Base giuridica: consenso dell'utente, revocabile dalle preferenze cookie.",
                  "Measuring visits, conversions, landing-page performance, Google and Meta campaigns and carrying out remarketing. Legal basis: user consent, which may be withdrawn through cookie settings."
                )}
              />
            </div>
          </PolicySection>

          <PolicySection title={tr("5. Carácter obligatorio, exactitud y actualización", "5. Natura obbligatoria, esattezza e aggiornamento", "5. Required fields, accuracy and updates")}> 
            <p>{tr(
              "Los campos marcados como obligatorios son necesarios para atender la solicitud o prestar el servicio. Si no se facilitan, no podrá garantizarse una respuesta completa. Los demás campos son voluntarios.",
              "I campi contrassegnati come obbligatori sono necessari per gestire la richiesta o fornire il servizio. In mancanza di tali dati non può essere garantita una risposta completa. Gli altri campi sono facoltativi.",
              "Fields marked as required are necessary to handle the request or provide the service. If they are not supplied, a complete response cannot be guaranteed. Other fields are optional."
            )}</p>
            <p>{tr(
              "El usuario garantiza que los datos facilitados son veraces, exactos y actualizados y se compromete a comunicar cualquier modificación.",
              "L'utente garantisce che i dati forniti sono veritieri, esatti e aggiornati e si impegna a comunicare eventuali modifiche.",
              "Users guarantee that the information supplied is truthful, accurate and up to date and agree to notify us of any changes."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("6. Destinatarios y encargados", "6. Destinatari e responsabili del trattamento", "6. Recipients and processors")}> 
            <p>{tr(
              "Los datos no se comunicarán a terceros independientes salvo obligación legal o cuando sea imprescindible para ejecutar la solicitud o relación contractual. Podrán acceder a ellos proveedores que actúan como encargados del tratamiento para servicios técnicos, alojamiento, CRM, autenticación, correo electrónico, analítica o publicidad.",
              "I dati non saranno comunicati a terzi indipendenti salvo obbligo di legge o quando indispensabile per eseguire la richiesta o il rapporto contrattuale. Potranno accedervi fornitori che agiscono come responsabili del trattamento per servizi tecnici, hosting, CRM, autenticazione, email, analitica o pubblicità.",
              "Data will not be disclosed to independent third parties unless legally required or essential to fulfil the request or contractual relationship. Service providers acting as processors may access it for technical, hosting, CRM, authentication, email, analytics or advertising services."
            )}</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              {TRACKING_PROVIDERS.map((provider) => (
                <li key={provider.en}>{tr(provider.es, provider.it, provider.en)}</li>
              ))}
            </ul>
          </PolicySection>

          <PolicySection title={tr("7. Transferencias internacionales", "7. Trasferimenti internazionali", "7. International transfers")}> 
            <p>{tr(
              "Algunos proveedores tecnológicos pueden tratar datos fuera del Espacio Económico Europeo. Cuando corresponda, las transferencias se realizarán mediante mecanismos reconocidos por la normativa aplicable, como decisiones de adecuación o cláusulas contractuales tipo.",
              "Alcuni fornitori tecnologici possono trattare dati al di fuori dello Spazio Economico Europeo. Quando applicabile, i trasferimenti avverranno tramite meccanismi riconosciuti dalla normativa, come decisioni di adeguatezza o clausole contrattuali standard.",
              "Some technology providers may process data outside the European Economic Area. Where applicable, transfers will rely on recognised safeguards such as adequacy decisions or standard contractual clauses."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("8. Plazos de conservación", "8. Periodi di conservazione", "8. Retention periods")}> 
            <ul className="list-disc space-y-2 pl-5">
              <li>{tr(`Solicitudes y leads sin relación contractual: hasta ${LEGAL.leadRetentionMonths} meses desde el último contacto, salvo obligaciones legales o reclamaciones.`, `Richieste e lead senza rapporto contrattuale: fino a ${LEGAL.leadRetentionMonths} mesi dall'ultimo contatto, salvo obblighi legali o reclami.`, `Enquiries and leads without a contractual relationship: up to ${LEGAL.leadRetentionMonths} months from the last contact, unless required for legal obligations or claims.`)}</li>
              <li>{tr("Datos contractuales, contables y de facturación: durante la relación y los plazos de prescripción legal aplicables.", "Dati contrattuali, contabili e di fatturazione: per la durata del rapporto e per i periodi di prescrizione previsti dalla legge.", "Contractual, accounting and billing data: for the duration of the relationship and applicable statutory limitation periods.")}</li>
              <li>{tr("Comunicaciones comerciales: mientras subsista la base jurídica o hasta la oposición o retirada del consentimiento.", "Comunicazioni commerciali: finché sussiste la base giuridica o fino all'opposizione o revoca del consenso.", "Commercial communications: while the legal basis remains valid or until objection or withdrawal of consent.")}</li>
              <li>{tr("Interacciones en redes sociales: mientras se mantenga la relación o hasta que el usuario retire el consentimiento o elimine la interacción.", "Interazioni sui social network: per la durata del rapporto o fino alla revoca del consenso o alla rimozione dell'interazione.", "Social media interactions: while the relationship continues or until the user withdraws consent or removes the interaction.")}</li>
              <li>{tr(`Preferencias de cookies: hasta ${LEGAL.consentValidityMonths} meses como máximo, salvo retirada anterior.`, `Preferenze cookie: fino a un massimo di ${LEGAL.consentValidityMonths} mesi, salvo revoca precedente.`, `Cookie preferences: for no longer than ${LEGAL.consentValidityMonths} months, unless withdrawn earlier.`)}</li>
            </ul>
          </PolicySection>

          <PolicySection title={tr("9. Derechos", "9. Diritti", "9. Rights")}> 
            <p>{tr(
              "Puedes ejercer los derechos de acceso, rectificación, portabilidad, supresión, limitación y oposición al tratamiento, así como retirar el consentimiento cuando sea la base jurídica aplicable.",
              "Puoi esercitare i diritti di accesso, rettifica, portabilità, cancellazione, limitazione e opposizione al trattamento, nonché revocare il consenso quando costituisce la base giuridica.",
              "You may exercise your rights of access, rectification, portability, erasure, restriction and objection, and withdraw consent where consent is the applicable legal basis."
            )}</p>
            <p>{tr("Para ejercerlos, escribe a", "Per esercitarli, scrivi a", "To exercise them, contact")} <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">{LEGAL.privacyEmail}</a> {tr("o dirígete a", "oppure scrivi a", "or write to")} {LEGAL.address}.</p>
            <p>{tr("Si consideras que el tratamiento no se ajusta a la normativa, puedes presentar una reclamación ante la", "Se ritieni che il trattamento non sia conforme alla normativa, puoi presentare un reclamo alla", "If you believe processing does not comply with applicable law, you may lodge a complaint with the")} <a href={LEGAL.aepdUrl} target="_blank" rel="noreferrer" className="underline hover:text-foreground">Agencia Española de Protección de Datos (AEPD)</a>.</p>
          </PolicySection>

          <PolicySection title={tr("10. Medidas de seguridad", "10. Misure di sicurezza", "10. Security measures")}> 
            <p>{tr(
              "Eivitech aplica medidas técnicas y organizativas apropiadas para tratar los datos de forma lícita, leal, transparente, adecuada, pertinente y limitada a lo necesario, y para protegerlos frente a pérdida, acceso, alteración o divulgación no autorizados.",
              "Eivitech applica misure tecniche e organizzative adeguate per trattare i dati in modo lecito, corretto, trasparente, adeguato, pertinente e limitato al necessario, proteggendoli da perdita, accesso, alterazione o divulgazione non autorizzati.",
              "Eivitech applies appropriate technical and organisational measures to process data lawfully, fairly, transparently, adequately, relevantly and only as necessary, and to protect it against loss, unauthorised access, alteration or disclosure."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("11. Formularios y comunicaciones comerciales", "11. Moduli e comunicazioni commerciali", "11. Forms and marketing communications")}> 
            <p>{tr(
              "La aceptación de la política de privacidad en los formularios permite tratar los datos para responder y gestionar la solicitud enviada. No equivale por sí sola a una suscripción general a comunicaciones promocionales. Cuando se solicite publicidad o newsletter, se ofrecerá una opción separada y no premarcada.",
              "L'accettazione della privacy policy nei moduli consente di trattare i dati per rispondere e gestire la richiesta inviata. Non equivale di per sé a un'iscrizione generale a comunicazioni promozionali. Per pubblicità o newsletter verrà proposta un'opzione separata e non preselezionata.",
              "Accepting the privacy policy in a form allows us to process data to respond to and manage that request. It does not by itself amount to a general subscription to promotional communications. Advertising or newsletter consent will be requested separately and will not be preselected."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("12. Redes sociales y publicaciones", "12. Social network e pubblicazioni", "12. Social media and publications")}> 
            <p>{tr(
              "Al seguir o interactuar con perfiles oficiales de Eivitech, el usuario acepta el tratamiento de la información pública necesaria para gestionar esa interacción. Las plataformas sociales mantienen sus propias políticas y configuraciones de privacidad.",
              "Seguendo o interagendo con i profili ufficiali Eivitech, l'utente accetta il trattamento delle informazioni pubbliche necessarie a gestire l'interazione. Le piattaforme social applicano proprie policy e impostazioni privacy.",
              "By following or interacting with Eivitech's official profiles, users accept the processing of public information necessary to manage that interaction. Social platforms apply their own privacy policies and settings."
            )}</p>
            <p>{tr(
              "El usuario debe disponer de los derechos necesarios sobre los textos, imágenes, vídeos o comentarios que publique y no puede difundir contenido ilícito, ofensivo o que vulnere derechos de terceros. Eivitech podrá retirar contenidos cuando proceda.",
              "L'utente deve disporre dei diritti necessari su testi, immagini, video o commenti pubblicati e non può diffondere contenuti illeciti, offensivi o lesivi di diritti di terzi. Eivitech potrà rimuovere i contenuti quando opportuno.",
              "Users must hold the necessary rights to any text, images, videos or comments they publish and must not post unlawful, offensive or rights-infringing content. Eivitech may remove content where appropriate."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("13. Menores de edad", "13. Minori", "13. Minors")}> 
            <p>{tr(
              "El sitio y los formularios profesionales no se dirigen a menores de 14 años. Eivitech no solicita conscientemente datos de menores. Si un menor utiliza redes sociales o formularios, deberá contar con la autorización o representación legal que resulte aplicable.",
              "Il sito e i moduli professionali non sono destinati ai minori di 14 anni. Eivitech non richiede consapevolmente dati di minori. L'uso di social network o moduli da parte di un minore richiede l'autorizzazione o rappresentanza legale applicabile.",
              "The website and professional forms are not directed at children under 14. Eivitech does not knowingly request children's data. A minor using social media or forms must have the applicable legal authorisation or representation."
            )}</p>
          </PolicySection>

          <PolicySection title={tr("14. Confidencialidad del correo electrónico", "14. Riservatezza delle email", "14. Email confidentiality")}> 
            <p>{tr(
              `Los mensajes enviados por ${LEGAL.legalName} y sus archivos adjuntos se dirigen exclusivamente a sus destinatarios y pueden contener información confidencial o sometida a secreto profesional. Si recibes un mensaje por error, debes eliminarlo e informar al remitente.`,
              `I messaggi inviati da ${LEGAL.legalName} e i relativi allegati sono destinati esclusivamente ai destinatari e possono contenere informazioni riservate o soggette a segreto professionale. Se ricevi un messaggio per errore, eliminalo e informa il mittente.`,
              `Messages sent by ${LEGAL.legalName} and their attachments are intended exclusively for their recipients and may contain confidential or professionally privileged information. If you receive a message in error, delete it and notify the sender.`
            )}</p>
          </PolicySection>

          <PolicySection title={tr("15. Cookies y medición de campañas", "15. Cookie e misurazione delle campagne", "15. Cookies and campaign measurement")}> 
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