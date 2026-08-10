import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { CTASection } from "@/components/CTASection";
import { SERVICES } from "@/data/services";
import { tr } from "@/lib/i18n";

const Servicios = () => (
  <>
    <SEO
      title={tr("Servicios de reformas e instalaciones en Ibiza | Eivitech", "Servizi di ristrutturazione e impianti a Ibiza | Eivitech", "Renovation and installation services in Ibiza | Eivitech")}
      description={tr("Reformas integrales, instalaciones, carpintería, exterior y locales comerciales en Ibiza.", "Ristrutturazioni complete, impianti, falegnameria, esterni e locali commerciali a Ibiza.", "Full renovations, installations, carpentry, outdoor areas and commercial spaces in Ibiza.")}
      path="/servicios"
    />
    <section className="container-x pt-16 md:pt-24 pb-12">
      <div className="eyebrow">{tr("Servicios", "Servizi", "Services")}</div>
      <h1 className="display-xl mt-4 max-w-4xl">
        {tr("Coordinamos cada parte de la reforma con el mismo cuidado", "Coordiniamo ogni parte della ristrutturazione con la stessa cura", "We coordinate every part of the renovation with the same care")}
      </h1>
      <p className="body-lg mt-5 max-w-2xl">
        {tr("Desde la reforma integral al detalle final. Selecciona el servicio que mejor encaje con tu proyecto o cuéntanos qué necesitas para orientarte.", "Dalla ristrutturazione completa al dettaglio finale. Seleziona il servizio più adatto al tuo progetto o raccontaci di cosa hai bisogno.", "From the full renovation to the final detail. Choose the service that best fits your project or tell us what you need.")}
      </p>
    </section>
    <section className="container-x pb-20 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => <ServiceCard key={s.slug} service={s} />)}
    </section>
    <CTASection />
  </>
);

export default Servicios;
