import { query } from "./db.js";

const schemaSql = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS crm_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id text UNIQUE,
  email text UNIQUE NOT NULL,
  name text,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'first_contact', 'visit_review', 'proposal', 'follow_up', 'won', 'lost', 'review_portfolio')),
  priority text NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baja')),
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text NOT NULL,
  tipo_cliente text NOT NULL,
  tipo_propiedad text NOT NULL,
  zona text,
  intervencion text NOT NULL,
  tiene_fotos text NOT NULL,
  tiene_proyecto text NOT NULL,
  plazo text NOT NULL,
  presupuesto text,
  mensaje text,
  source text,
  landing_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  consent_privacy boolean NOT NULL DEFAULT false,
  assigned_to uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  next_action text,
  last_contact_at timestamptz,
  next_follow_up_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON crm_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_priority ON crm_leads(priority);
CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON crm_leads(email);

CREATE TABLE IF NOT EXISTS crm_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'call', 'whatsapp', 'email', 'visit', 'proposal', 'follow_up', 'status_change', 'automation')),
  title text NOT NULL,
  notes text,
  due_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_lead_id ON crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_due_at ON crm_activities(due_at);

CREATE TABLE IF NOT EXISTS crm_automation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES crm_leads(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  provider text NOT NULL DEFAULT 'api',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  error_message text
);

ALTER TABLE crm_automation_events
  DROP CONSTRAINT IF EXISTS crm_automation_events_status_check;

ALTER TABLE crm_automation_events
  ADD CONSTRAINT crm_automation_events_status_check
  CHECK (status IN ('pending', 'sent', 'failed', 'skipped'));

CREATE INDEX IF NOT EXISTS idx_crm_automation_events_lead_id ON crm_automation_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_automation_events_status ON crm_automation_events(status);

CREATE TABLE IF NOT EXISTS crm_email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  account_key text NOT NULL,
  recipient text NOT NULL,
  from_address text NOT NULL,
  resend_email_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed', 'delayed', 'complained', 'suppressed', 'skipped')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  bounced_at timestamptz,
  failed_at timestamptz,
  delayed_at timestamptz,
  complained_at timestamptz,
  last_event_at timestamptz,
  error_message text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (lead_id, account_key)
);

CREATE INDEX IF NOT EXISTS idx_crm_email_notifications_lead_id
  ON crm_email_notifications(lead_id);

CREATE INDEX IF NOT EXISTS idx_crm_email_notifications_status
  ON crm_email_notifications(status);

CREATE INDEX IF NOT EXISTS idx_crm_email_notifications_resend_email_id
  ON crm_email_notifications(resend_email_id);

CREATE TABLE IF NOT EXISTS crm_resend_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  svix_id text UNIQUE NOT NULL,
  account_key text NOT NULL,
  event_type text NOT NULL,
  resend_email_id text,
  received_at timestamptz NOT NULL DEFAULT now(),
  event_created_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crm_resend_webhook_events_resend_email_id
  ON crm_resend_webhook_events(resend_email_id);

CREATE INDEX IF NOT EXISTS idx_crm_resend_webhook_events_event_type
  ON crm_resend_webhook_events(event_type);

CREATE TABLE IF NOT EXISTS crm_marketing_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  address text,
  region text,
  country_code text,
  language text CHECK (language IS NULL OR language IN ('es', 'it', 'en', 'nl')),
  contact_type text,
  source text,
  source_file text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'subscribed', 'unsubscribed', 'suppressed')),
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_source text,
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  suppressed_at timestamptz,
  suppression_reason text,
  unsubscribe_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  resend_contact_id text UNIQUE,
  created_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_marketing_contacts_email
  ON crm_marketing_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_marketing_contacts_status
  ON crm_marketing_contacts(status);
CREATE INDEX IF NOT EXISTS idx_crm_marketing_contacts_language
  ON crm_marketing_contacts(language);
CREATE INDEX IF NOT EXISTS idx_crm_marketing_contacts_type
  ON crm_marketing_contacts(contact_type);

CREATE TABLE IF NOT EXISTS crm_marketing_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  resend_segment_id text UNIQUE,
  created_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_marketing_segment_members (
  segment_id uuid NOT NULL REFERENCES crm_marketing_segments(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES crm_marketing_contacts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (segment_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_marketing_segment_members_contact
  ON crm_marketing_segment_members(contact_id);

CREATE TABLE IF NOT EXISTS crm_marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  preview_text text,
  from_name text,
  from_email text,
  reply_to text,
  language text NOT NULL DEFAULT 'it' CHECK (language IN ('es', 'it', 'en', 'nl')),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed')),
  segment_id uuid REFERENCES crm_marketing_segments(id) ON DELETE SET NULL,
  topic text,
  editor_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  html text NOT NULL DEFAULT '',
  scheduled_at timestamptz,
  sent_at timestamptz,
  resend_broadcast_id text UNIQUE,
  recipient_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  opened_count integer NOT NULL DEFAULT 0,
  clicked_count integer NOT NULL DEFAULT 0,
  bounced_count integer NOT NULL DEFAULT 0,
  complained_count integer NOT NULL DEFAULT 0,
  unsubscribed_count integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_marketing_campaigns_status
  ON crm_marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_crm_marketing_campaigns_created_at
  ON crm_marketing_campaigns(created_at DESC);

CREATE TABLE IF NOT EXISTS crm_marketing_consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES crm_marketing_contacts(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('created', 'updated', 'subscribed', 'unsubscribed', 'suppressed', 'restored', 'imported')),
  source text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_marketing_consent_events_contact
  ON crm_marketing_consent_events(contact_id, created_at DESC);

CREATE TABLE IF NOT EXISTS crm_marketing_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text,
  total_rows integer NOT NULL DEFAULT 0,
  inserted_rows integer NOT NULL DEFAULT 0,
  updated_rows integer NOT NULL DEFAULT 0,
  skipped_rows integer NOT NULL DEFAULT 0,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  imported_by uuid REFERENCES crm_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

export async function runMigrations() {
  await query(schemaSql);
}
