import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { captureUtm } from "@/lib/utm";
import { getStoredConsent, track } from "@/lib/tracking";
import { captureMetaAttribution, storeMetaRevocationToken } from "@/lib/metaAttribution";
import { submitLeadToCrm } from "@/lib/crm";
import { homeCareLeadFields, type HomeCareFormData } from "@/lib/homeCareLead";
import { HOME_CARE_SOURCE } from "@/data/homeCare365.seo.mjs";
import type { HomeCareCopy, HomeCarePlanKey } from "@/data/homeCare365";

const field = "w-full rounded-sm border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";
const labelCls = "block text-sm font-medium mb-1.5";
const errorCls = "mt-1 text-xs text-destructive";

const BATHROOM_OPTIONS = ["1", "2", "3", "4", "5+"] as const;

function buildSchema(copy: HomeCareCopy["form"]) {
  return z.object({
    nombre: z.string().trim().min(2, copy.errors.name).max(80),
    email: z.string().trim().email(copy.errors.email).max(120),
    telefono: z.string().trim().min(6, copy.errors.phone).max(40),
    tipoCliente: z.enum(["propietario", "agencia", "empresa", "otro"]),
    tipoPropiedad: z.enum(["villa", "apartamento", "casa", "otro"]),
    zona: z.string().trim().max(80).optional().or(z.literal("")),
    superficie: z.enum(["lt100", "100-200", "200-400", "gt400"]),
    banos: z.enum(BATHROOM_OPTIONS),
    climatizadores: z.enum(["0", "1-2", "3-5", "6+"]),
    usoAnual: z.enum(["lt1", "1-3", "4-6", "gt6"]),
    plan: z.enum(["essential", "care", "premium", "sin-decidir"]),
    instalaciones: z.array(z.string()).default([]),
    mensaje: z.string().trim().max(1000).optional().or(z.literal("")),
    consentimiento: z.literal(true, { message: copy.errors.consent }),
    marketingConsent: z.boolean().optional(),
  });
}

export function HomeCareLeadForm({
  copy,
  planNames,
  selectedPlan,
}: {
  copy: HomeCareCopy["form"];
  planNames: Record<HomeCarePlanKey, string>;
  selectedPlan: HomeCarePlanKey | null;
}) {
  const navigate = useNavigate();
  const startedRef = useRef(false);
  const submissionRef = useRef<{ id: string; timestamp: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<HomeCareFormData>({
    resolver: zodResolver(buildSchema(copy)),
    defaultValues: {
      tipoCliente: "propietario",
      tipoPropiedad: "villa",
      superficie: "100-200",
      banos: "2",
      climatizadores: "1-2",
      usoAnual: "1-3",
      plan: "sin-decidir",
      instalaciones: [],
      marketingConsent: false,
    },
  });
  const { register, setValue, handleSubmit, formState: { errors } } = form;

  useEffect(() => {
    if (selectedPlan) setValue("plan", selectedPlan);
  }, [selectedPlan, setValue]);

  const onFirstFocus = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    track("form_start", { source: HOME_CARE_SOURCE, mode: "home_care" });
  };

  const onSubmit = async (data: HomeCareFormData) => {
    setSubmitting(true);
    setSubmitError(null);

    if (!submissionRef.current) {
      submissionRef.current = { id: crypto.randomUUID(), timestamp: new Date().toISOString() };
    }
    const consent = getStoredConsent();
    const metaConsent = Boolean(consent?.marketing);
    const payload = {
      ...homeCareLeadFields(data),
      ...captureUtm(),
      ...captureMetaAttribution(metaConsent),
      source: HOME_CARE_SOURCE,
      timestamp: submissionRef.current.timestamp,
      submission_id: submissionRef.current.id,
      lead_kind: "customer" as const,
      meta_consent: metaConsent,
      meta_consent_source: metaConsent ? "cookie_banner" as const : "none" as const,
      meta_consent_at: metaConsent ? consent?.updatedAt : undefined,
      meta_consent_version: metaConsent ? consent?.version : undefined,
    };
    track("form_submit", { source: HOME_CARE_SOURCE, mode: "home_care", plan: data.plan });

    try {
      const response = await submitLeadToCrm(payload);
      storeMetaRevocationToken(response.metaConsentRevocationToken);
      await track(
        "lead",
        { source: HOME_CARE_SOURCE, mode: "home_care", plan: data.plan, tipoPropiedad: data.tipoPropiedad },
        { eventId: response.eventId || undefined },
      );
      await new Promise((resolve) => setTimeout(resolve, 400));
      navigate("/gracias");
    } catch (error) {
      track("form_error", { source: HOME_CARE_SOURCE, mode: "home_care", reason: "crm_submit_failed" });
      console.error("[home-care] CRM submit failed", error);
      setSubmitError(copy.error);
    } finally {
      setSubmitting(false);
    }
  };

  const options = (entries: Record<string, string>) =>
    Object.entries(entries).map(([value, text]) => (
      <option key={value} value={value}>{text}</option>
    ));

  return (
    <form
      data-lead
      noValidate
      onFocus={onFirstFocus}
      onSubmit={handleSubmit(onSubmit, () => track("form_error", { source: HOME_CARE_SOURCE, mode: "home_care" }))}
      className="grid gap-5 rounded-sm border border-border bg-card p-5 shadow-soft md:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={`${copy.name} *`} id="hc-nombre" error={errors.nombre?.message}>
          <input id="hc-nombre" className={field} autoComplete="name" aria-required="true" {...register("nombre")} />
        </Field>
        <Field label={`${copy.email} *`} id="hc-email" error={errors.email?.message}>
          <input id="hc-email" type="email" className={field} autoComplete="email" aria-required="true" {...register("email")} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={`${copy.phone} *`} id="hc-telefono" error={errors.telefono?.message}>
          <input id="hc-telefono" type="tel" className={field} autoComplete="tel" aria-required="true" {...register("telefono")} />
        </Field>
        <Field label={copy.zone} id="hc-zona">
          <input id="hc-zona" className={field} placeholder={copy.zonePlaceholder} {...register("zona")} />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={copy.profile} id="hc-perfil">
          <select id="hc-perfil" className={field} {...register("tipoCliente")}>{options(copy.profileOptions)}</select>
        </Field>
        <Field label={copy.propertyType} id="hc-propiedad">
          <select id="hc-propiedad" className={field} {...register("tipoPropiedad")}>{options(copy.propertyOptions)}</select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={copy.size} id="hc-superficie">
          <select id="hc-superficie" className={field} {...register("superficie")}>{options(copy.sizeOptions)}</select>
        </Field>
        <Field label={copy.bathrooms} id="hc-banos">
          <select id="hc-banos" className={field} {...register("banos")}>
            {BATHROOM_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </Field>
        <Field label={copy.acUnits} id="hc-climatizadores">
          <select id="hc-climatizadores" className={field} {...register("climatizadores")}>{options(copy.acOptions)}</select>
        </Field>
        <Field label={copy.usage} id="hc-uso">
          <select id="hc-uso" className={field} {...register("usoAnual")}>{options(copy.usageOptions)}</select>
        </Field>
      </div>

      <Field label={copy.plan} id="hc-plan">
        <select id="hc-plan" className={field} {...register("plan")}>
          {(Object.keys(planNames) as HomeCarePlanKey[]).map((key) => (
            <option key={key} value={key}>{planNames[key]}</option>
          ))}
          <option value="sin-decidir">{copy.planUndecided}</option>
        </select>
      </Field>

      <fieldset>
        <legend className={labelCls}>{copy.systems}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(copy.systemsOptions).map(([value, text]) => (
            <label key={value} className="flex items-center gap-3 rounded-sm border border-border px-3 py-2.5 text-sm">
              <input type="checkbox" value={value} className="h-4 w-4 accent-primary" {...register("instalaciones")} />
              <span>{text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label={copy.message} id="hc-mensaje">
        <textarea id="hc-mensaje" rows={4} className={field} placeholder={copy.messagePlaceholder} {...register("mensaje")} />
      </Field>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" {...register("consentimiento")} />
        <span>
          {copy.consent} <a href="/privacy-policy" className="underline hover:text-foreground">{copy.consentLink}</a>{copy.consentTail}
        </span>
      </label>
      {errors.consentimiento && <p className={errorCls}>{errors.consentimiento.message}</p>}

      <label className="flex items-start gap-3 rounded-sm border border-border bg-accent/30 p-3 text-sm text-muted-foreground">
        <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-primary" {...register("marketingConsent")} />
        <span>
          <strong className="font-medium text-foreground">{copy.marketingOptional}</strong> {copy.marketing}
        </span>
      </label>

      {submitError && (
        <p role="alert" className="rounded-sm border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-sm bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelCls} htmlFor={id}>{label}</label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}
