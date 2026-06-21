import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CheckCircle2 } from "lucide-react";
import { whatsappUrl } from "@/data/site";

const Gracias = () => (
  <>
    <SEO title="Gracias | Eivitech Ibiza" description="Hemos recibido tu solicitud." path="/gracias" />
    <section className="container-x py-32 text-center">
      <CheckCircle2 size={56} className="mx-auto text-primary" />
      <h1 className="display-lg mt-8">Gracias</h1>
      <p className="body-lg mx-auto mt-5 max-w-xl">
        Hemos recibido tu solicitud. Revisaremos la información y te contactaremos para valorar el siguiente paso.
      </p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
        Si tienes fotos, vídeos o planos, puedes enviarlos también por WhatsApp para acelerar la valoración.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href={whatsappUrl("Hola, acabo de enviar el formulario en la web. Te paso material adicional.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-sm bg-[#25D366] px-6 py-3.5 text-sm font-medium text-white"
        >
          Enviar material por WhatsApp
        </a>
        <Link to="/proyectos" className="inline-flex items-center rounded-sm border border-foreground/20 px-6 py-3.5 text-sm font-medium hover:bg-foreground/5">
          Ver proyectos mientras tanto
        </Link>
      </div>
    </section>
  </>
);

export default Gracias;
