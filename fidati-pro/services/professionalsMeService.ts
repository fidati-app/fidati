import { devLog, devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';
import { AccountStatus, MyProfessional, ProDashboardStats, ProProfile, ProService } from '@/types';

interface ServiceRow {
  id: string;
  legacy_id: string | null;
  title: string;
  price_from: number;
  duration_label: string;
  sort_order: number;
}

interface ZoneRow {
  zone_name: string;
  sort_order: number;
}

interface MyProfessionalRow {
  id: string;
  legacy_id: string | null;
  auth_user_id: string | null;
  name: string;
  category_label: string;
  category_slug: string | null;
  email: string | null;
  phone: string | null;
  bio: string;
  image_url: string | null;
  hero_image_url: string | null;
  avatar_color: string;
  rating: number;
  review_count: number;
  jobs_completed: number;
  price_per_hour: number;
  verified: boolean;
  available_today: boolean;
  base_city: string | null;
  service_areas: string[] | null;
  member_since: string | null;
  earnings_this_month: number;
  earnings_this_week: number;
  profile_completion: number;
  new_clients_this_month: number;
  response_rate: number;
  account_status: string;
  profile_views: number;
  professional_services?: ServiceRow[] | null;
  professional_zones?: ZoneRow[] | null;
}

const MY_PROFESSIONAL_SELECT = `
  id,
  legacy_id,
  auth_user_id,
  name,
  category_label,
  category_slug,
  email,
  phone,
  bio,
  image_url,
  hero_image_url,
  avatar_color,
  rating,
  review_count,
  jobs_completed,
  price_per_hour,
  verified,
  available_today,
  base_city,
  service_areas,
  member_since,
  earnings_this_month,
  earnings_this_week,
  profile_completion,
  new_clients_this_month,
  response_rate,
  account_status,
  profile_views,
  professional_services (
    id,
    legacy_id,
    title,
    price_from,
    duration_label,
    sort_order
  ),
  professional_zones (
    zone_name,
    sort_order
  )
`;

function mapAccountStatus(value: string | null | undefined): AccountStatus {
  if (value === 'verified' || value === 'in_review' || value === 'unverified') {
    return value;
  }
  return 'unverified';
}

function mapServices(rows: ServiceRow[] | null | undefined): ProService[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      id: row.legacy_id ?? row.id,
      title: row.title,
      priceFrom: Number(row.price_from),
      duration: row.duration_label,
    }));
}

function mapServiceZones(row: MyProfessionalRow): string[] {
  const fromZones = (row.professional_zones ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((zone) => zone.zone_name.trim())
    .filter(Boolean);

  if (fromZones.length > 0) {
    return fromZones;
  }

  return (row.service_areas ?? []).map((area) => area.trim()).filter(Boolean);
}

function buildStats(row: MyProfessionalRow): ProDashboardStats {
  return {
    earningsThisWeek: Number(row.earnings_this_week ?? 0),
    earningsThisMonth: Number(row.earnings_this_month ?? 0),
    profileCompletion: row.profile_completion ?? 0,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    jobsCompleted: row.jobs_completed ?? 0,
    newClientsThisMonth: row.new_clients_this_month ?? 0,
    responseRate: row.response_rate ?? 100,
    accountStatus: mapAccountStatus(row.account_status),
    profileViews: row.profile_views ?? 0,
  };
}

function mapMyProfessionalRow(row: MyProfessionalRow): MyProfessional {
  const serviceZones = mapServiceZones(row);
  const serviceAreas = (row.service_areas ?? serviceZones).map((area) => area.trim()).filter(Boolean);
  const stats = buildStats(row);

  return {
    id: row.id,
    legacyId: row.legacy_id,
    authUserId: row.auth_user_id ?? '',
    name: row.name,
    category: row.category_label,
    categorySlug: row.category_slug,
    email: row.email,
    phone: row.phone,
    bio: row.bio ?? '',
    imageUrl: row.image_url,
    heroImageUrl: row.hero_image_url,
    avatarColor: row.avatar_color,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    jobsCompleted: row.jobs_completed ?? 0,
    pricePerHour: Number(row.price_per_hour ?? 0),
    verified: row.verified,
    availableToday: row.available_today,
    baseCity: row.base_city,
    serviceAreas,
    serviceZones,
    memberSince: row.member_since,
    earningsThisMonth: Number(row.earnings_this_month ?? 0),
    earningsThisWeek: Number(row.earnings_this_week ?? 0),
    profileCompletion: row.profile_completion ?? 0,
    newClientsThisMonth: row.new_clients_this_month ?? 0,
    responseRate: row.response_rate ?? 100,
    accountStatus: mapAccountStatus(row.account_status),
    profileViews: row.profile_views ?? 0,
    services: mapServices(row.professional_services ?? undefined),
    stats,
  };
}

export async function fetchMyProfessionalByAuthUserId(
  authUserId: string,
): Promise<MyProfessional | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  devLog('fetchMyProfessional auth user id:', authUserId);
  devLog('fetchMyProfessional session user id:', session?.user?.id ?? '(none)');
  devLog('fetchMyProfessional query:', {
    table: 'professionals',
    filter: { auth_user_id: authUserId },
    note: 'colonna auth_user_id (non id / professional_id)',
  });

  const { data: probeRow, error: probeError } = await supabase
    .from('professionals')
    .select('id, auth_user_id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  devLog('fetchMyProfessional probe data:', probeRow);
  if (probeError) {
    devLogSupabaseError('fetchMyProfessional probe', probeError);
    throw probeError;
  }

  if (!probeRow) {
    devLog('fetchMyProfessional probe: nessuna riga per auth_user_id', authUserId);
    return null;
  }

  const { data, error } = await supabase
    .from('professionals')
    .select(MY_PROFESSIONAL_SELECT)
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  devLog('fetchMyProfessional full select data:', data ? { id: data.id, auth_user_id: data.auth_user_id } : null);

  if (error) {
    devLogSupabaseError('fetchMyProfessional full select', error);
    throw error;
  }

  if (!data) {
    devLog('fetchMyProfessional full select: nessuna riga per auth_user_id', authUserId);
    return null;
  }

  return mapMyProfessionalRow(data as MyProfessionalRow);
}

export function myProfessionalToProProfile(professional: MyProfessional): ProProfile {
  return {
    id: professional.legacyId ?? professional.id,
    name: professional.name,
    category: professional.category,
    email: professional.email ?? '',
    phone: professional.phone ?? '',
    bio: professional.bio,
    rating: professional.rating,
    reviewCount: professional.reviewCount,
    jobsCompleted: professional.jobsCompleted,
    memberSince: professional.memberSince ?? '—',
    earningsThisMonth: professional.earningsThisMonth,
    verified: professional.verified,
    availableToday: professional.availableToday,
    baseCity: professional.baseCity,
    serviceZones: professional.serviceZones,
    services: professional.services,
    portfolio: [],
    reviews: [],
    stats: professional.stats,
  };
}
