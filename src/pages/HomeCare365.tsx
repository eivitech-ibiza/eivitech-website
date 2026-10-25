import { useState, type MouseEvent } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import { SEO } from "@/components/SEO";
import { HomeCareLeadForm } from "@/components/HomeCareLeadForm";
import { HOME_CARE_CONTENT, homeCareCopy, type HomeCarePlanKey } from "@/data/homeCare365";
import { HOME_CARE_PATH, HOME_CARE_SOURCE, homeCareStructuredData } from "@/data/homeCare365.seo.mjs";
import { whatsappUrl } from "@/data/site";
import { CURRENT_LANGUAGE } from "@/lib/i18n";
import { track } from "@/lib/tracking";

const FORM_ID = "solicitud";
const CHECKS_ID = "controles";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const HomeCare365 = () => {
  const copy = homeCareCopy();
  const { image, plans } = HOME_CARE_CONTENT;
  const [selectedPlan, setSelectedPlan] = useState<HomeCarePlanKey | null>(null);
  const planNames = Object.fromEntries(
    plans.map((key) => [key, copy.plansSection.items[key].name]),
  ) as Record<HomeCarePlanKey, string>;

  const jumpTo = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection(id);
  };

  const choosePlan = (key: HomeCarePlanKey) => {
    setSelectedPlan(key);
    scrollToSection(FORM_ID);
  };

  return (
    <>
      <SEO
        title={copy.meta.title}
        description={copy.meta.description}
        path={HOME_CARE_PATH}
        breadcrumbName={copy.meta.breadcrumb}
        ogImage={image.src}
        ogImageAlt={copy.meta.imageAlt}
        ogImageType={image.type}
        ogImageWidth={image.width}
        ogImageHeight={image.height}
        trackAs="service_page_view"
        trackPayload={{ service: HOME_CARE_SOURCE }}
        jsonLd={homeCareStructuredData(HOME_CARE_CONTENT, CURRENT_LANGUAGE)}
      />

      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={`${import.meta.env.BASE_URL}${image.src.replace(/^\//, "")}`}
            alt={copy.meta.imageAlt}
            width={image.width}
            height={image.height}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background/85" />
        </div>
        <div className="container-x pb-16 pt-20 md:pb-24 md:pt-28">
          <div className="eyebrow">{copy.hero.eyebrow}</div>
          <h1 className="display-xl mt-4 max-w-4xl">{copy.hero.title}</h1>
          <p className="body-lg mt-6 max-w-3xl">{copy.hero.lead}</p>
          <p className="mt-5 max-w-2xl font-display text-xl italic text-foreground/80 md:text-2xl">{copy.hero.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`#${FORM_ID}`}
              onClick={jumpTo(FORM_ID)}
              className="inline-flex items-center rounded-sm bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              {copy.hero.primaryCta}
            </a>
            <a
              href={`#${CHECKS_ID}`}
              onClick={jumpTo(CHECKS_ID)}
              className="inline-flex items-center rounded-sm border border-foreground/20 px-6 py-3.5 text-sm font-medium transition hover:bg-foreground/5"
            >
              {copy.hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      <section className="section-tight" aria-labelledby="hc-facts">
        <div className="container-x">
          <h2 id="hc-facts" className="eyebrow">{copy.facts.title}</h2>
          <dl className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {copy.facts.items.map((item) => (
              <div key={item.label} className="bg-card p-5">
                <dt className="text-xs font-medium uppercase tracking-[0.18em] text-primary">{item.label}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-foreground/85">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-tight bg-accent/40">
        <div className="container-x grid gap-10 md:grid-cols-2">
          <div>
            <div className="eyebrow">{copy.problem.eyebrow}</div>
            <h2 className="display-md mt-3">{copy.problem.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{copy.problem.intro}</p>
          </div>
          <ul className="grid gap-3 self-center">
            {copy.problem.items.map((item) => (
              <li key={item} className="border-b border-border pb-3 text-foreground/85">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id={CHECKS_ID} className="section-tight scroll-mt-24">
        <div className="container-x">
          <div className="eyebrow">{copy.checks.eyebrow}</div>
          <h2 className="display-md mt-3 max-w-3xl">{copy.checks.title}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">{copy.checks.intro}</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {copy.checks.groups.map((group, index) => (
              <div key={group.title} className="rounded-sm border border-border bg-card p-6">
                <div className="font-display text-primary">{String.fromCharCode(65 + index)}</div>
                <h3 className="mt-3 font-display text-2xl">{group.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                      <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-muted-foreground">{copy.checks.safety}</p>
        </div>
      </section>

      <section className="section-tight bg-accent/40">
        <div className="container-x">
          <div className="eyebrow">{copy.plansSection.eyebrow}</div>
          <h2 className="display-md mt-3">{copy.plansSection.title}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">{copy.plansSection.intro}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {plans.map((key) => {
              const plan = copy.plansSection.items[key];
              const active = selectedPlan === key;
              return (
                <article
                  key={key}
                  className={`flex flex-col rounded-sm border bg-card p-6 transition ${active ? "border-primary shadow-soft" : "border-border"}`}
                >
                  <h3 className="font-display text-3xl">{plan.name}</h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {copy.plansSection.frequencyLabel}
                  </p>
                  <p className="mt-1 text-base font-medium text-primary">{plan.frequency}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.includes.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm">
                        <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => choosePlan(key)}
                    className="mt-6 inline-flex items-center justify-center rounded-sm border border-foreground/20 px-5 py-3 text-sm font-medium transition hover:border-primary hover:bg-primary/10"
                  >
                    {copy.plansSection.cta}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">{copy.plansSection.note}</p>
        </div>
      </section>

      <section className="section-tight">
        <div className="container-x grid gap-12 md:grid-cols-2">
          <div>
            <div className="eyebrow">{copy.report.eyebrow}</div>
            <h2 className="display-md mt-3">{copy.report.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{copy.report.text}</p>
            <ul className="mt-6 space-y-3">
              {copy.report.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check size={18} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow">{copy.scope.eyebrow}</div>
            <h2 className="display-md mt-3">{copy.scope.title}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium">{copy.scope.includedTitle}</h3>
                <ul className="mt-3 space-y-2.5">
                  {copy.scope.included.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium">{copy.scope.excludedTitle}</h3>
                <ul className="mt-3 space-y-2.5">
                  {copy.scope.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <X size={16} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 rounded-sm border border-primary/25 bg-primary/10 p-4 text-sm leading-relaxed">{copy.scope.note}</p>
          </div>
        </div>
      </section>

      <section className="section-tight bg-accent/40">
        <div className="container-x">
          <div className="eyebrow">{copy.process.eyebrow}</div>
          <h2 className="display-md mt-3">{copy.process.title}</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {copy.process.steps.map((step, index) => (
              <li key={step.title} className="rounded-sm border border-border bg-card p-5">
                <div className="font-display text-primary">{String(index + 1).padStart(2, "0")}</div>
                <h3 className="mt-3 font-display text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id={FORM_ID} className="section-tight scroll-mt-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <div className="eyebrow">{copy.form.eyebrow}</div>
            <h2 className="display-md mt-3">{copy.form.title}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{copy.form.intro}</p>
          </div>
          <HomeCareLeadForm copy={copy.form} planNames={planNames} selectedPlan={selectedPlan} />
        </div>
      </section>

      <section className="section-tight">
        <div className="container-x max-w-4xl">
          <div className="eyebrow">{copy.faq.eyebrow}</div>
          <h2 className="display-md mt-3 mb-8">{copy.faq.title}</h2>
          <div className="border-t border-border">
            {copy.faq.items.map((item, index) => (
              <details key={item.q} className="group border-b border-border" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-lg md:text-xl">{item.q}</h3>
                  <span className="shrink-0 text-primary" aria-hidden="true">
                    <Plus size={20} className="group-open:hidden" />
                    <Minus size={20} className="hidden group-open:block" />
                  </span>
                </summary>
                <p className="-mt-1 max-w-3xl pb-6 leading-relaxed text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-ink text-cream">
        <div className="container-x grid gap-10 md:grid-cols-2 md:items-end">
          <h2 className="display-lg max-w-xl">{copy.cta.title}</h2>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-cream/80">{copy.cta.text}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`#${FORM_ID}`}
                onClick={jumpTo(FORM_ID)}
                className="inline-flex items-center rounded-sm bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                {copy.hero.primaryCta}
              </a>
              <a
                href={whatsappUrl(copy.cta.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: HOME_CARE_SOURCE })}
                className="inline-flex items-center rounded-sm border border-cream/30 px-6 py-3.5 text-sm font-medium text-cream transition hover:bg-cream/10"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeCare365;
