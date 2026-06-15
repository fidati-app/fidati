-- Disponibilità settimanale strutturata + lavori urgenti

ALTER TABLE public.professional_availability
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.professional_availability
  ADD COLUMN IF NOT EXISTS start_time TIME;

ALTER TABLE public.professional_availability
  ADD COLUMN IF NOT EXISTS end_time TIME;

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS accepts_urgent_jobs BOOLEAN NOT NULL DEFAULT false;

-- Backfill da colonne esistenti
UPDATE public.professional_availability
SET
  is_available = (status <> 'off'),
  start_time = CASE
    WHEN status <> 'off' AND array_length(time_ranges, 1) > 0 THEN
      to_timestamp(
        regexp_replace(split_part(time_ranges[1], '–', 1), '[^0-9:]', '', 'g'),
        'HH24:MI'
      )::time
    ELSE NULL
  END,
  end_time = CASE
    WHEN status <> 'off' AND array_length(time_ranges, 1) > 0 THEN
      to_timestamp(
        regexp_replace(split_part(time_ranges[1], '–', 2), '[^0-9:]', '', 'g'),
        'HH24:MI'
      )::time
    ELSE NULL
  END
WHERE start_time IS NULL OR end_time IS NULL OR is_available IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.professional_availability TO authenticated;

ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "professionals_select_own_availability" ON public.professional_availability;
CREATE POLICY "professionals_select_own_availability"
  ON public.professional_availability
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "professionals_insert_own_availability" ON public.professional_availability;
CREATE POLICY "professionals_insert_own_availability"
  ON public.professional_availability
  FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "professionals_update_own_availability" ON public.professional_availability;
CREATE POLICY "professionals_update_own_availability"
  ON public.professional_availability
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "professionals_delete_own_availability" ON public.professional_availability;
CREATE POLICY "professionals_delete_own_availability"
  ON public.professional_availability
  FOR DELETE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM public.professionals WHERE auth_user_id = auth.uid()
    )
  );
