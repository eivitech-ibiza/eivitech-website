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

The sender configured in each `*_FROM` variable must be verified inside the Resend account that owns the corresponding API key. The two internal channels may use separate Resend accounts or the same verified account and sender domain.

Requester confirmation variables:

- `RESEND_REQUESTER_FROM` (optional; defaults to `RESEND_OWNER_FROM`)
- `RESEND_REQUESTER_REPLY_TO` (optional; defaults to `RESEND_OWNER_TO`)
- `PUBLIC_SITE_URL` (optional; defaults to `https://www.eivitech.com`)

The confirmation sent to the person who completes the form reuses `RESEND_OWNER_API_KEY`; no third API key is required.

Webhook variables reserved for delivery tracking:

- `RESEND_OWNER_WEBHOOK_SECRET`
- `RESEND_LUCIANO_WEBHOOK_SECRET`

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
6. the confirmation language follows the landing-page prefix (`/it`, `/es`, or `/en`) and defaults to Italian;
7. each result is stored independently in `crm_email_notifications` with account keys `owner`, `luciano`, and `requester`;
8. one failed email does not block the other emails or delete the lead.

## Security note

Do not call PostgreSQL or Resend directly from GitHub Pages. The frontend must call this API, and this API must be the only layer that uses `DATABASE_URL`, `CLERK_SECRET_KEY`, and the Resend API keys.
