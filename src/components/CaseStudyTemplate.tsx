import { Link } from "react-router-dom";
import type { Project } from "@/data/projects";
import { SEO } from "@/components/SEO";
import { CTASection } from "@/components/CTASection";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/data/projects";
import { tr } from "@/lib/i18n";

const fallbackImage = `${import.meta.env.BASE_URL}placeholder.svg`;

function withBase(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

function ProjectImage({ src, alt, priority = false, className = "" }: { src: string; alt: string; priority?: boolean; className?: string }) {
  return (
    <img
      src={withBase(src)}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      onError={(event) => {
        event.currentTarget.src = fallbackImage;
      }}
      className={className}
    />
  );
}

function getProjectPath(project: Project) {
  return `/proyectos/${project.slug}`;
}

export function CaseStudyTemplate({ project }: { project: Project }) {
  const others = PROJECTS.filter((p) => p.slug !== project.slug).slice(0, 3);
  const path = getProjectPath(project);
  const gallery = project.gallery?.length ? project.gallery : [project.cover];

  return (
    <>
      <SEO
        title={project.metaTitle}
        description={project.metaDescription}
        path={path}
        trackAs="project_view"
        trackPayload={{ project: project.slug }}
        ogImage={withBase(project.cover)}
      />

      <article>
        <section className="container-x pt-12 md:pt-20">
          <Link to="/proyectos" className="text-sm text-muted-foreground hover:text-foreground">
            ← {tr("Todos los proyectos", "Tutti i progetti", "All projects")}
          </Link>

          <div className="mt-6 grid gap-8 md:grid-cols-[2fr_1fr] md:items-end">
            <div>
              <div className="eyebrow">{project.type} · {project.intervention}</div>
              <h1 className="display-xl mt-4">{project.name}</h1>
              <p className="body-lg mt-5 max-w-2xl">{project.short}</p>
            </div>
            <div className="space-y-4 text-muted-foreground md:text-right">
              {project.zone && (
                <div>
                  <div className="eyebrow">Zona</div>
                  <div className="mt-1">{project.zone}</div>
                </div>
              )}
              <div>
                <div className="eyebrow">{tr("Estilo", "Stile", "Style")}</div>
                <div className="mt-1">{project.style}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-x mt-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-muted md:aspect-[16/8]">
            <ProjectImage src={project.cover} alt={project.name} priority className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 max-w-2xl text-white">
              <div className="text-xs uppercase tracking-[0.25em] text-white/75">
                {tr("Proyecto seleccionado", "Progetto selezionato", "Selected project")}
              </div>
              <p className="mt-3 text-xl font-medium leading-snug md:text-3xl">{project.short}</p>
            </div>
          </div>
        </section>

        <section className="container-x mt-6">
          <div className="grid gap-4 md:grid-cols-4 md:auto-rows-[260px]">
            {gallery.map((src, index) => (
              <figure
                key={`${src}-${index}`}
                className={`group relative overflow-hidden rounded-sm bg-muted ${
                  index === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <ProjectImage
                  src={src}
                  alt={`${project.name} — ${tr("imagen", "immagine", "image")} ${index + 1}`}
                  priority={index === 0}
                  className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {project.name} · {project.category}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="section-tight">
          <div className="container-x grid gap-14 lg:grid-cols-[1fr_2fr]">
            <div>
              <div className="eyebrow">{tr("Caso", "Caso", "Case")}</div>
              <h2 className="display-md mt-3">{tr("Situación y objetivo", "Situazione e obiettivo", "Situation and goal")}</h2>
            </div>
            <div className="space-y-8 text-lg leading-relaxed">
              <div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">
                  {tr("Situación inicial", "Situazione iniziale", "Initial situation")}
                </div>
                <p className="mt-2">{project.situation}</p>
              </div>
              <div>
                <div className="text-sm uppercase tracking-widest text-muted-foreground">
                  {tr("Objetivo del cliente", "Obiettivo del cliente", "Client goal")}
                </div>
                <p className="mt-2">{project.goal}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-tight bg-accent/40">
          <div className="container-x grid gap-14 lg:grid-cols-2">
            <div>
              <div className="eyebrow">{tr("Intervenciones", "Interventi", "Works")}</div>
              <h2 className="display-md mt-3 mb-6">{tr("Lo que realizamos", "Cosa abbiamo realizzato", "What we delivered")}</h2>
              <ul className="space-y-3">
                {project.works.map((w, i) => (
                  <li key={i} className="flex gap-4 border-b border-border pb-3">
                    <span className="font-display text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="eyebrow">{tr("Materiales y detalles", "Materiali e dettagli", "Materials and details")}</div>
              <h2 className="display-md mt-3 mb-6">{tr("Acabados", "Finiture", "Finishes")}</h2>
              <div className="flex flex-wrap gap-2">
                {project.materials.map((m) => (
                  <span key={m} className="rounded-sm border border-border bg-background px-4 py-2 text-sm">
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-10">
                <div className="text-sm uppercase tracking-widest text-muted-foreground">
                  {tr("Resultado", "Risultato", "Result")}
                </div>
                <p className="mt-2 text-lg leading-relaxed">{project.result}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container-x mt-6">
          <div className="rounded-sm border border-dashed border-primary/40 bg-primary-soft/40 p-5 text-sm leading-relaxed">
            <strong>{tr("Nota operativa", "Nota operativa", "Operational note")}:</strong>{" "}
            {tr(
              "Las imágenes finales deben cargarse manualmente en la carpeta indicada para este proyecto. Verificar autorización de uso antes de publicar.",
              "Le immagini finali devono essere caricate manualmente nella cartella indicata per questo progetto. Verificare l'autorizzazione d'uso prima della pubblicazione.",
              "Final images must be uploaded manually in the folder indicated for this project. Check usage authorization before publishing."
            )}
            <div className="mt-2 font-mono text-xs">{project.folderHint}</div>
          </div>
        </section>

        <section className="section-tight">
          <div className="container-x">
            <div className="eyebrow">{tr("Otros proyectos", "Altri progetti", "Other projects")}</div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {others.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      </article>

      <CTASection title={tr("¿Tienes una propiedad parecida en Ibiza?", "Hai una proprietà simile a Ibiza?", "Do you have a similar property in Ibiza?")} />
    </>
  );
}
