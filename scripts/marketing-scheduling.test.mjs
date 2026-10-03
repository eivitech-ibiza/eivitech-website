import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("campaign workspace exposes immediate and Europe/Madrid scheduled delivery with cancellation", () => {
  const delivery = readFileSync("src/components/marketing/CampaignDeliveryDialog.tsx", "utf8");
  const confirmation = readFileSync("src/components/marketing/CampaignConfirmationDialog.tsx", "utf8");
  const workspace = readFileSync("src/components/marketing/CampaignWorkspace.tsx", "utf8");
  const client = readFileSync("src/lib/marketing.ts", "utf8");

  assert.match(delivery, /Invia subito/);
  assert.match(delivery, /Programma invio/);
  assert.match(delivery, /Europe\/Madrid/);
  assert.match(confirmation, /recipient_count/);
  assert.match(confirmation, /scheduled_at/);
  assert.match(workspace, /cancelMarketingCampaign/);
  assert.match(workspace, /\["scheduled", "sending"\]\.includes\(campaign\.status\)/);
  assert.match(workspace, /Annullamento in verifica/);
  assert.match(client, /campaigns\/\$\{campaignId\}\/cancel/);
});
