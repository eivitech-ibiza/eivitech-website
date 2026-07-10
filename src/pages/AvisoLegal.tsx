import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { LEGAL } from "@/data/legal";
import { tr } from "@/lib/i18n";

const AvisoLegal = () => (
  <>
    <SEO
      title={tr("Aviso legal | Eivitech Ibiza", "Note legali | Eivitech Ibiza", "Legal notice | Eivitech Ibiza")}
      description={tr(
        `Aviso legal, condiciones de uso y datos identificativos de ${LEGAL.legalName}.`,
        `Note legali, condizioni d'uso e dati identificativi di ${LEGAL.legalName}.`,
        `Legal notice, terms of use and identification details for ${LEGAL.legalName}.`
      )}
      path="/aviso-legal"
    />

    <section className="container-x py-20">
      <div className="max-w-3xl">
        <div className="eyebrow">{tr("Legal", "Legale", "Legal")}</div>
        <h1 className="display-lg mt-4">{tr("Aviso legal", "Note legali", "Legal notice")}</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          {tr(
            `Este documento regula el acceso y uso de ${LEGAL.domain} y da cumplimiento a la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE).`,
            `Il presente documento disciplina l'accesso e l'utilizzo di ${LEGAL.domain} e dà attuazione alla legge spagnola 34/2002 sui servizi della società dell'informazione e sul commercio elettronico (LSSI-CE).`,
            `This document governs access to and use of ${LEGAL.domain} and complies with Spanish Law 34/2002 on information society services and electronic commerce (LSSI-CE).`
          )}
        </p>

        <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
          <LegalSection title={tr("1. Responsable y datos identificativos", "1. Titolare e dati identificativi", "1. Website owner and identification details")}> 
            <p className="font-medium text-foreground">{LEGAL.legalName}</p>
            <p>{tr("Nombre comercial:", "Nome commerciale:", "Trading name:")} {LEGAL.companyName}</p>
            <p>{tr("NIF:", "NIF:", "Tax ID:")} {LEGAL.taxId}</p>
            <p>{tr("Domicilio social:", "Sede legale:", "Registered office:")} {LEGAL.address}</p>
            <p>{tr("Dominio:", "Dominio:", "Domain:")} {LEGAL.domain}</p>
            <p>{tr("Correo electrónico:", "Email:", "Email:")} <a href={`mailto:${LEGAL.email}`} className="underline hover:text-foreground">{LEGAL.email}</a></p>
            <p>{tr("Teléfono:", "Telefono:", "Telephone:")} <a href={`tel:${LEGAL.phone.replace(/\s/g, "")}`} className="underline hover:text-foreground">{LEGAL.phone}</a></p>
          </LegalSection>

          <LegalSection title={tr("2. Objeto y condiciones de uso", "2. Oggetto e condizioni d'uso", "2. Purpose and terms of use")}> 
            <p>{tr(
              "El sitio presenta los servicios, proyectos y canales de contacto de Eivitech relacionados con reformas, instalaciones, interiores, exteriores y colaboraciones profesionales. Toda persona que acceda al sitio asume la condición de usuario y se compromete a utilizarlo de forma lícita, diligente y respetuosa.",
              "Il sito presenta servizi, progetti e canali di contatto Eivitech relativi a ristrutturazioni, impianti, interni, esterni e collaborazioni professionali. Chi accede al sito assume la qualità di utente e si impegna a utilizzarlo in modo lecito, diligente e rispettoso.",
              "The website presents Eivitech services, projects and contact channels relating to renovations, installations, interiors, outdoor works and professional collaborations. Anyone accessing the website becomes a user and agrees to use it lawfully, diligently and responsibly."
            )}</p>
            <p>{tr(
              "No está permitido introducir código dañino, intentar acceder a áreas restringidas, utilizar contenidos con fines fraudulentos o vulnerar derechos de terceros. Eivitech podrá modificar, actualizar o retirar contenidos del sitio cuando resulte necesario.",
              "Non è consentito introdurre codice dannoso, tentare di accedere ad aree riservate, utilizzare i contenuti per finalità fraudolente o violare diritti di terzi. Eivitech può modificare, aggiornare o rimuovere i contenuti del sito quando necessario.",
              "Users must not introduce harmful code, attempt to access restricted areas, use content for fraudulent purposes or infringe third-party rights. Eivitech may amend, update or remove website content where necessary."
            )}</p>
          </LegalSection>

          <LegalSection title={tr("3. Propiedad intelectual e industrial", "3. Proprietà intellettuale e industriale", "3. Intellectual and industrial property")}> 
            <p>{tr(
              "La programación, edición, diseño, logotipos, textos, fotografías, vídeos, gráficos y demás contenidos pertenecen a Eivitech o a sus respectivos titulares y están protegidos por la normativa de propiedad intelectual e industrial. Su reproducción, explotación, distribución o transformación requiere autorización previa, salvo los usos permitidos por la ley.",
              "Programmazione, editing, design, loghi, testi, fotografie, video, elementi grafici e altri contenuti appartengono a Eivitech o ai rispettivi titolari e sono protetti dalla normativa sulla proprietà intellettuale e industriale. Riproduzione, sfruttamento, distribuzione o trasformazione richiedono autorizzazione preventiva, salvo gli usi consentiti dalla legge.",
              "Programming, editing, design, logos, text, photographs, videos, graphics and other content belong to Eivitech or their respective owners and are protected by intellectual and industrial property law. Reproduction, exploitation, distribution or alteration requires prior authorisation, except where permitted by law."
            )}</p>
            <p>{tr(
              `Las observaciones sobre posibles infracciones pueden enviarse a ${LEGAL.email}.`,
              `Eventuali segnalazioni relative a possibili violazioni possono essere inviate a ${LEGAL.email}.`,
              `Reports concerning possible infringements may be sent to ${LEGAL.email}.`
            )}</p>
          </LegalSection>

          <LegalSection title={tr("4. Responsabilidad y disponibilidad", "4. Responsabilità e disponibilità", "4. Liability and availability")}> 
            <p>{tr(
              "Eivitech procura mantener la información actualizada y el sitio disponible, pero no garantiza la ausencia absoluta de errores, interrupciones, fallos técnicos, causas de fuerza mayor o contenidos externos modificados por terceros. La información publicada tiene carácter general y no sustituye un presupuesto, contrato o valoración técnica individual.",
              "Eivitech cerca di mantenere aggiornate le informazioni e disponibile il sito, ma non garantisce l'assenza assoluta di errori, interruzioni, guasti tecnici, cause di forza maggiore o contenuti esterni modificati da terzi. Le informazioni pubblicate hanno carattere generale e non sostituiscono un preventivo, contratto o valutazione tecnica individuale.",
              "Eivitech seeks to keep information current and the website available, but does not guarantee the complete absence of errors, interruptions, technical failures, force majeure events or external content changed by third parties. Published information is general and does not replace an individual quotation, contract or technical assessment."
            )}</p>
          </LegalSection>

          <LegalSection title={tr("5. Enlaces externos", "5. Collegamenti esterni", "5. External links")}> 
            <p>{tr(
              "El sitio puede contener enlaces a páginas o servicios de terceros. Eivitech no controla de forma permanente dichos contenidos ni sus condiciones, por lo que no asume responsabilidad por ellos. Si se detecta contenido contrario a la ley, a derechos de terceros, a la moral o al orden público, se retirará el enlace cuando proceda.",
              "Il sito può contenere collegamenti a pagine o servizi di terzi. Eivitech non controlla in modo permanente tali contenuti o condizioni e non ne assume la responsabilità. Qualora vengano rilevati contenuti contrari alla legge, ai diritti di terzi, alla morale o all'ordine pubblico, il collegamento sarà rimosso quando opportuno.",
              "The website may contain links to third-party pages or services. Eivitech does not continuously control their content or terms and accepts no responsibility for them. Where content contrary to law, third-party rights, morality or public order is identified, the link will be removed where appropriate."
            )}</p>
          </LegalSection>

          <LegalSection title={tr("6. Direcciones IP y registros técnicos", "6. Indirizzi IP e registri tecnici", "6. IP addresses and technical logs")}> 
            <p>{tr(
              "Los servidores y proveedores técnicos pueden registrar automáticamente la dirección IP, dominio, navegador, dispositivo, fecha, hora, página solicitada y otros datos técnicos necesarios para seguridad, funcionamiento, diagnóstico y estadísticas agregadas. Su tratamiento se explica en la Política de privacidad y, cuando corresponda, queda sujeto al consentimiento de cookies.",
              "Server e fornitori tecnici possono registrare automaticamente indirizzo IP, dominio, browser, dispositivo, data, ora, pagina richiesta e altri dati tecnici necessari per sicurezza, funzionamento, diagnosi e statistiche aggregate. Il relativo trattamento è descritto nella Privacy Policy e, ove applicabile, è soggetto al consenso cookie.",
              "Servers and technical providers may automatically record IP address, domain, browser, device, date, time, requested page and other technical data required for security, operation, diagnostics and aggregated statistics. Processing is explained in the Privacy Policy and, where applicable, is subject to cookie consent."
            )}</p>
          </LegalSection>

          <LegalSection title={tr("7. Protección de datos y cookies", "7. Protezione dei dati e cookie", "7. Data protection and cookies")}> 
            <p>{tr("El tratamiento de datos personales se explica en la", "Il trattamento dei dati personali è descritto nella", "Personal data processing is explained in the")} <Link to="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>. {tr("El uso de cookies y tecnologías similares se detalla en la", "L'uso di cookie e tecnologie simili è descritto nella", "The use of cookies and similar technologies is detailed in the")} <Link to="/cookie-policy" className="underline hover:text-foreground">Cookie Policy</Link>.</p>
          </LegalSection>

          <LegalSection title={tr("8. Legislación aplicable y jurisdicción", "8. Legge applicabile e giurisdizione", "8. Applicable law and jurisdiction")}> 
            <p>{tr(
              "Este sitio se rige por la legislación española. Las controversias se someterán a los juzgados y tribunales que resulten competentes conforme a la normativa aplicable, respetando en todo caso las normas imperativas de protección de consumidores y usuarios.",
              "Il sito è disciplinato dalla legislazione spagnola. Le controversie saranno sottoposte ai tribunali competenti secondo la normativa applicabile, nel rispetto delle norme imperative a tutela di consumatori e utenti.",
              "This website is governed by Spanish law. Disputes will be submitted to the courts with jurisdiction under applicable law, subject at all times to mandatory consumer and user protection rules."
            )}</p>
          </LegalSection>
        </div>
      </div>
    </section>
  </>
);

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="display-sm text-foreground">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default AvisoLegal;