export const MARKETING_TIME_ZONE = "Europe/Madrid";
export const MARKETING_MAX_SCHEDULE_AHEAD_MS = 30 * 24 * 60 * 60 * 1000;
export const MARKETING_MIN_SCHEDULE_LEAD_MS = 60 * 1000;

export type MarketingScheduleErrorCode =
  | "INVALID_LOCAL_DATE_TIME"
  | "NONEXISTENT_LOCAL_TIME"
  | "AMBIGUOUS_LOCAL_TIME"
  | "PAST_SCHEDULE"
  | "SCHEDULE_TOO_SOON"
  | "SCHEDULE_TOO_FAR";

export class MarketingScheduleError extends Error {
  code: MarketingScheduleErrorCode;

  constructor(code: MarketingScheduleErrorCode, message: string) {
    super(message);
    this.name = "MarketingScheduleError";
    this.code = code;
  }
}

type LocalParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

const madridFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: MARKETING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function parseLocalDateTime(value: string): LocalParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new MarketingScheduleError(
      "INVALID_LOCAL_DATE_TIME",
      "Use a valid date and time in Europe/Madrid.",
    );
  }

  const parts: LocalParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };

  const nominal = new Date(Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  ));

  if (
    nominal.getUTCFullYear() !== parts.year
    || nominal.getUTCMonth() + 1 !== parts.month
    || nominal.getUTCDate() !== parts.day
    || nominal.getUTCHours() !== parts.hour
    || nominal.getUTCMinutes() !== parts.minute
  ) {
    throw new MarketingScheduleError(
      "INVALID_LOCAL_DATE_TIME",
      "Use a valid calendar date and time in Europe/Madrid.",
    );
  }

  return parts;
}

function partsInMadrid(date: Date): LocalParts {
  const values = Object.fromEntries(
    madridFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
}

function sameParts(left: LocalParts, right: LocalParts) {
  return left.year === right.year
    && left.month === right.month
    && left.day === right.day
    && left.hour === right.hour
    && left.minute === right.minute;
}

export function resolveMadridLocalDateTime(
  localDateTime: string,
  now: Date = new Date(),
) {
  const target = parseLocalDateTime(localDateTime);
  const nominalUtc = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hour,
    target.minute,
  );

  const matches = new Map<number, Date>();
  for (let offsetMinutes = -180; offsetMinutes <= 180; offsetMinutes += 15) {
    const candidate = new Date(nominalUtc - offsetMinutes * 60_000);
    if (sameParts(partsInMadrid(candidate), target)) {
      matches.set(candidate.getTime(), candidate);
    }
  }

  const candidates = [...matches.values()].sort((a, b) => a.getTime() - b.getTime());

  if (candidates.length === 0) {
    throw new MarketingScheduleError(
      "NONEXISTENT_LOCAL_TIME",
      "This time does not exist in Europe/Madrid because of the daylight-saving time change.",
    );
  }

  if (candidates.length > 1) {
    throw new MarketingScheduleError(
      "AMBIGUOUS_LOCAL_TIME",
      "This time occurs twice in Europe/Madrid because of the daylight-saving time change. Choose another time.",
    );
  }

  const scheduled = candidates[0];
  const delay = scheduled.getTime() - now.getTime();

  if (delay <= 0) {
    throw new MarketingScheduleError(
      "PAST_SCHEDULE",
      "The scheduled date and time must be in the future.",
    );
  }

  if (delay < MARKETING_MIN_SCHEDULE_LEAD_MS) {
    throw new MarketingScheduleError(
      "SCHEDULE_TOO_SOON",
      "Schedule the campaign at least one minute in the future.",
    );
  }

  if (delay > MARKETING_MAX_SCHEDULE_AHEAD_MS) {
    throw new MarketingScheduleError(
      "SCHEDULE_TOO_FAR",
      "Resend Broadcasts can be scheduled up to 30 days in advance.",
    );
  }

  return {
    utcIso: scheduled.toISOString(),
    localDateTime,
    timeZone: MARKETING_TIME_ZONE,
  };
}
