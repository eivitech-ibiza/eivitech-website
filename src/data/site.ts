import { tr } from "@/lib/i18n";

export const SITE = {
  name: "Eivitech",
  brand: "Eivitech Ibiza",
  tagline: tr("Reformas · Instalaciones · Acabados · Ibiza", "Ristrutturazioni · Impianti · Finiture · Ibiza", "Renovations · Installations · Finishes · Ibiza"),
  phone: "+34 674 735 188",
  phoneHref: "tel:+34674735188",
  whatsappNumber: "34674735188",
  email: "info@eivitech.com",
  emailHref: "mailto:info@eivitech.com",
  location: tr("Ibiza, España", "Ibiza, Spagna", "Ibiza, Spain"),
  legalName: "EIVITECH PLUS SL",
  taxIdLabel: "NIF/CIF",
  taxId: "B75708115",
  registeredAddressLine1: "C/ San Critofol 30, bloque 6, puerta 403",
  registeredAddressLine2: "07800 Ibiza, Illes Balears, España",
  locale: tr("es-ES", "it-IT", "en-GB"),
} as const;

export const whatsappUrl = (message?: string) => {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
};
