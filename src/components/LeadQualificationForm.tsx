import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { captureUtm } from "@/lib/utm";
import { track } from "@/lib/tracking";
import { submitLeadToCrm, submitPartnerToCrm } from "@/lib/crm";
import { tr } from "@/lib/i18n";

const validationMessages = {
  name: tr("Indica tu nombre", "Indica il tuo nome", "Enter your name"),
  email: tr("Email no válido", "Email non valida", "Invalid email"),
  phone: tr("Indica un teléfono o WhatsApp", "Indica un telefono o WhatsApp", "Enter a phone number or WhatsApp"),
  consent: tr("Debes aceptar la política de privacidad", "Devi accettare la privacy policy", "You must accept the privacy policy"),
};

const clientSchema = z.object({
  nombre: z.string().trim().min(2, validationMessages.name).max(80),
  email: z.string().trim().email(validationMessages.email).max(120),
  telefono: z.string().trim().min(6, validationMessages.phone).max(40),
  tipoCliente: z.enum(["propietario", "comprador", "inversor", "agencia", "empresa", "otro"]),
  tipoPropiedad: z.enum(["villa", "apartamento", "casa", "local-comercial", "otro"]),
  zona: z.string().trim().max(80).optional().or(z.literal("")),
  intervencion: z.enum(["reforma-integral", "bano", "cocina", "instalaciones", "exterior", "local-comercial", "otro"]),
  tieneFotos: z.enum(["si", "no"]),
  tieneProyecto: z.enum(["si", "no", "en-proceso"]),
  plazo: z.enum(["urgente", "1-3-meses", "3-6-meses", "sin-fecha"]),
  presupuesto: z.string().trim().max(60).optional().or(z.literal("")),
  mensaje: z.string().trim().max(1500).optional().or(z.literal("")),
  consentimiento: z.literal(true, { message: validationMessages.consent }),
});

const partnerSchema = z.object({
  nombre: z.string().trim().min(2, validationMessages.name).max(80),
  email: z.string().trim().email(validationMessages.email).max(120),
  telefono: z.string().trim().min(6, validationMessages.phone).max(40),
  empresa: z.string().trim().max(120).optional().or(z.literal("")),
  categoria: z.enum(["carpinteria", "aluminio", "cristaleria", "marmol-piedra", "herreria", "electricidad", "fontaneria", "pladur", "pintura", "arquitectura", "jardineria", "otro"]),
  zona: z.string().trim().max(120).optional().or(z.literal("")),
  experiencia: z.enum(["menos-2", "2-5", "5-10", "10-plus"]),
  disponibilidad: z.enum(["inmediata", "1-2-semanas", "proyectos-programados", "solo-urgencias"]),
  website: z.string().trim().max(250).optional().or(z.literal("")),
  mensaje: z.string().trim().max(1500).optional().or(z.literal("")),
  consentimiento: z.literal(true, { message: validationMessages.consent }),
});

export type LeadFormData = z.infer<typeof clientSchema>;
export type PartnerFormData = z.infer<typeof partnerSchema>;

type FormMode = "cliente" | "partner";

const field = "w-full rounded-sm border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";
const label = "block text-sm font-medium mb-1.5";
const errorCls = "mt-1 text-xs text-destructive";

export function LeadQualificationForm({ source = "contacto" }: { source?: string }) {
  const navigate = useNavigate();
  const startedRef = useRef(false);
  const [mode, setMode] = useState<FormMode>("cliente");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const clientForm = useForm<LeadFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      tipoCliente: "propietario",
      tipoPropiedad: "villa",
      intervencion: "reforma-integral",
      tieneFotos: "no",
      tieneProyecto: "no",
      plazo: "sin-fecha",
    },
  });

  const partnerForm = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      categoria: "carpinteria",
      experiencia: "5-10",
      disponibilidad: "proyectos-programados",
    },
  });

  useEffect(() => {
    const onFocus = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      track("form_start", { source, mode });
    };

    document.querySelectorAll("form[data-lead] input, form[data-lead] select, form[data-lead] textarea").forEach((el) => {
      el.addEventListener("focus", onFocus, { once: true });
    });

    return () => {
      document.querySelectorAll("form[data-lead] input, form[data-lead] select, form[data-lead] textarea").forEach((el) => {
        el.removeEventListener("focus", onFocus);
      });
    };
  }, [source, mode]);

  const basePayload = () => ({ ...captureUtm(), source: mode === "partner" ? `${source}-partner` : source, timestamp: new Date().toISOString() });

  const onClientSubmit = async (data: LeadFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    const payload = { ...data, ...basePayload() };
    track("form_submit", { source, mode: "cliente" });
    track("quote_request", { source, tipoCliente: data.tipoCliente, intervencion: data.intervencion });

    try {
      await submitLeadToCrm(payload);
      await new Promise((r) => setTimeout(r, 400));
      navigate("/gracias");
    } catch (error) {
      track("form_error", { source, mode: "cliente", reason: "crm_submit_failed" });
      console.error("[lead] CRM submit failed", error);
      setSubmitError(tr(
        "No hemos podido enviar la solicitud en este momento. Inténtalo de nuevo o contacta directamente por WhatsApp.",
        "Non siamo riusciti a inviare la richiesta in questo momento. Riprova o contattaci direttamente su WhatsApp.",
        "We could not send the request right now. Try again or contact us directly on WhatsApp."
      ));
    } finally {
      setSubmitting(false);
    }
  };

  const onPartnerSubmit = async (data: PartnerFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    const payload = { ...data, ...basePayload() };
    track("form_submit", { source, mode: "partner", categoria: data.categoria });

    try {
      await submitPartnerToCrm(payload);
      await new Promise((r) => setTimeout(r, 400));
      navigate("/gracias");
    } catch (error) {
      track("form_error", { source, mode: "partner", reason: "crm_submit_failed" });
      console.error("[partner] CRM submit failed", error);
      setSubmitError(tr(
        "No hemos podido enviar la candidatura en este momento. Inténtalo de nuevo o contacta directamente por WhatsApp.",
        "Non siamo riusciti a inviare la candidatura in questo momento. Riprova o contattaci direttamente su WhatsApp.",
        "We could not send the application right now. Try again or contact us directly on WhatsApp."
      ));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-border bg-card p-2 shadow-soft">
        <div className="grid gap-2 md:grid-cols-2">
          <ModeButton
            active={mode === "cliente"}
            title={tr("Soy cliente", "Sono cliente", "I am a client")}
            subtitle={tr("Quiero solicitar una valoración para una reforma o trabajo.", "Voglio richiedere una valutazione per una ristrutturazione o un lavoro.", "I want to request an assessment for a renovation or job.")}
            onClick={() => setMode("cliente")}
          />
          <ModeButton
            active={mode === "partner"}
            title={tr("Soy colaborador profesional", "Sono un collaboratore professionale", "I am a professional partner")}
            subtitle={tr("Quiero presentarme como proveedor, oficio o partner técnico.", "Voglio presentarmi come fornitore, artigiano o partner tecnico.", "I want to apply as a supplier, trade or technical partner.")}
            onClick={() => setMode("partner")}
          />
        </div>
      </div>

      {mode === "cliente" ? (
        <form data-lead onSubmit={clientForm.handleSubmit(onClientSubmit, () => track("form_error", { source, mode: "cliente" }))} className="grid gap-5" noValidate>
          <ClientFields form={clientForm} />
          <PrivacyAndSubmit registerConsent={clientForm.register("consentimiento")} errors={clientForm.formState.errors} submitting={submitting} submitError={submitError} buttonLabel={tr("Enviar solicitud", "Invia richiesta", "Send request")} loadingLabel={tr("Enviando…", "Invio…", "Sending…")} />
        </form>
      ) : (
        <form data-lead onSubmit={partnerForm.handleSubmit(onPartnerSubmit, () => track("form_error", { source, mode: "partner" }))} className="grid gap-5" noValidate>
          <PartnerFields form={partnerForm} />
          <PrivacyAndSubmit registerConsent={partnerForm.register("consentimiento")} errors={partnerForm.formState.errors} submitting={submitting} submitError={submitError} buttonLabel={tr("Enviar candidatura", "Invia candidatura", "Send application")} loadingLabel={tr("Enviando…", "Invio…", "Sending…")} />
        </form>
      )}
    </div>
  );
}

function ModeButton({ active, title, subtitle, onClick }: { active: boolean; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border p-4 text-left transition ${active ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-accent/60"}`}
    >
      <div className="text-sm font-medium text-foreground">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
    </button>
  );
}

function ClientFields({ form }: { form: ReturnType<typeof useForm<LeadFormData>> }) {
  const { register, formState: { errors } } = form;

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <Input label={tr("Nombre *", "Nome *", "Name *")} id="nombre" error={errors.nombre?.message}><input id="nombre" className={field} autoComplete="name" {...register("nombre")} /></Input>
        <Input label="Email *" id="email" error={errors.email?.message}><input id="email" type="email" className={field} autoComplete="email" {...register("email")} /></Input>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input label={tr("Teléfono / WhatsApp *", "Telefono / WhatsApp *", "Phone / WhatsApp *")} id="telefono" error={errors.telefono?.message}><input id="telefono" type="tel" className={field} autoComplete="tel" {...register("telefono")} /></Input>
        <Input label={tr("Zona de Ibiza", "Zona di Ibiza", "Area of Ibiza")} id="zona"><input id="zona" className={field} placeholder="Sant Josep, Marina Botafoc…" {...register("zona")} /></Input>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Input label={tr("Tipo de cliente *", "Tipo di cliente *", "Client type *")} id="tipoCliente">
          <select id="tipoCliente" className={field} {...register("tipoCliente")}>
            <option value="propietario">{tr("Propietario", "Proprietario", "Owner")}</option>
            <option value="comprador">{tr("Comprador", "Acquirente", "Buyer")}</option>
            <option value="inversor">{tr("Inversor", "Investitore", "Investor")}</option>
            <option value="agencia">{tr("Agencia", "Agenzia", "Agency")}</option>
            <option value="empresa">{tr("Empresa", "Impresa", "Company")}</option>
            <option value="otro">{tr("Otro", "Altro", "Other")}</option>
          </select>
        </Input>
        <Input label={tr("Tipo de propiedad *", "Tipo di proprietà *", "Property type *")} id="tipoPropiedad">
          <select id="tipoPropiedad" className={field} {...register("tipoPropiedad")}>
            <option value="villa">Villa</option>
            <option value="apartamento">{tr("Apartamento", "Appartamento", "Apartment")}</option>
            <option value="casa">{tr("Casa", "Casa", "House")}</option>
            <option value="local-comercial">{tr("Local comercial", "Locale commerciale", "Commercial premises")}</option>
            <option value="otro">{tr("Otro", "Altro", "Other")}</option>
          </select>
        </Input>
        <Input label={tr("Tipo de intervención *", "Tipo di intervento *", "Type of work *")} id="intervencion">
          <select id="intervencion" className={field} {...register("intervencion")}>
            <option value="reforma-integral">{tr("Reforma integral", "Ristrutturazione completa", "Full renovation")}</option>
            <option value="bano">{tr("Baño", "Bagno", "Bathroom")}</option>
            <option value="cocina">{tr("Cocina", "Cucina", "Kitchen")}</option>
            <option value="instalaciones">{tr("Instalaciones", "Impianti", "Installations")}</option>
            <option value="exterior">{tr("Exterior", "Esterno", "Exterior")}</option>
            <option value="local-comercial">{tr("Local comercial", "Locale commerciale", "Commercial premises")}</option>
            <option value="otro">{tr("Otro", "Altro", "Other")}</option>
          </select>
        </Input>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Input label={tr("¿Tiene fotos o vídeo? *", "Hai foto o video? *", "Do you have photos or video? *")} id="tieneFotos">
          <select id="tieneFotos" className={field} {...register("tieneFotos")}>
            <option value="si">{tr("Sí", "Sì", "Yes")}</option>
            <option value="no">No</option>
          </select>
        </Input>
        <Input label={tr("¿Proyecto técnico? *", "Progetto tecnico? *", "Technical project? *")} id="tieneProyecto">
          <select id="tieneProyecto" className={field} {...register("tieneProyecto")}>
            <option value="si">{tr("Sí", "Sì", "Yes")}</option>
            <option value="no">No</option>
            <option value="en-proceso">{tr("En proceso", "In corso", "In progress")}</option>
          </select>
        </Input>
        <Input label={tr("Plazo deseado *", "Tempistica desiderata *", "Desired timing *")} id="plazo">
          <select id="plazo" className={field} {...register("plazo")}>
            <option value="urgente">{tr("Urgente", "Urgente", "Urgent")}</option>
            <option value="1-3-meses">{tr("1 a 3 meses", "1-3 mesi", "1 to 3 months")}</option>
            <option value="3-6-meses">{tr("3 a 6 meses", "3-6 mesi", "3 to 6 months")}</option>
            <option value="sin-fecha">{tr("Sin fecha definida", "Senza data definita", "No fixed date")}</option>
          </select>
        </Input>
      </div>

      <Input label={tr("Presupuesto orientativo", "Budget orientativo", "Indicative budget")} id="presupuesto"><input id="presupuesto" className={field} placeholder={tr("Si ya lo tienes definido", "Se lo hai già definito", "If already defined")} {...register("presupuesto")} /></Input>
      <Input label={tr("Mensaje", "Messaggio", "Message")} id="mensaje"><textarea id="mensaje" rows={5} className={field} placeholder={tr("Cuéntanos lo que tengas en mente del proyecto.", "Raccontaci cosa hai in mente per il progetto.", "Tell us what you have in mind for the project.")} {...register("mensaje")} /></Input>
    </>
  );
}

function PartnerFields({ form }: { form: ReturnType<typeof useForm<PartnerFormData>> }) {
  const { register, formState: { errors } } = form;

  return (
    <>
      <div className="rounded-sm border border-primary/25 bg-primary/10 p-4 text-sm text-muted-foreground">
        {tr(
          "Este formulario es solo para profesionales que quieran colaborar con Eivitech en Ibiza.",
          "Questo modulo è solo per professionisti che vogliono collaborare con Eivitech a Ibiza.",
          "This form is only for professionals who want to collaborate with Eivitech in Ibiza."
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input label={tr("Nombre responsable *", "Nome responsabile *", "Contact person *")} id="partner-nombre" error={errors.nombre?.message}><input id="partner-nombre" className={field} autoComplete="name" {...register("nombre")} /></Input>
        <Input label="Email *" id="partner-email" error={errors.email?.message}><input id="partner-email" type="email" className={field} autoComplete="email" {...register("email")} /></Input>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input label={tr("Teléfono / WhatsApp *", "Telefono / WhatsApp *", "Phone / WhatsApp *")} id="partner-telefono" error={errors.telefono?.message}><input id="partner-telefono" type="tel" className={field} autoComplete="tel" {...register("telefono")} /></Input>
        <Input label={tr("Empresa / marca", "Impresa / brand", "Company / brand")} id="empresa"><input id="empresa" className={field} {...register("empresa")} /></Input>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Input label={tr("Categoría profesional *", "Categoria professionale *", "Professional category *")} id="categoria">
          <select id="categoria" className={field} {...register("categoria")}>
            <option value="carpinteria">{tr("Carpintería", "Falegnameria", "Carpentry")}</option>
            <option value="aluminio">{tr("Aluminio / ventanas", "Alluminio / finestre", "Aluminium / windows")}</option>
            <option value="cristaleria">{tr("Cristalería", "Vetreria", "Glasswork")}</option>
            <option value="marmol-piedra">{tr("Mármol / piedra", "Marmo / pietra", "Marble / stone")}</option>
            <option value="herreria">{tr("Herrería / metal", "Fabbro / metallo", "Metalwork")}</option>
            <option value="electricidad">{tr("Electricidad", "Elettricità", "Electricity")}</option>
            <option value="fontaneria">{tr("Fontanería", "Idraulica", "Plumbing")}</option>
            <option value="pladur">Pladur</option>
            <option value="pintura">{tr("Pintura", "Pittura", "Painting")}</option>
            <option value="arquitectura">{tr("Arquitectura / diseño", "Architettura / design", "Architecture / design")}</option>
            <option value="jardineria">{tr("Jardinería", "Giardinaggio", "Gardening")}</option>
            <option value="otro">{tr("Otro", "Altro", "Other")}</option>
          </select>
        </Input>
        <Input label={tr("Experiencia *", "Esperienza *", "Experience *")} id="experiencia">
          <select id="experiencia" className={field} {...register("experiencia")}>
            <option value="menos-2">{tr("Menos de 2 años", "Meno di 2 anni", "Less than 2 years")}</option>
            <option value="2-5">2-5</option>
            <option value="5-10">5-10</option>
            <option value="10-plus">10+</option>
          </select>
        </Input>
        <Input label={tr("Disponibilidad *", "Disponibilità *", "Availability *")} id="disponibilidad">
          <select id="disponibilidad" className={field} {...register("disponibilidad")}>
            <option value="inmediata">{tr("Inmediata", "Immediata", "Immediate")}</option>
            <option value="1-2-semanas">{tr("1-2 semanas", "1-2 settimane", "1-2 weeks")}</option>
            <option value="proyectos-programados">{tr("Proyectos programados", "Progetti programmati", "Scheduled projects")}</option>
            <option value="solo-urgencias">{tr("Solo urgencias", "Solo urgenze", "Urgencies only")}</option>
          </select>
        </Input>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input label={tr("Zona cubierta", "Zona coperta", "Covered area")} id="partner-zona"><input id="partner-zona" className={field} placeholder="Ibiza, Sant Josep, Santa Eulària…" {...register("zona")} /></Input>
        <Input label={tr("Web / Instagram / portfolio", "Sito / Instagram / portfolio", "Website / Instagram / portfolio")} id="website"><input id="website" className={field} placeholder="https://…" {...register("website")} /></Input>
      </div>

      <Input label={tr("Mensaje profesional", "Messaggio professionale", "Professional message")} id="partner-mensaje"><textarea id="partner-mensaje" rows={5} className={field} placeholder={tr("Cuéntanos qué trabajos realizas, con qué garantías y qué tipo de proyectos puedes asumir.", "Raccontaci quali lavori fai, con quali garanzie e che tipo di progetti puoi gestire.", "Tell us what work you do, what guarantees you offer and what kind of projects you can handle.")} {...register("mensaje")} /></Input>
    </>
  );
}

function Input({ label: labelText, id, error, children }: { label: string; id: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className={label} htmlFor={id}>{labelText}</label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

function PrivacyAndSubmit({ registerConsent, errors, submitting, submitError, buttonLabel, loadingLabel }: { registerConsent: UseFormRegisterReturn; errors: { consentimiento?: { message?: string } }; submitting: boolean; submitError: string | null; buttonLabel: string; loadingLabel: string }) {
  return (
    <>
      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" {...registerConsent} />
        <span>
          {tr("He leído y acepto la", "Ho letto e accetto la", "I have read and accept the")} <a href="/privacidad" className="underline hover:text-foreground">{tr("política de privacidad", "privacy policy", "privacy policy")}</a>.
          {" "}{tr("Acepto el tratamiento de mis datos para responder a la solicitud.", "Accetto il trattamento dei miei dati per rispondere alla richiesta.", "I accept the processing of my data to respond to the request.")}
        </span>
      </label>
      {errors.consentimiento && <p className={errorCls}>{errors.consentimiento.message}</p>}
      {submitError && <p className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? loadingLabel : buttonLabel}
      </button>

      <p className="text-xs text-muted-foreground">
        {tr(
          "El tratamiento de datos debe verificarse con asesoría legal/privacy antes de activar campañas, cookies, píxeles o automatizaciones.",
          "Il trattamento dei dati deve essere verificato con consulenza legale/privacy prima di attivare campagne, cookie, pixel o automazioni.",
          "Data processing must be verified with legal/privacy advice before activating campaigns, cookies, pixels or automations."
        )}
      </p>
    </>
  );
}
