-- =============================================================================
-- Fidati — Row Level Security (RLS) policies
-- Template per integrazione futura con Supabase Auth.
-- NON attivare in produzione senza revisione sicurezza.
-- =============================================================================

-- Abilita RLS su tutte le tabelle principali
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_availability_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profile_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_popular_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_service_tiles ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- CATALOGO PUBBLICO (lettura anonima)
-- -----------------------------------------------------------------------------

CREATE POLICY "public_read_service_categories"
  ON service_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "public_read_services"
  ON services FOR SELECT
  USING (is_active = true);

CREATE POLICY "public_read_service_packages"
  ON service_packages FOR SELECT
  USING (true);

CREATE POLICY "public_read_professionals_listing"
  ON professionals FOR SELECT
  USING (verified = true);

CREATE POLICY "public_read_professional_services"
  ON professional_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "public_read_professional_packages"
  ON professional_service_packages FOR SELECT
  USING (true);

CREATE POLICY "public_read_professional_zones"
  ON professional_zones FOR SELECT
  USING (true);

CREATE POLICY "professionals_manage_own_zones"
  ON professional_zones FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM professionals WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM professionals WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "public_read_professional_portfolio"
  ON professional_portfolio FOR SELECT
  USING (true);

CREATE POLICY "public_read_professional_portfolio_images"
  ON professional_portfolio_images FOR SELECT
  USING (true);

CREATE POLICY "public_read_reviews"
  ON reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "public_read_home_popular_services"
  ON home_popular_services FOR SELECT
  USING (true);

CREATE POLICY "public_read_home_offers"
  ON home_offers FOR SELECT
  USING (true);

CREATE POLICY "public_read_home_service_tiles"
  ON home_service_tiles FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- CLIENTI (fidati-app)
-- -----------------------------------------------------------------------------

CREATE POLICY "customers_select_own"
  ON customers FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "customers_update_own"
  ON customers FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "customers_insert_own"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- -----------------------------------------------------------------------------
-- PROFESSIONISTI (fidati-pro)
-- -----------------------------------------------------------------------------

CREATE POLICY "professionals_select_own"
  ON professionals FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "professionals_update_own"
  ON professionals FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "professionals_insert_own"
  ON professionals FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "professionals_manage_own_services"
  ON professional_services FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM professionals WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "professionals_manage_own_availability"
  ON professional_availability FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM professionals WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "professionals_manage_own_profile_steps"
  ON professional_profile_steps FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM professionals WHERE auth_user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- PRENOTAZIONI E RICHIESTE
-- -----------------------------------------------------------------------------

CREATE POLICY "customers_read_own_bookings"
  ON bookings FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "professionals_read_own_bookings"
  ON bookings FOR SELECT
  USING (
    professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "customers_create_booking_requests"
  ON booking_requests FOR INSERT
  WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "customers_read_own_booking_requests"
  ON booking_requests FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "professionals_read_assigned_requests"
  ON booking_requests FOR SELECT
  USING (
    professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "professionals_update_assigned_requests"
  ON booking_requests FOR UPDATE
  USING (
    professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- MESSAGGI
-- -----------------------------------------------------------------------------

CREATE POLICY "participants_read_conversations"
  ON conversations FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "participants_read_messages"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
         OR professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "participants_insert_messages"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
         OR professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- PAGAMENTI, NOTIFICHE, SUPPORTO
-- -----------------------------------------------------------------------------

CREATE POLICY "customers_read_own_payments"
  ON payments FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "professionals_read_own_payments"
  ON payments FOR SELECT
  USING (
    professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "users_read_own_notifications"
  ON notifications FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "customers_manage_own_tickets"
  ON support_tickets FOR ALL
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "users_create_reports"
  ON reports FOR INSERT
  WITH CHECK (
    reporter_customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid())
    OR reporter_professional_id IN (SELECT id FROM professionals WHERE auth_user_id = auth.uid())
  );
