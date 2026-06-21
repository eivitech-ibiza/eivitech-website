import { useParams, Navigate } from "react-router-dom";
import { CaseStudyTemplate } from "@/components/CaseStudyTemplate";
import { getProject } from "@/data/projects";

const Proyecto = () => {
  const { slug = "" } = useParams();
  const project = getProject(slug);
  if (!project) return <Navigate to="/proyectos" replace />;
  return <CaseStudyTemplate project={project} />;
};

export default Proyecto;
