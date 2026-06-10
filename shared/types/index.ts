/**
 * Tipi condivisi Fidati — allineati a supabase/schema.sql
 * Usabili da fidati-app e fidati-pro quando si collegherà Supabase.
 */

export * from './enums';
export * from './database';

/** UUID fissi del seed per test e migrazione */
export const SEED_IDS = {
  categories: {
    pulizie: 'c1000001-0001-4000-8000-000000000001',
    idraulici: 'c1000001-0001-4000-8000-000000000002',
    elettricisti: 'c1000001-0001-4000-8000-000000000003',
    giardinieri: 'c1000001-0001-4000-8000-000000000004',
    tuttofare: 'c1000001-0001-4000-8000-000000000005',
  },
  customers: {
    marcoRossi: 'a1000001-0001-4000-8000-000000000001',
    c1: 'a1000001-0001-4000-8000-000000000002',
    c2: 'a1000001-0001-4000-8000-000000000003',
    c3: 'a1000001-0001-4000-8000-000000000004',
    c4: 'a1000001-0001-4000-8000-000000000005',
  },
  professionals: {
    lauraBianchi: 'b1000001-0001-4000-8000-000000000001',
    lucaBianchi: 'b1000001-0001-4000-8000-000000000002',
    annaFerrari: 'b1000001-0001-4000-8000-000000000003',
    paoloRusso: 'b1000001-0001-4000-8000-000000000004',
    lucaConti: 'b1000001-0001-4000-8000-000000000005',
    sofiaMarino: 'b1000001-0001-4000-8000-000000000006',
    giuliaCosta: 'b1000001-0001-4000-8000-000000000007',
    marcoDeLuca: 'b1000001-0001-4000-8000-000000000008',
    andreaNeri: 'b1000001-0001-4000-8000-000000000009',
    robertoGalli: 'b1000001-0001-4000-8000-000000000010',
    elenaVitale: 'b1000001-0001-4000-8000-000000000011',
    francescoVerde: 'b1000001-0001-4000-8000-000000000012',
    chiaraBosco: 'b1000001-0001-4000-8000-000000000013',
    davideMoretti: 'b1000001-0001-4000-8000-000000000014',
    simoneRiva: 'b1000001-0001-4000-8000-000000000015',
  },
} as const;

/** Mapping legacy mock id → UUID seed (fidati-app + fidati-pro) */
export const LEGACY_PROFESSIONAL_IDS: Record<string, string> = {
  '1': SEED_IDS.professionals.lauraBianchi,
  '2': SEED_IDS.professionals.lucaBianchi,
  '3': SEED_IDS.professionals.annaFerrari,
  '4': SEED_IDS.professionals.paoloRusso,
  '5': SEED_IDS.professionals.lucaConti,
  '6': SEED_IDS.professionals.sofiaMarino,
  '7': SEED_IDS.professionals.giuliaCosta,
  '8': SEED_IDS.professionals.marcoDeLuca,
  '9': SEED_IDS.professionals.andreaNeri,
  '10': SEED_IDS.professionals.robertoGalli,
  '11': SEED_IDS.professionals.elenaVitale,
  '12': SEED_IDS.professionals.francescoVerde,
  '13': SEED_IDS.professionals.chiaraBosco,
  '14': SEED_IDS.professionals.davideMoretti,
  '15': SEED_IDS.professionals.simoneRiva,
  'pro-1': SEED_IDS.professionals.lauraBianchi,
};
