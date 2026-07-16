import { useParams, Navigate } from "react-router-dom";
import { CaseStudyTemplate } from "@/components/CaseStudyTemplate";
import { getProject } from "@/data/projects";

const LEGACY_SLUGS: Record<string, string> = {
  "casa-boas": "modern-minimal-apartment-marina-botafoch",
  "casa-vinya": "luxury-mediterranean-villa-renovation",
  "casa-mediterraneo": "warm-contemporary-apartment-transformation",
  "casa-charlie": "authentic-ibiza-finca-restoration",
  "proyecto-paisajismo-exterior": "low-maintenance-mediterranean-landscape",
  "casa-vadella": "investment-oriented-villa-makeover",
  "apartamento-marina-botafoc": "modern-minimal-apartment-marina-botafoch",
  "apartamento-marina-botafoch": "modern-minimal-apartment-marina-botafoch",
  "sant-josep-de-sa-talaia": "investment-oriented-villa-makeover",
  "casa-sant-josep": "investment-oriented-villa-makeover",
  "true-bar": "transformations",
  "urbanizacion-valverde": "transformations",
};

const Proyecto = () => {
  const { slug = "" } = useParams();
  const mappedSlug = LEGACY_SLUGS[slug] || slug;
  if (mappedSlug === "transformations") return <Navigate to="/transformations" replace />;

  const project = getProject(mappedSlug);
  if (!project) return <Navigate to="/transformations" replace />;
  return <CaseStudyTemplate key={project.slug} project={project} />;
};

export default Proyecto;
