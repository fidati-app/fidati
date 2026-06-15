# Fidati Admin

Pannello interno enterprise per il team Fidati — React + Vite + Supabase.

## Setup

```bash
cd fidati-admin
cp .env.example .env
npm install
npm run dev
```

Apri `http://localhost:5173`

## Prerequisiti Supabase

1. `supabase db push` dalla root del monorepo (migration `202606210001_admin_panel.sql`)
2. Crea un utente in **Authentication → Users**
3. Inserisci l'utente in `admin_users` (vedi README root o istruzioni agent)

## Stack

- React 19 + Vite + TypeScript
- Supabase Auth + JS client
- React Router
- Recharts (KPI)
- Lucide icons
- Dark UI premium
