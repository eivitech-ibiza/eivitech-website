import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../src/components/marketing/CampaignWorkspace.tsx", import.meta.url),
  "utf8"
);

test("campaign workspace offers audience refresh instead of forcing campaign recreation", () => {
  assert.match(source, /getAudienceChangedAfterPrepareDetails/);
  assert.match(source, /refreshAudienceAndPrepare/);
  assert.match(source, /Sincronizza e aggiorna destinatari/);
  assert.match(source, /prepareMarketingCampaign/);
});
