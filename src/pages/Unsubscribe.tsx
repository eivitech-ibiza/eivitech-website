import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, MailX } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";

const CRM_ENDPOINT = "https://ibiza-project-accelerator-production.up.railway.app";
type Language = "es" | "it" | "en" | "nl";

type UnsubscribeState = {
  email_hint: string;
  language: Language;
  unsubscribed: boolean;
  unsubscribed_at?: string | null;
};

const COPY: Record<Language, {
  title: string;
  description: string;
  already: string;
  button: string;
  success: string;
  error: string;
  invalid: string;
  home: string;
}> = {
  it: {
    title: "Gestisci le comunicazioni Eivitech",
    description: "Puoi interrompere in qualsiasi momento la ricezione delle email marketing Eivitech.",
    already: "Questo indirizzo risulta già disiscritto.",
    button: "Disiscrivimi dalle email marketing",
    success: "Disiscrizione completata. Non riceverai più campagne marketing Eivitech.",
    error: "Non è stato possibile completare la richiesta. Riprova tra poco.",
    invalid: "Il collegamento di disiscrizione non è valido o non è più disponibile.",
    home: "Torna al sito Eivitech",
  },
  es: {
    title: "Gestiona las comunicaciones de Eivitech",
    description: "Puedes dejar de recibir los correos de marketing de Eivitech en cualquier momento.",
    already: "Esta dirección ya está dada de baja.",
    button: "Darme de baja de los correos de marketing",
    success: "Baja completada. Ya no recibirás campañas de marketing de Eivitech.",
    error: "No se ha podido completar la solicitud. Inténtalo de nuevo más tarde.",
    invalid: "El enlace de baja no es válido o ya no está disponible.",
    home: "Volver al sitio de Eivitech",
  },
  en: {
    title: "Manage Eivitech communications",
    description: "You can stop receiving Eivitech marketing emails at any time.",
    already: "This address is already unsubscribed.",
    button: "Unsubscribe me from marketing emails",
    success: "You have been unsubscribed and will no longer receive Eivitech marketing campaigns.",
    error: "We could not complete the request. Please try again shortly.",
    invalid: "The unsubscribe link is invalid or no longer available.",
    home: "Return to the Eivitech website",
  },
  nl: {
    title: "Beheer je Eivitech-communicatie",
    description: "Je kunt je op elk moment afmelden voor marketingmails van Eivitech.",
    already: "Dit e-mailadres is al uitgeschreven.",
    button: "Afmelden voor marketingmails",
    success: "Je bent uitgeschreven en ontvangt geen marketingcampagnes van Eivitech meer.",
    error: "De aanvraag kon niet worden voltooid. Probeer het later opnieuw.",
    invalid: "De afmeldlink is ongeldig of niet meer beschikbaar.",
    home: "Terug naar de Eivitech-website",
  },
};

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const requestedLanguage = params.get("lang") as Language | null;
  const [data, setData] = useState<UnsubscribeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);

  const language: Language = data?.language || (requestedLanguage && COPY[requestedLanguage] ? requestedLanguage : "it");
  const copy = useMemo(() => COPY[language], [language]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!/^[a-f0-9]{64}$/i.test(token)) {
        setFailed(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${CRM_ENDPOINT}/api/marketing-public/unsubscribe/${encodeURIComponent(token)}`);
        if (!response.ok) throw new Error("Invalid token");
        const payload = await response.json() as UnsubscribeState;
        if (active) {
          setData(payload);
          setCompleted(payload.unsubscribed);
        }
      } catch (error) {
        console.error("[unsubscribe] load failed", error);
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [token]);

  async function unsubscribe() {
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch(`${CRM_ENDPOINT}/api/marketing-public/unsubscribe/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Unsubscribe failed");
      setCompleted(true);
    } catch (error) {
      console.error("[unsubscribe] submit failed", error);
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <SEO title="Disiscrizione email | Eivitech Ibiza" description="Gestione delle preferenze email Eivitech." path="/unsubscribe" noIndex />
      <section className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-2xl rounded-sm border border-border bg-card p-7 shadow-card md:p-10">
          {loading ? (
            <div className="flex min-h-56 items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : failed && !data ? (
            <div className="text-center">
              <MailX className="mx-auto text-destructive" size={38} />
              <h1 className="display-sm mt-5">{copy.title}</h1>
              <p className="mt-4 text-muted-foreground">{copy.invalid}</p>
              <Link to="/" className="mt-7 inline-flex rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">{copy.home}</Link>
            </div>
          ) : completed ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto text-secondary" size={42} />
              <h1 className="display-sm mt-5">{copy.title}</h1>
              <p className="mt-4 text-muted-foreground">{data?.unsubscribed ? copy.already : copy.success}</p>
              {data?.email_hint && <p className="mt-3 text-sm text-muted-foreground">{data.email_hint}</p>}
              <Link to="/" className="mt-7 inline-flex rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground">{copy.home}</Link>
            </div>
          ) : (
            <div className="text-center">
              <MailX className="mx-auto text-primary" size={38} />
              <h1 className="display-sm mt-5">{copy.title}</h1>
              <p className="mt-4 text-muted-foreground">{copy.description}</p>
              {data?.email_hint && <p className="mt-3 text-sm font-medium">{data.email_hint}</p>}
              {failed && <p className="mt-4 text-sm text-destructive">{copy.error}</p>}
              <button onClick={() => void unsubscribe()} disabled={submitting} className="mt-7 inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60">
                {submitting && <Loader2 size={16} className="animate-spin" />}{copy.button}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
