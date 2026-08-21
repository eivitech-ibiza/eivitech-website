import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMarketingTestPayload,
  buildResendBroadcastPayload,
  campaignContentMode,
  renderBroadcastHtml,
  renderBroadcastText,
  renderTestHtml,
  renderTestText,
  type MarketingCampaignForResend,
} from "./resendMarketing.js";

function campaign(html: string, editorJson?: Record<string, unknown>): MarketingCampaignForResend {
  return {
    id: "campaign-test",
    name: "Campaign test",
    subject: "Subject test",
    preview_text: "Preview test",
    html,
    editor_json: editorJson,
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

test("plain-text mode uses stored text and Resend merge tags", () => {
  const textCampaign = campaign("<p>stale html</p>", {
    content_mode: "text",
    text_content: "Ciao {{first_name}}\nEmail: {{email}}\nBaja: {{unsubscribe_url}}",
  });

  assert.equal(campaignContentMode(textCampaign), "text");
  const rendered = renderBroadcastText(textCampaign);
  assert.match(rendered, /Ciao \{\{\{contact\.first_name\|there\}\}\}/);
  assert.match(rendered, /\{\{\{contact\.email\}\}\}/);
  assert.match(rendered, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
  assert.doesNotMatch(rendered, /<p>/);
});

test("plain-text test mode substitutes sample values and test unsubscribe target", () => {
  const textCampaign = campaign("", {
    content_mode: "text",
    text_content: "Ciao {{first_name}} {{last_name}}\n{{email}}\n{{unsubscribe_url}}",
  });

  const rendered = renderTestText(textCampaign, "luciano@example.com", {
    firstName: "Luciano",
    lastName: "Novello",
  });

  assert.match(rendered, /^EMAIL DI PROVA/);
  assert.match(rendered, /Luciano Novello/);
  assert.match(rendered, /luciano@example\.com/);
  assert.match(rendered, /#unsubscribe-test/);
});

test("plain-text broadcast payload contains text and clears stale HTML", () => {
  const textCampaign = campaign("<p>old html</p>", {
    content_mode: "text",
    text_content: "Ciao {{first_name}}\n{{unsubscribe_url}}",
  });

  const payload = buildResendBroadcastPayload(textCampaign, "segment-test");
  assert.equal(payload.html, "");
  assert.equal(typeof payload.text, "string");
  assert.match(payload.text, /RESEND_UNSUBSCRIBE_URL/);
});

test("HTML broadcast payload keeps HTML and adds a text alternative", () => {
  const htmlCampaign = campaign("<p>Ciao {{first_name}}</p><p>Test {{unsubscribe_url}}</p>", {
    content_mode: "html",
  });

  const payload = buildResendBroadcastPayload(htmlCampaign, "segment-test");
  assert.match(payload.html, /<!doctype html>/i);
  assert.match(payload.text, /Ciao/);
  assert.match(payload.text, /RESEND_UNSUBSCRIBE_URL/);
});

test("plain-text test payload does not include an HTML body", () => {
  const textCampaign = campaign("<p>old html</p>", {
    content_mode: "text",
    text_content: "Messaggio {{first_name}}",
  });

  const payload = buildMarketingTestPayload(textCampaign, "test@example.com") as Record<string, unknown>;
  assert.equal("html" in payload, false);
  assert.equal(typeof payload.text, "string");
});
