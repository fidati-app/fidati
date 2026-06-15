import { devLogSupabaseError } from '@/lib/devLog';

import { supabase } from '@/lib/supabaseClient';

import { syncProfessionalZonesList } from '@/services/professionalZonesService';

import { fetchMyProfessionalByAuthUserId } from '@/services/professionalsMeService';

import { MyProfessional } from '@/types';

import {

  computeStartingPrice,

  formatServicePriceRangeLabel,

  parsePriceInput,

} from '@/utils/pricing';

import { parseServiceAreasInput } from '@/utils/registrationValidation';

import { slugifyServiceTitle } from '@/utils/serviceSlug';



export interface ProRegistrationServiceInput {
  title: string;
  serviceSlug?: string;
  isCustom?: boolean;
  priceMin?: number | null;
  priceMax?: number | null;
  quoteRequired?: boolean;
}



export interface ProRegistrationProfileInput {

  name: string;

  accountKind: 'individual' | 'company';

  firstName?: string;

  lastName?: string;

  companyName?: string;

  email: string;

  phone: string;

  categorySlug: string;

  cities: string[];

  services: (ProRegistrationServiceInput | string)[];

  description?: string;

  /** @deprecated compat pending legacy */

  baseCity?: string;

  serviceAreasRaw?: string;

  priceFrom?: number;

  priceMin?: number | null;

  priceMax?: number | null;

}



interface CategoryRow {

  id: string;

  slug: string;

  name: string;

}



const profileCreationLocks = new Map<string, Promise<MyProfessional>>();



function isDuplicateKeyError(error: unknown): boolean {

  return (

    typeof error === 'object' &&

    error !== null &&

    'code' in error &&

    (error as { code?: string }).code === '23505'

  );

}



function normalizeCities(input: ProRegistrationProfileInput): string[] {

  if (input.cities?.length) {

    return input.cities.map((c) => c.trim()).filter(Boolean);

  }

  return parseServiceAreasInput(input.serviceAreasRaw ?? '', input.baseCity ?? '');

}



function normalizeServices(input: ProRegistrationProfileInput): ProRegistrationServiceInput[] {
  if (!input.services?.length) {
    return [];
  }

  const legacyMin = input.priceMin ?? input.priceFrom ?? null;
  const legacyMax = input.priceMax ?? null;

  const seenSlugs = new Set<string>();

  return input.services
    .map((service) => {
      if (typeof service === 'string') {
        const title = service.trim();
        const serviceSlug = slugifyServiceTitle(title);
        return {
          title,
          serviceSlug,
          isCustom: true,
          priceMin: legacyMin != null && legacyMin > 0 ? legacyMin : null,
          priceMax: legacyMax,
        };
      }

      const title = service.title.trim();
      const serviceSlug = service.serviceSlug ?? slugifyServiceTitle(title);

      return {
        title,
        serviceSlug,
        isCustom: service.isCustom ?? false,
        priceMin: service.quoteRequired ? null : (service.priceMin ?? null),
        priceMax: service.quoteRequired ? null : (service.priceMax ?? null),
        quoteRequired: service.quoteRequired ?? false,
      };
    })
    .filter((service) => {
      if (!service.title.length || !service.serviceSlug) return false;
      if (seenSlugs.has(service.serviceSlug)) return false;
      seenSlugs.add(service.serviceSlug);
      return true;
    });
}



async function fetchCategoryBySlug(slug: string): Promise<CategoryRow | null> {

  const { data, error } = await supabase

    .from('service_categories')

    .select('id, slug, name')

    .eq('slug', slug)

    .eq('is_active', true)

    .maybeSingle();



  if (error) {

    devLogSupabaseError('fetchCategoryBySlug', error);

    throw error;

  }



  return (data as CategoryRow | null) ?? null;

}



async function findProfessionalIdByAuthUserId(authUserId: string): Promise<string | null> {

  const { data, error } = await supabase

    .from('professionals')

    .select('id')

    .eq('auth_user_id', authUserId)

    .maybeSingle();



  if (error) {

    devLogSupabaseError('findProfessionalIdByAuthUserId', error);

    throw error;

  }



  return data?.id ?? null;

}



async function resolveProfessionalId(

  authUserId: string,

  input: ProRegistrationProfileInput,

  category: CategoryRow,

  serviceAreas: string[],

  startingPrice: number,

): Promise<string> {

  const existingId = await findProfessionalIdByAuthUserId(authUserId);

  if (existingId) {

    return existingId;

  }



  const baseCity = serviceAreas[0] ?? '';



  const { data: professional, error: insertError } = await supabase

    .from('professionals')

    .insert({

      auth_user_id: authUserId,

      name: input.name.trim(),

      account_kind: input.accountKind,

      first_name: input.accountKind === 'individual' ? (input.firstName?.trim() ?? null) : null,

      last_name: input.accountKind === 'individual' ? (input.lastName?.trim() ?? null) : null,

      company_name: input.accountKind === 'company' ? (input.companyName?.trim() ?? null) : null,

      email: input.email.trim(),

      phone: input.phone.trim(),

      category_id: category.id,

      category_label: category.name,

      category_slug: input.categorySlug,

      base_city: baseCity,

      service_areas: serviceAreas,

      price_per_hour: startingPrice,

      bio: (input.description ?? '').trim(),

      verified: false,

      available_today: false,

      rating: 0,

      review_count: 0,

      account_status: 'unverified',

      verification_status: 'unverified',

      has_pro_app: true,

    })

    .select('id')

    .single();



  if (!insertError && professional?.id) {

    return professional.id;

  }



  if (insertError && isDuplicateKeyError(insertError)) {

    const duplicateId = await findProfessionalIdByAuthUserId(authUserId);

    if (duplicateId) {

      return duplicateId;

    }

  }



  if (insertError) {

    devLogSupabaseError('createProfessionalProfile insert', insertError);

    throw insertError;

  }



  throw new Error('Impossibile creare o recuperare il profilo professionista.');

}



async function updateProfessionalProfile(

  professionalId: string,

  input: ProRegistrationProfileInput,

  category: CategoryRow,

  serviceAreas: string[],

  startingPrice: number,

): Promise<void> {

  const { error } = await supabase

    .from('professionals')

    .update({

      name: input.name.trim(),

      account_kind: input.accountKind,

      first_name: input.accountKind === 'individual' ? (input.firstName?.trim() ?? null) : null,

      last_name: input.accountKind === 'individual' ? (input.lastName?.trim() ?? null) : null,

      company_name: input.accountKind === 'company' ? (input.companyName?.trim() ?? null) : null,

      email: input.email.trim(),

      phone: input.phone.trim(),

      category_id: category.id,

      category_label: category.name,

      category_slug: input.categorySlug,

      base_city: serviceAreas[0] ?? '',

      service_areas: serviceAreas,

      price_per_hour: startingPrice,

      bio: (input.description ?? '').trim(),

      has_pro_app: true,

    })

    .eq('id', professionalId);



  if (error) {

    devLogSupabaseError('updateProfessionalProfile', error);

    throw error;

  }

}



/**

 * Sincronizza i servizi: elimina orfani, upsert su (professional_id, service_slug).

 */

async function syncProfessionalServices(

  professionalId: string,

  services: ProRegistrationServiceInput[],

): Promise<void> {

  const rows = services.map((service, index) => {
    const title = service.title.trim();
    const serviceSlug = service.serviceSlug ?? slugifyServiceTitle(title);
    const quoteRequired = service.quoteRequired ?? false;
    const priceFrom =
      quoteRequired || service.priceMin == null || service.priceMin <= 0 ? 0 : service.priceMin;
    const priceMax =
      quoteRequired || service.priceMax == null || service.priceMax <= 0 ? null : service.priceMax;

    return {
      professional_id: professionalId,
      service_slug: serviceSlug,
      title,
      price_from: priceFrom,
      price_max: priceMax,
      quote_required: quoteRequired,
      duration_label: formatServicePriceRangeLabel(
        service.priceMin ?? null,
        service.priceMax ?? null,
        quoteRequired,
      ),
      sort_order: index,
      is_active: true,
      is_custom: service.isCustom ?? false,
    };
  });



  const targetSlugs = rows.map((row) => row.service_slug);



  const { data: existingRows, error: fetchError } = await supabase

    .from('professional_services')

    .select('id, service_slug')

    .eq('professional_id', professionalId);



  if (fetchError) {

    devLogSupabaseError('syncProfessionalServices fetch', fetchError);

    throw fetchError;

  }



  const idsToDelete =

    existingRows

      ?.filter((row) => !targetSlugs.includes(row.service_slug))

      .map((row) => row.id) ?? [];



  if (idsToDelete.length > 0) {

    const { error: deleteError } = await supabase

      .from('professional_services')

      .delete()

      .in('id', idsToDelete);



    if (deleteError) {

      devLogSupabaseError('syncProfessionalServices delete', deleteError);

      throw deleteError;

    }

  }



  if (rows.length === 0) {

    return;

  }



  const { error: upsertError } = await supabase.from('professional_services').upsert(rows, {

    onConflict: 'professional_id,service_slug',

  });



  if (upsertError) {

    devLogSupabaseError('syncProfessionalServices upsert', upsertError);

    throw upsertError;

  }

}



async function createProfessionalProfileInternal(

  authUserId: string,

  input: ProRegistrationProfileInput,

): Promise<MyProfessional> {

  const {

    data: { session },

  } = await supabase.auth.getSession();



  if (!session?.user?.id) {

    throw new Error(

      'Sessione non attiva: impossibile creare il profilo. Conferma l’email e accedi di nuovo.',

    );

  }



  const category = await fetchCategoryBySlug(input.categorySlug);

  if (!category) {

    throw new Error('Categoria non valida o non disponibile.');

  }



  const serviceAreas = normalizeCities(input);

  const services = normalizeServices(input);

  const startingPrice = computeStartingPrice(services) ?? 0;



  const professionalId = await resolveProfessionalId(

    authUserId,

    input,

    category,

    serviceAreas,

    startingPrice,

  );



  await updateProfessionalProfile(professionalId, input, category, serviceAreas, startingPrice);

  await syncProfessionalZonesList(professionalId, serviceAreas);

  await syncProfessionalServices(professionalId, services);



  const profile = await fetchMyProfessionalByAuthUserId(authUserId);

  if (!profile) {

    throw new Error('Profilo creato ma non recuperabile.');

  }



  return profile;

}



export async function createProfessionalProfile(

  authUserId: string,

  input: ProRegistrationProfileInput,

): Promise<MyProfessional> {

  const inFlight = profileCreationLocks.get(authUserId);

  if (inFlight) {

    return inFlight;

  }



  const promise = createProfessionalProfileInternal(authUserId, input).finally(() => {

    profileCreationLocks.delete(authUserId);

  });



  profileCreationLocks.set(authUserId, promise);

  return promise;

}



export async function completePendingRegistrationForUser(

  authUserId: string,

  pending: ProRegistrationProfileInput,

): Promise<MyProfessional> {

  return createProfessionalProfile(authUserId, pending);

}



/** @deprecated usa parsePriceInput da utils/pricing */

export { parsePriceInput };


