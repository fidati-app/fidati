-- Fidati Admin Priority 3: impostazioni, permessi granulari, ticket segnalazioni

-- Stato segnalazione: in attesa utente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'report_status' AND e.enumlabel = 'waiting_user'
  ) THEN
    ALTER TYPE public.report_status ADD VALUE 'waiting_user';
  END IF;
END $$;

-- Campi ticket su reports
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reports_assigned_admin ON public.reports(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority);

-- Storico eventi ticket
CREATE TABLE IF NOT EXISTS public.report_ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'status_change', 'priority_change', 'assignment', 'note', 'created'
  )),
  previous_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_ticket_events_report ON public.report_ticket_events(report_id, created_at DESC);

-- Catalogo città per autocomplete
CREATE TABLE IF NOT EXISTS public.city_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  province TEXT,
  region TEXT NOT NULL DEFAULT 'Puglia',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, province)
);

CREATE INDEX IF NOT EXISTS idx_city_catalog_active ON public.city_catalog(is_active, sort_order);

INSERT INTO public.city_catalog (name, province, region, sort_order) VALUES
  ('Barletta', 'BT', 'Puglia', 1),
  ('Andria', 'BT', 'Puglia', 2),
  ('Trani', 'BT', 'Puglia', 3),
  ('Bisceglie', 'BT', 'Puglia', 4),
  ('Margherita di Savoia', 'BT', 'Puglia', 5),
  ('Canosa di Puglia', 'BT', 'Puglia', 6),
  ('Minervino Murge', 'BT', 'Puglia', 7),
  ('Trinitapoli', 'BT', 'Puglia', 8)
ON CONFLICT (name, province) DO NOTHING;

-- Template messaggi e commissioni per categoria (seed)
INSERT INTO public.platform_settings (key, value) VALUES
  ('message_templates', '{
    "verification_approved": "La tua verifica è stata approvata. Ora sei visibile su Fidati.",
    "verification_rejected": "La tua richiesta di verifica è stata rifiutata. Controlla i dettagli nel profilo.",
    "verification_changes_requested": "Abbiamo bisogno di alcune modifiche al tuo profilo prima di approvare la verifica.",
    "account_banned": "Il tuo account professionista è stato sospeso. Contatta il supporto Fidati."
  }'::jsonb),
  ('commission_by_category', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Permessi: helper SQL
CREATE OR REPLACE FUNCTION public.admin_has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_role public.admin_role;
BEGIN
  SELECT id, role INTO v_admin_id, v_role
  FROM public.admin_users
  WHERE auth_user_id = auth.uid() AND is_active = true
  LIMIT 1;

  IF v_admin_id IS NULL THEN RETURN false; END IF;
  IF v_role = 'super_admin' THEN RETURN true; END IF;

  IF EXISTS (
    SELECT 1 FROM public.admin_permissions
    WHERE admin_user_id = v_admin_id AND permission = p_permission
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Salva permessi granulari (solo super_admin)
CREATE OR REPLACE FUNCTION public.save_admin_permissions(
  p_admin_user_id UUID,
  p_permissions TEXT[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_super BOOLEAN;
  perm TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid() AND role = 'super_admin' AND is_active = true
  ) INTO v_is_super;
  IF NOT v_is_super THEN RAISE EXCEPTION 'Solo super_admin può modificare i permessi'; END IF;

  DELETE FROM public.admin_permissions WHERE admin_user_id = p_admin_user_id;

  FOREACH perm IN ARRAY COALESCE(p_permissions, ARRAY[]::TEXT[])
  LOOP
    INSERT INTO public.admin_permissions (admin_user_id, permission)
    VALUES (p_admin_user_id, trim(perm))
    ON CONFLICT DO NOTHING;
  END LOOP;

  PERFORM public.add_admin_audit_log(
    'update_admin_permissions', 'admin_user', p_admin_user_id,
    jsonb_build_object('permissions', p_permissions)
  );
END;
$$;

-- Aggiorna ticket segnalazione con storico
CREATE OR REPLACE FUNCTION public.update_report_ticket(
  p_report_id UUID,
  p_status public.report_status DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_assigned_admin_id UUID DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
  v_old_status public.report_status;
  v_old_priority TEXT;
  v_old_assign UUID;
  v_had_change BOOLEAN := false;
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  v_admin_id := public.current_admin_id();

  SELECT status, priority, assigned_admin_id
  INTO v_old_status, v_old_priority, v_old_assign
  FROM public.reports WHERE id = p_report_id FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Segnalazione non trovata'; END IF;

  IF p_status IS NOT NULL AND p_status IS DISTINCT FROM v_old_status THEN
    UPDATE public.reports SET status = p_status, updated_at = now() WHERE id = p_report_id;
    INSERT INTO public.report_ticket_events (report_id, admin_id, event_type, previous_value, new_value)
    VALUES (p_report_id, v_admin_id, 'status_change', v_old_status::text, p_status::text);
    v_had_change := true;
  END IF;

  IF p_priority IS NOT NULL AND p_priority IS DISTINCT FROM v_old_priority THEN
    UPDATE public.reports SET priority = p_priority, updated_at = now() WHERE id = p_report_id;
    INSERT INTO public.report_ticket_events (report_id, admin_id, event_type, previous_value, new_value)
    VALUES (p_report_id, v_admin_id, 'priority_change', v_old_priority, p_priority);
    v_had_change := true;
  END IF;

  IF p_assigned_admin_id IS DISTINCT FROM v_old_assign THEN
    UPDATE public.reports SET assigned_admin_id = p_assigned_admin_id, updated_at = now() WHERE id = p_report_id;
    INSERT INTO public.report_ticket_events (report_id, admin_id, event_type, previous_value, new_value)
    VALUES (
      p_report_id, v_admin_id, 'assignment',
      COALESCE(v_old_assign::text, ''), COALESCE(p_assigned_admin_id::text, '')
    );
    v_had_change := true;
  END IF;

  IF NULLIF(trim(p_note), '') IS NOT NULL THEN
    INSERT INTO public.admin_notes (admin_id, target_type, target_id, body)
    VALUES (v_admin_id, 'report', p_report_id, trim(p_note));
    IF NOT v_had_change THEN
      INSERT INTO public.report_ticket_events (report_id, admin_id, event_type, note)
      VALUES (p_report_id, v_admin_id, 'note', trim(p_note));
    END IF;
  END IF;

  PERFORM public.add_admin_audit_log(
    'update_report_ticket', 'report', p_report_id,
    jsonb_build_object(
      'status', p_status, 'priority', p_priority,
      'assigned_admin_id', p_assigned_admin_id, 'note', p_note
    )
  );
END;
$$;

-- Aggiorna impostazione piattaforma
CREATE OR REPLACE FUNCTION public.update_platform_setting(p_key TEXT, p_value JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_active_admin() THEN RAISE EXCEPTION 'Accesso negato'; END IF;

  INSERT INTO public.platform_settings (key, value, updated_at)
  VALUES (p_key, p_value, now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

  PERFORM public.add_admin_audit_log(
    'update_platform_setting', 'platform_setting', NULL,
    jsonb_build_object('key', p_key, 'value', p_value)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_has_permission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_admin_permissions(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_report_ticket(UUID, public.report_status, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_platform_setting(TEXT, JSONB) TO authenticated;

ALTER TABLE public.report_ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_report_events" ON public.report_ticket_events;
CREATE POLICY "admin_read_report_events"
  ON public.report_ticket_events FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_insert_report_events" ON public.report_ticket_events;
CREATE POLICY "admin_insert_report_events"
  ON public.report_ticket_events FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_manage_city_catalog" ON public.city_catalog;
CREATE POLICY "admin_manage_city_catalog"
  ON public.city_catalog FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_read_services" ON public.services;
CREATE POLICY "admin_read_services"
  ON public.services FOR SELECT TO authenticated
  USING (public.is_active_admin());

DROP POLICY IF EXISTS "admin_manage_services" ON public.services;
CREATE POLICY "admin_manage_services"
  ON public.services FOR ALL TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_insert_categories" ON public.service_categories;
CREATE POLICY "admin_insert_categories"
  ON public.service_categories FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_ticket_events TO authenticated;
GRANT ALL ON public.city_catalog TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT INSERT ON public.service_categories TO authenticated;

-- Permetti admin di aggiornare settings (UI controlla permesso settings.edit)
DROP POLICY IF EXISTS "admin_update_settings" ON public.platform_settings;
CREATE POLICY "admin_update_settings"
  ON public.platform_settings FOR UPDATE TO authenticated
  USING (public.is_active_admin()) WITH CHECK (public.is_active_admin());

DROP POLICY IF EXISTS "admin_insert_settings" ON public.platform_settings;
CREATE POLICY "admin_insert_settings"
  ON public.platform_settings FOR INSERT TO authenticated
  WITH CHECK (public.is_active_admin());
