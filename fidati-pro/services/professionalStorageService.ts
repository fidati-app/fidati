import { supabase } from '@/lib/supabaseClient';

import { devLogSupabaseError } from '@/lib/devLog';



export type StorageBucket =

  | 'professional-profile-photos'

  | 'professional-documents'

  | 'professional-portfolio';



function devLogStorage(label: string, payload: unknown) {

  if (__DEV__) {

    console.log(`[Fidati Pro Documents] ${label}`, payload);

  }

}



async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {

  const response = await fetch(uri);

  if (!response.ok) {

    throw new Error(`Impossibile leggere il file selezionato (${response.status}).`);

  }

  return response.arrayBuffer();

}



function inferContentType(uri: string): string {

  const lower = uri.toLowerCase();

  if (lower.includes('.png')) return 'image/png';

  if (lower.includes('.webp')) return 'image/webp';

  return 'image/jpeg';

}



export async function uploadProfessionalImage(

  bucket: StorageBucket,

  professionalId: string,

  fileName: string,

  localUri: string,

  options?: { upsert?: boolean },

): Promise<string> {

  const path = `${professionalId}/${fileName}`;

  devLogStorage('upload path', { bucket, path, localUri: localUri.slice(0, 80) });



  const body = await uriToArrayBuffer(localUri);

  const contentType = inferContentType(localUri);



  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, body, {

    contentType,

    upsert: options?.upsert ?? true,

  });



  if (uploadError) {

    devLogStorage('upload error code/message', {

      code: uploadError.name ?? 'storage_error',

      message: uploadError.message,

    });

    devLogSupabaseError(`uploadProfessionalImage ${bucket}`, uploadError);

    throw uploadError;

  }



  if (bucket === 'professional-documents') {

    const { data, error } = await supabase.storage

      .from(bucket)

      .createSignedUrl(path, 60 * 60 * 24 * 365);



    if (error || !data?.signedUrl) {

      devLogStorage('upload error code/message', {

        code: error?.name ?? 'signed_url_error',

        message: error?.message ?? 'Impossibile generare URL documento.',

      });

      devLogSupabaseError('createSignedUrl documents', error);

      throw error ?? new Error('Impossibile generare URL documento.');

    }



    return data.signedUrl;

  }



  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;

}



export async function deleteStorageObject(bucket: StorageBucket, path: string): Promise<void> {

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {

    devLogSupabaseError(`deleteStorageObject ${bucket}`, error);

    throw error;

  }

}



export function extractStoragePathFromUrl(bucket: StorageBucket, url: string): string | null {

  try {

    const marker = `/storage/v1/object/public/${bucket}/`;

    const signedMarker = `/storage/v1/object/sign/${bucket}/`;

    if (url.includes(marker)) {

      return url.split(marker)[1]?.split('?')[0] ?? null;

    }

    if (url.includes(signedMarker)) {

      return url.split(signedMarker)[1]?.split('?')[0] ?? null;

    }

    const alt = `${bucket}/`;

    const idx = url.indexOf(alt);

    if (idx >= 0) {

      return url.slice(idx + alt.length).split('?')[0];

    }

  } catch {

    return null;

  }

  return null;

}

