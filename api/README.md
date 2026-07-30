# Eivitech CRM API

Backend API for the Eivitech CRM funnel and the integrated email marketing workspace.

## Railway deployment

Deploy this folder as an isolated service from the repository.

Railway service settings:

- Root Directory: `api`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

Required variables:

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `BOOTSTRAP_ADMIN_EMAILS`
- `ALLOWED_ORIGIN`

Internal Resend notification variables:

- `RESEND_OWNER_API_KEY`
- `RESEND_OWNER_FROM`
- `RESEND_OWNER_TO`
- `RESEND_LUCIANO_API_KEY`
- `RESEND_LUCIANO_FROM`
- `RESEND_LUCIANO_TO`

By default:

- owner channel → `info@eivitech.com`
- Luciano channel → `lncoachmrc@gmail.com`

The sender configured in each `*_FROM` variable must be verified inside the Resend account that owns the matching API key. The two internal channels may use separate Resend accounts or the same verified account and sender domain.

Requester confirmation variables:

- `RESEND_REQUESTER_FROM` (optional; defaults to `RESEND_OWNER_FROM`)
- `RESEND_REQUESTER_REPLY_TO` (optional; defaults to `RESEND_OWNER_TO`)
- `RESEND_REQUESTER_TEMPLATE_IT_ID` (optional; defaults to the published Italian confirmation template)
- `PUBLIC_SITE_URL` (optional; defaults to `https://www.eivitech.com`)

The confirmation sent to the person who completes the form reuses `RESEND_OWNER_API_KEY`; no third API key is required.

Webhook variables for delivery tracking:

- `RESEND_OWNER_WEBHOOK_SECRET`
- `RESEND_LUCIANO_WEBHOOK_SECRET`

The owner Resend webhook should point to `https://ibiza-project-accelerator-production.up.railway.app/api/webhooks/resend/owner` and subscribe to sent, delivered, delayed, bounced, failed, complained, suppressed, and opened email events. The API verifies the Svix signature, stores events idempotently by `svix-id`, and updates `crm_email_notifications` with the real delivery state. A `200` response from the Resend send endpoint means the message was accepted for processing; final delivery, suppression, bounce, or failure is determined by these lifecycle events.

Optional variables:

- `RESEND_API_KEY` (legacy fallback for the owner channel)
- `LEAD_NOTIFICATION_FROM` (shared fallback sender)
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`
- `PGSSLMODE`

## Endpoints

Public:

- `GET /health`
- `GET /api/health`
- `POST /api/leads`
- `POST /api/webhooks/resend/owner` (signed Resend delivery events)

Protected by Clerk + CRM user authorization:

- `GET /api/leads`
- `GET /api/leads/:id`
- `PATCH /api/leads/:id`
- `POST /api/leads/:id/activities`
- `GET /api/dashboard/stats`

Protected by Clerk and restricted to `admin` or `manager` roles:

- `GET /api/marketing/stats`
- `GET /api/marketing/contacts`
- `POST /api/marketing/contacts`
- `PATCH /api/marketing/contacts/:id`
- `POST /api/marketing/contacts/import`
- `GET /api/marketing/segments`
- `POST /api/marketing/segments`
- `PATCH /api/marketing/segments/:id`
- `POST /api/marketing/segments/:id/members`
- `GET /api/marketing/campaigns`
- `POST /api/marketing/campaigns`
- `PATCH /api/marketing/campaigns/:id`

## Free email marketing foundation

The first phase uses only code already hosted in the Eivitech repository and the existing PostgreSQL database. It adds no paid dependency and requires no new external account.

Implemented in this phase:

- contact directory with consent, language, tags, status, suppression and unsubscribe token;
- CSV import compatible with common Mailchimp exports and the Digitalempower WordPress plugin columns;
- deduplication by email;
- consent event audit trail;
- segments and segment memberships;
- campaign drafts with HTML, language, sender data, topic and segment;
- a protected CRM workspace at `/dashboard/email-marketing`;
- safeguards that deliberately keep bulk sending disabled until unsubscribe handling, Resend marketing sync and a final send confirmation are implemented.

No lead is automatically subscribed to marketing. A contact becomes `subscribed` only when documented marketing consent is explicitly supplied.

Future sending can use the existing Resend free marketing tier, but the database and draft workflow are provider-independent. No marketing API key is required in this first phase.

## Notification behavior

When either the client form or the professional collaborator form creates a lead:

1. the lead is stored in PostgreSQL;
2. the owner channel sends an internal notification to `info@eivitech.com`;
3. the Luciano channel sends a separate internal notification to `lncoachmrc@gmail.com`;
4. the owner Resend account sends a confirmation to the email address entered in the form;
5. the confirmation contains the request reference, submission date, a summary of the submitted data, the website address, and a reply path to Eivitech;
6. the confirmation language follows the landing-page prefix/query language and defaults to Italian;
7. each send result is stored independently in `crm_email_notifications` with account keys `owner`, `luciano`, and `requester`;
8. Resend webhook lifecycle events update the real message state to `delivered`, `suppressed`, `bounced`, `failed`, `delayed`, or `complained`;
9. one failed or suppressed email does not block the other emails or delete the lead.

## Security note

Do not call PostgreSQL or Resend directly from GitHub Pages. The frontend must call this API, and this API must be the only layer that uses `DATABASE_URL`, `CLERK_SECRET_KEY`, and the Resend API keys.


## Email marketing safe-send workflow

The protected CRM workspace supports draft editing/deletion, sandboxed HTML preview, test sends, Resend segment/contact sync and a two-step campaign preparation flow.

Required only for Resend contact, segment and broadcast management:

- `RESEND_MARKETING_API_KEY` — a separate Resend key with Full access;
- `RESEND_MARKETING_FROM`;
- `RESEND_MARKETING_REPLY_TO`;
- `MARKETING_MAX_RECIPIENTS` — server-side recipient ceiling, default 100;
- `MARKETING_BULK_SEND_ENABLED=false` — must remain false until production verification is complete.

A real campaign can be sent only when all of the following are true:

1. the campaign is still a draft and has a segment;
2. every recipient is subscribed, has documented consent and is neither unsubscribed nor suppressed;
3. the segment and contacts have been synchronized with Resend;
4. the operator prepares the campaign and receives a one-time 10-minute token;
5. the operator checks the review checkbox and types the exact recipient-count phrase;
6. `MARKETING_BULK_SEND_ENABLED` is explicitly set to `true` on Railway.

Public unsubscribe API:

- `GET /api/marketing-public/unsubscribe/:token`
- `POST /api/marketing-public/unsubscribe/:token`

Public page:

- `/unsubscribe?token=<64-character-token>&lang=it|es|en|nl`
