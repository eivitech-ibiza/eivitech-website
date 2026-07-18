# Eivitech CRM API

Backend API for the Eivitech CRM funnel.

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
