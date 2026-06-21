# Refactor Eivitech Ibiza — da vetrina a funnel

Sito React/Vite/Tailwind in spagnolo, mobile-first, copy persuasivo (StoryBrand/AIDA), pronto per Google/Meta Ads. Nessun dato inventato: dove mancano info → placeholder "pendiente de completar con Daniele".

## Direzione visiva
Ibiza premium naturale: palette sabbia/calce/terracotta/verde oliva/blu mare profondo, tipografia display serif (Fraunces) + sans grotesque (Inter/Manrope), immagini grandi, microcemento/legno/pietra come mood. Niente azzurrini corporate, niente viola AI.

## Pagine (React Router + react-helmet-async)

```
/                              Home (StoryBrand)
/empresa                       Chi siamo
/servicios                     Index servizi
/servicios/reformas-integrales
/servicios/electricidad-iluminacion
/servicios/albanileria-acabados
/servicios/fontaneria
/servicios/cocinas-banos
/servicios/carpinteria
/servicios/terrazas-exteriores
/servicios/locales-comerciales
/proyectos                     Portfolio listing
/proyectos/casa-sant-josep     (placeholder Daniele)
/proyectos/true-bar
/proyectos/apartamento-marina-botafoch
/proyectos/urbanizacion-valverde
/contacto                      Form qualificazione completo
/gracias                       Thank-you state
/reformas-ibiza                Landing Google Ads
/proyectos-reformas-ibiza      Landing Meta Ads
/renovation-company-ibiza      Landing EN (SHOULD)
/privacidad                    Privacy placeholder
/aviso-legal                   Placeholder
/404
```

## Componenti (`src/components/`)
Header (sticky + CTA), Footer, WhatsAppFloat, PhoneLink, ServiceCard, ProjectCard, CaseStudyTemplate, ServicePageTemplate, LandingTemplate, LeadQualificationForm (zod + react-hook-form), ShortLeadForm, CTASection, ProcessSteps, FAQAccordion, TestimonialSection (placeholder), Hero, SectionHeading, Badge, CookieConsent (placeholder), ThankYouState, SEO (Helmet wrapper), TrackingDebugPanel (?debug=1).

## Utility
- `src/lib/tracking.ts` — funzioni placeholder per page_view, service_page_view, project_view, whatsapp_click, phone_click, form_start, form_submit, form_error, quote_request, meta_landing_view, google_landing_view. Solo `console.log` + `window.dataLayer.push` se esiste. Niente pixel attivi.
- `src/lib/utm.ts` — cattura UTM da querystring, salva sessionStorage, espone hidden fields (utm_source/medium/campaign/content/term, landing_page, referrer, timestamp).
- `src/lib/seo.ts` — JSON-LD helpers (LocalBusiness placeholder, Service, FAQPage).
- `src/data/services.ts`, `src/data/projects.ts`, `src/data/faqs.ts` — single source of truth.

## Form qualificazione
Tutti i campi richiesti (tipo cliente, propiedad, zona, intervención, fotos, proyecto técnico, plazo, presupuesto opzionale, mensaje, consenso). Validazione zod, errori inline, su submit → tracking.quote_request → redirect `/gracias`. Niente backend reale: POST verso endpoint mock + console + nota "integrazione CRM/webhook da configurare". Mailto fallback con corpo precompilato per ricezione interna.

## SEO per pagina
Title <60, meta description <160, H1 unico, canonical relativo, og:* per route, schema Service/FAQPage/LocalBusiness (placeholder). Sitemap.xml generato via `scripts/generate-sitemap.ts` con tutte le route. `index.html` sitewide tags in spagnolo + Organization JSON-LD.

## Privacy
Form raccoglie minimo necessario, checkbox consenso obbligatorio con link `/privacidad`, pagina privacidad con disclaimer "verificación legal pendiente", CookieConsent banner placeholder che NON attiva tracker reali. Nota esplicita nel codice.

## Stack tecnico
- react-helmet-async (install)
- react-hook-form + zod + @hookform/resolvers (install)
- framer-motion (install, animazioni leggere hero/sections)
- lucide-react (già presente)
- Immagini hero/sezioni: generate con imagegen (mood Ibiza naturale, microcemento, legno, pietra, interni eleganti) — 4-6 immagini chiave riusate.

## Deliverable finale
README aggiornato (o sezione in `/empresa` interna) con:
- pagine create
- componenti
- eventi tracking
- dati da validare con Daniele (Casa Sant Josep, anni esperienza, certificazioni, garanzie, tempi, prezzi, schema LocalBusiness address/coords, privacy policy reale, pixel IDs)
- next steps pre-pubblicazione

## Fuori scope (WON'T)
E-commerce, login, area riservata, preventivi automatici, integrazione CRM live, blog, versione EN completa (solo landing).

## Stima
~25-30 file nuovi. Procedo a implementare tutto in un'unica sessione, partendo da design system + dati + componenti core, poi pagine.
