import assert from "node:assert/strict";
import test from "node:test";
import {
  initialStatusForLead,
  isHomeCareLead,
  nextActionForLead,
  priorityFromScore,
  scoreLead,
} from "./leadScoring.js";

const homeCareVilla = {
  plazo: "sin-fecha",
  intervencion: "otro",
  tipo_propiedad: "villa",
  tiene_fotos: "no",
  tiene_proyecto: "no",
  presupuesto: null,
  source: "home-care-365",
  utm_source: null,
};

test("Home Care 365 leads are recognised by source", () => {
  assert.equal(isHomeCareLead({ source: "home-care-365" }), true);
  assert.equal(isHomeCareLead({ source: "contacto" }), false);
  assert.equal(isHomeCareLead({ source: null }), false);
});

test("Home Care 365 villa leads are not ranked low by renovation rules", () => {
  const score = scoreLead(homeCareVilla);
  assert.equal(score, 70);
  assert.equal(priorityFromScore(score), "media");
  assert.equal(priorityFromScore(scoreLead({ ...homeCareVilla, utm_source: "google" })), "alta");
  assert.equal(priorityFromScore(scoreLead({ ...homeCareVilla, tipo_propiedad: "apartamento" })), "media");
});

test("Home Care 365 leads get their own next action and status", () => {
  assert.match(nextActionForLead(homeCareVilla), /^Home Care 365:/);
  assert.match(nextActionForLead(homeCareVilla), /No pedir por escrito fechas de ausencia/);
  assert.equal(initialStatusForLead(homeCareVilla), "first_contact");
});

test("renovation lead scoring is unchanged", () => {
  const renovation = {
    plazo: "urgente",
    intervencion: "reforma-integral",
    tipo_propiedad: "villa",
    tiene_fotos: "si",
    tiene_proyecto: "si",
    presupuesto: "200k",
    source: "contacto",
    utm_source: null,
  };
  assert.equal(scoreLead(renovation), 100);
  assert.equal(scoreLead({ ...renovation, plazo: "sin-fecha", intervencion: "otro", tiene_fotos: "no", tiene_proyecto: "no", presupuesto: null }), 40);
  assert.equal(nextActionForLead(renovation), "Contactar por WhatsApp hoy y confirmar necesidad real.");
  assert.equal(initialStatusForLead(renovation), "visit_review");
});
