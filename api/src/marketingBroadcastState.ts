export type MarketingCampaignRuntimeStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "paused"
  | "cancelled"
  | "failed";

export function localStatusFromResendBroadcast(
  providerStatus: string | null | undefined,
  currentStatus: MarketingCampaignRuntimeStatus,
): MarketingCampaignRuntimeStatus | null {
  switch ((providerStatus || "").trim().toLowerCase()) {
    case "scheduled":
      return "scheduled";
    case "queued":
    case "sending":
      return "sending";
    case "sent":
      return "sent";
    case "canceled":
    case "cancelled":
      return "cancelled";
    case "failed":
      return "failed";
    case "draft":
      return currentStatus === "scheduled" ? "cancelled" : "draft";
    default:
      return null;
  }
}
