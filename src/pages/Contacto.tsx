import { SEO } from "@/components/SEO";
import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { SITE, whatsappUrl } from "@/data/site";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { track } from "@/lib/tracking";
import { tr } from "@/lib/i18n";

const Contacto = () => (
  <>
    <SEO
      title={tr("Contacto | Eivitech Ibiza", "Contatto | Eivitech Ibiza", "Contact | Eivitech Ibiza")}
      description={tr(
        "Cuéntanos tu proyecto en Ibiza. Rellena el formulario o escríbenos por WhatsApp para una primera valoración.",
        "Raccontaci il tuo progetto a Ibiza. Compila il modulo o scrivici su WhatsApp per una prima valutazione.",
        "Tell us about your project in Ibiza. Fill in the form or message us on WhatsApp for an initial assessment."
      )}
      path="/contacto"
    />
    <section className="container-x pt-16 md:pt-24 pb-12">
      <div className="eyebrow">{tr("Contacto", "Contatto", "Contact")}</div>
      <h1 className="display-xl mt-4 max-w-3xl">
        {tr("Cuéntanos qué propiedad quieres reformar", "Raccontaci quale proprietà vuoi ristrutturare", "Tell us which property you want to renovate")}
      </h1>
      <p className="body-lg mt-5 max-w-2xl">
        {tr(
          "Cuanto más nos cuentes sobre la propiedad y el tipo de intervención, mejor podremos orientarte en la primera valoración.",
          "Più ci racconti sulla proprietà e sul tipo di intervento, meglio potremo orientarti nella prima valutazione.",
          "The more you tell us about the property and the type of work, the better we can guide you in the initial assessment."
        )}
      </p>
    </section>

    <section className="container-x pb-24 grid gap-14 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-sm border border-border bg-card p-6 md:p-10">
        <LeadQualificationForm source="contacto" />
      </div>
      <aside className="space-y-8">
        <div>
          <div className="eyebrow">{tr("Otros canales", "Altri canali", "Other channels")}</div>
          <div className="mt-4 space-y-3 text-sm">
            <a href={SITE.phoneHref} onClick={() => track("phone_click", { source: "contacto" })} className="flex items-center gap-3 hover:text-primary">
              <Phone size={16} className="text-primary" /> {SITE.phone}
            </a>
            <a href={SITE.emailHref} className="flex items-center gap-3 hover:text-primary">
              <Mail size={16} className="text-primary" /> {SITE.email}
            </a>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin size={16} className="text-primary" /> {SITE.location}
            </div>
          </div>
        </div>
        <a
          href={whatsappUrl(tr("Hola, me gustaría solicitar una valoración para mi proyecto en Ibiza.", "Ciao, vorrei richiedere una valutazione per il mio progetto a Ibiza.", "Hello, I would like to request an assessment for my project in Ibiza."))}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { source: "contacto" })}
          className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-5 py-3 text-sm font-medium text-white"
        >
          <MessageCircle size={16} /> {tr("Hablar por WhatsApp", "Parla su WhatsApp", "Chat on WhatsApp")}
        </a>
        <div className="rounded-sm bg-accent p-5 text-sm text-muted-foreground leading-relaxed">
          {tr("Recopilamos solo los datos necesarios para responder a tu solicitud. Más información en la", "Raccogliamo solo i dati necessari per rispondere alla tua richiesta. Maggiori informazioni nella", "We collect only the data needed to respond to your request. More information in the")} {" "}
          <a href="/privacy-policy" className="underline hover:text-foreground">{tr("política de privacidad", "privacy policy", "privacy policy")}</a>.
        </div>
      </aside>
    </section>
  </>
);

export default Contacto;
