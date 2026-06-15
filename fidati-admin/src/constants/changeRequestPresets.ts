export const SERVICE_CHANGE_PRESETS = [
  'Prezzo non coerente',
  'Nome servizio poco chiaro',
  'Servizio non pertinente alla categoria',
  'Durata mancante o errata',
  'Altro',
];

export const PORTFOLIO_CHANGE_PRESETS = [
  'Foto poco chiara',
  'Foto non pertinente',
  'Foto duplicata',
  'Foto di bassa qualità',
  'Altro',
];

export const DOCUMENT_CHANGE_PRESETS = [
  'Documento non leggibile',
  'Documento tagliato',
  'Selfie non chiaro',
  'Documento non valido',
  'Altro',
];

export const VERIFICATION_CHANGE_AREAS = [
  { id: 'profile_photo', label: 'Foto profilo' },
  { id: 'document_front', label: 'Documento fronte' },
  { id: 'document_back', label: 'Documento retro' },
  { id: 'selfie', label: 'Selfie' },
  { id: 'work_photos', label: 'Foto lavori' },
  { id: 'services', label: 'Servizi' },
  { id: 'prices', label: 'Prezzi' },
  { id: 'zones', label: 'Zone / città' },
  { id: 'availability', label: 'Disponibilità' },
  { id: 'other', label: 'Altro' },
];

export const VERIFICATION_CHANGE_PRESETS = [
  'Profilo incompleto',
  'Documenti non conformi',
  'Foto lavori insufficienti',
  'Servizi o prezzi da rivedere',
  'Zone operative da aggiornare',
  'Altro',
];

export const ACCOUNT_STATUS_OPTIONS = [
  { value: 'active', label: 'Attivo' },
  { value: 'suspended', label: 'Sospeso' },
  { value: 'banned', label: 'Bannato' },
  { value: 'unverified', label: 'Non verificato' },
];
