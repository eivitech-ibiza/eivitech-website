export const MARKETING_TIME_ZONE = "Europe/Madrid" as const;
export const MAX_SCHEDULE_AHEAD_MS = 30 * 24 * 60 * 60 * 1000;

export type MarketingDeliveryMode = "now" | "scheduled";
export type ScheduledCampaignLocalStatus = "draft" | "scheduled" | "sending" | "sent" | "cancelled" | "failed";

export class MarketingScheduleError extends Error {
  code: "INVALID_LOCAL_DATETIME" | "NONEXISTENT_LOCAL_TIME" | "AMBIGUOUS_LOCAL_TIME" | "SCHEDULE_IN_PAST" | "SCHEDULE_TOO_FAR";
  status: number;

  constructor(
    code: MarketingScheduleError["code"],
    message: string,
    status = 400,
  ) {
    super(message);
    this.name = "MarketingScheduleError";
    this.code = code;
    this.status = status;
  }
}

type WallClockParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const madridFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: MARKETING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function wallClockPartsAt(date: Date): WallClockParts {
  const formatted = madridFormatter.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => {
    const part = formatted.find((candidate) => candidate.type === type)?.value;
    return part ? Number(part) : Number.NaN;
  };

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

function sameWallClock(left: WallClockParts, right: WallClockParts) {
  return left.year === right.year
    && left.month === right.month
    && left.day === right.day
    && left.hour === right.hour
    && left.minute === right.minute
    && left.second === right.second;
}

function parseLocalDateTime(value: string): WallClockParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) {
    throw new MarketingScheduleError(
      "INVALID_LOCAL_DATETIME",
      "Inserisci una data e un'ora valide nel formato locale di Europe/Madrid.",
    );
  }

  const parts: WallClockParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] || 0),
  };
  const normalized = new Date(Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  ));

  if (
    normalized.getUTCFullYear() !== parts.year
    || normalized.getUTCMonth() + 1 !== parts.month
    || normalized.getUTCDate() !== parts.day
    || normalized.getUTCHours() !== parts.hour
    || normalized.getUTCMinutes() !== parts.minute
    || normalized.getUTCSeconds() !== parts.second
  ) {
    throw new MarketingScheduleError(
      "INVALID_LOCAL_DATETIME",
      "La data o l'ora selezionata non è valida.",
    );
  }

  return parts;
}

export function localMadridDateTimeToUtc(value: string) {
  const target = parseLocalDateTime(value);
  const naiveUtc = Date.UTC(
    target.year,
    target.month - 1,
    target.day,
    target.hour,
    target.minute,
    target.second,
  );
  const matches: number[] = [];

  for (
    let candidate = naiveUtc - 4 * 60 * 60 * 1000;
    candidate <= naiveUtc + 4 * 60 * 60 * 1000;
    candidate += 60 * 1000
  ) {
    if (sameWallClock(wallClockPartsAt(new Date(candidate)), target)) {
      matches.push(candidate);
    }
  }

  if (matches.length === 0) {
    throw new MarketingScheduleError(
      "NONEXISTENT_LOCAL_TIME",
      "L'ora selezionata non esiste in Europe/Madrid per il passaggio all'ora legale. Scegli un altro orario.",
    );
  }
  if (matches.length > 1) {
    throw new MarketingScheduleError(
      "AMBIGUOUS_LOCAL_TIME",
      "L'ora selezionata è ambigua in Europe/Madrid per il ritorno all'ora solare. Scegli un altro orario.",
    );
  }

  return new Date(matches[0]).toISOString();
}

export function validateScheduledInstant(value: string, now = new Date()) {
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) {
    throw new MarketingScheduleError(
      "INVALID_LOCAL_DATETIME",
      "La data programmata non è valida.",
    );
  }
  if (instant.getTime() <= now.getTime()) {
    throw new MarketingScheduleError(
      "SCHEDULE_IN_PAST",
      "La data e l'ora programmate devono essere nel futuro.",
    );
  }
  if (instant.getTime() > now.getTime() + MAX_SCHEDULE_AHEAD_MS) {
    throw new MarketingScheduleError(
      "SCHEDULE_TOO_FAR",
      "Resend consente di programmare un Broadcast fino a 30 giorni prima dell'invio.",
    );
  }
  return instant.toISOString();
}

export function confirmationPhraseForDelivery(mode: MarketingDeliveryMode, recipientCount: number) {
  return mode === "scheduled"
    ? `PROGRAMMA ${recipientCount} EMAIL`
    : `INVIA ${recipientCount} EMAIL`;
}

export function mapResendBroadcastState(providerStatus: string, _mode: MarketingDeliveryMode): {
  localStatus: ScheduledCampaignLocalStatus;
  accepted: boolean;
  completed: boolean;
} {
  switch (providerStatus.toLowerCase()) {
    case "scheduled":
      return { localStatus: "scheduled", accepted: true, completed: false };
    case "queued":
      return { localStatus: "sending", accepted: true, completed: false };
    case "sent":
      return { localStatus: "sent", accepted: true, completed: true };
    case "canceled":
    case "cancelled":
      return { localStatus: "cancelled", accepted: true, completed: true };
    case "draft":
      return { localStatus: "draft", accepted: false, completed: false };
    default:
      return { localStatus: "failed", accepted: false, completed: false };
  }
}
