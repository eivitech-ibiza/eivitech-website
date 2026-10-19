import assert from "node:assert/strict";
import test from "node:test";
import { buildCrmClientSheetHtml, escapeCrmHtml } from "../src/lib/crmSheetPrint.ts";

test("CRM sheet escapes stored untrusted form input in its HTML output", () => {
  assert.equal(escapeCrmHtml('<script>alert("x")</script>'), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  const html = buildCrmClientSheetHtml({
    lead: {
      id: "one",
      nombre: '<img src=x onerror="alert(1)">',
      email: "safe@example.com",
      status: "first_contact",
      priority: "media",
    },
    activities: [{
      id: "note",
      type: "note",
      title: "First contact",
      notes: "<script>alert(1)</script>",
      due_at: null,
      completed_at: null,
      created_at: "2026-10-19T12:00:00.000Z",
    }],
    outcomes: [{
      id: "outcome",
      action_key: "qualify",
      outcome: "qualified",
      milestone_key: "qualified",
      metadata: { budget: '<iframe src="evil">' },
      occurred_at: "2026-10-19T12:00:00.000Z",
    }],
  }, "https://eivitech.com/media/brand/eivitech-logo.svg");

  assert.ok(html.includes("EIVITECH") || html.includes("Eivitech"));
  assert.ok(html.includes("Scheda cliente"));
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(html.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.ok(html.includes("&lt;iframe src=&quot;evil&quot;&gt;"));
  assert.equal(html.includes("<script>alert(1)</script>"), false);
  assert.ok(html.includes('class="toolbar"'));
  assert.ok(html.includes("@page { size: A4;"));
});
