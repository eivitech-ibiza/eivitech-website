import { useParams, Navigate } from "react-router-dom";
import { CaseStudyTemplate } from "@/components/CaseStudyTemplate";
import { getProject } from "@/data/projects";

const LEGACY_SLUGS: Record<string, string> = {
  "apartamento-marina-botafoc": "casa-boas",
  "apartamento-marina-botafoch": "casa-boas",
  "sant-josep-de-sa-talaia": "casa-vadella",
  "casa-sant-josep": "casa-vadella",
  "true-bar": "proyectos",
  "urbanizacion-valverde": "proyectos",
};

const Proyecto = () => {
  const { slug = "" } = useParams();
  const mappedSlug = LEGACY_SLUGS[slug] || slug;
  if (mappedSlug === "proyectos") return <Navigate to="/proyectos" replace />;

  const project = getProject(mappedSlug);
  if (!project) return <Navigate to="/proyectos" replace />;
  return <CaseStudyTemplate project={project} />;
};

export default Proyecto;
