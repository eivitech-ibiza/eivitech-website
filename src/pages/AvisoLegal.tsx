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
        `Aviso legal y datos identificativos de ${LEGAL.legalName}.`,
        `Note legali e dati identificativi di ${LEGAL.legalName}.`,
        `Legal notice and identification details for ${LEGAL.legalName}.`
      )}
      path="/aviso-legal"
    />

    <section className="container-x py-20">
      <div className="max-w-3xl">
        <div className="eyebrow">{tr("Legal", "Legale", "Legal")}</div>
        <h1 className="display-lg mt-4">{tr("Aviso legal", "Note legali", "Legal notice")}</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          {tr(
            "Este aviso regula el acceso y uso del sitio web de Eivitech.",
            "Le presenti note regolano l'accesso e l'utilizzo del sito web Eivitech.",
            "This notice governs access to and use of the Eivitech website."
          )}
        </p>

        <div className="mt-10 space-y-10 text-muted-foreground leading-relaxed">
          <LegalSection title={tr("1. Datos identificativos", "1. Dati identificativi", "1. Identification details")}>
            <p className="font-medium text-foreground">{LEGAL.legalName}</p>
            <p>{tr("CIF:", "CIF:", "Tax ID:")} {LEGAL.taxId}</p>
            <p>{LEGAL.address}</p>
            <p>{tr("Referente operativo:", "Referente operativo:", "Operational contact:")} {LEGAL.operationalContact}</p>
            <p>{tr("Correo electrónico:", "Email:", "Email:")} <a href={`mailto:${LEGAL.email}`} className="underline hover:text-foreground">{LEGAL.email}</a></p>
            <p>{tr("Teléfono:", "Telefono:", "Telephone:")} <a href={`tel:${LEGAL.phone.replace(/\s/g, "")}`} className="underline hover:text-foreground">{LEGAL.phone}</a></p>
          </LegalSection>

          <LegalSection title={tr("2. Objeto del sitio", "2. Oggetto del sito", "2. Website purpose")}>
            <p>{tr(
              "El sitio presenta los servicios, proyectos y canales de contacto de Eivitech relacionados con reformas, instalaciones, interiores, exteriores y colaboraciones profesionales.",
              "Il sito presenta i servizi, i progetti e i canali di contatto di Eivitech relativi a ristrutturazioni, impianti, interni, esterni e collaborazioni professionali.",
              "The website presents Eivitech services, projects and contact channels relating to renovations, installations, interiors, outdoor works and professional collaborations."
            )}</p>
          </LegalSection>

          <LegalSection title={tr("3. Condiciones de uso", "3. Condizioni d'uso", "3. Terms of use")}>
            <p>{tr(
              "El usuario se compromete a utilizar el sitio de forma lícita, diligente y respetuosa, sin introducir código dañino, intentar acceder a áreas restringidas ni emplear la información publicada con fines fraudulentos o contrarios a derechos de terceros.",
              "L'utente si impegna a utilizzare il sito in modo lecito, diligente e rispettoso, senza introdurre codice dannoso, tentare di accedere ad aree riservate o utilizzare le informazioni pubblicate per finalità fraudolente o lesive dei diritti di terzi.",
              "Users agree to use the website lawfully and responsibly, without introducing harmful code, attempting to access restricted areas or using published information for fraudulent purposes or in breach of third-party rights."
            )}</p>
          </LegalSection>

          <LegalSection title={tr("4. Propiedad intelectual", "4. Proprietà intellettuale", "4. Intellectual property")}>
            <p>{tr(
              "Los textos, diseños, fotografías, vídeos, logotipos, elementos gráficos y código del sitio pertenecen a sus respectivos titulares y no pueden reproducirse, distribuirse o transformarse sin autorización, salvo en los casos permitidos por la ley.",
              "Testi, design, fotografie, video, loghi, elementi grafici e codice del sito appartengono ai rispettivi titolari e non possono essere riprodotti, distribuiti o trasformati senza autorizzazione, salvo quanto consentito dalla legge.",
              "Website text, designs, photographs, videos, logos, graphic elements and code belong to their respective rights holders and may not be reproduced, distributed or transformed without authorisation, except where permitted by law."
            )}</p>
          </LegalSection>

          <LegalSection title={tr("5. Responsabilidad", "5. Responsabilità", "5. Liability")}>
            <p>{tr(
              "Eivitech procura mantener la información actualizada y el sitio disponible, pero no garantiza la ausencia absoluta de errores, interrupciones o contenidos externos modificados por terceros. La información publicada tiene carácter general y no sustituye un presupuesto, contrato o valoración técnica individual.",
              "Eivitech cerca di mantenere aggiornate le informazioni e disponibile il sito, ma non garantisce l'assenza assoluta di errori, interruzioni o contenuti esterni modificati da terzi. Le informazioni pubblicate hanno carattere generale e non sostituiscono un preventivo, contratto o valutazione tecnica individuale.",
              "Eivitech seeks to keep information current and the website available, but does not guarantee the absolute absence of errors, interruptions or third-party changes to external content. Published information is general and does not replace an individual quotation, contract or technical assessment."
            )}</p>
          </LegalSection>

          <LegalSection title={tr("6. Protección de datos y cookies", "6. Protezione dei dati e cookie", "6. Data protection and cookies")}>
            <p>{tr("El tratamiento de datos personales se explica en la", "Il trattamento dei dati personali è descritto nella", "Personal data processing is explained in the")} <Link to="/privacy-policy" className="underline hover:text-foreground">Privacy Policy</Link>. {tr("El uso de cookies y tecnologías similares se detalla en la", "L'uso di cookie e tecnologie simili è descritto nella", "The use of cookies and similar technologies is detailed in the")} <Link to="/cookie-policy" className="underline hover:text-foreground">Cookie Policy</Link>.</p>
          </LegalSection>

          <LegalSection title={tr("7. Legislación aplicable", "7. Legge applicabile", "7. Applicable law")}>
            <p>{tr(
              "Este sitio se rige por la legislación española, sin perjuicio de las normas imperativas de protección que puedan resultar aplicables al usuario.",
              "Il sito è disciplinato dalla legislazione spagnola, fatte salve le norme imperative di protezione eventualmente applicabili all'utente.",
              "This website is governed by Spanish law, without prejudice to any mandatory protections that may apply to the user."
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
