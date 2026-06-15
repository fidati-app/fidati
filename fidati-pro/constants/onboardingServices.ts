/** Servizi suggeriti per categoria durante l'onboarding. */
export const ONBOARDING_SERVICES_BY_CATEGORY: Record<string, string[]> = {
  elettricisti: [
    'Impianti elettrici',
    'Guasti e blackout',
    'Domotica',
    'Illuminazione',
    'Certificazioni',
  ],
  idraulici: ['Perdite e tubature', 'Sanitari', 'Boiler', 'Scarichi', 'Rubinetteria'],
  pulizie: ['Pulizia casa', 'Uffici', 'Post-cantiere', 'Sanificazione', 'Fine locazione'],
  giardinieri: ['Potatura', 'Manutenzione verde', 'Irrigazione', 'Potature alte', 'Sistemazione esterno'],
  fabbri: ['Apertura porte', 'Serrature', 'Cancelli', 'Blindati', 'Copie chiavi'],
  caldaie: ['Manutenzione caldaia', 'Accensione', 'Controllo fumi', 'Sostituzione', 'Guasti'],
  condizionatori: ['Installazione', 'Manutenzione', 'Ricarica gas', 'Pulizia filtri', 'Guasti'],
  serramentisti: ['Infissi', 'Serramenti', 'Zanzariere', 'Tapparelle', 'Porte finestra'],
  'traslochi-sgomberi': ['Traslochi', 'Sgomberi', 'Montaggio mobili', 'Imballaggio', 'Trasporto'],
  antennisti: ['Antenne TV', 'Parabole', 'Impianti SAT', 'Cavo', 'Riparazioni'],
  'montaggio-mobili': ['Cucine', 'Armadi', 'Letti', 'Mobili IKEA', 'Riparazioni mobili'],
};

export const ONBOARDING_FALLBACK_SERVICES = [
  'Consulenza',
  'Intervento urgente',
  'Manutenzione',
  'Preventivo in loco',
];

export function getSuggestedServicesForCategory(categorySlug: string): string[] {
  return ONBOARDING_SERVICES_BY_CATEGORY[categorySlug] ?? ONBOARDING_FALLBACK_SERVICES;
}
