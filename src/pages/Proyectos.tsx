import { SEO } from "@/components/SEO";
import { ProjectCard } from "@/components/ProjectCard";
import { CTASection } from "@/components/CTASection";
import { PROJECTS } from "@/data/projects";

const Proyectos = () => (
  <>
    <SEO
      title="Proyectos de reformas en Ibiza | Eivitech"
      description="Casos reales de reformas e instalaciones en Ibiza: villas, apartamentos y locales comerciales."
      path="/proyectos"
    />
    <section className="container-x pt-16 md:pt-24 pb-12">
      <div className="eyebrow">Proyectos</div>
      <h1 className="display-xl mt-4 max-w-4xl">Casos reales en Ibiza</h1>
      <p className="body-lg mt-5 max-w-2xl">
        Cada proyecto tiene su propia historia: cuál era el punto de partida, qué buscábamos y cómo se resolvió.
      </p>
    </section>
    <section className="container-x pb-20 grid gap-6 md:grid-cols-2">
      {PROJECTS.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i === 0} />)}
    </section>
    <CTASection title="¿Tienes una propiedad parecida?" />
  </>
);

export default Proyectos;
