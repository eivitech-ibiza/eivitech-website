export type MarketingApiErrorPayload = {
  error?: unknown;
  code?: unknown;
  reason?: unknown;
  prepared_count?: unknown;
  current_eligible_count?: unknown;
  resend_active_count?: unknown;
};

export class MarketingApiError extends Error {
  readonly status: number;
  readonly payload: MarketingApiErrorPayload | null;

  constructor(
    status: number,
    message: string,
    payload: MarketingApiErrorPayload | null
  ) {
    super(message);
    this.name = "MarketingApiError";
    this.status = status;
    this.payload = payload;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseMarketingApiError(status: number, rawBody: string) {
  let payload: MarketingApiErrorPayload | null = null;

  try {
    const parsed = JSON.parse(rawBody);
    if (isRecord(parsed)) {
      payload = parsed;
    }
  } catch {
    payload = null;
  }

  const payloadMessage =
    payload && typeof payload.error === "string"
      ? payload.error.trim()
      : "";

  return new MarketingApiError(
    status,
    payloadMessage || rawBody.trim() || "Email marketing request failed",
    payload
  );
}

export type AudienceChangedAfterPrepareDetails = {
  reason: "audience_changed" | "segment_not_synced";
  preparedCount: number;
  currentEligibleCount: number;
  resendActiveCount: number;
};

function safeCount(value: unknown) {
  const count =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : 0;

  return Number.isFinite(count) && count >= 0
    ? Math.trunc(count)
    : 0;
}

export function getAudienceChangedAfterPrepareDetails(
  error: unknown
): AudienceChangedAfterPrepareDetails | null {
  if (!(error instanceof MarketingApiError)) return null;

  const payload = error.payload;

  if (
    !payload ||
    payload.code !== "AUDIENCE_CHANGED_AFTER_PREPARE"
  ) {
    return null;
  }

  return {
    reason:
      payload.reason === "segment_not_synced"
        ? "segment_not_synced"
        : "audience_changed",
    preparedCount: safeCount(payload.prepared_count),
    currentEligibleCount: safeCount(payload.current_eligible_count),
    resendActiveCount: safeCount(payload.resend_active_count),
  };
}
