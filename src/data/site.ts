export const SITE = {
  name: "Eivitech",
  brand: "Eivitech Ibiza",
  tagline: "Reformas · Instalaciones · Acabados · Ibiza",
  phone: "+34 674 735 188",
  phoneHref: "tel:+34674735188",
  whatsappNumber: "34674735188",
  email: "info@eivitech.com",
  emailHref: "mailto:info@eivitech.com",
  location: "Ibiza, España",
  locale: "es-ES",
} as const;

export const whatsappUrl = (message?: string) => {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
};
