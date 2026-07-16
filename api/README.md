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

Dual Resend notification variables:

- `RESEND_OWNER_API_KEY`
- `RESEND_OWNER_FROM`
- `RESEND_OWNER_TO`
- `RESEND_LUCIANO_API_KEY`
- `RESEND_LUCIANO_FROM`
- `RESEND_LUCIANO_TO`

Each API key sends one separate notification. By default:

- owner channel → `info@eivitech.com`
- Luciano channel → `lncoachmrc@gmail.com`

The sender configured in each `*_FROM` variable must be verified inside the Resend account that owns the corresponding API key.

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
2. the owner Resend account sends a notification to `info@eivitech.com`;
3. Luciano's Resend account sends a separate notification to `lncoachmrc@gmail.com`;
4. each result is stored independently in `crm_email_notifications`;
5. one failed channel does not block the other channel or delete the lead.

## Security note

Do not call PostgreSQL or Resend directly from GitHub Pages. The frontend must call this API, and this API must be the only layer that uses `DATABASE_URL`, `CLERK_SECRET_KEY`, and the Resend API keys.
