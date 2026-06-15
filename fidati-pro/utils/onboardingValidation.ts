import { isValidEmail } from '@/utils/registrationValidation';

import { ParsedServicePrice, parsePriceInput } from '@/utils/pricing';

import type { OnboardingAccountKind } from '@/types/onboarding';



const MIN_NAME_LEN = 2;



export function validateOnboardingAccount(input: {

  email: string;

  password: string;

  confirmPassword: string;

  phone: string;

  emailTaken?: boolean;

  phoneTaken?: boolean;

}): string | null {

  if (!isValidEmail(input.email)) {

    return 'Inserisci un’email valida.';

  }

  if (input.emailTaken) {

    return 'Questa email è già collegata a un account Fidati.';

  }

  if (input.phoneTaken) {

    return 'Questo numero è già collegato a un account Fidati.';

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



export function validateOnboardingStep1(input: {

  accountKind: OnboardingAccountKind;

  firstName: string;

  lastName: string;

  companyName: string;

  categorySlug: string;

}): string | null {

  if (input.accountKind === 'individual') {

    const first = input.firstName.trim();

    const last = input.lastName.trim();

    if (first.length < MIN_NAME_LEN) {

      return 'Il nome deve avere almeno 2 caratteri.';

    }

    if (last.length < MIN_NAME_LEN) {

      return 'Il cognome deve avere almeno 2 caratteri.';

    }

  } else {

    const company = input.companyName.trim();

    if (company.length < MIN_NAME_LEN) {

      return 'Il nome attività / società deve avere almeno 2 caratteri.';

    }

  }

  if (!input.categorySlug) {

    return 'Seleziona la categoria in cui lavori.';

  }

  return null;

}



export function buildOnboardingDisplayName(input: {

  accountKind: OnboardingAccountKind;

  firstName: string;

  lastName: string;

  companyName: string;

}): string {

  if (input.accountKind === 'company') {

    return input.companyName.trim();

  }

  return `${input.firstName.trim()} ${input.lastName.trim()}`.trim();

}



export function validateOnboardingStep2(mainCity: string | null): string | null {

  if (!mainCity?.trim()) {

    return 'Seleziona la tua città principale dall’elenco.';

  }

  return null;

}



export function validateOnboardingStep3(selectedServices: string[]): string | null {

  if (selectedServices.length === 0) {

    return 'Seleziona almeno un servizio che offri.';

  }

  return null;

}



export type ServicePriceFieldErrors = {

  min?: string;

  max?: string;

};



export function validateOnboardingStep4Fields(

  services: ParsedServicePrice[],

): Record<string, ServicePriceFieldErrors> {

  const errors: Record<string, ServicePriceFieldErrors> = {};



  for (const service of services) {

    if (service.quoteRequired && service.isCustom) {

      continue;

    }



    const slug = service.serviceSlug;

    const row: ServicePriceFieldErrors = {};



    if (service.priceMin == null) {

      row.min = 'Inserisci il prezzo minimo.';

    } else if (service.priceMin <= 0) {

      row.min = 'Inserisci un prezzo minimo valido.';

    }



    if (service.priceMax == null) {

      row.max = 'Inserisci il prezzo massimo.';

    } else if (service.priceMax <= 0) {

      row.max = 'Inserisci un prezzo massimo valido.';

    }



    if (

      service.priceMin != null &&

      service.priceMax != null &&

      service.priceMax < service.priceMin

    ) {

      row.max = 'Il prezzo massimo deve essere maggiore o uguale al minimo.';

    }



    if (row.min || row.max) {

      errors[slug] = row;

    }

  }



  return errors;

}



export function hasOnboardingStep4Errors(errors: Record<string, ServicePriceFieldErrors>): boolean {

  return Object.keys(errors).length > 0;

}



/** @deprecated Usa validateOnboardingStep4Fields per errori per campo. */

export function validateOnboardingStep4PerService(services: ParsedServicePrice[]): string | null {

  const fieldErrors = validateOnboardingStep4Fields(services);

  const firstSlug = Object.keys(fieldErrors)[0];

  if (!firstSlug) return null;

  const row = fieldErrors[firstSlug];

  return row.min ?? row.max ?? null;

}



export function validatePartialServicePriceRow(

  minRaw: string,

  maxRaw: string,

  title: string,

  quoteRequired: boolean,

): string | null {

  if (quoteRequired) {

    return null;

  }



  const hasMin = minRaw.trim().length > 0;

  const hasMax = maxRaw.trim().length > 0;



  if (!hasMin && !hasMax) {

    return null;

  }



  const min = parsePriceInput(minRaw);

  const max = parsePriceInput(maxRaw);



  if (hasMin && min == null) {

    return `Inserisci un minimo valido per "${title}".`;

  }

  if (hasMax && max == null) {

    return `Inserisci un massimo valido per "${title}".`;

  }

  if (min != null && max != null && max < min) {

    return 'Il prezzo massimo deve essere maggiore o uguale al minimo.';

  }



  return null;

}


