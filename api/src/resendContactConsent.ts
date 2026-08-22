const RESEND_API = "https://api.resend.com";

function marketingAdminApiKey() {
  return process.env.RESEND_MARKETING_API_KEY?.trim() || null;
}

export async function resubscribeResendMarketingContact(contactIdOrEmail: string) {
  const apiKey = marketingAdminApiKey();
  if (!apiKey) return { synced: false as const, reason: "not_configured" as const };

  const response = await fetch(`${RESEND_API}/contacts/${encodeURIComponent(contactIdOrEmail)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ unsubscribed: false }),
  });

  const responseText = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(`Resend resubscribe failed (${response.status}): ${responseText}`);
  }

  return { synced: true as const };
}
