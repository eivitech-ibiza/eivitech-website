import assert from "node:assert/strict";
import test from "node:test";
import {
  MarketingScheduleError,
  resolveMadridLocalDateTime,
} from "./marketingSchedule.js";

test("resolves a summer Europe/Madrid local time to UTC", () => {
  const result = resolveMadridLocalDateTime(
    "2026-10-03T18:30",
    new Date("2026-10-03T12:00:00.000Z"),
  );

  assert.equal(result.utcIso, "2026-10-03T16:30:00.000Z");
  assert.equal(result.timeZone, "Europe/Madrid");
});

test("resolves a winter Europe/Madrid local time to UTC", () => {
  const result = resolveMadridLocalDateTime(
    "2026-12-03T18:30",
    new Date("2026-12-03T12:00:00.000Z"),
  );

  assert.equal(result.utcIso, "2026-12-03T17:30:00.000Z");
});

test("rejects the nonexistent spring-forward hour", () => {
  assert.throws(
    () => resolveMadridLocalDateTime(
      "2026-03-29T02:30",
      new Date("2026-03-28T12:00:00.000Z"),
    ),
    (error) => error instanceof MarketingScheduleError
      && error.code === "NONEXISTENT_LOCAL_TIME",
  );
});

test("rejects the ambiguous fall-back hour", () => {
  assert.throws(
    () => resolveMadridLocalDateTime(
      "2026-10-25T02:30",
      new Date("2026-10-24T12:00:00.000Z"),
    ),
    (error) => error instanceof MarketingScheduleError
      && error.code === "AMBIGUOUS_LOCAL_TIME",
  );
});

test("rejects past schedules", () => {
  assert.throws(
    () => resolveMadridLocalDateTime(
      "2026-10-03T12:00",
      new Date("2026-10-03T12:00:00.000Z"),
    ),
    (error) => error instanceof MarketingScheduleError
      && error.code === "PAST_SCHEDULE",
  );
});

test("rejects schedules beyond 30 days", () => {
  assert.throws(
    () => resolveMadridLocalDateTime(
      "2026-11-15T12:00",
      new Date("2026-10-03T10:00:00.000Z"),
    ),
    (error) => error instanceof MarketingScheduleError
      && error.code === "SCHEDULE_TOO_FAR",
  );
});
