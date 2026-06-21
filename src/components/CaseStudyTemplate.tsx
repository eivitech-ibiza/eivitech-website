import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/data/projects";

export function CaseStudyTemplate({ project }: { project: Project }) {
  const others = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);
  const path = `/proyectos/${project.slug}`;
  return (
    <>
      <SEO
        title={project.metaTitle}
        description={project.metaDescription}
        path={path}
        trackAs="project_view"
        trackPayload={{ project: project.slug }}
        ogImage={project.image}
      />
      <article>
        <section className="container-x pt-12 md:pt-20">
          <Link to="/proyectos" className="text-sm text-muted-foreground hover:text-foreground">← Todos los proyectos</Link>
          <div className="mt-6 grid gap-8 md:grid-cols-[2fr_1fr] md:items-end">
            <div>
              <div className="eyebrow">{project.type} · {project.intervention}</div>
              <h1 className="display-xl mt-4">{project.name}</h1>
            </div>
            {project.zone && <div className="text-muted-foreground md:text-right"><div className="eyebrow">Zona</div><div className="mt-1">{project.zone}</div></div>}
          </div>
        </section>

        <section className="container-x mt-10">
          <div className="aspect-[16/10] overflow-hidden rounded-sm bg-muted">
            <img src={project.image} alt={project.name} loading="eager" className="h-full w-full object-cover" />
          </div>
        </section>

        <section className="section-tight">
          <div className="container-x grid gap-14 lg:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow">Caso</div>
              <h2 className="display-md mt-3">Situación y objetivo</h2>
            </div>
            <div className="space-y-8 text-lg leading-relaxed">
              <div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Situación inicial</div>
                <p className="mt-2">{project.situation}</p>
              </div>
              <div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Objetivo del cliente</div>
                <p className="mt-2">{project.goal}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-tight bg-accent/40">
          <div className="container-x grid gap-14 lg:grid-cols-2">
            <div>
              <div className="eyebrow">Intervenciones</div>
              <h2 className="display-md mt-3 mb-6">Lo que realizamos</h2>
              <ul className="space-y-3">
                {project.works.map((w, i) => (
                  <li key={i} className="border-b border-border pb-3 flex gap-4">
                    <span className="text-primary font-display">{String(i + 1).padStart(2, "0")}</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow">Materiales y detalles</div>
              <h2 className="display-md mt-3 mb-6">Acabados</h2>
              <div className="flex flex-wrap gap-2">
                {project.materials.map((m) => (
                  <span key={m} className="rounded-sm border border-border bg-background px-4 py-2 text-sm">{m}</span>
                ))}
              </div>
              <div className="mt-10">
                <div className="text-sm uppercase tracking-widest text-muted-foreground">Resultado</div>
                <p className="mt-2 text-lg leading-relaxed">{project.result}</p>
              </div>
            </div>
          </div>
        </section>

        {project.placeholder && (
          <section className="container-x mt-6">
            <div className="rounded-sm border border-dashed border-primary/40 bg-primary-soft/40 p-5 text-sm">
              Contenido y galería de este proyecto pendientes de completar con Daniele.
            </div>
          </section>
        )}

        <section className="section-tight">
          <div className="container-x">
            <div className="eyebrow">Otros proyectos</div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {others.map((p) => <ProjectCard key={p.slug} project={p} />)}
            </div>
          </div>
        </section>
      </article>

      <CTASection title="¿Tienes una propiedad parecida en Ibiza?" />
    </>
  );
}
