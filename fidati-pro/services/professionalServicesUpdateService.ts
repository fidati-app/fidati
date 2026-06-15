import { devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';
import { formatServicePriceRangeLabel } from '@/utils/pricing';

export type ServiceRow = {
  id: string;
  professional_id: string;
  title: string;
  price_from: number;
  price_max: number | null;
  duration_label: string | null;
  service_slug: string;
};

export async function fetchProfessionalServiceById(
  serviceId: string,
  professionalId: string,
): Promise<ServiceRow | null> {
  const { data, error } = await supabase
    .from('professional_services')
    .select('id, professional_id, title, price_from, price_max, duration_label, service_slug')
    .eq('id', serviceId)
    .eq('professional_id', professionalId)
    .maybeSingle();

  if (error) {
    devLogSupabaseError('fetchProfessionalServiceById', error);
    throw error;
  }

  return data as ServiceRow | null;
}

export async function updateProfessionalServicePrices(input: {
  serviceId: string;
  professionalId: string;
  priceFrom: number;
  priceMax: number | null;
  quoteOnRequest: boolean;
}): Promise<ServiceRow> {
  const priceFrom = input.quoteOnRequest ? 0 : input.priceFrom;
  const priceMax = input.quoteOnRequest ? null : input.priceMax;
  const durationLabel = input.quoteOnRequest
    ? 'Preventivo su richiesta'
    : formatServicePriceRangeLabel(priceFrom > 0 ? priceFrom : null, priceMax);

  const { data, error } = await supabase
    .from('professional_services')
    .update({
      price_from: priceFrom,
      price_max: priceMax,
      duration_label: durationLabel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.serviceId)
    .eq('professional_id', input.professionalId)
    .select('id, professional_id, title, price_from, price_max, duration_label, service_slug')
    .single();

  if (error) {
    devLogSupabaseError('updateProfessionalServicePrices', error);
    throw error;
  }

  const services = await supabase
    .from('professional_services')
    .select('price_from')
    .eq('professional_id', input.professionalId)
    .eq('is_active', true);

  if (!services.error && services.data?.length) {
    const mins = services.data
      .map((s) => Number(s.price_from))
      .filter((p) => Number.isFinite(p) && p > 0);
    if (mins.length) {
      await supabase
        .from('professionals')
        .update({ price_per_hour: Math.min(...mins), updated_at: new Date().toISOString() })
        .eq('id', input.professionalId);
    }
  }

  return data as ServiceRow;
}
