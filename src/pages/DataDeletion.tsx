import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { LEGAL } from "@/data/legal";
import { tr } from "@/lib/i18n";

export default function DataDeletion() {
  return (
    <>
      <SEO
        title={tr(
          "Eliminación de datos | Eivitech Ibiza",
          "Eliminazione dei dati | Eivitech Ibiza",
          "Data deletion | Eivitech Ibiza",
          "Gegevens verwijderen | Eivitech Ibiza"
        )}
        description={tr(
          "Instrucciones para solicitar la eliminación de datos personales tratados por Eivitech.",
          "Istruzioni per richiedere l'eliminazione dei dati personali trattati da Eivitech.",
          "Instructions for requesting deletion of personal data processed by Eivitech.",
          "Instructies om verwijdering aan te vragen van persoonsgegevens die door Eivitech worden verwerkt."
        )}
        path="/data-deletion"
        noIndex
      />

      <section className="container-x py-20">
        <div className="max-w-3xl">
          <div className="eyebrow">
            {tr("Privacidad", "Privacy", "Privacy", "Privacy")}
          </div>
          <h1 className="display-lg mt-4">
            {tr(
              "Solicitud de eliminación de datos",
              "Richiesta di eliminazione dei dati",
              "Data deletion request",
              "Verzoek tot gegevensverwijdering"
            )}
          </h1>

          <div className="mt-8 space-y-8 text-muted-foreground leading-relaxed">
            <p>
              {tr(
                `${LEGAL.legalName} permite solicitar la eliminación de los datos personales recibidos a través del sitio web, formularios de Meta Lead Ads, correo electrónico, redes sociales y nuestro CRM, salvo cuando exista una obligación legal o una base legítima para conservar determinados datos.`,
                `${LEGAL.legalName} consente di richiedere la cancellazione dei dati personali ricevuti tramite il sito web, i moduli Meta Lead Ads, email, social network e il nostro CRM, salvo quando esista un obbligo di legge o una base legittima per conservare determinati dati.`,
                `${LEGAL.legalName} allows you to request deletion of personal data received through the website, Meta Lead Ads forms, email, social media and our CRM, except where a legal obligation or other lawful basis requires certain data to be retained.`,
                `${LEGAL.legalName} maakt het mogelijk om verwijdering aan te vragen van persoonsgegevens die zijn ontvangen via de website, Meta Lead Ads-formulieren, e-mail, sociale media en ons CRM, behalve wanneer een wettelijke verplichting of andere rechtsgrond vereist dat bepaalde gegevens worden bewaard.`
              )}
            </p>

            <section>
              <h2 className="display-sm text-foreground">
                {tr(
                  "Cómo solicitar la eliminación",
                  "Come richiedere la cancellazione",
                  "How to request deletion",
                  "Hoe verwijdering aan te vragen"
                )}
              </h2>
              <ol className="mt-3 list-decimal space-y-3 pl-5">
                <li>
                  {tr(
                    "Envía un correo electrónico a",
                    "Invia un'email a",
                    "Send an email to",
                    "Stuur een e-mail naar"
                  )}{" "}
                  <a href={`mailto:${LEGAL.privacyEmail}`} className="underline hover:text-foreground">
                    {LEGAL.privacyEmail}
                  </a>.
                </li>
                <li>
                  {tr(
                    "Utiliza como asunto: “Solicitud de eliminación de datos”.",
                    "Usa come oggetto: “Richiesta di eliminazione dei dati”.",
                    "Use the subject: “Data deletion request”.",
                    "Gebruik als onderwerp: “Verzoek tot gegevensverwijdering”."
                  )}
                </li>
                <li>
                  {tr(
                    "Indica el nombre y el correo electrónico o teléfono que utilizaste al contactar con Eivitech o al enviar un formulario de Meta.",
                    "Indica il nome e l'indirizzo email o il numero di telefono utilizzati per contattare Eivitech o inviare un modulo Meta.",
                    "Provide the name and email address or phone number you used when contacting Eivitech or submitting a Meta form.",
                    "Vermeld de naam en het e-mailadres of telefoonnummer dat je gebruikte toen je contact opnam met Eivitech of een Meta-formulier indiende."
                  )}
                </li>
                <li>
                  {tr(
                    "Si necesitamos información adicional para verificar tu identidad o localizar los datos, te la solicitaremos antes de completar la eliminación.",
                    "Se avremo bisogno di ulteriori informazioni per verificare la tua identità o individuare i dati, te le richiederemo prima di completare la cancellazione.",
                    "If we need additional information to verify your identity or locate the data, we will request it before completing deletion.",
                    "Als we aanvullende informatie nodig hebben om je identiteit te verifiëren of de gegevens te vinden, vragen we die voordat de verwijdering wordt voltooid."
                  )}
                </li>
              </ol>
            </section>

            <section>
              <h2 className="display-sm text-foreground">
                {tr(
                  "Qué ocurre después",
                  "Cosa succede dopo",
                  "What happens next",
                  "Wat gebeurt er daarna"
                )}
              </h2>
              <p className="mt-3">
                {tr(
                  "Confirmaremos la recepción de la solicitud y la gestionaremos dentro de los plazos previstos por la normativa aplicable. Cuando corresponda, eliminaremos o anonimizaremos los datos de nuestros sistemas activos y de los proveedores que actúen por nuestra cuenta.",
                  "Confermeremo la ricezione della richiesta e la gestiremo nei termini previsti dalla normativa applicabile. Ove opportuno, cancelleremo o anonimizzeremo i dati dai nostri sistemi attivi e dai fornitori che operano per nostro conto.",
                  "We will acknowledge the request and handle it within the time limits required by applicable law. Where appropriate, we will delete or anonymise the data from our active systems and from service providers acting on our behalf.",
                  "We bevestigen de ontvangst van het verzoek en behandelen het binnen de termijnen van de toepasselijke wetgeving. Waar passend verwijderen of anonimiseren we de gegevens uit onze actieve systemen en bij dienstverleners die namens ons handelen."
                )}
              </p>
              <p className="mt-3">
                {tr(
                  "Algunos datos podrán conservarse de forma limitada cuando sea necesario para cumplir obligaciones legales, atender reclamaciones o acreditar el cumplimiento normativo.",
                  "Alcuni dati potranno essere conservati in modo limitato quando necessario per adempiere a obblighi di legge, gestire reclami o dimostrare la conformità normativa.",
                  "Some data may be retained on a limited basis where necessary to comply with legal obligations, handle claims or demonstrate regulatory compliance.",
                  "Sommige gegevens kunnen beperkt worden bewaard wanneer dat nodig is om aan wettelijke verplichtingen te voldoen, claims af te handelen of naleving aan te tonen."
                )}
              </p>
            </section>

            <p>
              {tr(
                "Para más información, consulta nuestra",
                "Per maggiori informazioni, consulta la nostra",
                "For more information, see our",
                "Voor meer informatie, zie ons"
              )}{" "}
              <Link to="/privacy-policy" className="underline hover:text-foreground">
                {tr(
                  "Política de privacidad",
                  "Privacy Policy",
                  "Privacy Policy",
                  "Privacybeleid"
                )}
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
