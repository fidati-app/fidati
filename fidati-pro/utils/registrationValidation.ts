const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateRegistrationStep1(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}): string | null {
  if (!input.name.trim()) {
    return 'Inserisci il nome professionista o attività.';
  }
  if (!isValidEmail(input.email)) {
    return 'Inserisci un’email valida.';
  }
  if (input.password.length < 6) {
    return 'La password deve avere almeno 6 caratteri.';
  }
  if (input.password !== input.confirmPassword) {
    return 'Le password non coincidono.';
  }
  if (!input.phone.trim()) {
    return 'Inserisci un numero di telefono.';
  }
  return null;
}

export function parseServiceAreasInput(raw: string, baseCity: string): string[] {
  const parts = raw
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const unique = new Set<string>();
  const normalizedBase = baseCity.trim();
  if (normalizedBase) {
    unique.add(normalizedBase);
  }

  for (const part of parts) {
    unique.add(part);
  }

  return Array.from(unique);
}

export function validateRegistrationStep2(input: {
  categorySlug: string;
  baseCity: string;
  serviceAreasRaw: string;
  priceFromRaw: string;
  description: string;
}): string | null {
  if (!input.categorySlug) {
    return 'Seleziona una categoria principale.';
  }
  if (!input.baseCity.trim()) {
    return 'Inserisci la città base.';
  }
  const areas = parseServiceAreasInput(input.serviceAreasRaw, input.baseCity);
  if (areas.length === 0) {
    return 'Inserisci almeno una zona operativa.';
  }
  const price = Number(input.priceFromRaw.replace(',', '.'));
  if (!Number.isFinite(price) || price <= 0) {
    return 'Inserisci un prezzo da valido.';
  }
  if (!input.description.trim()) {
    return 'Inserisci una breve descrizione.';
  }
  return null;
}

export function parsePriceFrom(raw: string): number {
  return Number(raw.replace(',', '.').trim());
}
