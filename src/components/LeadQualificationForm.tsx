import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { captureUtm } from "@/lib/utm";
import { track } from "@/lib/tracking";
import { submitLeadToCrm } from "@/lib/crm";

const schema = z.object({
  nombre: z.string().trim().min(2, "Indica tu nombre").max(80),
  email: z.string().trim().email("Email no válido").max(120),
  telefono: z.string().trim().min(6, "Indica un teléfono o WhatsApp").max(40),
  tipoCliente: z.enum(["propietario", "comprador", "inversor", "agencia", "empresa", "otro"]),
  tipoPropiedad: z.enum(["villa", "apartamento", "casa", "local-comercial", "otro"]),
  zona: z.string().trim().max(80).optional().or(z.literal("")),
  intervencion: z.enum(["reforma-integral", "bano", "cocina", "instalaciones", "exterior", "local-comercial", "otro"]),
  tieneFotos: z.enum(["si", "no"]),
  tieneProyecto: z.enum(["si", "no", "en-proceso"]),
  plazo: z.enum(["urgente", "1-3-meses", "3-6-meses", "sin-fecha"]),
  presupuesto: z.string().trim().max(60).optional().or(z.literal("")),
  mensaje: z.string().trim().max(1500).optional().or(z.literal("")),
  consentimiento: z.literal(true, { message: "Debes aceptar la política de privacidad" }),
});

export type LeadFormData = z.infer<typeof schema>;

const field = "w-full rounded-sm border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";
const label = "block text-sm font-medium mb-1.5";
const errorCls = "mt-1 text-xs text-destructive";

export function LeadQualificationForm({ source = "contacto" }: { source?: string }) {
  const navigate = useNavigate();
  const startedRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipoCliente: "propietario", tipoPropiedad: "villa", intervencion: "reforma-integral", tieneFotos: "no", tieneProyecto: "no", plazo: "sin-fecha" },
  });

  useEffect(() => {
    const onFocus = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      track("form_start", { source });
    };
    document.querySelectorAll("form[data-lead] input, form[data-lead] select, form[data-lead] textarea").forEach((el) => {
      el.addEventListener("focus", onFocus, { once: true });
    });
    return () => {
      document.querySelectorAll("form[data-lead] input, form[data-lead] select, form[data-lead] textarea").forEach((el) => {
        el.removeEventListener("focus", onFocus);
      });
    };
  }, [source]);

  const onSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    const utm = captureUtm();
    const payload = { ...data, ...utm, source, timestamp: new Date().toISOString() };
    track("form_submit", { source });
    track("quote_request", { source, tipoCliente: data.tipoCliente, intervencion: data.intervencion });

    try {
      await submitLeadToCrm(payload);
      await new Promise((r) => setTimeout(r, 400));
      navigate("/gracias");
    } catch (error) {
      track("form_error", { source, reason: "crm_submit_failed" });
      // eslint-disable-next-line no-console
      console.error("[lead] CRM submit failed", error);
      setSubmitError("No hemos podido enviar la solicitud en este momento. Inténtalo de nuevo o contacta directamente por WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form data-lead onSubmit={handleSubmit(onSubmit, () => track("form_error", { source }))} className="grid gap-5" noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="nombre">Nombre *</label>
          <input id="nombre" className={field} autoComplete="name" {...register("nombre")} />
          {errors.nombre && <p className={errorCls}>{errors.nombre.message}</p>}
        </div>
        <div>
          <label className={label} htmlFor="email">Email *</label>
          <input id="email" type="email" className={field} autoComplete="email" {...register("email")} />
          {errors.email && <p className={errorCls}>{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="telefono">Teléfono / WhatsApp *</label>
          <input id="telefono" type="tel" className={field} autoComplete="tel" {...register("telefono")} />
          {errors.telefono && <p className={errorCls}>{errors.telefono.message}</p>}
        </div>
        <div>
          <label className={label} htmlFor="zona">Zona de Ibiza</label>
          <input id="zona" className={field} placeholder="Sant Josep, Marina Botafoch…" {...register("zona")} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className={label} htmlFor="tipoCliente">Tipo de cliente *</label>
          <select id="tipoCliente" className={field} {...register("tipoCliente")}>
            <option value="propietario">Propietario</option>
            <option value="comprador">Comprador</option>
            <option value="inversor">Inversor</option>
            <option value="agencia">Agencia</option>
            <option value="empresa">Empresa</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="tipoPropiedad">Tipo de propiedad *</label>
          <select id="tipoPropiedad" className={field} {...register("tipoPropiedad")}>
            <option value="villa">Villa</option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="local-comercial">Local comercial</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="intervencion">Tipo de intervención *</label>
          <select id="intervencion" className={field} {...register("intervencion")}>
            <option value="reforma-integral">Reforma integral</option>
            <option value="bano">Baño</option>
            <option value="cocina">Cocina</option>
            <option value="instalaciones">Instalaciones</option>
            <option value="exterior">Exterior</option>
            <option value="local-comercial">Local comercial</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className={label} htmlFor="tieneFotos">¿Tiene fotos o vídeo? *</label>
          <select id="tieneFotos" className={field} {...register("tieneFotos")}>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="tieneProyecto">¿Proyecto técnico? *</label>
          <select id="tieneProyecto" className={field} {...register("tieneProyecto")}>
            <option value="si">Sí</option>
            <option value="no">No</option>
            <option value="en-proceso">En proceso</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="plazo">Plazo deseado *</label>
          <select id="plazo" className={field} {...register("plazo")}>
            <option value="urgente">Urgente</option>
            <option value="1-3-meses">1 a 3 meses</option>
            <option value="3-6-meses">3 a 6 meses</option>
            <option value="sin-fecha">Sin fecha definida</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="presupuesto">Presupuesto orientativo</label>
        <input id="presupuesto" className={field} placeholder="Si ya lo tienes definido" {...register("presupuesto")} />
      </div>

      <div>
        <label className={label} htmlFor="mensaje">Mensaje</label>
        <textarea id="mensaje" rows={5} className={field} placeholder="Cuéntanos lo que tengas en mente del proyecto." {...register("mensaje")} />
      </div>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" {...register("consentimiento")} />
        <span>
          He leído y acepto la <a href="/privacidad" className="underline hover:text-foreground">política de privacidad</a>.
          Acepto el tratamiento de mis datos para responder a la solicitud.
        </span>
      </label>
      {errors.consentimiento && <p className={errorCls}>{errors.consentimiento.message}</p>}
      {submitError && <p className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? "Enviando…" : "Enviar solicitud"}
      </button>

      <p className="text-xs text-muted-foreground">
        El tratamiento de datos debe verificarse con asesoría legal/privacy antes de activar campañas, cookies,
        píxeles o automatizaciones.
      </p>
    </form>
  );
}
