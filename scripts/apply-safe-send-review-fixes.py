#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, content: str) -> None:
    (ROOT / path).write_text(content, encoding="utf-8")


def replace_once(path: str, old: str, new: str) -> None:
    content = read(path)
    count = content.count(old)
    if count != 1:
        raise RuntimeError(f"Expected one occurrence in {path}, found {count}: {old[:100]!r}")
    write(path, content.replace(old, new, 1))


# PostgreSQL must not assign the same column twice in one UPDATE statement.
replace_once(
    "api/src/marketing.ts",
    '''       html = $12,
       scheduled_at = $13,
       status = 'draft',
       send_confirmation_token_hash = NULL,
''',
    '''       html = $12,
       scheduled_at = $13,
       send_confirmation_token_hash = NULL,
''',
)

# Existing Resend contacts must never be globally resubscribed by a routine sync.
replace_once(
    "api/src/resendMarketing.ts",
    '''  const payload = {
    first_name: contact.first_name || undefined,
    last_name: contact.last_name || undefined,
    unsubscribed: false,
  };

  if (contact.resend_contact_id) {
''',
    '''  const updatePayload = {
    first_name: contact.first_name || undefined,
    last_name: contact.last_name || undefined,
  };
  const createPayload = {
    ...updatePayload,
    unsubscribed: false,
  };

  if (contact.resend_contact_id) {
''',
)
replace_once("api/src/resendMarketing.ts", "      body: payload,\n", "      body: updatePayload,\n")
replace_once(
    "api/src/resendMarketing.ts",
    '''        email: contact.email,
        ...payload,
        segments: [{ id: segmentId }],
''',
    '''        email: contact.email,
        ...createPayload,
        segments: [{ id: segmentId }],
''',
)
# Replace the second existing-contact PATCH payload.
content = read("api/src/resendMarketing.ts")
needle = "      body: payload,\n"
if content.count(needle) != 1:
    raise RuntimeError(f"Expected one remaining existing-contact payload, found {content.count(needle)}")
content = content.replace(needle, "      body: updatePayload,\n", 1)
write("api/src/resendMarketing.ts", content)

list_function = r'''

export type ResendSegmentContact = {
  id: string;
  email: string;
  unsubscribed?: boolean;
};

export async function listResendSegmentContacts(segmentId: string) {
  const contacts: ResendSegmentContact[] = [];
  let after: string | null = null;

  do {
    const params = new URLSearchParams({ limit: "100" });
    if (after) params.set("after", after);
    const page = await resendRequest<{
      data?: ResendSegmentContact[];
      has_more?: boolean;
    }>(`/segments/${encodeURIComponent(segmentId)}/contacts?${params.toString()}`, {
      apiKey: adminKeyOrThrow(),
    });
    const rows = page.data || [];
    contacts.push(...rows);
    after = page.has_more && rows.length > 0 ? rows[rows.length - 1].id : null;
  } while (after);

  return contacts;
}
'''
replace_once(
    "api/src/resendMarketing.ts",
    '\nexport async function removeResendContactFromSegment(contactIdOrEmail: string, segmentId: string) {',
    list_function + '\nexport async function removeResendContactFromSegment(contactIdOrEmail: string, segmentId: string) {',
)

# Reconcile remote membership so a removed/local-terminal contact cannot remain in the send segment.
replace_once(
    "api/src/marketing.ts",
    '''  marketingCapabilities,
  sendMarketingTestEmail,
''',
    '''  marketingCapabilities,
  listResendSegmentContacts,
  removeResendContactFromSegment,
  sendMarketingTestEmail,
''',
)
replace_once(
    "api/src/marketing.ts",
    '''  let synced = 0;
  for (let index = 0; index < contacts.rows.length; index += 5) {
''',
    '''  const eligibleEmails = new Set(contacts.rows.map((contact) => contact.email.toLowerCase()));
  let synced = 0;
  for (let index = 0; index < contacts.rows.length; index += 5) {
''',
)
replace_once(
    "api/src/marketing.ts",
    '''  return { resendSegmentId, eligible: contacts.rows.length, synced };
}
''',
    '''  const remoteContacts = await listResendSegmentContacts(resendSegmentId);
  const staleContacts = remoteContacts.filter((contact) => !eligibleEmails.has(contact.email.toLowerCase()));
  let removed = 0;
  for (let index = 0; index < staleContacts.length; index += 5) {
    const batch = staleContacts.slice(index, index + 5);
    await Promise.all(batch.map((contact) => removeResendContactFromSegment(contact.id || contact.email, resendSegmentId)));
    removed += batch.length;
  }

  return { resendSegmentId, eligible: contacts.rows.length, synced, removed };
}
''',
)

# Match the richer sync response in the frontend client.
replace_once(
    "src/lib/marketing.ts",
    '  return marketingRequest<{ resendSegmentId: string; eligible: number; synced: number }>(`/segments/${segmentId}/sync-resend`, { method: "POST", token, body: {} });',
    '  return marketingRequest<{ resendSegmentId: string; eligible: number; synced: number; removed: number }>(`/segments/${segmentId}/sync-resend`, { method: "POST", token, body: {} });',
)

# Regression coverage for SQL correctness and exact remote membership.
test_path = "scripts/email-marketing-safe-send.test.mjs"
test = read(test_path)
test += r'''

test("draft updates assign status once and Resend sync removes stale members", () => {
  const patchRoute = marketing.match(/marketingRouter\.patch\("\/campaigns\/:id"[\s\S]*?marketingRouter\.post\("\/segments\/:id\/sync-resend"/)?.[0] || "";
  assert.equal((patchRoute.match(/\bstatus\s*=/g) || []).length, 1);
  assert.match(marketing, /listResendSegmentContacts/);
  assert.match(marketing, /removeResendContactFromSegment/);
  assert.match(marketing, /staleContacts/);
  assert.match(resend, /const updatePayload/);
  assert.match(resend, /const createPayload/);
  const existingUpdate = resend.match(/if \(contact\.resend_contact_id\)[\s\S]*?return updated\.id/)?.[0] || "";
  assert.doesNotMatch(existingUpdate, /unsubscribed:\s*false/);
});
'''
write(test_path, test)

readme = read("api/README.md")
readme += "\nResend segment synchronization is reconciliatory: contacts no longer eligible locally are removed from the remote segment, and routine updates never clear a global Resend opt-out.\n"
write("api/README.md", readme)

(ROOT / "scripts/apply-safe-send-review-fixes.py").unlink(missing_ok=True)
