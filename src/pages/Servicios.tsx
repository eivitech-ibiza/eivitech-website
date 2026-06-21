import { SEO } from "@/components/SEO";
import { ServiceCard } from "@/components/ServiceCard";
import { CTASection } from "@/components/CTASection";
import { SERVICES } from "@/data/services";

const Servicios = () => (
  <>
    <SEO
      title="Servicios de reformas e instalaciones en Ibiza | Eivitech"
      description="Reformas integrales, instalaciones, carpintería, exterior y locales comerciales en Ibiza."
      path="/servicios"
    />
    <section className="container-x pt-16 md:pt-24 pb-12">
      <div className="eyebrow">Servicios</div>
      <h1 className="display-xl mt-4 max-w-4xl">Coordinamos cada parte de la reforma con el mismo cuidado</h1>
      <p className="body-lg mt-5 max-w-2xl">
        Desde la reforma integral al detalle final. Selecciona el servicio que mejor encaje con tu proyecto o
        cuéntanos qué necesitas para orientarte.
      </p>
    </section>
    <section className="container-x pb-20 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => <ServiceCard key={s.slug} service={s} />)}
    </section>
    <CTASection />
  </>
);

export default Servicios;
