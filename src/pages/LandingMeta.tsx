import { SEO } from "@/components/SEO";
import { LeadQualificationForm } from "@/components/LeadQualificationForm";
import { ProjectCard } from "@/components/ProjectCard";
import { ProcessSteps } from "@/components/ProcessSteps";
import { PROJECTS } from "@/data/projects";
import { whatsappUrl } from "@/data/site";
import { track } from "@/lib/tracking";
import { MessageCircle } from "lucide-react";
import materiales from "@/assets/materiales.jpg";
import apartamento from "@/assets/apartamento.jpg";

const LandingMeta = () => (
  <>
    <SEO
      title="Proyectos de reformas en Ibiza | Eivitech"
      description="Mira casos reales de reformas en Ibiza: villas, apartamentos y locales. Materiales, acabados y estilo."
      path="/proyectos-reformas-ibiza"
      trackAs="meta_landing_view"
      ogImage={apartamento}
    />

    <section className="container-x pt-14 md:pt-20 pb-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
        <div>
          <div className="eyebrow">Reformas en Ibiza · Proyectos</div>
          <h1 className="display-xl mt-4">Materiales naturales. Acabados cuidados. Ibiza.</h1>
          <p className="body-lg mt-5 max-w-xl">
            Echa un vistazo a algunos de nuestros proyectos: villas, apartamentos y locales reformados con atención al detalle.
          </p>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-sm">
          <img src={materiales} alt="Materiales naturales" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>

    <section className="section-tight">
      <div className="container-x grid gap-6 md:grid-cols-2">
        {PROJECTS.map((p) => <ProjectCard key={p.slug} project={p} />)}
      </div>
    </section>

    <section className="section bg-accent/40">
      <div className="container-x grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
        <div>
          <div className="eyebrow">Estilo y materiales</div>
          <h2 className="display-md mt-3">Microcemento, madera, piedra ibicenca</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Trabajamos con materiales que envejecen bien y se integran con el carácter de la isla.
          </p>
        </div>
        <ProcessSteps
          steps={[
            { title: "Valoración" },
            { title: "Visita" },
            { title: "Presupuesto" },
            { title: "Planificación" },
            { title: "Ejecución" },
            { title: "Entrega" },
          ]}
        />
      </div>
    </section>

    <section className="section">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="eyebrow">Empezar</div>
          <h2 className="display-lg mt-3">¿Te imaginas algo parecido en tu propiedad?</h2>
          <p className="mt-5 text-muted-foreground text-lg leading-relaxed">
            Cuéntanos tu proyecto y prepararemos una primera valoración. Sin compromiso.
          </p>
          <a
            href={whatsappUrl("Hola, vengo de Instagram. Me gustaría hablar de una posible reforma en Ibiza.")}
            onClick={() => track("whatsapp_click", { source: "landing_meta" })}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-5 py-3.5 text-sm font-medium text-white"
          >
            <MessageCircle size={16} /> Hablar por WhatsApp
          </a>
        </div>
        <div className="rounded-sm border border-border bg-card p-6 md:p-8">
          <LeadQualificationForm source="landing_meta" />
        </div>
      </div>
    </section>
  </>
);

export default LandingMeta;
