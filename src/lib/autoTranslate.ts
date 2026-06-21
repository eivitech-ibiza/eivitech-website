import { CURRENT_LANGUAGE, type Language } from "@/lib/i18n";

type TranslationMap = Record<string, string>;

const IT: TranslationMap = {
  "Inicio": "Home",
  "Servicios": "Servizi",
  "Proyectos": "Progetti",
  "Empresa": "Azienda",
  "Contacto": "Contatto",
  "Solicitar valoración": "Richiedi una valutazione",
  "Ver proyectos": "Vedi progetti",
  "Ver todos los servicios →": "Vedi tutti i servizi →",
  "Ver todos →": "Vedi tutti →",
  "Ver servicio": "Vedi servizio",
  "Servicio": "Servizio",
  "Siguiente paso": "Prossimo passo",
  "Hablar por WhatsApp": "Parla su WhatsApp",
  "Área privada": "Area privata",
  "CRM privado": "CRM privato",
  "Sitio": "Sito",
  "Privacidad": "Privacy",
  "Aviso legal": "Note legali",
  "Todos los derechos reservados.": "Tutti i diritti riservati.",
  "Reformas · Instalaciones · Acabados · Ibiza": "Ristrutturazioni · Impianti · Finiture · Ibiza",
  "Reformas integrales": "Ristrutturazioni complete",
  "Electricidad e iluminación": "Elettricità e illuminazione",
  "Albañilería y acabados": "Muratura e finiture",
  "Fontanería": "Idraulica",
  "Cocinas y baños": "Cucine e bagni",
  "Carpintería y soluciones a medida": "Falegnameria e soluzioni su misura",
  "Terrazas y exteriores": "Terrazze ed esterni",
  "Locales comerciales": "Locali commerciali",
  "El contexto": "Il contesto",
  "La propuesta": "La proposta",
  "Proyectos destacados": "Progetti in evidenza",
  "Casos reales en Ibiza": "Casi reali a Ibiza",
  "Cómo trabajamos": "Come lavoriamo",
  "Preguntas frecuentes": "Domande frequenti",
  "Nombre *": "Nome *",
  "Teléfono / WhatsApp *": "Telefono / WhatsApp *",
  "Zona de Ibiza": "Zona di Ibiza",
  "Tipo de cliente *": "Tipo di cliente *",
  "Tipo de propiedad *": "Tipo di proprietà *",
  "Tipo de intervención *": "Tipo di intervento *",
  "Presupuesto orientativo": "Budget indicativo",
  "Mensaje": "Messaggio",
  "Enviar solicitud": "Invia richiesta",
  "Otros canales": "Altri canali"
};

const EN: TranslationMap = {
  "Inicio": "Home",
  "Servicios": "Services",
  "Proyectos": "Projects",
  "Empresa": "Company",
  "Contacto": "Contact",
  "Solicitar valoración": "Request an assessment",
  "Ver proyectos": "View projects",
  "Ver todos los servicios →": "View all services →",
  "Ver todos →": "View all →",
  "Ver servicio": "View service",
  "Servicio": "Service",
  "Siguiente paso": "Next step",
  "Hablar por WhatsApp": "Chat on WhatsApp",
  "Área privada": "Private area",
  "CRM privado": "Private CRM",
  "Sitio": "Site",
  "Privacidad": "Privacy",
  "Aviso legal": "Legal notice",
  "Todos los derechos reservados.": "All rights reserved.",
  "Reformas · Instalaciones · Acabados · Ibiza": "Renovations · Installations · Finishes · Ibiza",
  "Reformas integrales": "Full renovations",
  "Electricidad e iluminación": "Electrical and lighting",
  "Albañilería y acabados": "Masonry and finishes",
  "Fontanería": "Plumbing",
  "Cocinas y baños": "Kitchens and bathrooms",
  "Carpintería y soluciones a medida": "Carpentry and tailored solutions",
  "Terrazas y exteriores": "Terraces and outdoor areas",
  "Locales comerciales": "Commercial spaces",
  "El contexto": "The context",
  "La propuesta": "The proposal",
  "Proyectos destacados": "Featured projects",
  "Casos reales en Ibiza": "Real cases in Ibiza",
  "Cómo trabajamos": "How we work",
  "Preguntas frecuentes": "Frequently asked questions",
  "Nombre *": "Name *",
  "Teléfono / WhatsApp *": "Phone / WhatsApp *",
  "Zona de Ibiza": "Area of Ibiza",
  "Tipo de cliente *": "Client type *",
  "Tipo de propiedad *": "Property type *",
  "Tipo de intervención *": "Type of work *",
  "Presupuesto orientativo": "Indicative budget",
  "Mensaje": "Message",
  "Enviar solicitud": "Send request",
  "Otros canales": "Other channels"
};

const DICTIONARIES: Record<Exclude<Language, "es">, TranslationMap> = { it: IT, en: EN };

function translated(value: string) {
  if (CURRENT_LANGUAGE === "es") return value;
  return DICTIONARIES[CURRENT_LANGUAGE][value.trim()] || value;
}

function translateNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
    const next = translated(node.textContent);
    if (next !== node.textContent) node.textContent = next;
  }
}

function translateTree(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    translateNode(node);
    node = walker.nextNode();
  }
}

export function initAutoTranslate() {
  if (typeof window === "undefined" || CURRENT_LANGUAGE === "es") return;
  window.requestAnimationFrame(() => translateTree(document.body));
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) translateNode(node);
      if (node.nodeType === Node.ELEMENT_NODE) translateTree(node as Element);
    }));
  }).observe(document.body, { childList: true, subtree: true });
}
