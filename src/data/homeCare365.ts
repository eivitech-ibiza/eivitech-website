import contentFile from "./homeCare365.content.json";
import { CURRENT_LANGUAGE, type Language } from "@/lib/i18n";

export type HomeCareLanguage = Language;
export type HomeCarePlanKey = "essential" | "care" | "premium";

type LabelValue = { label: string; value: string };
type Plan = { name: string; frequency: string; summary: string; includes: string[] };

export type HomeCareCopy = {
  meta: { title: string; description: string; imageAlt: string; serviceType: string; breadcrumb: string };
  hero: { eyebrow: string; title: string; lead: string; tagline: string; primaryCta: string; secondaryCta: string };
  facts: { title: string; items: LabelValue[] };
  problem: { eyebrow: string; title: string; intro: string; items: string[] };
  checks: { eyebrow: string; title: string; intro: string; safety: string; groups: { title: string; items: string[] }[] };
  plansSection: {
    eyebrow: string;
    title: string;
    intro: string;
    note: string;
    frequencyLabel: string;
    items: Record<HomeCarePlanKey, Plan>;
    cta: string;
  };
  report: { eyebrow: string; title: string; text: string; items: string[] };
  scope: {
    eyebrow: string;
    title: string;
    includedTitle: string;
    included: string[];
    excludedTitle: string;
    excluded: string[];
    note: string;
  };
  process: { eyebrow: string; title: string; steps: { title: string; text: string }[] };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[] };
  form: {
    eyebrow: string;
    title: string;
    intro: string;
    name: string;
    email: string;
    phone: string;
    profile: string;
    profileOptions: Record<"propietario" | "agencia" | "empresa" | "otro", string>;
    propertyType: string;
    propertyOptions: Record<"villa" | "apartamento" | "casa" | "otro", string>;
    zone: string;
    zonePlaceholder: string;
    size: string;
    sizeOptions: Record<string, string>;
    bathrooms: string;
    acUnits: string;
    acOptions: Record<string, string>;
    usage: string;
    usageOptions: Record<string, string>;
    plan: string;
    planUndecided: string;
    systems: string;
    systemsOptions: Record<string, string>;
    message: string;
    messagePlaceholder: string;
    required: string;
    consent: string;
    consentLink: string;
    consentTail: string;
    marketingOptional: string;
    marketing: string;
    submit: string;
    submitting: string;
    error: string;
    errors: { name: string; email: string; phone: string; consent: string };
  };
  cta: { title: string; text: string; whatsapp: string };
};

export type HomeCareContentFile = {
  path: string;
  image: { src: string; width: number; height: number; type: string };
  plans: HomeCarePlanKey[];
} & Record<HomeCareLanguage, HomeCareCopy>;

export const HOME_CARE_CONTENT = contentFile as unknown as HomeCareContentFile;

export const homeCareCopy = (language: HomeCareLanguage = CURRENT_LANGUAGE): HomeCareCopy =>
  HOME_CARE_CONTENT[language] || HOME_CARE_CONTENT.es;
