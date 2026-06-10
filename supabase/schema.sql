-- =============================================================================
-- Fidati — Database schema (Supabase / PostgreSQL)
-- Allineato ai mock di fidati-app e fidati-pro.
-- NON collegato alle app: solo preparazione infrastruttura.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

CREATE TYPE package_tier AS ENUM ('base', 'standard', 'premium');
CREATE TYPE booking_status AS ENUM ('incoming', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'declined', 'completed');
CREATE TYPE appointment_status AS ENUM ('upcoming', 'in_progress', 'done');
CREATE TYPE day_availability AS ENUM ('free', 'partial', 'full', 'off');
CREATE TYPE message_sender AS ENUM ('customer', 'professional', 'system');
CREATE TYPE message_kind AS ENUM ('text', 'booking_request', 'system');
CREATE TYPE account_status AS ENUM ('verified', 'in_review', 'unverified');
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'in_app');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE report_target_type AS ENUM ('professional', 'customer', 'booking', 'review', 'message');
CREATE TYPE profile_step_id AS ENUM ('photo', 'bio', 'services', 'portfolio', 'zones');

-- -----------------------------------------------------------------------------
-- SERVICE CATALOG (marketplace — fidati-app)
-- -----------------------------------------------------------------------------

CREATE TABLE service_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  icon            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  professional_count INTEGER NOT NULL DEFAULT 0,
  home_count      INTEGER NOT NULL DEFAULT 0,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  category_id     UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  icon            TEXT NOT NULL DEFAULT 'construct-outline',
  description     TEXT NOT NULL DEFAULT '',
  from_price      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  weekly_bookings INTEGER NOT NULL DEFAULT 0,
  image_url       TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service_packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tier            package_tier NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price           NUMERIC(10, 2) NOT NULL,
  duration_label  TEXT NOT NULL DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------

CREATE TABLE customers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  legacy_id       TEXT UNIQUE,
  name            TEXT NOT NULL,
  email           TEXT UNIQUE,
  phone           TEXT,
  image_url       TEXT,
  avatar_color    TEXT NOT NULL DEFAULT '#3B82F6',
  member_since    TEXT,
  bookings_count  INTEGER NOT NULL DEFAULT 0,
  completed_count INTEGER NOT NULL DEFAULT 0,
  rating          NUMERIC(3, 2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE professionals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  legacy_id       TEXT UNIQUE,
  category_id     UUID NOT NULL REFERENCES service_categories(id),
  name            TEXT NOT NULL,
  category_label  TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  image_url       TEXT,
  hero_image_url  TEXT,
  avatar_color    TEXT NOT NULL DEFAULT '#07254A',
  bio             TEXT NOT NULL DEFAULT '',
  why_choose      JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating          NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_count    INTEGER NOT NULL DEFAULT 0,
  jobs_completed  INTEGER NOT NULL DEFAULT 0,
  price_per_hour  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  distance_km     NUMERIC(6, 2),
  available_today BOOLEAN NOT NULL DEFAULT false,
  verified        BOOLEAN NOT NULL DEFAULT false,
  badge_document  BOOLEAN NOT NULL DEFAULT false,
  badge_phone     BOOLEAN NOT NULL DEFAULT false,
  badge_professional BOOLEAN NOT NULL DEFAULT false,
  member_since    TEXT,
  earnings_this_month NUMERIC(12, 2) NOT NULL DEFAULT 0,
  earnings_this_week  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  profile_completion  INTEGER NOT NULL DEFAULT 0,
  new_clients_this_month INTEGER NOT NULL DEFAULT 0,
  response_rate   INTEGER NOT NULL DEFAULT 100,
  account_status  account_status NOT NULL DEFAULT 'unverified',
  profile_views   INTEGER NOT NULL DEFAULT 0,
  has_pro_app     BOOLEAN NOT NULL DEFAULT false,
  urgent_badge    TEXT,
  is_new_featured BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE professional_zones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  zone_name       TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id, zone_name)
);

CREATE TABLE professional_services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  catalog_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  price_from      NUMERIC(10, 2) NOT NULL,
  duration_label  TEXT NOT NULL DEFAULT '',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id, legacy_id)
);

CREATE TABLE professional_service_packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  professional_service_id UUID REFERENCES professional_services(id) ON DELETE SET NULL,
  tier            package_tier NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  price           NUMERIC(10, 2) NOT NULL,
  duration_label  TEXT NOT NULL DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id, legacy_id)
);

CREATE TABLE professional_portfolio (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  subtitle        TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT '',
  cover_image     TEXT NOT NULL,
  before_image    TEXT,
  after_image     TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id, legacy_id)
);

CREATE TABLE professional_portfolio_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id    UUID NOT NULL REFERENCES professional_portfolio(id) ON DELETE CASCADE,
  image_url       TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE professional_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  short_label     TEXT NOT NULL,
  day_label       TEXT NOT NULL,
  time_ranges     TEXT[] NOT NULL DEFAULT '{}',
  status          day_availability NOT NULL DEFAULT 'partial',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id, day_of_week)
);

CREATE TABLE professional_availability_days (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  date_key        DATE NOT NULL,
  availability    day_availability NOT NULL DEFAULT 'partial',
  appointment_count INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id, date_key)
);

CREATE TABLE professional_profile_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  step            profile_step_id NOT NULL,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (professional_id, step)
);

-- -----------------------------------------------------------------------------
-- BOOKINGS & REQUESTS
-- -----------------------------------------------------------------------------

CREATE TABLE booking_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  conversation_id UUID,
  service_title   TEXT NOT NULL,
  category_label  TEXT NOT NULL DEFAULT '',
  scheduled_date  DATE,
  scheduled_time  TIME,
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  address         TEXT NOT NULL DEFAULT '',
  zone            TEXT,
  distance_km     NUMERIC(6, 2),
  note            TEXT,
  status          request_status NOT NULL DEFAULT 'pending',
  client_verified BOOLEAN NOT NULL DEFAULT false,
  client_rating   NUMERIC(3, 2),
  response_deadline_at TIMESTAMPTZ,
  online_payment_available BOOLEAN NOT NULL DEFAULT false,
  package_title   TEXT,
  photos          JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
  professional_service_id UUID REFERENCES professional_services(id) ON DELETE SET NULL,
  service_title   TEXT NOT NULL,
  category_label  TEXT NOT NULL DEFAULT '',
  scheduled_date  DATE,
  scheduled_time  TIME,
  end_time        TIME,
  status          booking_status NOT NULL DEFAULT 'incoming',
  appointment_status appointment_status,
  price           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  address         TEXT,
  zone            TEXT,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- MESSAGING
-- -----------------------------------------------------------------------------

CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  last_message    TEXT NOT NULL DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unread_customer INTEGER NOT NULL DEFAULT 0,
  unread_professional INTEGER NOT NULL DEFAULT 0,
  pending_deadline_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (customer_id, professional_id)
);

ALTER TABLE booking_requests
  ADD CONSTRAINT booking_requests_conversation_id_fkey
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL;

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender          message_sender NOT NULL,
  kind            message_kind NOT NULL DEFAULT 'text',
  body            TEXT NOT NULL DEFAULT '',
  image_url       TEXT,
  booking_request_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- REVIEWS
-- -----------------------------------------------------------------------------

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body            TEXT NOT NULL DEFAULT '',
  service_title   TEXT,
  client_display_name TEXT,
  review_date     DATE,
  is_published    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- PAYMENTS & REFUNDS
-- -----------------------------------------------------------------------------

CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'EUR',
  status          payment_status NOT NULL DEFAULT 'pending',
  payment_method  TEXT,
  provider        TEXT,
  provider_ref    TEXT,
  authorized_at   TIMESTAMPTZ,
  captured_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount          NUMERIC(10, 2) NOT NULL,
  status          refund_status NOT NULL DEFAULT 'pending',
  reason          TEXT,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- NOTIFICATIONS, SUPPORT, REPORTS
-- -----------------------------------------------------------------------------

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID REFERENCES customers(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  channel         notification_channel NOT NULL DEFAULT 'in_app',
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL DEFAULT '',
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (customer_id IS NOT NULL AND professional_id IS NULL)
    OR (customer_id IS NULL AND professional_id IS NOT NULL)
  )
);

CREATE TABLE support_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL DEFAULT '',
  status          ticket_status NOT NULL DEFAULT 'open',
  priority        TEXT NOT NULL DEFAULT 'normal',
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  reporter_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  reporter_professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  target_type     report_target_type NOT NULL,
  target_id       UUID NOT NULL,
  reason          TEXT NOT NULL,
  details         TEXT,
  status          report_status NOT NULL DEFAULT 'open',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- HOME MARKETPLACE (fidati-app home screen)
-- -----------------------------------------------------------------------------

CREATE TABLE home_popular_services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  category_id     UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  icon            TEXT NOT NULL DEFAULT 'construct-outline',
  rating          NUMERIC(3, 2) NOT NULL DEFAULT 0,
  completed_jobs  INTEGER NOT NULL DEFAULT 0,
  avg_price       NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url       TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE home_offers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  category_id     UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  highlight       TEXT NOT NULL,
  subtitle        TEXT NOT NULL DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE home_service_tiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id       TEXT UNIQUE,
  audience        TEXT NOT NULL CHECK (audience IN ('casa', 'azienda')),
  title           TEXT NOT NULL,
  icon            TEXT NOT NULL DEFAULT 'construct-outline',
  category_slug   TEXT NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------

CREATE INDEX idx_professionals_category ON professionals(category_id);
CREATE INDEX idx_professionals_available ON professionals(available_today) WHERE available_today = true;
CREATE INDEX idx_professional_services_pro ON professional_services(professional_id);
CREATE INDEX idx_booking_requests_pro_status ON booking_requests(professional_id, status);
CREATE INDEX idx_booking_requests_customer ON booking_requests(customer_id);
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX idx_bookings_professional_date ON bookings(professional_id, scheduled_date);
CREATE INDEX idx_conversations_professional ON conversations(professional_id, updated_at DESC);
CREATE INDEX idx_conversations_customer ON conversations(customer_id, updated_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at);
CREATE INDEX idx_reviews_professional ON reviews(professional_id, created_at DESC);
CREATE INDEX idx_notifications_customer_unread ON notifications(customer_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_professional_unread ON notifications(professional_id) WHERE read_at IS NULL;

-- -----------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_categories_updated BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_service_packages_updated BEFORE UPDATE ON service_packages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_professionals_updated BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_professional_services_updated BEFORE UPDATE ON professional_services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_booking_requests_updated BEFORE UPDATE ON booking_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_refunds_updated BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_support_tickets_updated BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reports_updated BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_home_popular_services_updated BEFORE UPDATE ON home_popular_services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_home_offers_updated BEFORE UPDATE ON home_offers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_home_service_tiles_updated BEFORE UPDATE ON home_service_tiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
