-- Aggiunge titolo opzionale alle foto lavori

ALTER TABLE public.professional_work_photos
  ADD COLUMN IF NOT EXISTS title TEXT;

COMMENT ON COLUMN public.professional_work_photos.title IS 'Titolo breve opzionale mostrato nel portfolio professionista';
