/** Categorie ufficiali Fidati disponibili in registrazione fidati-pro. */
export interface ProCategoryOption {
  slug: string;
  label: string;
}

export const PRO_REGISTRATION_CATEGORIES: ProCategoryOption[] = [
  { slug: 'elettricisti', label: 'Elettricisti' },
  { slug: 'idraulici', label: 'Idraulici' },
  { slug: 'pulizie', label: 'Pulizie' },
  { slug: 'giardinieri', label: 'Giardinieri' },
  { slug: 'fabbri', label: 'Fabbri' },
  { slug: 'caldaie', label: 'Caldaie' },
  { slug: 'condizionatori', label: 'Condizionatori' },
  { slug: 'serramentisti', label: 'Infissi' },
  { slug: 'traslochi-sgomberi', label: 'Traslochi' },
  { slug: 'antennisti', label: 'Antennisti' },
  { slug: 'montaggio-mobili', label: 'Montaggio mobili' },
];

export const PRO_SERVICE_CITIES = [
  'Barletta',
  'Andria',
  'Trani',
  'Bisceglie',
  'Margherita di Savoia',
] as const;

export type ProServiceCity = (typeof PRO_SERVICE_CITIES)[number];
