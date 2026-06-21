import { useParams, Navigate } from "react-router-dom";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";
import { getService } from "@/data/services";

const Servicio = () => {
  const { slug = "" } = useParams();
  const service = getService(slug);
  if (!service) return <Navigate to="/servicios" replace />;
  return <ServicePageTemplate service={service} />;
};

export default Servicio;
