import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO title="Página no encontrada | Eivitech" description="La página solicitada no existe." path={location.pathname} />
      <section className="container-x py-32 text-center">
        <div className="eyebrow">404</div>
        <h1 className="display-lg mt-4">Esta página no existe</h1>
        <p className="body-lg mt-5">Volvamos al inicio o explora nuestros proyectos.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="rounded-sm bg-primary px-6 py-3.5 text-sm text-primary-foreground">Inicio</Link>
          <Link to="/proyectos" className="rounded-sm border border-foreground/20 px-6 py-3.5 text-sm">Proyectos</Link>
        </div>
      </section>
    </>
  );
};

export default NotFound;
