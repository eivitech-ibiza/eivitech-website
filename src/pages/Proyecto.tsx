import { useParams, Navigate } from "react-router-dom";
import { CaseStudyTemplate } from "@/components/CaseStudyTemplate";
import { getProject } from "@/data/projects";

const LEGACY_SLUGS: Record<string, string> = {
  "apartamento-marina-botafoc": "apartamento-marina-botafoch",
  "sant-josep-de-sa-talaia": "casa-sant-josep",
};

const Proyecto = () => {
  const { slug = "" } = useParams();
  const project = getProject(LEGACY_SLUGS[slug] || slug);
  if (!project) return <Navigate to="/proyectos" replace />;
  return <CaseStudyTemplate project={project} />;
};

export default Proyecto;
