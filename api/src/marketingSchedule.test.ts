import assert from "node:assert/strict";
import test from "node:test";
import {
  MarketingScheduleError,
  confirmationPhraseForDelivery,
  localMadridDateTimeToUtc,
  mapResendBroadcastState,
  validateScheduledInstant,
} from "./marketingSchedule.js";

test("converts a winter Europe/Madrid wall time to UTC", () => {
  assert.equal(
    localMadridDateTimeToUtc("2026-01-15T10:30"),
    "2026-01-15T09:30:00.000Z",
  );
});

test("converts a summer Europe/Madrid wall time to UTC", () => {
  assert.equal(
    localMadridDateTimeToUtc("2026-07-15T10:30"),
    "2026-07-15T08:30:00.000Z",
  );
});

test("rejects a nonexistent Europe/Madrid wall time during the spring DST jump", () => {
  assert.throws(
    () => localMadridDateTimeToUtc("2026-03-29T02:30"),
    (error: unknown) => error instanceof MarketingScheduleError
      && error.code === "NONEXISTENT_LOCAL_TIME",
  );
});

test("rejects an ambiguous Europe/Madrid wall time during the autumn DST fallback", () => {
  assert.throws(
    () => localMadridDateTimeToUtc("2026-10-25T02:30"),
    (error: unknown) => error instanceof MarketingScheduleError
      && error.code === "AMBIGUOUS_LOCAL_TIME",
  );
});

test("rejects scheduled instants in the past", () => {
  assert.throws(
    () => validateScheduledInstant(
      "2026-10-03T08:00:00.000Z",
      new Date("2026-10-03T09:00:00.000Z"),
    ),
    (error: unknown) => error instanceof MarketingScheduleError
      && error.code === "SCHEDULE_IN_PAST",
  );
});

test("rejects scheduled instants more than 30 days ahead", () => {
  assert.throws(
    () => validateScheduledInstant(
      "2026-11-03T09:00:01.000Z",
      new Date("2026-10-03T09:00:00.000Z"),
    ),
    (error: unknown) => error instanceof MarketingScheduleError
      && error.code === "SCHEDULE_TOO_FAR",
  );
});

test("builds distinct one-time confirmation phrases", () => {
  assert.equal(confirmationPhraseForDelivery("now", 12), "INVIA 12 EMAIL");
  assert.equal(confirmationPhraseForDelivery("scheduled", 12), "PROGRAMMA 12 EMAIL");
});

test("maps provider states without claiming delivery before it happened", () => {
  assert.deepEqual(mapResendBroadcastState("scheduled", "scheduled"), {
    localStatus: "scheduled",
    accepted: true,
    completed: false,
  });
  assert.deepEqual(mapResendBroadcastState("queued", "now"), {
    localStatus: "sending",
    accepted: true,
    completed: false,
  });
  assert.deepEqual(mapResendBroadcastState("sent", "now"), {
    localStatus: "sent",
    accepted: true,
    completed: true,
  });
  assert.deepEqual(mapResendBroadcastState("canceled", "scheduled"), {
    localStatus: "cancelled",
    accepted: true,
    completed: true,
  });
  assert.deepEqual(mapResendBroadcastState("draft", "scheduled"), {
    localStatus: "draft",
    accepted: false,
    completed: false,
  });
});
