import type { FAQ } from "@/data/faqs";

export const orgJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Eivitech",
  telephone: "+34 674 735 188",
  email: "info@eivitech.com",
  areaServed: "Ibiza, España",
  address: { "@type": "PostalAddress", addressLocality: "Ibiza", addressCountry: "ES" },
  // NOTA: completar dirección exacta y geo coordinates con Daniele.
});

export const serviceJsonLd = (name: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: name,
  provider: { "@type": "LocalBusiness", name: "Eivitech" },
  areaServed: "Ibiza, España",
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
