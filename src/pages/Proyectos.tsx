import { SEO } from "@/components/SEO";
import { ProjectCard } from "@/components/ProjectCard";
import { CTASection } from "@/components/CTASection";
import { PROJECTS } from "@/data/projects";
import { tr } from "@/lib/i18n";

const Proyectos = () => (
  <>
    <SEO
      title={tr("Transformaciones de propiedades en Ibiza | Eivitech", "Trasformazioni immobiliari a Ibiza | Eivitech", "Property transformations in Ibiza | Eivitech")}
      description={tr("Seis casos seleccionados de Eivitech en Ibiza: apartamentos, villas, fincas, exteriores y reformas orientadas a valor.", "Sei casi selezionati Eivitech a Ibiza: appartamenti, ville, fincas, esterni e ristrutturazioni orientate al valore.", "Six selected Eivitech cases in Ibiza: apartments, villas, fincas, outdoor areas and value-oriented renovations.")}
      path="/transformations"
    />
    <section className="container-x pt-16 pb-12 md:pt-24">
      <div className="eyebrow">{tr("Transformations", "Trasformazioni", "Transformations")}</div>
      <h1 className="display-xl mt-4 max-w-4xl">
        {tr("Selected property transformations in Ibiza", "Trasformazioni immobiliari selezionate a Ibiza", "Selected property transformations in Ibiza")}
      </h1>
      <p className="body-lg mt-5 max-w-2xl">
        {tr(
          "Cada proyecto muestra un problema inicial, una visión del cliente y una solución Eivitech: espacios mejor pensados, materiales naturales, luz cálida y gestión completa.",
          "Ogni progetto mostra un problema iniziale, una visione del cliente e una soluzione Eivitech: spazi pensati meglio, materiali naturali, luce calda e gestione completa.",
          "Each project shows a starting problem, a client vision and an Eivitech solution: smarter spaces, natural materials, warm lighting and complete project management."
        )}
      </p>
    </section>
    <section className="container-x grid gap-6 pb-20 md:grid-cols-2">
      {PROJECTS.map((p, i) => (
        <ProjectCard key={p.slug} project={p} priority={i === 0} />
      ))}
    </section>
    <CTASection title={tr("Let's talk about your property.", "Parliamo della tua proprietà.", "Let's talk about your property.")} />
  </>
);

export default Proyectos;
