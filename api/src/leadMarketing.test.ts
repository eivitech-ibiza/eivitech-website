import assert from "node:assert/strict";
import test from "node:test";
import { deriveLeadMarketingProfile, type LeadMarketingInput } from "./leadMarketing.js";

function baseLead(overrides: Partial<LeadMarketingInput> = {}): LeadMarketingInput {
  return {
    nombre: "Ana García",
    email: "ANA@EXAMPLE.COM",
    telefono: "+34 600 000 000",
    tipoCliente: "propietario",
    tipoPropiedad: "villa",
    zona: "Sant Josep",
    intervencion: "reforma-integral",
    tieneFotos: "si",
    tieneProyecto: "en-proceso",
    plazo: "1-3-meses",
    source: "contacto",
    landing_page: "/es/contacto?lang=es",
    ...overrides,
  };
}

test("client form derives a pending-list profile with useful segmentation tags", () => {
  const profile = deriveLeadMarketingProfile(baseLead());

  assert.equal(profile.email, "ana@example.com");
  assert.equal(profile.language, "es");
  assert.equal(profile.contactType, "propietario");
  assert.equal(profile.formMode, "cliente");
  assert.equal(profile.region, "Sant Josep");
  assert.deepEqual(profile.tags, [
    "cliente:propietario",
    "form:cliente",
    "fotos:si",
    "intervencion:reforma-integral",
    "plazo:1-3-meses",
    "proyecto:en-proceso",
    "propiedad:villa",
    "source:contacto",
    "web-form",
  ]);
});

test("professional collaborator form derives category, experience and availability tags", () => {
  const profile = deriveLeadMarketingProfile(baseLead({
    nombre: "Studio Ibiza",
    source: "contacto-partner",
    landing_page: "/it/contacto?lang=it",
    tipoCliente: "empresa",
    tipoPropiedad: "otro",
    intervencion: "otro",
    tieneFotos: "si",
    tieneProyecto: "no",
    plazo: "sin-fecha",
    zona: "Ibiza",
    mensaje: [
      "[PARTNER_COLLABORATOR_APPLICATION]",
      "Categoría: arquitectura",
      "Empresa/marca: Studio Ibiza",
      "Zona cubierta: Santa Eulària",
      "Experiencia: 5-10",
      "Disponibilidad: proyectos-programados",
      "Web/portfolio: https://example.com",
      "",
      "Mensaje libre",
    ].join("\n"),
  }));

  assert.equal(profile.language, "it");
  assert.equal(profile.contactType, "colaborador-profesional");
  assert.equal(profile.formMode, "colaborador");
  assert.equal(profile.region, "Santa Eulària");
  assert.ok(profile.tags.includes("form:colaborador"));
  assert.ok(profile.tags.includes("colaborador-profesional"));
  assert.ok(profile.tags.includes("categoria:arquitectura"));
  assert.ok(profile.tags.includes("experiencia:5-10"));
  assert.ok(profile.tags.includes("disponibilidad:proyectos-programados"));
  assert.ok(profile.tags.includes("source:contacto-partner"));
  assert.ok(!profile.tags.some((tag) => tag.includes("studio-ibiza")));
});

test("language can be inferred from the localized path and tag values are normalized", () => {
  const profile = deriveLeadMarketingProfile(baseLead({
    source: "landing Google Ibiza",
    landing_page: "/nl/contacto",
    utm_source: "Google Ads",
  }));

  assert.equal(profile.language, "nl");
  assert.ok(profile.tags.includes("source:landing-google-ibiza"));
  assert.ok(profile.tags.includes("utm-source:google-ads"));
});
