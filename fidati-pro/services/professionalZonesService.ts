import { devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';

export async function updateProfessionalServiceAreas(
  professionalId: string,
  zoneNames: string[],
): Promise<void> {
  const areas = zoneNames.map((z) => z.trim()).filter(Boolean);

  const { error } = await supabase
    .from('professionals')
    .update({
      service_areas: areas,
      base_city: areas[0] ?? '',
    })
    .eq('id', professionalId);

  if (error) {
    devLogSupabaseError('updateProfessionalServiceAreas', error);
    throw error;
  }
}

/**
 * Sincronizza le zone: elimina quelle rimosse, upsert quelle attive.
 */
export async function syncProfessionalZonesList(
  professionalId: string,
  zoneNames: string[],
): Promise<void> {
  const normalizedZones = zoneNames.map((z) => z.trim()).filter(Boolean);

  const { data: existingRows, error: fetchError } = await supabase
    .from('professional_zones')
    .select('id, zone_name')
    .eq('professional_id', professionalId);

  if (fetchError) {
    devLogSupabaseError('syncProfessionalZonesList fetch', fetchError);
    throw fetchError;
  }

  const targetKeys = new Set(normalizedZones.map((z) => z.toLowerCase()));
  const idsToDelete =
    existingRows
      ?.filter((row) => !targetKeys.has(row.zone_name.trim().toLowerCase()))
      .map((row) => row.id) ?? [];

  if (idsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('professional_zones')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      devLogSupabaseError('syncProfessionalZonesList delete', deleteError);
      throw deleteError;
    }
  }

  if (normalizedZones.length === 0) {
    await updateProfessionalServiceAreas(professionalId, []);
    return;
  }

  const rows = normalizedZones.map((zone, index) => ({
    professional_id: professionalId,
    zone_name: zone,
    sort_order: index,
  }));

  const { error: upsertError } = await supabase.from('professional_zones').upsert(rows, {
    onConflict: 'professional_id,zone_name',
  });

  if (upsertError) {
    devLogSupabaseError('syncProfessionalZonesList upsert', upsertError);
    throw upsertError;
  }

  await updateProfessionalServiceAreas(professionalId, normalizedZones);
}

/** Salva base_city esplicita + zone (base sempre prima se presente). */
export async function syncProfessionalZonesAndBaseCity(
  professionalId: string,
  baseCity: string,
  operationalZoneNames: string[],
): Promise<void> {
  const base = baseCity.trim();
  const extras = operationalZoneNames
    .map((z) => z.trim())
    .filter(Boolean)
    .filter((z) => !base || z.toLowerCase() !== base.toLowerCase());
  const allZones = base ? [base, ...extras] : extras;

  await syncProfessionalZonesList(professionalId, allZones);

  if (base) {
    const { error } = await supabase
      .from('professionals')
      .update({
        base_city: base,
        service_areas: allZones,
        updated_at: new Date().toISOString(),
      })
      .eq('id', professionalId);

    if (error) {
      devLogSupabaseError('syncProfessionalZonesAndBaseCity base_city', error);
      throw error;
    }
  }
}

export async function addProfessionalZone(
  professionalId: string,
  currentZones: string[],
  city: string,
): Promise<string[]> {
  const trimmed = city.trim();
  if (!trimmed) {
    throw new Error('Inserisci una città valida.');
  }

  if (currentZones.some((z) => z.toLowerCase() === trimmed.toLowerCase())) {
    return currentZones;
  }

  const nextZones = [...currentZones, trimmed];
  await syncProfessionalZonesList(professionalId, nextZones);
  return nextZones;
}

export async function removeProfessionalZone(
  professionalId: string,
  currentZones: string[],
  city: string,
): Promise<string[]> {
  const nextZones = currentZones.filter((z) => z !== city);

  if (nextZones.length === 0) {
    throw new Error('Devi avere almeno una zona servita.');
  }

  await syncProfessionalZonesList(professionalId, nextZones);
  return nextZones;
}
