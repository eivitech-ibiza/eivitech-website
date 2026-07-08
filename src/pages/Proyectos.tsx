import { SEO } from "@/components/SEO";
import { ProjectCard } from "@/components/ProjectCard";
import { CTASection } from "@/components/CTASection";
import { PROJECTS } from "@/data/projects";
import { tr } from "@/lib/i18n";

const Proyectos = () => (
  <>
    <SEO
      title={tr("Proyectos seleccionados de reformas en Ibiza | Eivitech", "Progetti selezionati di ristrutturazione a Ibiza | Eivitech", "Selected renovation projects in Ibiza | Eivitech")}
      description={tr("Seis casos seleccionados de Eivitech en Ibiza: villas, apartamentos, casas rústicas, exteriores, paisajismo y acabados contemporáneos.", "Sei casi selezionati Eivitech a Ibiza: ville, appartamenti, case rustiche, esterni, paesaggismo e finiture contemporanee.", "Six selected Eivitech cases in Ibiza: villas, apartments, rustic homes, outdoor areas, landscaping and contemporary finishes.")}
      path="/proyectos"
    />
    <section className="container-x pt-16 pb-12 md:pt-24">
      <div className="eyebrow">{tr("Selected projects", "Progetti selezionati", "Selected projects")}</div>
      <h1 className="display-xl mt-4 max-w-4xl">
        {tr("Seis proyectos para entender cómo trabajamos", "Sei progetti per capire come lavoriamo", "Six projects to understand how we work")}
      </h1>
      <p className="body-lg mt-5 max-w-2xl">
        {tr(
          "Una selección breve y clara: interiores, villas, apartamentos, casas rústicas y exteriores. Cada caso muestra el punto de partida, el objetivo, las intervenciones y los materiales clave.",
          "Una selezione breve e chiara: interni, ville, appartamenti, case rustiche ed esterni. Ogni caso mostra punto di partenza, obiettivo, interventi e materiali chiave.",
          "A short and clear selection: interiors, villas, apartments, rustic homes and outdoor areas. Each case shows the starting point, the goal, the works and the key materials."
        )}
      </p>
    </section>
    <section className="container-x grid gap-6 pb-20 md:grid-cols-2">
      {PROJECTS.map((p, i) => (
        <ProjectCard key={p.slug} project={p} priority={i === 0} />
      ))}
    </section>
    <CTASection title={tr("¿Tienes una propiedad parecida?", "Hai una proprietà simile?", "Do you have a similar property?")} />
  </>
);

export default Proyectos;
