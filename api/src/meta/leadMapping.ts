function normalizeOptionKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

const operationalChoices: Record<string, Record<string, string>> = {
  tipoCliente: {
    propietario: "propietario",
    comprador: "comprador",
    inversor: "inversor",
    agencia: "agencia",
    empresa: "empresa",
    otro: "otro",
  },
  tipoPropiedad: {
    villa: "villa",
    apartamento: "apartamento",
    casa: "casa",
    "local-comercial": "local-comercial",
    otro: "otro",
  },
  intervencion: {
    "reforma-integral": "reforma-integral",
    bano: "bano",
    cocina: "cocina",
    instalaciones: "instalaciones",
    exterior: "exterior",
    "local-comercial": "local-comercial",
    otro: "otro",
  },
  tieneFotos: {
    si: "si",
    no: "no",
  },
  tieneProyecto: {
    si: "si",
    no: "no",
    "en-proceso": "en-proceso",
  },
  plazo: {
    urgente: "urgente",
    "1-3-meses": "1-3-meses",
    "3-6-meses": "3-6-meses",
    "sin-fecha-definida": "sin-fecha",
    "sin-fecha": "sin-fecha",
  },
};

export function normalizeMetaLeadValue(target: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const choices = operationalChoices[target];
  if (!choices) return trimmed;
  return choices[normalizeOptionKey(trimmed)] || null;
}

export function mapMetaLeadFields(
  fieldData: Array<{ name: string; values: string[] }>,
  mapping: Record<string, string>
) {
  const defaults: Record<string, string> = {
    full_name: "nombre",
    name: "nombre",
    email: "email",
    phone_number: "telefono",
    phone: "telefono",
  };
  const mapped: Record<string, string> = {};
  for (const field of fieldData) {
    const target = mapping[field.name] || defaults[field.name];
    const value = field.values[0];
    if (!target || !value) continue;
    const normalized = normalizeMetaLeadValue(target, value);
    if (normalized) mapped[target] = normalized.slice(0, 1500);
  }
  return mapped;
}
