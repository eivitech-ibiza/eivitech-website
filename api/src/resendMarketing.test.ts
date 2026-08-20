import assert from "node:assert/strict";
import test from "node:test";
import {
  renderBroadcastHtml,
  renderTestHtml,
  type MarketingCampaignForResend,
} from "./resendMarketing.js";

function campaign(html: string): MarketingCampaignForResend {
  return {
    id: "campaign-test",
    name: "Campaign test",
    subject: "Subject test",
    preview_text: "Preview test",
    html,
  };
}

function countMatches(value: string, pattern: RegExp) {
  return [...value.matchAll(pattern)].length;
}

test("full HTML documents are preserved as a single document for broadcasts", () => {
  const source = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><title>Eivitech</title></head>
<body style="margin:0">
  <div style="display:none">Custom preheader</div>
  <p>Hello</p>
  <a href="{{unsubscribe_url}}">darse de baja aquí</a>
</body>
</html>`;

  const rendered = renderBroadcastHtml(campaign(source));

  assert.equal(countMatches(rendered, /<!doctype\s+html\b/gi), 1);
  assert.equal(countMatches(rendered, /<html\b/gi), 1);
  assert.equal(countMatches(rendered, /<body\b/gi), 1);
  assert.equal(countMatches(rendered, /<\/body>/gi), 1);
  assert.match(rendered, /href="\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}"/);
  assert.equal(countMatches(rendered, /Custom preheader/g), 1);
  assert.doesNotMatch(rendered, /Ricevi questa email perché hai fornito un consenso marketing documentato/);
});

test("full HTML test emails insert the test banner inside the existing body", () => {
  const source = `<!doctype html><html><head><meta charset="utf-8"></head><body><p>Hello</p><a href="{{unsubscribe_url}}">unsubscribe</a></body></html>`;

  const rendered = renderTestHtml(campaign(source), "test@example.com");

  assert.equal(countMatches(rendered, /<!doctype\s+html\b/gi), 1);
  assert.equal(countMatches(rendered, /<html\b/gi), 1);
  assert.equal(countMatches(rendered, /<body\b/gi), 1);
  assert.match(rendered, /<body>.*EMAIL DI PROVA — nessuna campagna è stata inviata.*<p>Hello<\/p>/s);
  assert.match(rendered, /href="#unsubscribe-test"/);
});

test("HTML fragments still receive the standard wrapper and fallback unsubscribe footer", () => {
  const rendered = renderBroadcastHtml(campaign("<p>Hello fragment</p>"));

  assert.equal(countMatches(rendered, /<!doctype\s+html\b/gi), 1);
  assert.equal(countMatches(rendered, /<html\b/gi), 1);
  assert.equal(countMatches(rendered, /<body\b/gi), 1);
  assert.match(rendered, /Preview test/);
  assert.match(rendered, /Hello fragment/);
  assert.match(rendered, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
});
