import { SEO } from "@/components/SEO";

const Privacidad = () => (
  <>
    <SEO title="Política de privacidad | Eivitech Ibiza" description="Política de privacidad de Eivitech." path="/privacidad" />
    <section className="container-x py-20 max-w-3xl prose prose-neutral">
      <div className="eyebrow">Privacidad</div>
      <h1 className="display-lg mt-4">Política de privacidad</h1>
      <p className="mt-6 text-muted-foreground">
        Esta página es un placeholder. El tratamiento de datos, cookies, píxeles y automatizaciones debe
        verificarse con asesoría legal/privacy antes de activar campañas o trackers.
      </p>
      <h2 className="display-md mt-10">Datos que recopilamos</h2>
      <p className="mt-3 text-muted-foreground">
        Recopilamos únicamente los datos necesarios para responder a las solicitudes recibidas a través del
        formulario de contacto: nombre, email, teléfono y la información proporcionada sobre el proyecto.
      </p>
      <h2 className="display-md mt-10">Finalidad</h2>
      <p className="mt-3 text-muted-foreground">
        Los datos se utilizan exclusivamente para gestionar la primera valoración y el seguimiento posterior.
      </p>
      <h2 className="display-md mt-10">Contacto</h2>
      <p className="mt-3 text-muted-foreground">Para cualquier consulta sobre tus datos, escríbenos a info@eivitech.com.</p>
      <p className="mt-10 text-sm text-muted-foreground">
        Texto definitivo pendiente de redacción con asesoría legal.
      </p>
    </section>
  </>
);

export default Privacidad;
