import type { FAQ } from "@/data/faqs";
import { absoluteUrl, canonicalUrl } from "@/lib/siteUrl";

export const ORGANIZATION_ID = absoluteUrl("/#organization");
export const WEBSITE_ID = absoluteUrl("/#website");

export const orgJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": ORGANIZATION_ID,
  name: "Eivitech",
  alternateName: "Eivitech Ibiza",
  url: absoluteUrl("/"),
  description:
    "Empresa de reformas, instalaciones, acabados e interiores a medida para villas, apartamentos, fincas y espacios comerciales en Ibiza.",
  logo: absoluteUrl("/media/brand/eivitech-logo.svg"),
  image: absoluteUrl("/media/hero/eivitech-ibiza-ristrutturazione-villa-mediterranea-top-banner.webp"),
  telephone: "+34 674 735 188",
  email: "info@eivitech.com",
  areaServed: { "@type": "Place", name: "Ibiza, España" },
  address: { "@type": "PostalAddress", addressLocality: "Ibiza", addressCountry: "ES" },
  // NOTA: completar dirección exacta y geo coordinates con Daniele antes de declararlas.
});

export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: absoluteUrl("/"),
  name: "Eivitech Ibiza",
  publisher: { "@id": ORGANIZATION_ID },
  inLanguage: ["es-ES", "it-IT", "en-GB", "nl-NL"],
});

export const webPageJsonLd = ({
  title,
  description,
  path,
  inLanguage,
  image,
}: {
  title: string;
  description: string;
  path: string;
  inLanguage: string;
  image?: string;
}) => {
  const url = canonicalUrl(path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    ...(image
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: image,
          },
        }
      : {}),
  };
};

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: canonicalUrl(item.path),
  })),
});

export const serviceJsonLd = (name: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: name,
  provider: { "@id": ORGANIZATION_ID },
  areaServed: { "@type": "Place", name: "Ibiza, España" },
  description,
});

export const faqJsonLd = (faqs: FAQ[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});
