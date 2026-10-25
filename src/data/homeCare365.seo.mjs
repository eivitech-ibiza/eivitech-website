// Shared builders for the Home Care 365 page.
// Used both at runtime (React/Helmet) and at build time (static HTML for
// crawlers that do not execute JavaScript, including AI answer engines).
// Plain JavaScript with no imports so Node build scripts and Vite can share it.

const SITE_URL = "https://eivitech.com";
export const HOME_CARE_PATH = "/home-care-365";
export const HOME_CARE_SOURCE = "home-care-365";

const AREA_SERVED = { "@type": "Place", name: "Ibiza, España" };

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function planEntries(content, language) {
  const copy = content[language];
  return content.plans.map((key) => ({ key, ...copy.plansSection.items[key] }));
}

/**
 * Service (with an offer catalogue of the three plans, no prices) and FAQPage.
 * The page URL, @id and mainEntityOfPage are added by the SEO layer that
 * already enriches every Service block on the site.
 */
export function homeCareStructuredData(content, language) {
  const copy = content[language];
  const image = `${SITE_URL}${content.image.src}`;

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Eivitech Home Care 365",
    serviceType: copy.meta.serviceType,
    description: copy.meta.description,
    image,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: AREA_SERVED,
    audience: {
      "@type": "Audience",
      audienceType: copy.facts.items[0].value,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Home Care 365 — ${copy.plansSection.title.replace(/\.$/, "")}`,
      itemListElement: planEntries(content, language).map((plan) => ({
        "@type": "Offer",
        name: `Home Care 365 ${plan.name}`,
        description: `${plan.summary} ${copy.plansSection.frequencyLabel}: ${plan.frequency}.`,
        areaServed: AREA_SERVED,
        itemOffered: {
          "@type": "Service",
          name: `Home Care 365 ${plan.name}`,
          description: plan.includes.join(", "),
        },
      })),
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return [service, faq];
}

/**
 * Semantic HTML snapshot of the page content, injected into #root of the
 * static entry page. React replaces it on mount; crawlers that only read the
 * raw HTML still get the full answer-first content.
 */
export function homeCareStaticHtml(content, language, contact) {
  const copy = content[language];
  const e = escapeHtml;
  const list = (items) => `<ul>${items.map((item) => `<li>${e(item)}</li>`).join("")}</ul>`;

  const facts = copy.facts.items
    .map((item) => `<dt>${e(item.label)}</dt><dd>${e(item.value)}</dd>`)
    .join("");

  const checks = copy.checks.groups
    .map((group) => `<section><h3>${e(group.title)}</h3>${list(group.items)}</section>`)
    .join("");

  const plans = planEntries(content, language)
    .map(
      (plan) =>
        `<section><h3>${e(plan.name)}</h3><p>${e(copy.plansSection.frequencyLabel)}: ${e(plan.frequency)}</p><p>${e(plan.summary)}</p>${list(plan.includes)}</section>`,
    )
    .join("");

  const steps = copy.process.steps
    .map((step) => `<li><strong>${e(step.title)}</strong> — ${e(step.text)}</li>`)
    .join("");

  const faq = copy.faq.items
    .map((item) => `<section><h3>${e(item.q)}</h3><p>${e(item.a)}</p></section>`)
    .join("");

  return [
    `<main class="container-x section-tight" data-prerender="home-care-365">`,
    `<p class="eyebrow">${e(copy.hero.eyebrow)}</p>`,
    `<h1 class="display-xl">${e(copy.hero.title)}</h1>`,
    `<p class="body-lg">${e(copy.hero.lead)}</p>`,
    `<p>${e(copy.hero.tagline)}</p>`,
    `<h2>${e(copy.facts.title)}</h2><dl>${facts}</dl>`,
    `<h2>${e(copy.problem.title)}</h2><p>${e(copy.problem.intro)}</p>${list(copy.problem.items)}`,
    `<h2>${e(copy.checks.title)}</h2><p>${e(copy.checks.intro)}</p>${checks}<p>${e(copy.checks.safety)}</p>`,
    `<h2>${e(copy.plansSection.title)}</h2><p>${e(copy.plansSection.intro)}</p>${plans}<p>${e(copy.plansSection.note)}</p>`,
    `<h2>${e(copy.report.title)}</h2><p>${e(copy.report.text)}</p>${list(copy.report.items)}`,
    `<h2>${e(copy.scope.title)}</h2><h3>${e(copy.scope.includedTitle)}</h3>${list(copy.scope.included)}<h3>${e(copy.scope.excludedTitle)}</h3>${list(copy.scope.excluded)}<p>${e(copy.scope.note)}</p>`,
    `<h2>${e(copy.process.title)}</h2><ol>${steps}</ol>`,
    `<h2>${e(copy.faq.title)}</h2>${faq}`,
    `<h2>${e(copy.cta.title)}</h2><p>${e(copy.cta.text)}</p>`,
    `<p><a href="tel:${e(contact.phone.replace(/\s+/g, ""))}">${e(contact.phone)}</a> · <a href="mailto:${e(contact.email)}">${e(contact.email)}</a></p>`,
    `</main>`,
  ].join("");
}
