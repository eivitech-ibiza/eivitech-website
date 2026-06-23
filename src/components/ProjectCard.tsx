import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { tr } from "@/lib/i18n";

const mediaRoot = String.fromCharCode(104,116,116,112,115,58,47,47,101,105,118,105,116,101,99,104,46,99,111,109,47,119,112,45,99,111,110,116,101,110,116,47,117,112,108,111,97,100,115,47,50,48,50,49,47,48,56,47);
const santJosepCover = `${mediaRoot}casa-lujo-sant-josep-2.jpg`;
const valverdeCover = `${mediaRoot}terraza-casita-valverde-4-1024x576.jpg`;
const botafocCover = `${mediaRoot}marina-botafoch-apartamento-04-1024x768.jpg`;
const trueCover = `${mediaRoot}true-bar-1-576x1024.jpeg`;

function getCover(project: Project) {
  if (project.slug === "casa-sant-josep") return santJosepCover;
  if (project.slug === "urbanizacion-valverde") return valverdeCover;
  if (project.slug === "apartamento-marina-botafoch") return botafocCover;
  if (project.slug === "true-bar") return trueCover;
  return project.image;
}

function getDisplayName(project: Project) {
  if (project.slug === "casa-sant-josep") return "Sant Josep de sa Talaia";
  if (project.slug === "apartamento-marina-botafoch") return tr("Apartamento Marina Botafoc", "Appartamento Marina Botafoc", "Marina Botafoc Apartment");
  if (project.slug === "urbanizacion-valverde") return tr("Urbanización Valverde", "Urbanizzazione Valverde", "Valverde Residential Complex");
  return project.name;
}

function getDisplayZone(project: Project) {
  if (project.slug === "casa-sant-josep") return "Sant Josep de sa Talaia, Ibiza";
  if (project.slug === "apartamento-marina-botafoch") return "Marina Botafoc, Ibiza";
  return project.zone;
}

function getProjectPath(project: Project) {
  if (project.slug === "casa-sant-josep") return "/proyectos/sant-josep-de-sa-talaia";
  if (project.slug === "apartamento-marina-botafoch") return "/proyectos/apartamento-marina-botafoc";
  return `/proyectos/${project.slug}`;
}

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const cover = getCover(project);
  const displayName = getDisplayName(project);
  const displayZone = getDisplayZone(project);

  return (
    <Link to={getProjectPath(project)} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <img src={cover} alt={displayName} loading={priority ? "eager" : "lazy"} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">{project.type} · {project.intervention}</div>
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
