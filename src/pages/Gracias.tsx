import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CheckCircle2 } from "lucide-react";
import { whatsappUrl } from "@/data/site";
import { tr } from "@/lib/i18n";

const Gracias = () => (
  <>
    <SEO
      title={tr("Gracias | Eivitech Ibiza", "Grazie | Eivitech Ibiza", "Thank you | Eivitech Ibiza")}
      description={tr("Hemos recibido tu solicitud.", "Abbiamo ricevuto la tua richiesta.", "We have received your request.")}
      path="/gracias"
    />
    <section className="container-x py-32 text-center">
      <CheckCircle2 size={56} className="mx-auto text-primary" />
      <h1 className="display-lg mt-8">{tr("Gracias", "Grazie", "Thank you")}</h1>
      <p className="body-lg mx-auto mt-5 max-w-xl">
        {tr("Hemos recibido tu solicitud. Revisaremos la información y te contactaremos para valorar el siguiente paso.", "Abbiamo ricevuto la tua richiesta. Esamineremo le informazioni e ti contatteremo per valutare il prossimo passo.", "We have received your request. We will review the information and contact you to assess the next step.")}
      </p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
        {tr("Si tienes fotos, vídeos o planos, puedes enviarlos también por WhatsApp para acelerar la valoración.", "Se hai foto, video o planimetrie, puoi inviarli anche via WhatsApp per velocizzare la valutazione.", "If you have photos, videos or plans, you can also send them by WhatsApp to speed up the assessment.")}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={whatsappUrl(tr("Hola, acabo de enviar el formulario en la web. Te paso material adicional.", "Ciao, ho appena inviato il modulo sul sito. Ti mando materiale aggiuntivo.", "Hello, I have just submitted the form on the website. I am sending additional material."))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-sm bg-[#25D366] px-6 py-3.5 text-sm font-medium text-white"
        >
          {tr("Enviar material por WhatsApp", "Inviare materiale via WhatsApp", "Send material by WhatsApp")}
        </a>
        <Link to="/proyectos" className="inline-flex items-center rounded-sm border border-foreground/20 px-6 py-3.5 text-sm font-medium hover:bg-foreground/5">
          {tr("Ver proyectos mientras tanto", "Guarda i progetti nel frattempo", "View projects in the meantime")}
        </Link>
      </div>
    </section>
  </>
);

export default Gracias;
