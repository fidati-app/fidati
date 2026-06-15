import { devLog, devLogSupabaseError } from '@/lib/devLog';
import { supabase } from '@/lib/supabaseClient';
import {  deleteStorageObject,
  extractStoragePathFromUrl,
  uploadProfessionalImage,
} from '@/services/professionalStorageService';

export const MAX_WORK_PHOTOS = 6;
export const MIN_WORK_PHOTOS = 1;

export interface WorkPhoto {
  id: string;
  professionalId: string;
  imageUrl: string;
  title: string | null;
  sortOrder: number;
}

interface WorkPhotoRow {
  id: string;
  professional_id: string;
  image_url: string;
  title: string | null;
  sort_order: number;
}

function mapRow(row: WorkPhotoRow): WorkPhoto {
  return {
    id: row.id,
    professionalId: row.professional_id,
    imageUrl: row.image_url,
    title: row.title,
    sortOrder: row.sort_order,
  };
}

export async function fetchWorkPhotos(professionalId: string): Promise<WorkPhoto[]> {
  const { data, error } = await supabase
    .from('professional_work_photos')
    .select('*')
    .eq('professional_id', professionalId)
    .order('sort_order', { ascending: true });

  if (error) {
    devLogSupabaseError('fetchWorkPhotos', error);
    throw error;
  }

  return (data as WorkPhotoRow[]).map(mapRow);
}

export async function addWorkPhoto(
  professionalId: string,
  localUri: string,
  title?: string | null,
): Promise<WorkPhoto> {
  const existing = await fetchWorkPhotos(professionalId);
  if (existing.length >= MAX_WORK_PHOTOS) {
    throw new Error(`Puoi caricare al massimo ${MAX_WORK_PHOTOS} foto.`);
  }

  const fileName = `work-${Date.now()}.jpg`;
  const imageUrl = await uploadProfessionalImage(
    'professional-portfolio',
    professionalId,
    fileName,
    localUri,
  );

  const trimmedTitle = title?.trim() || null;

  const { data, error } = await supabase
    .from('professional_work_photos')
    .insert({
      professional_id: professionalId,
      image_url: imageUrl,
      title: trimmedTitle,
      sort_order: existing.length,
    })
    .select('*')
    .single();

  if (error) {
    devLogSupabaseError('addWorkPhoto', error);
    throw error;
  }

  return mapRow(data as WorkPhotoRow);
}

export async function addWorkPhotos(
  professionalId: string,
  localUris: string[],
  onProgress?: (completed: number, total: number) => void,
): Promise<{ photos: WorkPhoto[]; errors: string[] }> {
  const uploaded: WorkPhoto[] = [];
  const errors: string[] = [];
  const total = localUris.length;

  for (let index = 0; index < localUris.length; index += 1) {
    onProgress?.(index, total);
    try {
      const photo = await addWorkPhoto(professionalId, localUris[index]);
      uploaded.push(photo);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Caricamento fallito.';
      errors.push(message);
    } finally {
      onProgress?.(index + 1, total);
    }
  }

  if (uploaded.length === 0 && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return { photos: uploaded, errors };
}

export async function replaceWorkPhoto(
  photoId: string,
  professionalId: string,
  localUri: string,
): Promise<WorkPhoto> {
  const { data: existing, error: fetchError } = await supabase
    .from('professional_work_photos')
    .select('*')
    .eq('id', photoId)
    .eq('professional_id', professionalId)
    .single();

  if (fetchError || !existing) {
    devLogSupabaseError('replaceWorkPhoto.fetch', fetchError);
    if (__DEV__) {
      devLog('replaceWorkPhoto: foto non trovata', { photoId, professionalId, fetchError });
    }
    throw fetchError ?? new Error('Foto non trovata nel portfolio.');
  }

  const oldRow = existing as WorkPhotoRow;
  const oldStoragePath = extractStoragePathFromUrl('professional-portfolio', oldRow.image_url);
  const fileName = `work-${Date.now()}.jpg`;
  const newStoragePath = `${professionalId}/${fileName}`;

  if (__DEV__) {
    devLog('replaceWorkPhoto: upload sostituzione', {
      photoId,
      oldImageUrl: oldRow.image_url,
      oldStoragePath,
      newStoragePath,
    });
  }

  const imageUrl = await uploadProfessionalImage(
    'professional-portfolio',
    professionalId,
    fileName,
    localUri,
    { upsert: false },
  );

  const { data, error } = await supabase
    .from('professional_work_photos')
    .update({ image_url: imageUrl })
    .eq('id', photoId)
    .eq('professional_id', professionalId)
    .select('*')
    .single();

  if (error) {
    devLogSupabaseError('replaceWorkPhoto.update', error);
    if (__DEV__) devLog('replaceWorkPhoto: update DB fallito', { photoId, imageUrl, error });
    throw error;
  }

  if (oldStoragePath) {
    const oldFile = oldStoragePath.split('/').pop();
    if (oldFile && oldFile !== fileName) {
      try {
        await deleteStorageObject('professional-portfolio', `${professionalId}/${oldFile}`);
      } catch (cleanupErr) {
        if (__DEV__) devLogSupabaseError('replaceWorkPhoto.cleanup', cleanupErr);
      }
    }
  }

  if (__DEV__) {
    devLog('replaceWorkPhoto: completato', { photoId, newImageUrl: imageUrl });
  }

  return mapRow(data as WorkPhotoRow);
}

export async function fetchWorkPhotoById(
  photoId: string,
  professionalId: string,
): Promise<WorkPhoto | null> {
  const { data, error } = await supabase
    .from('professional_work_photos')
    .select('*')
    .eq('id', photoId)
    .eq('professional_id', professionalId)
    .maybeSingle();

  if (error) {
    devLogSupabaseError('fetchWorkPhotoById', error);
    throw error;
  }

  return data ? mapRow(data as WorkPhotoRow) : null;
}

export async function updateWorkPhotoTitle(photoId: string, title: string | null): Promise<void> {
  const trimmed = title?.trim() || null;
  const { error } = await supabase
    .from('professional_work_photos')
    .update({ title: trimmed })
    .eq('id', photoId);

  if (error) {
    devLogSupabaseError('updateWorkPhotoTitle', error);
    throw error;
  }
}

export async function reorderWorkPhoto(
  professionalId: string,
  photoId: string,
  direction: 'up' | 'down',
): Promise<WorkPhoto[]> {
  const photos = await fetchWorkPhotos(professionalId);
  const index = photos.findIndex((photo) => photo.id === photoId);
  if (index < 0) return photos;

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= photos.length) return photos;

  const reordered = [...photos];
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

  await Promise.all(
    reordered.map((photo, sortOrder) =>
      supabase.from('professional_work_photos').update({ sort_order: sortOrder }).eq('id', photo.id),
    ),
  );

  return fetchWorkPhotos(professionalId);
}

export async function removeWorkPhoto(photo: WorkPhoto): Promise<void> {
  const storagePath = extractStoragePathFromUrl('professional-portfolio', photo.imageUrl);
  if (storagePath) {
    const fileName = storagePath.split('/').pop();
    if (fileName) {
      try {
        await deleteStorageObject('professional-portfolio', `${photo.professionalId}/${fileName}`);
      } catch {
        // ignore storage cleanup errors
      }
    }
  }

  const { error } = await supabase.from('professional_work_photos').delete().eq('id', photo.id);
  if (error) {
    devLogSupabaseError('removeWorkPhoto', error);
    throw error;
  }

  const remaining = await fetchWorkPhotos(photo.professionalId);
  await Promise.all(
    remaining.map((item, sortOrder) =>
      supabase.from('professional_work_photos').update({ sort_order: sortOrder }).eq('id', item.id),
    ),
  );
}
