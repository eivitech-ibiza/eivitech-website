import { SEO } from "@/components/SEO";
import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { SITE, whatsappUrl } from "@/data/site";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { track } from "@/lib/tracking";

const Contacto = () => (
  <>
    <SEO
      title="Contacto | Eivitech Ibiza"
      description="Cuéntanos tu proyecto en Ibiza. Rellena el formulario o escríbenos por WhatsApp para una primera valoración."
      path="/contacto"
    />
    <section className="container-x pt-16 md:pt-24 pb-12">
      <div className="eyebrow">Contacto</div>
      <h1 className="display-xl mt-4 max-w-3xl">Cuéntanos qué propiedad quieres reformar</h1>
      <p className="body-lg mt-5 max-w-2xl">
        Cuanto más nos cuentes sobre la propiedad y el tipo de intervención, mejor podremos orientarte en la primera valoración.
      </p>
    </section>

    <section className="container-x pb-24 grid gap-14 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-sm border border-border bg-card p-6 md:p-10">
        <LeadQualificationForm source="contacto" />
      </div>
      <aside className="space-y-8">
        <div>
          <div className="eyebrow">Otros canales</div>
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
          href={whatsappUrl("Hola, me gustaría solicitar una valoración para mi proyecto en Ibiza.")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { source: "contacto" })}
          className="inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-5 py-3 text-sm font-medium text-white"
        >
          <MessageCircle size={16} /> Hablar por WhatsApp
        </a>
        <div className="rounded-sm bg-accent p-5 text-sm text-muted-foreground leading-relaxed">
          Recopilamos solo los datos necesarios para responder a tu solicitud. Más información en la{" "}
          <a href="/privacidad" className="underline hover:text-foreground">política de privacidad</a>.
        </div>
      </aside>
    </section>
  </>
);

export default Contacto;
