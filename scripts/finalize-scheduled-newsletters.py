from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file_path = Path(path)
    source = file_path.read_text(encoding="utf-8")
    count = source.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one match in {path}, found {count}: {old[:120]!r}")
    file_path.write_text(source.replace(old, new, 1), encoding="utf-8")
    print(f"updated {path}")


# The campaign audit table uses created_by; actor_id is not a real column.
replace_once(
    "api/src/marketingCampaignDelivery.ts",
    "(campaign_id, event_type, actor_id, payload)",
    "(campaign_id, event_type, created_by, payload)",
)

# Resend's Broadcast documentation does not establish the transactional-email
# 30-day scheduling limit. Keep only validity and future-instant validation.
replace_once(
    "api/src/marketingSchedule.ts",
    'export const MAX_SCHEDULE_AHEAD_MS = 30 * 24 * 60 * 60 * 1000;\n',
    "",
)
replace_once(
    "api/src/marketingSchedule.ts",
    '  code: "INVALID_LOCAL_DATETIME" | "NONEXISTENT_LOCAL_TIME" | "AMBIGUOUS_LOCAL_TIME" | "SCHEDULE_IN_PAST" | "SCHEDULE_TOO_FAR";\n',
    '  code: "INVALID_LOCAL_DATETIME" | "NONEXISTENT_LOCAL_TIME" | "AMBIGUOUS_LOCAL_TIME" | "SCHEDULE_IN_PAST";\n',
)
replace_once(
    "api/src/marketingSchedule.ts",
    '''  if (instant.getTime() > now.getTime() + MAX_SCHEDULE_AHEAD_MS) {
    throw new MarketingScheduleError(
      "SCHEDULE_TOO_FAR",
      "Resend consente di programmare un Broadcast fino a 30 giorni prima dell'invio.",
    );
  }
''',
    "",
)
replace_once(
    "api/src/marketingSchedule.test.ts",
    '''test("rejects scheduled instants more than 30 days ahead", () => {
  assert.throws(
    () => validateScheduledInstant(
      "2026-11-03T09:00:01.000Z",
      new Date("2026-10-03T09:00:00.000Z"),
    ),
    (error: unknown) => error instanceof MarketingScheduleError
      && error.code === "SCHEDULE_TOO_FAR",
  );
});
''',
    '''test("accepts valid future Broadcast instants without applying a transactional-email limit", () => {
  assert.equal(
    validateScheduledInstant(
      "2027-01-03T09:00:00.000Z",
      new Date("2026-10-03T09:00:00.000Z"),
    ),
    "2027-01-03T09:00:00.000Z",
  );
});
''',
)

# Static regression guards now follow the dedicated delivery module instead of
# requiring the old monolithic marketing router layout.
replace_once(
    "scripts/email-marketing-foundation.test.mjs",
    '  const marketing = read("api/src/marketing.ts");\n',
    '  const marketing = read("api/src/marketing.ts");\n  const delivery = read("api/src/marketingCampaignDelivery.ts");\n',
)
replace_once(
    "scripts/email-marketing-foundation.test.mjs",
    '''  assert.match(marketing, /marketingRouter\\.post\\("\\/campaigns\\/:id\\/send"/);
  assert.match(marketing, /MARKETING_BULK_SEND_ENABLED/);
  assert.match(marketing, /send_confirmation_token_hash/);
  assert.match(marketing, /send_confirmation_expires_at > now\\(\\)/);
''',
    '''  assert.match(delivery, /marketingCampaignDeliveryRouter\\.post\\("\\/campaigns\\/:id\\/send"/);
  assert.match(delivery, /MARKETING_BULK_SEND_ENABLED/);
  assert.match(delivery, /send_confirmation_token_hash/);
  assert.match(delivery, /send_confirmation_expires_at > now\\(\\)/);
''',
)

replace_once(
    "scripts/email-marketing-safe-send.test.mjs",
    'const marketing = readFileSync("api/src/marketing.ts", "utf8");\n',
    'const marketing = readFileSync("api/src/marketing.ts", "utf8");\nconst delivery = readFileSync("api/src/marketingCampaignDelivery.ts", "utf8");\nconst schedule = readFileSync("api/src/marketingSchedule.ts", "utf8");\n',
)
replace_once(
    "scripts/email-marketing-safe-send.test.mjs",
    'const workspace = readFileSync("src/components/marketing/CampaignWorkspace.tsx", "utf8");\n',
    'const workspace = readFileSync("src/components/marketing/CampaignWorkspace.tsx", "utf8");\nconst confirmationDialog = readFileSync("src/components/marketing/CampaignConfirmationDialog.tsx", "utf8");\n',
)
replace_once(
    "scripts/email-marketing-safe-send.test.mjs",
    '''  assert.match(marketing, /MARKETING_BULK_SEND_ENABLED/);
  assert.match(marketing, /send_confirmation_token_hash/);
  assert.match(marketing, /send_confirmation_expires_at > now\\(\\)/);
  assert.match(marketing, /INVIA \\$\\{campaign\\.recipient_count\\} EMAIL/);
  assert.match(marketing, /Only draft campaigns can be prepared/);
''',
    '''  assert.match(delivery, /MARKETING_BULK_SEND_ENABLED/);
  assert.match(delivery, /send_confirmation_token_hash/);
  assert.match(delivery, /send_confirmation_expires_at > now\\(\\)/);
  assert.match(delivery, /parsed\\.data\\.confirmation_phrase !== expectedPhrase/);
  assert.match(schedule, /INVIA \\$\\{recipientCount\\} EMAIL/);
  assert.match(schedule, /PROGRAMMA \\$\\{recipientCount\\} EMAIL/);
  assert.match(marketing, /Only draft campaigns can be prepared/);
''',
)
replace_once(
    "scripts/email-marketing-safe-send.test.mjs",
    '''  assert.match(workspace, /reviewConfirmed/);
  assert.match(workspace, /confirmationPhrase !== preparation\\.data\\.confirmation_phrase/);
  assert.match(workspace, /bulk_send_enabled/);
''',
    '''  assert.match(confirmationDialog, /reviewConfirmed/);
  assert.match(confirmationDialog, /confirmationPhrase !== preparation\\.data\\.confirmation_phrase/);
  assert.match(confirmationDialog, /bulk_send_enabled/);
''',
)

Path("api/src/marketingSchedulingIntegration.test.ts").write_text(
    '''import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("scheduled campaigns reserve their Resend audience pool until completion or cancellation", () => {
  const marketing = readFileSync(new URL("./marketing.ts", import.meta.url), "utf8");
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(marketing, /c\\.status IN \\('scheduled', 'sending', 'paused'\\)/);
  assert.match(delivery, /sendResendBroadcast\\(broadcastId, isoString\\(campaign\\.scheduled_at\\)\\)/);
  assert.match(delivery, /campaigns\\/:id\\/cancel/);
});

test("accepted Broadcast operations are not reported as delivered messages", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.doesNotMatch(
    delivery,
    /sendResendBroadcast\\([\\s\\S]{0,300}SET status = 'sent', sent_at = now\\(\\)/,
  );
  assert.match(delivery, /provider_status/);
  assert.match(delivery, /outcomeUncertain/);
});

test("campaign-list reconciliation is delayed to avoid racing a provider acceptance request", () => {
  const source = readFileSync(new URL("./campaignMetrics.ts", import.meta.url), "utf8");
  assert.match(source, /updated_at <= now\\(\\) - interval '30 seconds'/);
  assert.match(source, /scheduled_at <= now\\(\\) \\+ interval '5 minutes'/);
});

test("delivery audit events use the existing created_by database column", () => {
  const delivery = readFileSync(new URL("./marketingCampaignDelivery.ts", import.meta.url), "utf8");
  assert.match(delivery, /campaign_id, event_type, created_by, payload/);
  assert.doesNotMatch(delivery, /campaign_id, event_type, actor_id, payload/);
});
''',
    encoding="utf-8",
)
print("updated api/src/marketingSchedulingIntegration.test.ts")
