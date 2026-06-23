import { SEO } from "@/components/SEO";
import { tr } from "@/lib/i18n";

const Privacidad = () => (
  <>
    <SEO title={tr("Política de privacidad | Eivitech Ibiza", "Privacy policy | Eivitech Ibiza", "Privacy policy | Eivitech Ibiza")} description={tr("Política de privacidad de Eivitech.", "Privacy policy di Eivitech.", "Eivitech privacy policy.")} path="/privacidad" />
    <section className="container-x py-20 max-w-3xl prose prose-neutral">
      <div className="eyebrow">{tr("Privacidad", "Privacy", "Privacy")}</div>
      <h1 className="display-lg mt-4">{tr("Política de privacidad", "Privacy policy", "Privacy policy")}</h1>
      <p className="mt-6 text-muted-foreground">{tr("Esta página es un placeholder. El tratamiento de datos, cookies, píxeles y automatizaciones debe verificarse con asesoría legal/privacy antes de activar campañas o trackers.", "Questa pagina è un placeholder. Il trattamento di dati, cookie, pixel e automazioni deve essere verificato con consulenza legale/privacy prima di attivare campagne o tracker.", "This page is a placeholder. Data processing, cookies, pixels and automations must be reviewed with legal/privacy advice before activating campaigns or trackers.")}</p>
      <h2 className="display-md mt-10">{tr("Datos que recopilamos", "Dati che raccogliamo", "Data we collect")}</h2>
      <p className="mt-3 text-muted-foreground">{tr("Recopilamos únicamente los datos necesarios para responder a las solicitudes recibidas a través del formulario de contacto: nombre, email, teléfono y la información proporcionada sobre el proyecto.", "Raccogliamo solo i dati necessari per rispondere alle richieste ricevute tramite il modulo di contatto: nome, email, telefono e informazioni fornite sul progetto.", "We only collect the data needed to respond to requests received through the contact form: name, email, phone and information provided about the project.")}</p>
      <h2 className="display-md mt-10">{tr("Finalidad", "Finalità", "Purpose")}</h2>
      <p className="mt-3 text-muted-foreground">{tr("Los datos se utilizan exclusivamente para gestionar la primera valoración y el seguimiento posterior.", "I dati vengono utilizzati esclusivamente per gestire la prima valutazione e il follow-up successivo.", "The data is used exclusively to manage the initial assessment and later follow-up.")}</p>
      <h2 className="display-md mt-10">{tr("Contacto", "Contatto", "Contact")}</h2>
      <p className="mt-3 text-muted-foreground">{tr("Para cualquier consulta sobre tus datos, escríbenos a info@eivitech.com.", "Per qualsiasi domanda sui tuoi dati, scrivici a info@eivitech.com.", "For any question about your data, write to info@eivitech.com.")}</p>
      <p className="mt-10 text-sm text-muted-foreground">{tr("Texto definitivo pendiente de redacción con asesoría legal.", "Testo definitivo in attesa di redazione con consulenza legale.", "Final text pending legal drafting.")}</p>
    </section>
  </>
);

export default Privacidad;
