import { SEO } from "@/components/SEO";
import { ProjectCard } from "@/components/ProjectCard";
import { CTASection } from "@/components/CTASection";
import { PROJECTS } from "@/data/projects";
import { tr } from "@/lib/i18n";

const Proyectos = () => (
  <>
    <SEO
      title={tr("Proyectos de reformas en Ibiza | Eivitech", "Progetti di ristrutturazione a Ibiza | Eivitech", "Renovation projects in Ibiza | Eivitech")}
      description={tr("Casos reales de reformas e instalaciones en Ibiza: villas, apartamentos y locales comerciales.", "Casi reali di ristrutturazioni e impianti a Ibiza: ville, appartamenti e locali commerciali.", "Real renovation and installation projects in Ibiza: villas, apartments and commercial spaces.")}
      path="/proyectos"
    />
    <section className="container-x pt-16 md:pt-24 pb-12">
      <div className="eyebrow">{tr("Proyectos", "Progetti", "Projects")}</div>
      <h1 className="display-xl mt-4 max-w-4xl">{tr("Casos reales en Ibiza", "Casi reali a Ibiza", "Real cases in Ibiza")}</h1>
      <p className="body-lg mt-5 max-w-2xl">
        {tr("Cada proyecto tiene su propia historia: cuál era el punto de partida, qué buscábamos y cómo se resolvió.", "Ogni progetto ha la sua storia: da dove si partiva, cosa si cercava e come è stato risolto.", "Every project has its own story: the starting point, the goal and how it was solved.")}
      </p>
    </section>
    <section className="container-x pb-20 grid gap-6 md:grid-cols-2">
      {PROJECTS.map((p, i) => <ProjectCard key={p.slug} project={p} priority={i === 0} />)}
    </section>
    <CTASection title={tr("¿Tienes una propiedad parecida?", "Hai una proprietà simile?", "Do you have a similar property?")} />
  </>
);

export default Proyectos;
