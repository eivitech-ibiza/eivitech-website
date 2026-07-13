import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { tr } from "@/lib/i18n";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        title={tr("Página no encontrada | Eivitech", "Pagina non trovata | Eivitech", "Page not found | Eivitech")}
        description={tr("La página solicitada no existe.", "La pagina richiesta non esiste.", "The requested page does not exist.")}
        path={location.pathname}
        noIndex
      />
      <section className="container-x py-32 text-center">
        <div className="eyebrow">404</div>
        <h1 className="display-lg mt-4">{tr("Esta página no existe", "Questa pagina non esiste", "This page does not exist")}</h1>
        <p className="body-lg mt-5">{tr("Volvamos al inicio o explora nuestros proyectos.", "Torniamo alla home o esplora i nostri progetti.", "Go back home or explore our projects.")}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="rounded-sm bg-primary px-6 py-3.5 text-sm text-primary-foreground">{tr("Inicio", "Home", "Home")}</Link>
          <Link to="/transformations" className="rounded-sm border border-foreground/20 px-6 py-3.5 text-sm">{tr("Proyectos", "Progetti", "Projects")}</Link>
        </div>
      </section>
    </>
  );
};

export default NotFound;
