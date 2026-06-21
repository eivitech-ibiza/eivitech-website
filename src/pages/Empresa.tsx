import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { ProcessSteps } from "@/components/ProcessSteps";
import casaImg from "@/assets/hero-home.jpg";

const Empresa = () => (
  <>
    <SEO
      title="Empresa | Eivitech Ibiza"
      description="Eivitech nace para ofrecer un servicio individual a cada cliente, acompañando cada proyecto desde la idea inicial hasta el último detalle."
      path="/empresa"
    />

    <section className="container-x pt-16 md:pt-24 pb-12 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div>
        <div className="eyebrow">Empresa</div>
        <h1 className="display-xl mt-4">Un referente local para tu reforma en Ibiza</h1>
        <p className="body-lg mt-6 max-w-2xl">
          Eivitech nace con la idea de ofrecer un servicio individual para cada cliente, acompañando cada
          proyecto desde la idea inicial hasta el último detalle.
        </p>
      </div>
      <div className="aspect-[4/5] overflow-hidden rounded-sm">
        <img src={casaImg} alt="Interior reformado por Eivitech en Ibiza" loading="lazy" className="h-full w-full object-cover" />
      </div>
    </section>

    <section className="section">
      <div className="container-x grid gap-12 md:grid-cols-2">
        <div>
          <div className="eyebrow">Lo que nos guía</div>
          <h2 className="display-md mt-3">Trato cercano, gestión clara</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Creemos en una relación directa con el cliente y en una gestión clara del proyecto. Un único
            interlocutor para que no tengas que coordinar entre múltiples profesionales.
          </p>
        </div>
        <div>
          <div className="eyebrow">Cómo acompañamos</div>
          <h2 className="display-md mt-3">Reformar con menos preocupación</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Nos adaptamos al uso de cada propiedad: vivienda habitual, casa de vacaciones o espacio comercial.
            Cuidamos funcionalidad y acabados para que el resultado dure.
          </p>
        </div>
      </div>
    </section>

    <section className="section bg-accent/40">
      <div className="container-x">
        <div className="eyebrow">Cómo trabajamos</div>
        <h2 className="display-lg mt-3 mb-12">Un proceso claro de principio a fin</h2>
        <ProcessSteps
          steps={[
            { title: "Primera valoración" },
            { title: "Visita o revisión" },
            { title: "Presupuesto" },
            { title: "Planificación" },
            { title: "Ejecución" },
            { title: "Entrega" },
          ]}
        />
      </div>
    </section>

    <CTASection />
  </>
);

export default Empresa;
