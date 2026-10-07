import assert from "node:assert/strict";
import test from "node:test";

import { mapMetaLeadFields, normalizeMetaLeadValue } from "./meta/leadAds.js";

test("Meta Lead Ads option values normalize to CRM enums", () => {
  assert.equal(normalizeMetaLeadValue("tipoPropiedad", "Local comercial"), "local-comercial");
  assert.equal(normalizeMetaLeadValue("intervencion", "Reforma integral"), "reforma-integral");
  assert.equal(normalizeMetaLeadValue("intervencion", "Baño"), "bano");
  assert.equal(normalizeMetaLeadValue("tieneFotos", "Sí"), "si");
  assert.equal(normalizeMetaLeadValue("tieneProyecto", "En proceso"), "en-proceso");
  assert.equal(normalizeMetaLeadValue("plazo", "Sin fecha definida"), "sin-fecha");
  assert.equal(normalizeMetaLeadValue("plazo", "1-3 meses"), "1-3-meses");
});

test("Meta Lead Ads mapping keeps contact data and rejects unknown enum values", () => {
  const mapped = mapMetaLeadFields(
    [
      { name: "full_name", values: ["Luciano Test"] },
      { name: "email", values: ["test@example.com"] },
      { name: "phone_number", values: ["+34600000000"] },
      { name: "cliente", values: ["Propietario"] },
      { name: "propiedad", values: ["Local comercial"] },
      { name: "intervencion", values: ["<test lead: dummy data>"] },
      { name: "fotos", values: ["Sí"] },
      { name: "proyecto", values: ["En proceso"] },
      { name: "plazo", values: ["3-6 meses"] },
      { name: "zona", values: ["Santa Eulària"] },
    ],
    {
      cliente: "tipoCliente",
      propiedad: "tipoPropiedad",
      intervencion: "intervencion",
      fotos: "tieneFotos",
      proyecto: "tieneProyecto",
      plazo: "plazo",
      zona: "zona",
    }
  );

  assert.deepEqual(mapped, {
    nombre: "Luciano Test",
    email: "test@example.com",
    telefono: "+34600000000",
    tipoCliente: "propietario",
    tipoPropiedad: "local-comercial",
    tieneFotos: "si",
    tieneProyecto: "en-proceso",
    plazo: "3-6-meses",
    zona: "Santa Eulària",
  });
  assert.equal("intervencion" in mapped, false);
});
