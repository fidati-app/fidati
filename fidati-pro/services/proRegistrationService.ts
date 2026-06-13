import { devLog, devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';
import { fetchMyProfessionalByAuthUserId } from '@/services/professionalsMeService';
import { MyProfessional } from '@/types';
import { parseServiceAreasInput } from '@/utils/registrationValidation';

export interface ProRegistrationProfileInput {
  name: string;
  email: string;
  phone: string;
  categorySlug: string;
  baseCity: string;
  serviceAreasRaw: string;
  priceFrom: number;
  description: string;
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
}

async function fetchCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from('service_categories')
    .select('id, slug, name')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as CategoryRow | null) ?? null;
}

export async function createProfessionalProfile(
  authUserId: string,
  input: ProRegistrationProfileInput,
): Promise<MyProfessional> {
  devLog('createProfessionalProfile auth user id:', authUserId);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  devLog('createProfessionalProfile session user id:', session?.user?.id ?? '(none)');

  if (!session?.user?.id) {
    throw new Error(
      'Sessione non attiva: impossibile creare il profilo. Conferma l’email e accedi di nuovo.',
    );
  }

  if (session.user.id !== authUserId) {
    devLog('createProfessionalProfile session/auth mismatch', {
      sessionUserId: session.user.id,
      authUserId,
    });
  }

  const existing = await fetchMyProfessionalByAuthUserId(authUserId);
  if (existing) {
    devLog('createProfessionalProfile: profilo già presente', existing.id);
    return existing;
  }

  const category = await fetchCategoryBySlug(input.categorySlug);
  if (!category) {
    throw new Error('Categoria non valida o non disponibile.');
  }

  const serviceAreas = parseServiceAreasInput(input.serviceAreasRaw, input.baseCity);
  const baseCity = input.baseCity.trim();

  const insertPayload = {
    auth_user_id: authUserId,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    category_id: category.id,
    category_label: category.name,
    category_slug: input.categorySlug,
    base_city: baseCity,
    service_areas: serviceAreas,
    price_per_hour: input.priceFrom,
    bio: input.description.trim(),
    verified: false,
    available_today: false,
    rating: 0,
    review_count: 0,
    account_status: 'unverified',
    has_pro_app: true,
  };

  devLog('createProfessionalProfile insert professionals:', {
    auth_user_id: insertPayload.auth_user_id,
    category_slug: insertPayload.category_slug,
    base_city: insertPayload.base_city,
  });

  const { data: professional, error: insertError } = await supabase
    .from('professionals')
    .insert(insertPayload)
    .select('id, auth_user_id')
    .single();

  devLog('createProfessionalProfile insert data:', professional);

  if (insertError) {
    devLogSupabaseError('createProfessionalProfile insert', insertError);
    throw insertError;
  }

  const zones = serviceAreas.map((zone, index) => ({
    professional_id: professional.id,
    zone_name: zone,
    sort_order: index,
  }));

  devLog('createProfessionalProfile insert professional_zones count:', zones.length);

  const { error: zonesError } = await supabase.from('professional_zones').insert(zones);
  if (zonesError) {
    devLogSupabaseError('createProfessionalProfile zones insert', zonesError);
    throw zonesError;
  }

  const profile = await fetchMyProfessionalByAuthUserId(authUserId);
  if (!profile) {
    devLog('createProfessionalProfile: insert ok ma fetch null per auth_user_id', authUserId);
    throw new Error('Profilo creato ma non recuperabile.');
  }

  devLog('createProfessionalProfile success professional id:', profile.id);
  return profile;
}

export async function completePendingRegistrationForUser(
  authUserId: string,
  pending: ProRegistrationProfileInput,
): Promise<MyProfessional> {
  const existing = await fetchMyProfessionalByAuthUserId(authUserId);
  if (existing) {
    return existing;
  }

  return createProfessionalProfile(authUserId, pending);
}
