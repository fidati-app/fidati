# Fidati — Supabase Database

Preparazione database per **fidati-app** (cliente) e **fidati-pro** (professionista).

> **Stato attuale:** schema + seed + policies pronti. Le app continuano a usare i mock locali. Nessuna connessione Supabase attiva.

## File

| File | Descrizione |
|------|-------------|
| `schema.sql` | Tabelle, enum, indici, trigger `updated_at` |
| `seed.sql` | Dati derivati dai mock attuali |
| `policies.sql` | RLS template per Auth futuro |
| `../shared/types/` | Tipi TypeScript condivisi (row DB) |

## Ordine di esecuzione

```bash
# Supabase CLI (locale o remoto)
psql $DATABASE_URL -f supabase/schema.sql
psql $DATABASE_URL -f supabase/seed.sql
psql $DATABASE_URL -f supabase/policies.sql
```

Oppure incolla i file nell’editor SQL di Supabase Dashboard nell’ordine sopra.

## Mapping mock → database

### fidati-app

| Mock | Tabella |
|------|---------|
| `MOCK_USER` | `customers` (`legacy_id: user-1`) |
| `MOCK_PROFESSIONALS` | `professionals` + `professional_service_packages` |
| `CATEGORIES` | `service_categories` |
| `PROFESSIONAL_SERVICES` | `services` + `service_packages` |
| `MOCK_BOOKINGS` | `bookings` |
| `MOCK_MESSAGES` | `conversations` + `messages` |
| `BookingRequest` (runtime) | `booking_requests` + `messages.kind = booking_request` |

### fidati-pro

| Mock | Tabella |
|------|---------|
| `MOCK_PRO_PROFILE` (Laura) | `professionals` id `b1000001-...001` (= app pro `1`) |
| `MOCK_REQUESTS` | `booking_requests` |
| `MOCK_APPOINTMENTS` | `bookings` (`appointment_status`) |
| `MOCK_MESSAGES` / `CHAT_THREADS` | `conversations` + `messages` |
| `WEEKLY_AVAILABILITY` | `professional_availability` |
| `AGENDA_DAYS` | `professional_availability_days` |
| Profile steps (5) | `professional_profile_steps` |
| `ProService` | `professional_services` |
| Portfolio | `professional_portfolio` + `professional_portfolio_images` |
| Zones | `professional_zones` |
| Invoices (earnings screen) | da modellare su `payments` in futuro |

### Identità unificata Laura Bianchi

| App | legacy_id | UUID seed |
|-----|-----------|-----------|
| fidati-app | `1` | `b1000001-0001-4000-8000-000000000001` |
| fidati-pro | `pro-1` | stesso record (`has_pro_app = true`) |

## UUID fissi (seed)

Prefissi per debug (solo caratteri esadecimali `0-9`, `a-f`):

- `c1000001-…` — categorie
- `a1000001-…` — clienti
- `b1000001-…` — professionisti
- `d1000001-…` — servizi catalogo
- `ab000001-…` — pacchetti listino pro
- `ad000001-…` — conversazioni
- `af000001-…` — richieste
- `b0000001-…` — prenotazioni
- `b9000001-…` — recensioni
- `ba000002-…` — servizi popolari Home

Colonna `legacy_id` su ogni tabella principale per tracciare l’origine mock durante la migrazione.

## Tabelle (26)

1. `service_categories`
2. `services` (+ `weekly_bookings` per ranking settimanale)
3. `service_packages`
4. `customers`
5. `professionals` (+ `urgent_badge`, `is_new_featured`)
6. `professional_zones`
7. `professional_services`
8. `professional_service_packages`
9. `professional_portfolio`
10. `professional_portfolio_images`
11. `professional_availability`
12. `professional_availability_days`
13. `professional_profile_steps`
14. `booking_requests`
15. `bookings`
16. `conversations`
17. `messages`
18. `reviews` (+ `client_display_name` per HOME_REVIEWS)
19. `payments`
20. `refunds`
21. `notifications`
22. `support_tickets`
23. `reports`
24. `home_popular_services` — servizi più prenotati (carousel Home)
25. `home_offers` — offerte promozionali Home
26. `home_service_tiles` — tile Casa / Azienda

## Seed — volumi attuali

| Entità | Conteggio |
|--------|-----------|
| Professionisti | **15** (tutti da `MOCK_PROFESSIONALS`) |
| Categorie | **5** |
| Servizi catalogo | **26** (da `PROFESSIONAL_SERVICES`) |
| Pacchetti catalogo | **53** |
| Servizi per professionista | **78** (catalogo categoria × 15 pro) |
| Pacchetti listino pro | **45** (3 tier × 15 pro) |
| Zone servite | **47** |
| Portfolio | **31** voci |
| Recensioni | **37** (4 Home + 30 campione + 3 Laura pro) |

Rigenerare il seed da mock:

```bash
node supabase/scripts/generate-seed.mjs
```

## Home cliente — copertura seed

| Sezione Home | Fonte seed |
|--------------|------------|
| Categorie rail | `service_categories` |
| Servizi più prenotati | `home_popular_services` |
| Interventi urgenti | `professionals` (`urgent_badge`, `available_today`) |
| Professionisti per categoria | `professionals` + `rating` / `review_count` |
| Top professionisti | query su `professionals` ordinati per rating |
| Nuovi professionisti | `professionals.is_new_featured` |
| Offerte | `home_offers` |
| Tile Casa / Azienda | `home_service_tiles` |
| Ultime recensioni | `reviews` + `client_display_name` |
| Prenotazioni utente | `bookings` (Marco Rossi) |
| Messaggi | `conversations` + `messages` |

## Prossimi passi (non ancora implementati)

1. Collegare `@supabase/supabase-js` nelle app
2. Sostituire gradualmente i mock con repository
3. Collegare `auth.users` a `customers` / `professionals`
4. Storage bucket per portfolio e foto richieste

## Note

- `auth.users` è referenziato ma opzionale nel seed (nessun utente Auth creato).
- Le policies assumono `auth.uid()` — funzioneranno dopo login Supabase.
- Per sviluppo locale senza Auth, disabilita RLS o usa service role key.
