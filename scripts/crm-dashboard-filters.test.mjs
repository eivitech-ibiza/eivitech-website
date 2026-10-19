import assert from "node:assert/strict";
import test from "node:test";
import { filterCrmLeads, isCrmQualified } from "../src/lib/crmDashboardFilters.ts";

const leads = [
  { id: "a", status: "first_contact", priority: "alta", qualificationOutcome: "qualified" },
  { id: "b", status: "first_contact", priority: "media", qualificationOutcome: "incomplete" },
  { id: "c", status: "won", priority: "media", qualificationOutcome: "qualified" },
  { id: "d", status: "lost", priority: "baja", qualificationOutcome: null },
];

test("qualified means a recorded positive qualification, not any contacted lead", () => {
  assert.equal(isCrmQualified(leads[0]), true);
  assert.equal(isCrmQualified(leads[1]), false);
  assert.deepEqual(filterCrmLeads(leads, "qualified").map((lead) => lead.id), ["a", "c"]);
});

test("metric filters and pipeline status filters share one exact result set", () => {
  assert.deepEqual(filterCrmLeads(leads, "high").map((lead) => lead.id), ["a"]);
  assert.deepEqual(filterCrmLeads(leads, "won").map((lead) => lead.id), ["c"]);
  assert.deepEqual(filterCrmLeads(leads, "lost").map((lead) => lead.id), ["d"]);
  assert.deepEqual(filterCrmLeads(leads, "status:first_contact").map((lead) => lead.id), ["a", "b"]);
  assert.deepEqual(filterCrmLeads(leads, "all").map((lead) => lead.id), ["a", "b", "c", "d"]);
});

test("a partner approved metric filters on won status", () => {
  assert.deepEqual(filterCrmLeads(leads, "approved").map((lead) => lead.id), ["c"]);
});
