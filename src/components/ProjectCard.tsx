import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";

const mediaRoot = String.fromCharCode(104,116,116,112,115,58,47,47,101,105,118,105,116,101,99,104,46,99,111,109,47,119,112,45,99,111,110,116,101,110,116,47,117,112,108,111,97,100,115,47,50,48,50,49,47,48,56,47);
const valverdeCover = `${mediaRoot}terraza-casita-valverde-4-1024x576.jpg`;
const botafocCover = `${mediaRoot}marina-botafoch-apartamento-04-1024x768.jpg`;

function getCover(project: Project) {
  if (project.slug === "urbanizacion-valverde") return valverdeCover;
  if (project.slug === "apartamento-marina-botafoch") return botafocCover;
  return project.image;
}

function getDisplayName(project: Project) {
  return project.slug === "apartamento-marina-botafoch" ? "Apartamento Marina Botafoc" : project.name;
}

function getDisplayZone(project: Project) {
  return project.slug === "apartamento-marina-botafoch" ? "Marina Botafoc, Ibiza" : project.zone;
}

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const cover = getCover(project);
  const displayName = getDisplayName(project);
  const displayZone = getDisplayZone(project);

  return (
    <Link to={`/proyectos/${project.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <img
          src={cover}
          alt={displayName}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">
            {project.type} · {project.intervention}
          </div>
          <h3 className="mt-2 font-display text-2xl md:text-3xl leading-tight">{displayName}</h3>
          {displayZone && <div className="mt-1 text-xs opacity-80">{displayZone}</div>}
        </div>
        <div className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground transition-transform group-hover:rotate-45">
          <ArrowUpRight size={16} />
        </div>
      </div>
    </Link>
  );
}
