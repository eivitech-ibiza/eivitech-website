import assert from "node:assert/strict";
import test from "node:test";
import { splitCrmActivityNotes, collectCrmOperatorNotes } from "../src/lib/crmOperationalNotes.ts";

const entry = (id, at, notes, title = "Trattativa fallita") => ({ id, title, created_at: at, notes });

test("highlights the exact typed reason saved at the end of workflow activity notes", () => {
  const result = splitCrmActivityNotes("Azione: Chiudi trattativa\nEsito: non interessato\nNota: agenzia pubblicitaria");
  assert.deepEqual(result, {
    operatorNote: "agenzia pubblicitaria",
    details: "Azione: Chiudi trattativa\nEsito: non interessato",
  });
});

test("keeps multiline notes intact and separates structured fields without duplication", () => {
  const result = splitCrmActivityNotes("Azione: Primo contatto\r\nCanale: email\r\nNota: Non è interessato.\r\nLavora con agenzie pubblicitarie.");
  assert.deepEqual(result, {
    operatorNote: "Non è interessato.\nLavora con agenzie pubblicitarie.",
    details: "Azione: Primo contatto\nCanale: email",
  });
});

test("does not fabricate a note when a workflow has only structured fields", () => {
  assert.deepEqual(splitCrmActivityNotes("Azione: Qualifica\nEsito: qualificato"), {
    operatorNote: null, details: "Azione: Qualifica\nEsito: qualificato",
  });
  assert.deepEqual(splitCrmActivityNotes(null), { operatorNote: null, details: null });
});

test("keeps legacy plain-text activity notes available as details", () => {
  assert.deepEqual(splitCrmActivityNotes("richiamare domani"), {
    operatorNote: null, details: "richiamare domani",
  });
});

test("collects all previous operator notes newest-first despite later automatic activity", () => {
  const notes = collectCrmOperatorNotes([
    entry("earlier", "2026-10-18T10:00:00.000Z", "Azione: Primo contatto\nNota: Ha chiesto preventivo", "Primo contatto"),
    entry("automatic", "2026-10-19T13:00:00.000Z", "Nuovo messaggio"),
    entry("lost", "2026-10-19T12:00:00.000Z", "Azione: Trattativa fallita\nNota: agenzia pubblicitaria"),
  ]);
  assert.deepEqual(notes.map((note) => ({ id: note.id, note: note.note })), [
    { id: "lost", note: "agenzia pubblicitaria" },
    { id: "earlier", note: "Ha chiesto preventivo" },
  ]);
});
